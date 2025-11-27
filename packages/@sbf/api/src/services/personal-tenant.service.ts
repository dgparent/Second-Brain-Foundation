// Personal Tenant Service
// Handles creation and management of personal vaults

import { Injectable } from '@nestjs/common';
import { TenantService } from './tenant.service';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class PersonalTenantService {
  constructor(
    private readonly tenantService: TenantService
  ) {}

  /**
   * Create default personal tenant for new user
   */
  async createDefaultPersonalTenant(userId: string, userEmail?: string): Promise<any> {
    const tenant = await this.tenantService.create({
      type: 'personal',
      display_name: 'My Vault',
      slug: `user-${userId.substring(0, 8)}`,
      features: {
        sso_enabled: false,
        max_members: 1,
        retention_days: 365,
        enable_cross_workspace_search: false
      },
      policies: {
        audit_retention_days: 90
      }
    });

    // Add user as owner
    await this.tenantService.addMembership(tenant.id, {
      user_id: userId,
      role: 'tenant_owner',
      status: 'active'
    });

    // Initialize vault structure
    await this.initializeVaultStructure(tenant.id);

    // Set default privacy settings
    await this.setDefaultPrivacySettings(tenant.id);

    // Start file watcher (if available)
    // await this.fileWatcher.watchTenant(tenant.id);

    return tenant;
  }

  /**
   * Initialize vault folder structure
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
      '.aei',
      '.aei/cache',
      '.aei/logs'
    ];

    for (const folder of folders) {
      await fs.mkdir(path.join(tenantRoot, folder), { recursive: true });
    }

    // Create welcome README
    await this.createWelcomeReadme(tenantId);

    // Create first daily note
    await this.createFirstDailyNote(tenantId);
  }

  /**
   * Create welcome README file
   */
  private async createWelcomeReadme(tenantId: string): Promise<void> {
    const vaultsBasePath = process.env.VAULTS_BASE_PATH || './vaults';
    const content = `# Welcome to Your Second Brain

This is your personal vault managed by Second Brain Foundation.

## Getting Started

- Check the Daily/ folder for your daily notes
- Explore People/, Places/, Projects/, Topics/ for organized knowledge
- Use AEI (AI-Enabled Interface) for intelligent assistance

## Folder Structure

- **Daily/** - Daily notes and journals
- **People/** - Contacts and relationships
- **Places/** - Locations and spaces
- **Projects/** - Active and archived projects
- **Topics/** - Knowledge areas and research
- **Events/** - Calendar and scheduled items
- **Assets/** - Files, images, and resources
- **Templates/** - Note templates

## Privacy & Security

Your data is private and secure. By default:
- Local AI processing is enabled
- Cloud AI processing is disabled (you can enable it)
- Your data stays on your device

---

Created: ${new Date().toISOString()}
Tenant ID: ${tenantId}
Tenant Type: personal
`;

    await fs.writeFile(
      path.join(vaultsBasePath, tenantId, 'README.md'),
      content
    );
  }

  /**
   * Create first daily note
   */
  private async createFirstDailyNote(tenantId: string): Promise<void> {
    const vaultsBasePath = process.env.VAULTS_BASE_PATH || './vaults';
    const today = new Date().toISOString().split('T')[0];
    
    const content = `---
uid: daily-${today}
date: ${today}
tenant_id: ${tenantId}
created_at: ${new Date().toISOString()}
updated_at: ${new Date().toISOString()}
---

# Daily Note - ${today}

Welcome to your first daily note! 🎉

## Getting Started

This is your personal space for:
- Daily reflections and journal entries
- Task tracking and to-dos
- Meeting notes
- Quick thoughts and ideas

## Tips

- Use markdown for formatting
- Link to other notes with [[note-name]]
- Tag topics with #tags
- AEI will help you organize and find information

---

Start writing below...
`;

    await fs.writeFile(
      path.join(vaultsBasePath, tenantId, 'Daily', `${today}.md`),
      content
    );
  }

  /**
   * Set default privacy settings
   */
  private async setDefaultPrivacySettings(tenantId: string): Promise<void> {
    const vaultsBasePath = process.env.VAULTS_BASE_PATH || './vaults';
    const privacyConfig = {
      default_sensitivity: 'personal',
      privacy: {
        local_ai_allowed: true,
        cloud_ai_allowed: false,
        export_allowed: true
      },
      ai_preferences: {
        embedding_model: 'local',
        chat_model: 'local',
        summarization: 'local'
      }
    };

    await fs.writeFile(
      path.join(vaultsBasePath, tenantId, '.aei', 'privacy-config.json'),
      JSON.stringify(privacyConfig, null, 2)
    );
  }

  /**
   * Create additional personal vault (for users who want multiple vaults)
   */
  async createAdditionalVault(
    userId: string,
    displayName: string,
    purpose?: string
  ): Promise<any> {
    const slug = displayName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    const tenant = await this.tenantService.create({
      type: 'personal',
      display_name: displayName,
      slug: `${slug}-${userId.substring(0, 8)}`,
      features: {
        sso_enabled: false,
        max_members: 1,
        retention_days: 365,
        enable_cross_workspace_search: false
      },
      policies: {
        audit_retention_days: 90
      }
    });

    await this.tenantService.addMembership(tenant.id, {
      user_id: userId,
      role: 'tenant_owner',
      status: 'active'
    });

    await this.initializeVaultStructure(tenant.id);
    await this.setDefaultPrivacySettings(tenant.id);

    if (purpose) {
      await this.addVaultPurpose(tenant.id, purpose);
    }

    return tenant;
  }

  /**
   * Add purpose documentation to vault
   */
  private async addVaultPurpose(tenantId: string, purpose: string): Promise<void> {
    const vaultsBasePath = process.env.VAULTS_BASE_PATH || './vaults';
    const readmePath = path.join(vaultsBasePath, tenantId, 'README.md');
    
    const content = await fs.readFile(readmePath, 'utf-8');
    const updatedContent = content.replace(
      'This is your personal vault managed by Second Brain Foundation.',
      `This is your personal vault managed by Second Brain Foundation.

**Vault Purpose:** ${purpose}`
    );

    await fs.writeFile(readmePath, updatedContent);
  }
}
