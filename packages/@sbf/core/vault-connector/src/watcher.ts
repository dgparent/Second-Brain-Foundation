import * as chokidar from 'chokidar';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Subject } from 'rxjs';
import { MarkdownParser, ParsedVaultFile } from './parser';

export type FileEvent = {
  type: 'add' | 'change' | 'unlink';
  path: string;
  parsed?: ParsedVaultFile;
};

export class VaultWatcher {
  private watcher: chokidar.FSWatcher | null = null;
  private parser: MarkdownParser;
  public events$ = new Subject<FileEvent>();

  constructor(private vaultPath: string) {
    this.parser = new MarkdownParser();
  }

  async start() {
    this.watcher = chokidar.watch(this.vaultPath, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: false,
      awaitWriteFinish: {
        stabilityThreshold: 500,
        pollInterval: 100
      }
    });

    this.watcher
      .on('add', (path) => this.handleFile('add', path))
      .on('change', (path) => this.handleFile('change', path))
      .on('unlink', (path) => this.events$.next({ type: 'unlink', path }));
      
    console.log(`Vault watcher started at ${this.vaultPath}`);
  }

  async stop() {
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
    }
  }

  private async handleFile(type: 'add' | 'change', filePath: string) {
    if (!filePath.endsWith('.md')) return;

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const parsed = this.parser.parse(filePath, content);
      this.events$.next({ type, path: filePath, parsed });
    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error);
    }
  }
}
