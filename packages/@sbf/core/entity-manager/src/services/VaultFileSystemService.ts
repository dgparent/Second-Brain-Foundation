// Vault Filesystem Service
// Manages per-tenant vault directory structure and file operations

import * as fs from 'fs/promises';
import * as path from 'path';
import { Injectable, BadRequestException } from '@nestjs/common';

export interface VaultInitializationOptions {
  tenantId: string;
  tenantType: 'personal' | 'pseudo_personal' | 'professional';
  displayName?: string;
}

@Injectable()
export class VaultFileSystemService {
  private readonly baseVaultsPath: string;

  constructor() {
    this.baseVaultsPath = process.env.VAULTS_BASE_PATH || path.join(process.cwd(), 'vaults');
  }

  /**
   * Get the root path for a tenant's vault
   * SECURITY: Validates tenant_id format to prevent path traversal
   */
  getTenantRoot(tenantId: string): string {
    // Strict UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(tenantId)) {
      throw new BadRequestException(`Invalid tenant_id format: ${tenantId}`);
    }

    return path.join(this.baseVaultsPath, tenantId);
  }

  /**
   * Validate that a file path is within the tenant boundary
   * SECURITY: Prevents path traversal attacks (../, absolute paths, etc.)
   */
  validateTenantPath(tenantId: string, filePath: string): string {
    const tenantRoot = this.getTenantRoot(tenantId);
    const absolutePath = path.resolve(tenantRoot, filePath);

    // Ensure resolved path starts with tenant root
    if (!absolutePath.startsWith(tenantRoot)) {
      throw new BadRequestException(
        `Path traversal attempt detected: ${filePath} escapes tenant boundary`
      );
    }

    return absolutePath;
  }

  /**
   * Initialize vault structure for a new tenant
   */
  async initializeTenantVault(options: VaultInitializationOptions): Promise<void> {
    const { tenantId, tenantType, displayName } = options;
    const root = this.getTenantRoot(tenantId);

    // Create base SBF folder structure
    const baseFolders = [
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
      '.aei/logs',
      '.aei/audit-logs'
    ];

    // Add type-specific folders
    const typeFolders = this.getTypeSpecificFolders(tenantType);
    const allFolders = [...baseFolders, ...typeFolders];

    // Create all folders
    for (const folder of allFolders) {
      await fs.mkdir(path.join(root, folder), { recursive: true });
    }

    // Create initial files
    await this.createInitialReadme(tenantId, tenantType, displayName);
    await this.createWelcomeNote(tenantId, tenantType);
    await this.createPrivacyConfig(tenantId, tenantType);
  }

  /**
   * Get type-specific folders for a tenant type
   */
  private getTypeSpecificFolders(tenantType: string): string[] {
    switch (tenantType) {
      case 'pseudo_personal':
        return ['Provenance', 'Guardian-Notes'];
      
      case 'professional':
        return ['Teams', 'Clients', 'Billing', 'Departments'];
      
      case 'personal':
      default:
        return [];
    }
  }

  /**
   * Create initial README.md for tenant
   */
  private async createInitialReadme(
    tenantId: string,
    tenantType: string,
    displayName?: string
  ): Promise<void> {
    const content = `# Welcome to Your Second Brain

${displayName ? `**${displayName}**\n\n` : ''}This is your ${tenantType.replace('_', '-')} vault managed by Second Brain Foundation.

## Getting Started

- 📅 **Daily Notes** - Check the \`Daily/\` folder for your daily notes
- 👥 **People** - Track relationships and contacts in \`People/\`
- 📍 **Places** - Document locations in \`Places/\`
- 📁 **Projects** - Organize work in \`Projects/\`
- 🏷️ **Topics** - Manage knowledge areas in \`Topics/\`
- 📆 **Events** - Track events and milestones in \`Events/\`

## AI-Enabled Interface (AEI)

Use AEI commands for intelligent assistance:
- Automatic entity extraction
- Smart organization
- Relationship discovery
- Context-aware suggestions

${tenantType === 'pseudo_personal' ? `
## Guardian Information

This is a guardian-managed vault. All actions are logged for accountability.
See \`Provenance/\` folder for authority documentation.
` : ''}

${tenantType === 'professional' ? `
## Organization Vault

This workspace is shared with your team. Follow your organization's policies
for data classification and privacy.
` : ''}

---

**Vault Created:** ${new Date().toISOString()}  
**Tenant ID:** \`${tenantId}\`  
**Tenant Type:** ${tenantType}
`;

    const readmePath = path.join(this.getTenantRoot(tenantId), 'README.md');
    await fs.writeFile(readmePath, content, 'utf-8');
  }

  /**
   * Create welcome daily note
   */
  private async createWelcomeNote(tenantId: string, tenantType: string): Promise<void> {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    
    const content = `---
uid: daily-${dateStr}
type: daily
date: ${dateStr}
tags: [welcome]
---

# ${dateStr} - Welcome!

Welcome to your Second Brain Foundation vault! This is your first daily note.

## What are Daily Notes?

Daily notes are the cornerstone of your second brain. Each day gets its own note where you can:

- ✅ Track tasks and to-dos
- 📝 Capture quick thoughts and ideas
- 🔗 Link to people, projects, and topics
- 📊 Review your progress

## Quick Tips

1. **Use [[wiki-style links]]** to reference other notes
2. **Tag with #tags** to organize content
3. **Let AEI help** - it will automatically extract entities and relationships
4. **Review regularly** - come back to past daily notes to see patterns

${tenantType === 'pseudo_personal' ? `
## Guardian Note

This vault is being managed by a guardian. All entries and changes
are logged for transparency and accountability.
` : ''}

Happy note-taking! 🎉
`;

    const dailyPath = path.join(this.getTenantRoot(tenantId), 'Daily', `${dateStr}.md`);
    await fs.writeFile(dailyPath, content, 'utf-8');
  }

  /**
   * Create privacy configuration file
   */
  private async createPrivacyConfig(tenantId: string, tenantType: string): Promise<void> {
    const config = {
      default_sensitivity: tenantType === 'professional' ? 'internal' : 'personal',
      privacy: {
        local_ai_allowed: true,
        cloud_ai_allowed: tenantType === 'professional' ? true : false,
        export_allowed: true
      },
      retention: {
        daily_notes_days: 0,  // Keep forever
        audit_logs_days: tenantType === 'pseudo_personal' ? 2555 : 365,  // 7 years or 1 year
        deleted_items_days: 30
      }
    };

    const configPath = path.join(this.getTenantRoot(tenantId), '.aei', 'privacy-config.json');
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
  }

  /**
   * Check if tenant vault exists
   */
  async vaultExists(tenantId: string): Promise<boolean> {
    try {
      const root = this.getTenantRoot(tenantId);
      await fs.access(root);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Delete tenant vault (for offboarding)
   * DANGER: This is destructive!
   */
  async deleteTenantVault(tenantId: string): Promise<void> {
    const root = this.getTenantRoot(tenantId);
    
    // Extra safety check - ensure we're deleting from vaults directory
    if (!root.includes('vaults')) {
      throw new Error('Safety check failed: not a vaults directory');
    }

    await fs.rm(root, { recursive: true, force: true });
  }

  /**
   * Get vault statistics
   */
  async getVaultStats(tenantId: string): Promise<{
    totalFiles: number;
    totalSize: number;
    folders: string[];
  }> {
    const root = this.getTenantRoot(tenantId);
    
    const stats = {
      totalFiles: 0,
      totalSize: 0,
      folders: []
    };

    async function walkDir(dir: string) {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          stats.folders.push(fullPath.replace(root, ''));
          await walkDir(fullPath);
        } else {
          stats.totalFiles++;
          const stat = await fs.stat(fullPath);
          stats.totalSize += stat.size;
        }
      }
    }

    await walkDir(root);
    return stats;
  }
}
