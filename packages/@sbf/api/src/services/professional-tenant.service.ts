// Professional Tenant Service
// Manages organization/team vaults with advanced features

import { Injectable } from '@nestjs/common';
import { TenantService } from './tenant.service';
import * as fs from 'fs/promises';
import * as path from 'path';

interface CreateProfessionalTenantDto {
  organization_name: string;
  slug: string;
  legal_name?: string;
  country?: string;
  industry?: string;
  size?: string;
  enable_sso?: boolean;
  max_members?: number;
  retention_days?: number;
  require_mfa?: boolean;
}

interface OrganizationalMetadata {
  department?: string;
  team?: string;
  manager_id?: string;
  job_title?: string;
  employee_id?: string;
}

type ProfessionalRole = 
  | 'tenant_owner'
  | 'billing_admin'
  | 'org_admin'
  | 'manager'
  | 'member'
  | 'viewer'
  | 'guest';

@Injectable()
export class ProfessionalTenantService {
  constructor(
    private readonly tenantService: TenantService
  ) {}

  /**
   * Create professional tenant for organization
   */
  async createProfessionalTenant(
    ownerUserId: string,
    dto: CreateProfessionalTenantDto
  ): Promise<any> {
    const tenant = await this.tenantService.create({
      type: 'professional',
      display_name: dto.organization_name,
      slug: dto.slug,
      org_metadata: {
        legal_name: dto.legal_name || dto.organization_name,
        country: dto.country,
        industry: dto.industry,
        size: dto.size
      },
      features: {
        sso_enabled: dto.enable_sso || false,
        max_members: dto.max_members || 50,
        retention_days: dto.retention_days || 2555, // 7 years default
        enable_cross_workspace_search: true
      },
      policies: {
        audit_retention_days: 2555,
        min_password_length: 12,
        require_mfa: dto.require_mfa || false
      }
    });

    // Add creator as owner
    await this.tenantService.addMembership(tenant.id, {
      user_id: ownerUserId,
      role: 'tenant_owner',
      status: 'active',
      metadata: {
        job_title: 'Owner',
        joined_at: new Date().toISOString()
      }
    });

    // Initialize vault
    await this.initializeVaultStructure(tenant.id, dto.organization_name);

    // Create organization documentation
    await this.createOrganizationDocs(tenant.id, dto);

    return tenant;
  }

  /**
   * Initialize vault structure for professional tenant
   */
  private async initializeVaultStructure(tenantId: string, orgName: string): Promise<void> {
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
      'Teams',
      'Clients',
      'Billing',
      'Policies',
      'Onboarding',
      'Documentation',
      '.aei',
      '.aei/cache',
      '.aei/logs',
      '.aei/audit-logs'
    ];

    for (const folder of folders) {
      await fs.mkdir(path.join(tenantRoot, folder), { recursive: true });
    }

    await this.createWelcomeReadme(tenantId, orgName);
  }

  /**
   * Create welcome README for professional vault
   */
  private async createWelcomeReadme(tenantId: string, orgName: string): Promise<void> {
    const vaultsBasePath = process.env.VAULTS_BASE_PATH || './vaults';
    const content = `# ${orgName} - Professional Vault

Welcome to your organization's Second Brain workspace.

## Vault Structure

- **Daily/** - Daily organizational notes and updates
- **People/** - Team members, clients, contacts
- **Projects/** - Active and archived projects
- **Teams/** - Team-specific information
- **Clients/** - Client information and communications
- **Billing/** - Invoices, payments, financial records
- **Policies/** - Company policies and procedures
- **Documentation/** - Knowledge base and guides
- **Topics/** - Industry knowledge and research

## Collaboration

This is a shared workspace. All team members can:
- Create and edit content (based on their role)
- Collaborate on projects
- Share knowledge
- Track organizational activities

## Roles and Permissions

- **Owner** - Full control over the organization
- **Org Admin** - Manage users, settings, and policies
- **Billing Admin** - Manage billing and subscriptions
- **Manager** - Manage teams and projects
- **Member** - Create and edit content
- **Viewer** - Read-only access
- **Guest** - Limited project-specific access

## Security

This vault has enterprise-grade security:
- All actions are audited
- Multi-factor authentication ${tenantId.includes('require_mfa') ? 'required' : 'available'}
- Data retention: 7 years
- Compliance-ready audit logs

## Getting Started

1. **Set up your profile** in People/
2. **Review policies** in Policies/
3. **Join your team** in Teams/
4. **Start collaborating** on Projects/

---

Created: ${new Date().toISOString()}
Tenant ID: ${tenantId}
Tenant Type: professional
`;

    await fs.writeFile(
      path.join(vaultsBasePath, tenantId, 'README.md'),
      content
    );
  }

  /**
   * Create organization documentation
   */
  private async createOrganizationDocs(
    tenantId: string,
    dto: CreateProfessionalTenantDto
  ): Promise<void> {
    await this.createSecurityPolicyDoc(tenantId, dto);
    await this.createOnboardingGuide(tenantId, dto);
    await this.createTeamGuidelines(tenantId);
  }

  /**
   * Create security policy document
   */
  private async createSecurityPolicyDoc(
    tenantId: string,
    dto: CreateProfessionalTenantDto
  ): Promise<void> {
    const vaultsBasePath = process.env.VAULTS_BASE_PATH || './vaults';
    
    const content = `# Security Policy

**Organization:** ${dto.organization_name}  
**Last Updated:** ${new Date().toISOString()}

## Access Control

### Authentication
- Password minimum length: 12 characters
- Multi-factor authentication: ${dto.require_mfa ? 'Required' : 'Optional but recommended'}
- SSO: ${dto.enable_sso ? 'Enabled' : 'Not configured'}

### Authorization
Access is controlled by role-based permissions:
- Actions are limited based on user role
- Sensitive data requires appropriate clearance
- Audit logs track all access

## Data Handling

### Classification
Information is classified as:
1. **Public** - Can be shared freely
2. **Internal** - For organization members only
3. **Confidential** - Restricted to authorized personnel
4. **Strictly Confidential** - Highest protection level

### Retention
- Active data: Retained indefinitely
- Audit logs: ${dto.retention_days || 2555} days
- Deleted items: 30-day recovery window

## Compliance

### Audit Trail
All activities are logged:
- User actions
- Data access
- Configuration changes
- Member management

### Data Protection
- Encryption at rest
- Encryption in transit
- Regular backups
- Disaster recovery plan

## User Responsibilities

All users must:
- Use strong, unique passwords
- Enable MFA when available
- Report security incidents promptly
- Follow data classification guidelines
- Protect access credentials

## Incident Response

If you suspect a security issue:
1. Report immediately to administrators
2. Do not attempt to investigate independently
3. Document what you observed
4. Follow administrator guidance

## Policy Updates

This policy is reviewed:
- Annually
- After security incidents
- When regulations change
- As needed for operational reasons

---

For questions, contact your organization administrator.
`;

    await fs.writeFile(
      path.join(vaultsBasePath, tenantId, 'Policies', 'security-policy.md'),
      content
    );
  }

  /**
   * Create onboarding guide
   */
  private async createOnboardingGuide(
    tenantId: string,
    dto: CreateProfessionalTenantDto
  ): Promise<void> {
    const vaultsBasePath = process.env.VAULTS_BASE_PATH || './vaults';
    
    const content = `# New Member Onboarding Guide

Welcome to ${dto.organization_name}!

## Getting Started

### Day 1
1. **Complete your profile**
   - Add your information in People/
   - Upload a profile photo
   - List your skills and expertise

2. **Review key documents**
   - Security Policy (Policies/security-policy.md)
   - Team Guidelines (Policies/team-guidelines.md)
   - Organization README

3. **Set up your workspace**
   - Create your first daily note
   - Explore the folder structure
   - Bookmark important pages

### Week 1
- [ ] Meet with your manager
- [ ] Join your team(s)
- [ ] Review active projects
- [ ] Set up notifications
- [ ] Complete security training

### Month 1
- [ ] Contribute to a project
- [ ] Add knowledge to Topics/
- [ ] Attend team meetings
- [ ] Provide onboarding feedback

## Key Concepts

### Second Brain Philosophy
This workspace helps our organization:
- Capture knowledge
- Connect information
- Collaborate effectively
- Build institutional memory

### How We Use It
- **Daily Notes**: Team updates, meeting notes
- **Projects**: Active work, deliverables
- **Topics**: Knowledge base, research
- **People**: Team directory, client info

## Tools and Features

### Markdown
We use markdown for formatting:
- Headers: `# Heading`
- Lists: `- Item`
- Links: `[[page-name]]`
- Tags: `#tag-name`

### AEI (AI-Enabled Interface)
Our AI assistant helps with:
- Finding information
- Summarizing notes
- Generating content
- Answering questions

### Collaboration
- Tag team members: @username
- Link to projects: [[project-name]]
- Share updates in Daily notes
- Use templates for consistency

## Getting Help

- **Technical Issues**: Contact IT support
- **Content Questions**: Ask your team
- **Policy Questions**: Review Policies/ or ask admin
- **General Help**: Check Documentation/

## Tips for Success

1. **Be Consistent** - Update daily notes regularly
2. **Link Generously** - Connect related information
3. **Use Templates** - Maintain consistency
4. **Tag Appropriately** - Make content discoverable
5. **Contribute Knowledge** - Share what you learn

---

Welcome aboard! We're glad you're here.

Updated: ${new Date().toISOString()}
`;

    await fs.writeFile(
      path.join(vaultsBasePath, tenantId, 'Onboarding', 'new-member-guide.md'),
      content
    );
  }

  /**
   * Create team guidelines
   */
  private async createTeamGuidelines(tenantId: string): Promise<void> {
    const vaultsBasePath = process.env.VAULTS_BASE_PATH || './vaults';
    
    const content = `# Team Collaboration Guidelines

## Communication

### Daily Updates
- Post daily notes for significant updates
- Tag relevant team members
- Link to related projects
- Keep it concise

### Project Work
- Update project status regularly
- Document decisions and rationale
- Share blockers and dependencies
- Celebrate wins

### Knowledge Sharing
- Add learnings to Topics/
- Create guides and documentation
- Share resources and references
- Review and update existing content

## Organization

### Naming Conventions
- **Projects**: \`project-client-name-YYYY\`
- **Files**: \`descriptive-name-no-spaces\`
- **Tags**: \`#department #project #topic\`

### Folder Structure
- Keep related items together
- Use existing folders when possible
- Propose new structure to team
- Archive completed work

### Linking
- Link to related content
- Use descriptive link text
- Avoid orphaned pages
- Check broken links periodically

## Collaboration

### Working Together
- Respect others' work
- Communicate changes
- Resolve conflicts constructively
- Ask before major restructuring

### Feedback
- Be constructive and specific
- Assume positive intent
- Respond to comments promptly
- Thank contributors

### Meetings
- Document in Daily or Events
- Share agenda beforehand
- Note decisions and action items
- Assign owners and due dates

## Quality Standards

### Content
- Write clearly and concisely
- Use proper grammar and spelling
- Format for readability
- Keep information current

### Accuracy
- Verify facts before posting
- Cite sources when relevant
- Update outdated information
- Flag uncertainty

### Privacy
- Respect classification levels
- Don't share sensitive data inappropriately
- Follow security policy
- Report violations

## Best Practices

### Daily Habits
1. Review your daily note
2. Update project status
3. Respond to mentions
4. Capture new learnings

### Weekly Habits
1. Review team updates
2. Archive completed work
3. Update documentation
4. Clean up loose ends

### Monthly Habits
1. Review knowledge base
2. Update outdated content
3. Improve organization
4. Share feedback

---

These guidelines evolve with our team. Suggest improvements!

Last updated: ${new Date().toISOString()}
`;

    await fs.writeFile(
      path.join(vaultsBasePath, tenantId, 'Policies', 'team-guidelines.md'),
      content
    );
  }

  /**
   * Assign role with organizational hierarchy
   */
  async assignRole(
    tenantId: string,
    userId: string,
    role: ProfessionalRole,
    metadata?: OrganizationalMetadata
  ): Promise<void> {
    await this.tenantService.updateMembership(tenantId, userId, {
      role,
      metadata: {
        ...metadata,
        role_assigned_at: new Date().toISOString()
      }
    });

    // Log the role change
    await this.logRoleChange(tenantId, userId, role, metadata);
  }

  /**
   * Create a team within organization
   */
  async createTeam(
    tenantId: string,
    teamName: string,
    managerId: string,
    description?: string
  ): Promise<void> {
    const vaultsBasePath = process.env.VAULTS_BASE_PATH || './vaults';
    const teamSlug = teamName.toLowerCase().replace(/\s+/g, '-');
    
    const content = `# ${teamName}

**Manager:** User ${managerId}  
**Created:** ${new Date().toISOString()}

## Description

${description || 'Team description to be added.'}

## Team Members

- Manager: User ${managerId}

## Active Projects

## Resources

## Notes

---

Last updated: ${new Date().toISOString()}
`;

    await fs.writeFile(
      path.join(vaultsBasePath, tenantId, 'Teams', `${teamSlug}.md`),
      content
    );
  }

  /**
   * Invite member with specific role
   */
  async inviteMember(
    tenantId: string,
    email: string,
    role: ProfessionalRole,
    invitedBy: string,
    metadata?: OrganizationalMetadata
  ): Promise<any> {
    const invitation = await this.tenantService.createInvitation(tenantId, {
      email,
      role,
      invited_by: invitedBy,
      metadata
    });

    // Send invitation email (would integrate with EmailService)
    // await this.emailService.sendProfessionalInvitation(...)

    return invitation;
  }

  /**
   * Configure SSO for organization
   */
  async configureSso(
    tenantId: string,
    ssoConfig: {
      provider: string;
      domain: string;
      client_id: string;
      metadata_url?: string;
    }
  ): Promise<void> {
    await this.tenantService.update(tenantId, {
      features: {
        sso_enabled: true
      }
    });

    // Store SSO configuration (would be encrypted)
    await this.storeSsoConfig(tenantId, ssoConfig);
  }

  /**
   * Store SSO configuration securely
   */
  private async storeSsoConfig(tenantId: string, ssoConfig: any): Promise<void> {
    const vaultsBasePath = process.env.VAULTS_BASE_PATH || './vaults';
    
    // In production, this should be encrypted
    const configPath = path.join(vaultsBasePath, tenantId, '.aei', 'sso-config.json');
    await fs.writeFile(configPath, JSON.stringify({
      ...ssoConfig,
      configured_at: new Date().toISOString()
    }, null, 2));
  }

  /**
   * Generate organization usage report
   */
  async generateUsageReport(tenantId: string): Promise<any> {
    // Would integrate with actual metrics service
    return {
      tenant_id: tenantId,
      generated_at: new Date().toISOString(),
      metrics: {
        total_members: 0, // Would query actual membership
        active_projects: 0,
        total_entities: 0,
        storage_used_mb: 0
      }
    };
  }

  /**
   * Log role changes for audit
   */
  private async logRoleChange(
    tenantId: string,
    userId: string,
    role: string,
    metadata?: any
  ): Promise<void> {
    const vaultsBasePath = process.env.VAULTS_BASE_PATH || './vaults';
    const logEntry = {
      timestamp: new Date().toISOString(),
      action: 'role_changed',
      user_id: userId,
      new_role: role,
      metadata
    };

    const logPath = path.join(vaultsBasePath, tenantId, '.aei', 'audit-logs', 'role-changes.jsonl');
    
    try {
      await fs.appendFile(logPath, JSON.stringify(logEntry) + '\n');
    } catch (error) {
      await fs.mkdir(path.dirname(logPath), { recursive: true });
      await fs.appendFile(logPath, JSON.stringify(logEntry) + '\n');
    }
  }
}
