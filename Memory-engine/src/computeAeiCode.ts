export type MemoryLevel = 'transitory' | 'temporary' | 'short_term' | 'long_term' | 'canonical' | 'archived';
export type RestrictionMode = 'permissive' | 'cautious' | 'hardened';

export interface SensitivityPrivacy {
  cloud_ai_allowed: boolean;
  local_ai_allowed: boolean;
  export_allowed: boolean;
}

export interface Sensitivity {
  level: number; // 0-9
  scope?: string; // public_group | shareable_group | internal_group | secret_group | compartmentalized_group
  privacy: SensitivityPrivacy;
  visibility: 'public' | 'internal' | 'user' | 'restricted';
  group_access?: string[];
}

export interface Control {
  AEI_restriction_mode?: RestrictionMode;
}

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
  if (s.visibility === 'user' && level >= 3) scopeCode = 'PERS';
  return `${level}-${scopeCode}`;
}

function aiToCode(s: Sensitivity, control?: Control): string {
  const level = s.level;
  const { cloud_ai_allowed, local_ai_allowed } = s.privacy;
  const mode = control?.AEI_restriction_mode;

  if (level >= 8 || (!cloud_ai_allowed && !local_ai_allowed)) return 'NONE';
  if (mode === 'hardened') return 'META';
  if (!cloud_ai_allowed && local_ai_allowed) {
    if (mode === 'cautious') return 'LOC-C';
    return 'LOC';
  }
  // If level in 4-7 and hardened already handled, cautious w/ local only handled above
  // Cloud + local allowed cases
  return 'FULL';
}

function visibilityToCode(s: Sensitivity): string {
  const v = s.visibility;
  switch (v) {
    case 'public': return 'PUB';
    case 'internal': return s.group_access && s.group_access.length > 0 ? 'GRP' : 'INT';
    case 'user': return 'USER';
    case 'restricted': return 'RST';
    default: return 'UNK';
  }
}

// Simple test runner if executed directly
if (require.main === module) {
  const demo = computeAeiCode('short_term', {
    level: 4,
    privacy: { cloud_ai_allowed: false, local_ai_allowed: true, export_allowed: false },
    visibility: 'user'
  } as Sensitivity);
  console.log(demo); // Expect MEM:ST | SEC:4-PERS | AI:LOC | EXP:NO | VIS:USER
}
