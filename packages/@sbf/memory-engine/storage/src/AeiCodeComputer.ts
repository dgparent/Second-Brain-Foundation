/**
 * AEI Code Computer
 * Computes AEI memory-security codes per specification
 */

import { MemoryLevel, Sensitivity, Control } from './types';

export function computeAeiCode(
  memory_level: MemoryLevel,
  sensitivity: Sensitivity,
  control?: Control
): string {
  const memCode = memoryToCode(memory_level);
  const secCode = securityToCode(sensitivity);
  const aiCode = aiToCode(sensitivity, control);
  const expCode = sensitivity.privacy.export_allowed ? 'YES' : 'NO';
  const visCode = visibilityToCode(sensitivity);
  
  return `MEM:${memCode} | SEC:${secCode} | AI:${aiCode} | EXP:${expCode} | VIS:${visCode}`;
}

function memoryToCode(m: MemoryLevel): string {
  switch (m) {
    case 'transitory': return 'TR';
    case 'temporary': return 'TMP';
    case 'short_term': return 'ST';
    case 'long_term': return 'LT';
    case 'canonical': return 'CN';
    case 'archived': return 'AR';
    default: return 'UNK';
  }
}

function securityToCode(s: Sensitivity): string {
  const level = s.level;
  let scopeCode = 'GEN';
  
  const scope = s.scope;
  if (scope) {
    switch (scope) {
      case 'public_group': scopeCode = 'PUB'; break;
      case 'shareable_group': scopeCode = 'SHR'; break;
      case 'internal_group': scopeCode = 'INT'; break;
      case 'secret_group': scopeCode = 'SEC'; break;
      case 'compartmentalized_group': scopeCode = 'CMP'; break;
    }
  }
  
  // Personal readability override
  if (s.visibility === 'user' && level >= 3) {
    scopeCode = 'PERS';
  }
  
  return `${level}-${scopeCode}`;
}

function aiToCode(s: Sensitivity, control?: Control): string {
  const level = s.level;
  const { cloud_ai_allowed, local_ai_allowed } = s.privacy;
  const mode = control?.AEI_restriction_mode;

  // Most restrictive first
  if (level >= 8 || (!cloud_ai_allowed && !local_ai_allowed)) {
    return 'NONE';
  }
  
  if (mode === 'hardened') {
    return 'META';
  }
  
  if (!cloud_ai_allowed && local_ai_allowed) {
    if (mode === 'cautious') {
      return 'LOC-C';
    }
    return 'LOC';
  }
  
  // Cloud + local allowed
  return 'FULL';
}

function visibilityToCode(s: Sensitivity): string {
  const v = s.visibility;
  
  switch (v) {
    case 'public': 
      return 'PUB';
    case 'internal': 
      return (s.group_access && s.group_access.length > 0) ? 'GRP' : 'INT';
    case 'user': 
      return 'USER';
    case 'restricted': 
      return 'RST';
    default: 
      return 'UNK';
  }
}

/**
 * Parse an AEI code back into its components
 */
export function parseAeiCode(code: string): {
  memory: string;
  security: { level: number; scope: string };
  ai: string;
  export: boolean;
  visibility: string;
} | null {
  const parts = code.split(' | ');
  if (parts.length !== 5) return null;
  
  const mem = parts[0].split(':')[1];
  const sec = parts[1].split(':')[1].split('-');
  const ai = parts[2].split(':')[1];
  const exp = parts[3].split(':')[1] === 'YES';
  const vis = parts[4].split(':')[1];
  
  return {
    memory: mem,
    security: { level: parseInt(sec[0]), scope: sec[1] },
    ai,
    export: exp,
    visibility: vis
  };
}
