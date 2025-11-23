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
        // Front-matter parse (--- yaml ---). If absent, use defaults.
        let memory_level: MemoryLevel = 'transitory';
        let sensitivity: Sensitivity = defaultSensitivity();
        const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
        if (fmMatch) {
          try {
            const yamlBlock = fmMatch[1];
            const parsed: any = parseSimpleYaml(yamlBlock);
            if (parsed.memory_level && typeof parsed.memory_level === 'string') memory_level = parsed.memory_level as MemoryLevel;
            if (parsed.sensitivity && typeof parsed.sensitivity === 'object') {
              sensitivity = {
                level: parsed.sensitivity.level ?? sensitivity.level,
                scope: parsed.sensitivity.scope,
                privacy: {
                  cloud_ai_allowed: parsed.sensitivity.privacy?.cloud_ai_allowed ?? sensitivity.privacy.cloud_ai_allowed,
                  local_ai_allowed: parsed.sensitivity.privacy?.local_ai_allowed ?? sensitivity.privacy.local_ai_allowed,
                  export_allowed: parsed.sensitivity.privacy?.export_allowed ?? sensitivity.privacy.export_allowed
                },
                visibility: parsed.sensitivity.visibility ?? sensitivity.visibility,
                group_access: parsed.sensitivity.group_access
              } as Sensitivity;
            }
          } catch { /* fall back to defaults */ }
        }
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

// Extremely small YAML subset parser (key: value, nested via indentation one level)
function parseSimpleYaml(block: string): any {
  const lines = block.split(/\r?\n/);
  const root: any = {};
  let currentParent: any = root;
  const stack: { indent: number; obj: any }[] = [{ indent: -1, obj: root }];
  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const indent = line.match(/^ */)![0].length;
    const kv = line.split(':');
    if (kv.length < 2) continue;
    const key = kv[0].trim();
    const valueRaw = kv.slice(1).join(':').trim();
    while (stack.length && indent <= stack[stack.length - 1].indent) stack.pop();
    currentParent = stack[stack.length - 1].obj;
    if (valueRaw === '') { // new nested object
      const obj: any = {};
      currentParent[key] = obj;
      stack.push({ indent, obj });
    } else {
      let val: any = valueRaw;
      if (val === 'true') val = true; else if (val === 'false') val = false;
      else if (!isNaN(Number(val))) val = Number(val);
      else if (val.startsWith('[') && val.endsWith(']')) {
        val = val.slice(1, -1).split(',').map(v => v.trim()).filter(v => v);
      }
      currentParent[key] = val;
    }
  }
  return root;
}
