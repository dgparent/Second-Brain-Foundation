/**
 * Sync Command - Sync local files with SBF
 */

import { Command } from 'commander';
import { confirm, select } from '@inquirer/prompts';
import chalk from 'chalk';
import ora from 'ora';
import { readdir, stat, readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, relative, extname, basename } from 'node:path';
import { loadConfig, isInitialized } from '../config.js';
import { api } from '../utils/api.js';
import { success, error, warning, info } from '../utils/output.js';
import { SBF_FOLDERS } from '../types.js';
import matter from 'gray-matter';

export const syncCommand = new Command('sync')
  .description('Sync local files with SBF')
  .option('-d, --direction <dir>', 'Direction: up, down, both', 'both')
  .option('--dry-run', 'Show what would be synced')
  .option('-f, --force', 'Force sync without confirmation')
  .action(async (options) => {
    if (!isInitialized()) {
      error('Not initialized. Run `sbf init` first.');
      process.exit(1);
    }

    const config = loadConfig();
    const spinner = ora('Scanning local files...').start();

    try {
      // Scan local files
      const localFiles = await scanLocalFiles(process.cwd());
      spinner.text = 'Fetching remote entities...';

      // Get remote entities
      const remote = await api.listEntities({ limit: 1000 });
      spinner.stop();

      // Build sync plan
      const plan = buildSyncPlan(localFiles, remote.items);

      console.log(chalk.blue('\n📊 Sync Plan:'));
      console.log(`  To upload: ${plan.toUpload.length}`);
      console.log(`  To download: ${plan.toDownload.length}`);
      console.log(`  Conflicts: ${plan.conflicts.length}`);
      console.log(`  Unchanged: ${plan.unchanged.length}`);

      if (plan.conflicts.length > 0) {
        console.log(chalk.yellow('\n⚠️ Conflicts:'));
        for (const c of plan.conflicts.slice(0, 5)) {
          console.log(chalk.gray(`  - ${c.path}`));
        }
        if (plan.conflicts.length > 5) {
          console.log(chalk.gray(`  ... and ${plan.conflicts.length - 5} more`));
        }
      }

      if (options.dryRun) {
        warning('\n(Dry run - no changes made)');
        return;
      }

      const noChanges = plan.toUpload.length === 0 && plan.toDownload.length === 0;
      if (noChanges) {
        success('Everything is in sync!');
        return;
      }

      // Confirm
      if (!options.force) {
        const proceed = await confirm({
          message: 'Proceed with sync?',
          default: true,
        });
        if (!proceed) return;
      }

      // Execute sync
      const syncSpinner = ora('Syncing...').start();
      let uploaded = 0;
      let downloaded = 0;
      const errors: string[] = [];

      // Upload
      if (options.direction !== 'down') {
        for (const file of plan.toUpload) {
          syncSpinner.text = `Uploading ${file.path}...`;
          try {
            const content = await readFile(file.fullPath, 'utf-8');
            const parsed = matter(content);
            const entityData = {
              type: file.type,
              title: parsed.data.title || file.title,
              content: parsed.content,
              tags: parsed.data.tags || [],
              metadata: parsed.data,
            };

            if (file.uid) {
              await api.updateEntity(file.uid, entityData);
            } else {
              await api.createEntity(entityData);
            }
            uploaded++;
          } catch (e) {
            errors.push(`Upload ${file.path}: ${(e as Error).message}`);
          }
        }
      }

      // Download
      if (options.direction !== 'up') {
        for (const entity of plan.toDownload) {
          syncSpinner.text = `Downloading ${entity.uid}...`;
          try {
            const full = await api.getEntity(entity.uid);
            const localPath = getLocalPath(full, process.cwd());

            // Ensure directory exists
            const dir = join(localPath, '..');
            await mkdir(dir, { recursive: true });

            // Build frontmatter
            const frontmatter: Record<string, unknown> = {
              uid: full.uid,
              title: full.title,
              type: full.type,
              tags: full.tags,
              created: full.createdAt,
              modified: full.updatedAt,
            };

            const content = matter.stringify(full.content || '', frontmatter);
            await writeFile(localPath, content);
            downloaded++;
          } catch (e) {
            errors.push(`Download ${entity.uid}: ${(e as Error).message}`);
          }
        }
      }

      syncSpinner.succeed(`Synced: ${uploaded} uploaded, ${downloaded} downloaded`);

      if (errors.length > 0) {
        console.log(chalk.yellow(`\n⚠️ ${errors.length} errors:`));
        for (const err of errors.slice(0, 5)) {
          console.log(chalk.gray(`  - ${err}`));
        }
      }
    } catch (e) {
      spinner.stop();
      error(`Sync failed: ${(e as Error).message}`);
    }
  });

interface LocalFile {
  path: string;
  fullPath: string;
  title: string;
  type: string;
  uid?: string;
  checksum?: string;
  modified: Date;
}

interface SyncPlan {
  toUpload: LocalFile[];
  toDownload: Array<{ uid: string; title: string; type: string }>;
  conflicts: Array<{ path: string; local: LocalFile; remote: unknown }>;
  unchanged: string[];
}

async function scanLocalFiles(basePath: string): Promise<LocalFile[]> {
  const files: LocalFile[] = [];

  for (const [folder, type] of Object.entries(SBF_FOLDERS)) {
    const folderPath = join(basePath, folder);
    if (!existsSync(folderPath)) continue;

    const items = await scanDirectory(folderPath, type, basePath);
    files.push(...items);
  }

  return files;
}

async function scanDirectory(
  dirPath: string,
  type: string,
  basePath: string
): Promise<LocalFile[]> {
  const files: LocalFile[] = [];

  try {
    const entries = await readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);

      if (entry.isDirectory()) {
        const nested = await scanDirectory(fullPath, type, basePath);
        files.push(...nested);
      } else if (entry.isFile() && extname(entry.name) === '.md') {
        const stats = await stat(fullPath);
        const content = await readFile(fullPath, 'utf-8');
        const parsed = matter(content);

        files.push({
          path: relative(basePath, fullPath),
          fullPath,
          title: parsed.data.title || basename(entry.name, '.md'),
          type,
          uid: parsed.data.uid,
          checksum: parsed.data.checksum,
          modified: stats.mtime,
        });
      }
    }
  } catch {
    // Ignore errors
  }

  return files;
}

function buildSyncPlan(
  localFiles: LocalFile[],
  remoteEntities: Array<{ uid: string; title: string; type: string; updatedAt: string }>
): SyncPlan {
  const plan: SyncPlan = {
    toUpload: [],
    toDownload: [],
    conflicts: [],
    unchanged: [],
  };

  const localByUid = new Map(localFiles.filter((f) => f.uid).map((f) => [f.uid, f]));
  const remoteByUid = new Map(remoteEntities.map((e) => [e.uid, e]));

  // Check local files
  for (const file of localFiles) {
    if (!file.uid) {
      // New local file
      plan.toUpload.push(file);
    } else {
      const remote = remoteByUid.get(file.uid);
      if (!remote) {
        // Local file not on remote (deleted remotely?)
        plan.toUpload.push(file);
      } else {
        const remoteTime = new Date(remote.updatedAt);
        if (file.modified > remoteTime) {
          plan.toUpload.push(file);
        } else if (file.modified < remoteTime) {
          plan.conflicts.push({ path: file.path, local: file, remote });
        } else {
          plan.unchanged.push(file.path);
        }
      }
    }
  }

  // Check remote entities not in local
  for (const entity of remoteEntities) {
    if (!localByUid.has(entity.uid)) {
      plan.toDownload.push(entity);
    }
  }

  return plan;
}

function getLocalPath(entity: { type: string; title: string; uid: string }, basePath: string): string {
  const typeToFolder: Record<string, string> = {
    note: 'notes',
    project: 'projects',
    person: 'people',
    resource: 'resources',
    tag: 'tags',
    template: 'templates',
  };

  const folder = typeToFolder[entity.type] || 'notes';
  const safeName = entity.title
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase();

  return join(basePath, folder, `${safeName}.md`);
}
