import { computeAeiCode, MemoryLevel, Sensitivity, Control } from './computeAeiCode';
import * as fs from 'fs';
import * as path from 'path';

export interface VaultEntityRaw {
  id: string;
  vault_path: string; // relative path inside vault
  title: string;
  content: string; // full markdown content
  memory_level: MemoryLevel;
  sensitivity: Sensitivity;
  control?: Control;
}

export interface VaultEntity extends VaultEntityRaw {
  aei_code: string;
}

// Simple heuristic: filename without extension as title.
function deriveTitle(filePath: string): string {
  return path.basename(filePath).replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
}

// Placeholder sensitivity defaults; should be replaced by front-matter parsing.
function defaultSensitivity(): Sensitivity {
  return {
    level: 1,
    privacy: { cloud_ai_allowed: true, local_ai_allowed: true, export_allowed: true },
    visibility: 'public'
  } as Sensitivity;
}

export function scanVault(vaultRoot: string): VaultEntity[] {
  const entities: VaultEntity[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir)) {
      const full = path.join(dir, entry);
      const rel = path.relative(vaultRoot, full);
      if (fs.statSync(full).isDirectory()) {
        walk(full);
      } else if (entry.toLowerCase().endsWith('.md')) {
        const content = fs.readFileSync(full, 'utf8');
        // TODO: parse YAML front-matter for memory/security fields.
        const memory_level: MemoryLevel = 'transitory';
        const sensitivity = defaultSensitivity();
        const aei_code = computeAeiCode(memory_level, sensitivity);
        entities.push({
          id: rel.replace(/\\/g, '/'),
            vault_path: rel.replace(/\\/g, '/'),
          title: deriveTitle(entry),
          content,
          memory_level,
          sensitivity,
          aei_code
        });
      }
    }
  };
  walk(vaultRoot);
  return entities;
}
