/**
 * AEI Code Computer
 * Computes security/AI access codes for entities based on memory level and sensitivity
 */

import { MemoryLevel, Sensitivity, Control, RestrictionMode, ScopeGroup } from '../types';

/**
 * Computes the AEI code for an entity
 * Format: MEM:XX | SEC:X-XXX | AI:XXX | EXP:XXX | VIS:XXX
 */
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

/**
 * Converts memory level to code
 */
function memoryToCode(m: MemoryLevel): string {
  const codes: Record<MemoryLevel, string> = {
    'transitory': 'TR',
    'temporary': 'TMP',
    'short_term': 'ST',
    'long_term': 'LT',
    'canonical': 'CN',
    'archived': 'AR'
  };
  return codes[m] || 'UNK';
}

/**
 * Converts sensitivity to security code
 * Format: {level}-{scope}
 */
function securityToCode(s: Sensitivity): string {
  const level = s.level;
  let scopeCode = 'GEN';
  
  const scope = s.scope;
  if (scope) {
    const scopeCodes: Record<ScopeGroup, string> = {
      'public_group': 'PUB',
      'shareable_group': 'SHR',
      'internal_group': 'INT',
      'secret_group': 'SEC',
      'compartmentalized_group': 'CMP'
    };
    scopeCode = scopeCodes[scope] || 'GEN';
  }
  
  // Personal readability override
  if (s.visibility === 'user' && level >= 3) {
    scopeCode = 'PERS';
  }
  
  return `${level}-${scopeCode}`;
}

/**
 * Converts AI access permissions to code
 */
function aiToCode(s: Sensitivity, control?: Control): string {
  const level = s.level;
  const { cloud_ai_allowed, local_ai_allowed } = s.privacy;
  const mode: RestrictionMode | undefined = control?.AEI_restriction_mode;
  
  // No AI allowed at all
  if (level >= 8 || (!cloud_ai_allowed && !local_ai_allowed)) {
    return 'NONE';
  }
  
  // Hardened mode: only metadata
  if (mode === 'hardened') {
    return 'META';
  }
  
  // Local AI only
  if (!cloud_ai_allowed && local_ai_allowed) {
    if (mode === 'cautious') {
      return 'LOC-C';
    }
    return 'LOC';
  }
  
  // Full access (cloud + local)
  return 'FULL';
}

/**
 * Converts visibility to code
 */
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
 * Parses an AEI code back into components (for debugging/auditing)
 */
export function parseAeiCode(aeiCode: string): {
  memory: string;
  security: string;
  ai: string;
  export: string;
  visibility: string;
} | null {
  const regex = /MEM:(\w+) \| SEC:([\w-]+) \| AI:([\w-]+) \| EXP:(\w+) \| VIS:(\w+)/;
  const match = aeiCode.match(regex);
  
  if (!match) {
    return null;
  }
  
  return {
    memory: match[1],
    security: match[2],
    ai: match[3],
    export: match[4],
    visibility: match[5]
  };
}

/**
 * Checks if entity can be used for AI processing based on AEI code
 */
export function canUseForAI(aeiCode: string, cloudAI: boolean = false): boolean {
  const parsed = parseAeiCode(aeiCode);
  if (!parsed) return false;
  
  const aiCode = parsed.ai;
  
  if (aiCode === 'NONE' || aiCode === 'META') {
    return false;
  }
  
  if (cloudAI && (aiCode === 'LOC' || aiCode === 'LOC-C')) {
    return false;
  }
  
  return true;
}

/**
 * Checks if entity can be exported based on AEI code
 */
export function canExport(aeiCode: string): boolean {
  const parsed = parseAeiCode(aeiCode);
  return parsed?.export === 'YES';
}
