// Pseudo-Personal Tenant Service
// Manages vaults for individuals with guardians (children, elderly, etc.)

import { Injectable } from '@nestjs/common';
import { TenantService } from './tenant.service';
import * as fs from 'fs/promises';
import * as path from 'path';

interface SubjectData {
  name: string;
  date_of_birth?: string;
  relationship?: string;
}

interface CreatePseudoPersonalTenantDto {
  display_name: string;
  slug: string;
  subject_person_uid?: string;
  subject_data: SubjectData;
  authority_basis: string;
  require_two_guardian_approval?: boolean;
  allow_subject_login?: boolean;
}

@Injectable()
export class PseudoPersonalTenantService {
  constructor(
    private readonly tenantService: TenantService
  ) {}

  /**
   * Create pseudo-personal tenant with subject and guardians
   */
  async createPseudoPersonalTenant(
    guardianUserId: string,
    dto: CreatePseudoPersonalTenantDto
  ): Promise<any> {
    const tenant = await this.tenantService.create({
      type: 'pseudo_personal',
      display_name: dto.display_name,
      slug: dto.slug,
      subject_person_uid: dto.subject_person_uid,
      features: {
        sso_enabled: false,
        max_members: 10, // Guardians + care team
        retention_days: 2555, // 7 years (legal requirement in some jurisdictions)
        enable_cross_workspace_search: false
      },
      policies: {
        export_requires_two_guardians: dto.require_two_guardian_approval || false,
        allow_subject_login: dto.allow_subject_login || false,
        audit_retention_days: 2555 // 7 years
      }
    });

    // Add creating user as first guardian
    await this.tenantService.addMembership(tenant.id, {
      user_id: guardianUserId,
      role: 'guardian',
      status: 'active',
      metadata: {
        primary_guardian: true,
        authority_basis: dto.authority_basis,
        appointed_at: new Date().toISOString()
      }
    });

    // Initialize vault
    await this.initializeVaultStructure(tenant.id);

    // Create subject entity
    await this.createSubjectEntity(tenant.id, dto.subject_data);

    // Create provenance note documenting guardian authority
    await this.createProvenanceNote(tenant.id, guardianUserId, dto.authority_basis);

    // Create guardian responsibilities note
    await this.createGuardianResponsibilitiesNote(tenant.id);

    return tenant;
  }

  /**
   * Initialize vault structure for pseudo-personal tenant
   */
  private async initializeVaultStructure(tenantId: string): Promise<void> {
    const vaultsBasePath = process.env.VAULTS_BASE_PATH || './vaults';
    const tenantRoot = path.join(vaultsBasePath, tenantId);

    const folders = [
      'Daily',
      'People',
      'Places',
      'Projects',
      'Topics',
      'Events',
      'Assets',
      'Templates',
      'Provenance',
      'Guardian-Notes',
      'Care-Team',
      '.aei',
      '.aei/cache',
      '.aei/logs',
      '.aei/audit-logs'
    ];

    for (const folder of folders) {
      await fs.mkdir(path.join(tenantRoot, folder), { recursive: true });
    }

    await this.createWelcomeReadme(tenantId);
  }

  /**
   * Create welcome README for pseudo-personal vault
   */
  private async createWelcomeReadme(tenantId: string): Promise<void> {
    const vaultsBasePath = process.env.VAULTS_BASE_PATH || './vaults';
    const content = `# Pseudo-Personal Vault

This vault is managed by appointed guardians on behalf of the subject.

## Vault Structure

- **Daily/** - Daily notes and observations
- **People/** - Relationships and contacts
- **Guardian-Notes/** - Notes from guardians
- **Provenance/** - Authority documentation and consent
- **Care-Team/** - Information for caregivers
- **Topics/** - Knowledge areas
- **Events/** - Calendar and activities

## Guardian Responsibilities

Guardians are expected to:
- Act in the best interest of the subject
- Maintain confidentiality and privacy
- Document significant decisions
- Comply with applicable laws and regulations
- Respect the subject's autonomy when appropriate

## Audit Trail

All guardian actions are logged in \`.aei/audit-logs/\` for transparency and compliance.

## Privacy & Security

This vault has enhanced security:
- All guardian actions are audited
- Retention period: 7 years
- Data export may require multiple guardian approval
- Subject privacy is paramount

---

Created: ${new Date().toISOString()}
Tenant ID: ${tenantId}
Tenant Type: pseudo_personal
`;

    await fs.writeFile(
      path.join(vaultsBasePath, tenantId, 'README.md'),
      content
    );
  }

  /**
   * Create subject entity file
   */
  private async createSubjectEntity(
    tenantId: string,
    subjectData: SubjectData
  ): Promise<void> {
    const vaultsBasePath = process.env.VAULTS_BASE_PATH || './vaults';
    const uid = `person-subject-${Date.now()}`;
    
    const content = `---
uid: ${uid}
type: person
name: ${subjectData.name}
tenant_id: ${tenantId}
is_subject: true
date_of_birth: ${subjectData.date_of_birth || 'Not specified'}
relationship: self
sensitivity: confidential
privacy:
  local_ai_allowed: true
  cloud_ai_allowed: false
  export_allowed: false
created_at: ${new Date().toISOString()}
updated_at: ${new Date().toISOString()}
---

# ${subjectData.name}

**Role:** Subject of this pseudo-personal vault  
**Date of Birth:** ${subjectData.date_of_birth || 'Not specified'}  
**Guardians:** See Provenance/ folder for authority documentation

## About

This vault is managed by appointed guardians on behalf of ${subjectData.name}.

## Guardian Information

See the Guardian-Notes/ folder for guardian observations and decisions.

## Care Team

See the Care-Team/ folder for information relevant to caregivers.

---

**Important:** All information in this vault is confidential and should be handled with care.
`;

    await fs.writeFile(
      path.join(vaultsBasePath, tenantId, 'People', `${subjectData.name.replace(/\s+/g, '-')}-${uid}.md`),
      content
    );
  }

  /**
   * Create provenance note documenting guardian authority
   */
  private async createProvenanceNote(
    tenantId: string,
    guardianUserId: string,
    authorityBasis: string
  ): Promise<void> {
    const vaultsBasePath = process.env.VAULTS_BASE_PATH || './vaults';
    
    const content = `# Guardian Authority Provenance

**Date Established:** ${new Date().toISOString()}  
**Primary Guardian:** User ${guardianUserId}  
**Authority Basis:** ${authorityBasis}

## Consent and Authorization

${this.getAuthorityDescription(authorityBasis)}

## Legal Framework

This vault operates under the following principles:
- Best interest of the subject
- Privacy and confidentiality
- Transparency through audit logs
- Compliance with applicable laws

## Audit Trail

All guardian actions are logged in \`.aei/audit-logs/\` with:
- Timestamp
- Guardian user ID
- Action performed
- Entity affected
- Metadata

## Guardian Responsibilities

Guardians must:
1. **Act in Best Interest** - All decisions should prioritize the subject's wellbeing
2. **Maintain Privacy** - Protect the subject's confidential information
3. **Document Decisions** - Keep records of significant choices
4. **Respect Autonomy** - Include the subject in decisions when appropriate
5. **Comply with Law** - Follow all applicable legal requirements

## Access Levels

Guardian access includes:
- Read all information (except strictly confidential items)
- Create and edit notes
- Manage daily activities
- Coordinate care team
- **Limited deletion** (may require approval)
- **Cannot change sensitivity** of existing items

## Review and Updates

This provenance note should be reviewed:
- Annually
- When guardians change
- When the subject's status changes
- When legal requirements change

---

Created: ${new Date().toISOString()}
Tenant: ${tenantId}
`;

    await fs.writeFile(
      path.join(vaultsBasePath, tenantId, 'Provenance', `guardian-authority-${Date.now()}.md`),
      content
    );
  }

  /**
   * Get authority description based on type
   */
  private getAuthorityDescription(authorityBasis: string): string {
    const descriptions: Record<string, string> = {
      parental: 'This vault is managed by a parent/legal guardian with inherent parental authority.',
      legal_guardian: 'This vault is managed under court-appointed legal guardianship.',
      power_of_attorney: 'This vault is managed under power of attorney authorization.',
      healthcare_proxy: 'This vault is managed under healthcare proxy authorization.',
      delegated: 'This vault is managed under delegated authority with documented consent.',
      temporary: 'This vault is managed under temporary delegated authority.',
      other: 'This vault is managed under documented consent and authorization.'
    };

    return descriptions[authorityBasis] || descriptions.other;
  }

  /**
   * Create guardian responsibilities note
   */
  private async createGuardianResponsibilitiesNote(tenantId: string): Promise<void> {
    const vaultsBasePath = process.env.VAULTS_BASE_PATH || './vaults';
    
    const content = `# Guardian Responsibilities and Guidelines

## Core Principles

### 1. Best Interest Standard
- All decisions must prioritize the subject's wellbeing
- Consider the subject's preferences and values
- Balance safety with autonomy

### 2. Privacy and Confidentiality
- Protect sensitive information
- Share information only when necessary
- Respect the subject's privacy boundaries

### 3. Transparency
- Document important decisions
- Maintain audit trail
- Be accountable for actions

## Practical Guidelines

### Daily Operations
- Record observations in Guardian-Notes/
- Update care information as needed
- Coordinate with care team
- Maintain regular communication

### Decision Making
- Consult with subject when appropriate
- Consider long-term implications
- Document rationale for major decisions
- Seek additional input when uncertain

### Information Management
- Keep information current
- Organize notes for easy reference
- Use appropriate sensitivity levels
- Maintain backup copies

## Restricted Actions

Some actions require special approval:
- Deleting subject's personal notes
- Changing sensitivity classifications
- Exporting large amounts of data
- Granting access to others

## Getting Help

If you need assistance:
- Review the Provenance/ folder for guidelines
- Contact support for technical issues
- Consult legal counsel for legal questions
- Reach out to care team coordinators

---

Created: ${new Date().toISOString()}
Tenant: ${tenantId}
`;

    await fs.writeFile(
      path.join(vaultsBasePath, tenantId, 'Guardian-Notes', 'responsibilities.md'),
      content
    );
  }

  /**
   * Add additional guardian to existing pseudo-personal tenant
   */
  async addGuardian(
    tenantId: string,
    newGuardianUserId: string,
    addedByUserId: string,
    notes?: string
  ): Promise<void> {
    await this.tenantService.addMembership(tenantId, {
      user_id: newGuardianUserId,
      role: 'guardian',
      status: 'active',
      metadata: {
        primary_guardian: false,
        added_by: addedByUserId,
        added_at: new Date().toISOString(),
        notes
      }
    });

    // Log the addition
    await this.logGuardianChange(tenantId, 'guardian_added', {
      new_guardian: newGuardianUserId,
      added_by: addedByUserId,
      notes
    });
  }

  /**
   * Promote subject to tenant owner (e.g., child becomes adult)
   */
  async promoteSubjectToOwner(
    tenantId: string,
    subjectUserId: string,
    guardianUserId: string
  ): Promise<void> {
    // Change tenant type to personal
    await this.tenantService.update(tenantId, {
      type: 'personal',
      policies: {
        allow_subject_login: true,
        audit_retention_days: 2555 // Keep old audit logs
      }
    });

    // Update subject membership to owner
    await this.tenantService.updateMembership(tenantId, subjectUserId, {
      role: 'tenant_owner',
      metadata: {
        promoted_from_subject: true,
        promoted_at: new Date().toISOString(),
        promoted_by: guardianUserId
      }
    });

    // Document the transition
    await this.documentTransition(tenantId, subjectUserId, guardianUserId);
  }

  /**
   * Document subject to owner transition
   */
  private async documentTransition(
    tenantId: string,
    subjectUserId: string,
    guardianUserId: string
  ): Promise<void> {
    const vaultsBasePath = process.env.VAULTS_BASE_PATH || './vaults';
    
    const content = `# Vault Ownership Transition

**Date:** ${new Date().toISOString()}  
**Previous Type:** Pseudo-Personal  
**New Type:** Personal  

## Transition Details

The subject of this vault has been promoted to full ownership.

**New Owner:** User ${subjectUserId}  
**Authorized By:** Guardian ${guardianUserId}  

## What This Means

- Full control over vault content
- Ability to manage settings and privacy
- Can add/remove members
- Historical audit logs are preserved
- Guardian notes remain accessible

## Next Steps

As the new owner, you may want to:
1. Review privacy settings
2. Update vault structure as needed
3. Review guardian notes (optional)
4. Decide on guardian access (can maintain or remove)
5. Customize your vault

---

All historical data and audit logs have been preserved.
`;

    await fs.writeFile(
      path.join(vaultsBasePath, tenantId, 'Provenance', `ownership-transition-${Date.now()}.md`),
      content
    );
  }

  /**
   * Log guardian changes
   */
  private async logGuardianChange(
    tenantId: string,
    action: string,
    metadata: any
  ): Promise<void> {
    const vaultsBasePath = process.env.VAULTS_BASE_PATH || './vaults';
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      metadata
    };

    const logPath = path.join(vaultsBasePath, tenantId, '.aei', 'audit-logs', 'guardian-changes.jsonl');
    
    try {
      await fs.appendFile(logPath, JSON.stringify(logEntry) + '\n');
    } catch (error) {
      // Create directory if it doesn't exist
      await fs.mkdir(path.dirname(logPath), { recursive: true });
      await fs.appendFile(logPath, JSON.stringify(logEntry) + '\n');
    }
  }
}
