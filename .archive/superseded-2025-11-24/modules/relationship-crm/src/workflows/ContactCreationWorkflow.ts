/**
 * Relationship CRM Plugin - Contact Creation Workflow
 * 
 * Intelligent contact creation with AI-powered enrichment and duplicate detection
 */

import { createCRMContact, type LeadStatus, type PriorityLevel } from '../entities/CRMContact';
import type { ContactCategory } from '@sbf/frameworks-relationship-tracking';
import type { SimpleMemoryEngine, SimpleAEIProvider, SimpleEntity } from '../types/common';

export interface ContactCreationOptions {
  full_name: string;
  email?: string;
  phone?: string;
  company?: string;
  job_title?: string;
  category?: ContactCategory;
  tags?: string[];
  
  // CRM-specific
  lead_status?: LeadStatus;
  lead_source?: string;
  deal_value?: number;
  priority_level?: PriorityLevel;
  industry?: string;
  
  // AI enrichment options
  enrichment_options?: {
    infer_company?: boolean;
    infer_job_title?: boolean;
    infer_industry?: boolean;
    suggest_tags?: boolean;
    check_duplicates?: boolean;
  };
}

export class ContactCreationWorkflow {
  constructor(
    private memoryEngine: SimpleMemoryEngine,
    private aeiProvider?: SimpleAEIProvider
  ) {}

  /**
   * Create a new CRM contact with optional AI enrichment
   */
  async createContact(options: ContactCreationOptions): Promise<SimpleEntity> {
    // Check for duplicates if requested
    if (options.enrichment_options?.check_duplicates && this.aeiProvider) {
      const duplicate = await this.findDuplicateContact(options);
      if (duplicate) {
        throw new Error(`Duplicate contact found: ${duplicate.uid}`);
      }
    }

    // AI enrichment if enabled and provider available
    let enrichedData = { ...options };
    if (this.aeiProvider && options.enrichment_options) {
      enrichedData = await this.enrichContactData(options);
    }

    // Generate UID
    const uid = this.generateContactUID(enrichedData.full_name);

    // Calculate initial lead score
    const lead_score = this.calculateInitialLeadScore(enrichedData);

    // Create contact entity
    const contact = createCRMContact({
      uid,
      full_name: enrichedData.full_name,
      email: enrichedData.email,
      phone: enrichedData.phone,
      company: enrichedData.company,
      job_title: enrichedData.job_title,
      category: enrichedData.category || 'acquaintance',
      tags: enrichedData.tags || [],
      lead_status: enrichedData.lead_status || 'new',
      lead_source: enrichedData.lead_source,
      lead_score,
      deal_value: enrichedData.deal_value,
      priority_level: enrichedData.priority_level || this.inferPriorityLevel(enrichedData),
      industry: (enrichedData as any).industry,
      company_size: (enrichedData as any).company_size,
    });

    // Store in memory engine
    await this.memoryEngine.store(contact);

    return contact;
  }

  /**
   * Batch create contacts from a list
   */
  async createBatchContacts(contactList: ContactCreationOptions[]): Promise<SimpleEntity[]> {
    const results: SimpleEntity[] = [];
    
    for (const options of contactList) {
      try {
        const contact = await this.createContact(options);
        results.push(contact);
      } catch (error) {
        console.error(`Failed to create contact ${options.full_name}:`, error);
      }
    }

    return results;
  }

  /**
   * AI-powered contact data enrichment
   */
  private async enrichContactData(options: ContactCreationOptions): Promise<any> {
    const enriched = { ...options };
    const enrichOpts = options.enrichment_options!;

    // Infer company from email domain
    if (enrichOpts.infer_company && options.email && !options.company) {
      const domain = options.email.split('@')[1];
      if (domain && !this.isGenericEmail(domain)) {
        enriched.company = this.domainToCompanyName(domain);
      }
    }

    // Use AI to suggest additional metadata
    if (this.aeiProvider && (enrichOpts.infer_job_title || enrichOpts.infer_industry || enrichOpts.suggest_tags)) {
      const context = `
        Name: ${options.full_name}
        Email: ${options.email || 'unknown'}
        Company: ${enriched.company || 'unknown'}
        Job Title: ${options.job_title || 'unknown'}
      `;

      try {
        // Infer industry
        if (enrichOpts.infer_industry && enriched.company) {
          const industryResult = await this.aeiProvider.analyze(
            'What industry does this company operate in? Respond with a single industry name.',
            context
          );
          if (industryResult.confidence > 0.6) {
            enriched.industry = industryResult.result.trim();
          }
        }

        // Suggest tags
        if (enrichOpts.suggest_tags) {
          const tagsResult = await this.aeiProvider.analyze(
            'Suggest 2-3 relevant tags for this contact (comma-separated).',
            context
          );
          if (tagsResult.confidence > 0.5) {
            const suggestedTags = tagsResult.result.split(',').map(t => t.trim().toLowerCase());
            enriched.tags = [...(options.tags || []), ...suggestedTags];
          }
        }
      } catch (error) {
        console.error('AI enrichment failed:', error);
      }
    }

    return enriched;
  }

  /**
   * Find potential duplicate contacts
   */
  private async findDuplicateContact(options: ContactCreationOptions): Promise<SimpleEntity | null> {
    const contacts = await this.memoryEngine.query({ type: 'crm.contact' });

    // Exact email match
    if (options.email) {
      const emailMatch = contacts.find(c => 
        c.metadata.email?.toLowerCase() === options.email!.toLowerCase()
      );
      if (emailMatch) return emailMatch;
    }

    // Exact phone match
    if (options.phone) {
      const phoneMatch = contacts.find(c =>
        this.normalizePhone(c.metadata.phone) === this.normalizePhone(options.phone!)
      );
      if (phoneMatch) return phoneMatch;
    }

    // Similar name match
    const nameMatch = contacts.find(c => 
      this.nameSimilarity(c.metadata.full_name, options.full_name) > 0.9
    );
    if (nameMatch) return nameMatch;

    return null;
  }

  /**
   * Calculate initial lead score based on available data
   */
  private calculateInitialLeadScore(data: any): number {
    let score = 0;

    // Has email: +20
    if (data.email) score += 20;

    // Has phone: +15
    if (data.phone) score += 15;

    // Has company: +15
    if (data.company) score += 15;

    // Has job title: +10
    if (data.job_title) score += 10;

    // Has deal value: +20
    if (data.deal_value && data.deal_value > 0) score += 20;

    // Decision maker or budget authority: +20
    if (data.decision_maker || data.budget_authority) score += 20;

    return Math.min(100, score);
  }

  /**
   * Infer priority level from available data
   */
  private inferPriorityLevel(data: any): PriorityLevel {
    const score = this.calculateInitialLeadScore(data);
    
    if (score >= 75) return 'critical';
    if (score >= 50) return 'high';
    if (score >= 25) return 'medium';
    return 'low';
  }

  /**
   * Generate unique contact UID
   */
  private generateContactUID(fullName: string): string {
    const slug = fullName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const timestamp = Date.now().toString(36);
    return `contact-${slug}-${timestamp}`;
  }

  /**
   * Check if email domain is generic (gmail, yahoo, etc.)
   */
  private isGenericEmail(domain: string): boolean {
    const genericDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com'];
    return genericDomains.some(d => domain.toLowerCase().includes(d));
  }

  /**
   * Convert email domain to company name
   */
  private domainToCompanyName(domain: string): string {
    const name = domain.split('.')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  /**
   * Normalize phone number for comparison
   */
  private normalizePhone(phone?: string): string {
    if (!phone) return '';
    return phone.replace(/\D/g, '');
  }

  /**
   * Calculate similarity between two names (0-1)
   */
  private nameSimilarity(name1: string, name2: string): number {
    const n1 = name1.toLowerCase().trim();
    const n2 = name2.toLowerCase().trim();
    
    if (n1 === n2) return 1.0;
    
    // Simple Levenshtein-like similarity
    const longer = n1.length > n2.length ? n1 : n2;
    const shorter = n1.length > n2.length ? n2 : n1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(n1, n2);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }
}
