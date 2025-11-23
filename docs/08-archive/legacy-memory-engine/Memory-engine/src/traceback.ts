import * as fs from 'fs';
import * as path from 'path';
import { SimilarityResult } from './vectorIndex';

export interface TracebackItem {
  id: string;
  vault_path: string;
  aei_code: string;
  content?: string; // may be masked or full
  title?: string;
}

// Resolve vector hits back to vault content while enforcing AI code masking rules.
export function resolveTraceback(results: SimilarityResult[], vaultRoot: string): TracebackItem[] {
  return results.map(r => {
    const fullPath = path.join(vaultRoot, r.vault_path);
    let raw: string | undefined;
    try { raw = fs.readFileSync(fullPath, 'utf8'); } catch { raw = undefined; }
    const title = titleFromPath(r.vault_path);
    // Masking logic: AI:META -> only title + first line if not sensitive. AI:NONE shouldn't be indexed but guard.
    let content: string | undefined = raw;
    if (r.aei_code.includes('AI:NONE')) {
      content = undefined; // never expose
    } else if (r.aei_code.includes('AI:META')) {
      if (raw) {
        const firstLine = raw.split(/\r?\n/).find(l => l.trim()) || '';
        content = `# ${title}\n${firstLine}`; // metadata only
      } else {
        content = `# ${title}`;
      }
    }
    return { id: r.id, vault_path: r.vault_path, aei_code: r.aei_code, content, title };
  });
}

function titleFromPath(p: string): string {
  return path.basename(p).replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
}
