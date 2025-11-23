/**
 * Relationship CRM Plugin - Contact Search Utility
 * 
 * Advanced search and filtering for CRM contacts
 */

import type { SimpleEntity, ContactCategory, RelationshipStrength } from '@sbf/frameworks-relationship-tracking';
import type { LeadStatus, PriorityLevel, SalesStage } from '../entities/CRMContact';

export interface SimpleMemoryEngine {
  query(filter: { type?: string; metadata?: any }): Promise<SimpleEntity[]>;
}

export interface ContactSearchCriteria {
  full_name?: string;
  email?: string;
  company?: string;
  job_title?: string;
  category?: ContactCategory | ContactCategory[];
  tags?: string[];
  relationship_strength?: RelationshipStrength | RelationshipStrength[];
  
  // CRM-specific
  lead_status?: LeadStatus | LeadStatus[];
  sales_stage?: SalesStage | SalesStage[];
  priority_level?: PriorityLevel | PriorityLevel[];
  industry?: string;
  min_deal_value?: number;
  max_deal_value?: number;
  min_lead_score?: number;
  max_lead_score?: number;
  account_manager?: string;
  
  // Fuzzy search
  fuzzy_name?: string;
  fuzzy_company?: string;
}

export class ContactSearchUtility {
  constructor(private memoryEngine: SimpleMemoryEngine) {}

  /**
   * Find contacts matching search criteria
   */
  async findContacts(criteria: ContactSearchCriteria): Promise<SimpleEntity[]> {
    const allContacts = await this.memoryEngine.query({ type: 'crm.contact' });
    
    return allContacts.filter(contact => this.matchesCriteria(contact, criteria));
  }

  /**
   * Quick search by name or email
   */
  async quickSearch(query: string): Promise<SimpleEntity[]> {
    const allContacts = await this.memoryEngine.query({ type: 'crm.contact' });
    const lowerQuery = query.toLowerCase();

    return allContacts.filter(contact => {
      const name = contact.metadata.full_name?.toLowerCase() || '';
      const email = contact.metadata.email?.toLowerCase() || '';
      const company = contact.metadata.company?.toLowerCase() || '';

      return name.includes(lowerQuery) || 
             email.includes(lowerQuery) ||
             company.includes(lowerQuery);
    });
  }

  /**
   * Find high-value contacts
   */
  async findHighValueContacts(minValue: number = 10000): Promise<SimpleEntity[]> {
    return this.findContacts({
      min_deal_value: minValue,
    });
  }

  /**
   * Find hot leads (high score, not yet customers)
   */
  async findHotLeads(): Promise<SimpleEntity[]> {
    return this.findContacts({
      lead_status: ['new', 'contacted', 'qualified'],
      min_lead_score: 70,
    });
  }

  /**
   * Check if contact matches criteria
   */
  private matchesCriteria(contact: SimpleEntity, criteria: ContactSearchCriteria): boolean {
    const metadata = contact.metadata;

    // Exact matches
    if (criteria.full_name && metadata.full_name !== criteria.full_name) return false;
    if (criteria.email && metadata.email !== criteria.email) return false;
    if (criteria.company && metadata.company !== criteria.company) return false;
    if (criteria.job_title && metadata.job_title !== criteria.job_title) return false;
    if (criteria.industry && metadata.industry !== criteria.industry) return false;
    if (criteria.account_manager && metadata.account_manager !== criteria.account_manager) return false;

    // Array/multi-value matches
    if (criteria.category && !this.matchesValue(metadata.category, criteria.category)) return false;
    if (criteria.relationship_strength && !this.matchesValue(metadata.relationship_strength, criteria.relationship_strength)) return false;
    if (criteria.lead_status && !this.matchesValue(metadata.lead_status, criteria.lead_status)) return false;
    if (criteria.sales_stage && !this.matchesValue(metadata.sales_stage, criteria.sales_stage)) return false;
    if (criteria.priority_level && !this.matchesValue(metadata.priority_level, criteria.priority_level)) return false;

    // Tags (any match)
    if (criteria.tags && criteria.tags.length > 0) {
      const contactTags = metadata.tags || [];
      if (!criteria.tags.some(tag => contactTags.includes(tag))) return false;
    }

    // Numeric ranges
    if (criteria.min_deal_value !== undefined && (metadata.deal_value || 0) < criteria.min_deal_value) return false;
    if (criteria.max_deal_value !== undefined && (metadata.deal_value || 0) > criteria.max_deal_value) return false;
    if (criteria.min_lead_score !== undefined && (metadata.lead_score || 0) < criteria.min_lead_score) return false;
    if (criteria.max_lead_score !== undefined && (metadata.lead_score || 0) > criteria.max_lead_score) return false;

    // Fuzzy matches
    if (criteria.fuzzy_name && !this.fuzzyMatch(metadata.full_name, criteria.fuzzy_name)) return false;
    if (criteria.fuzzy_company && !this.fuzzyMatch(metadata.company, criteria.fuzzy_company)) return false;

    return true;
  }

  /**
   * Check if value matches (single value or array of values)
   */
  private matchesValue(actual: any, expected: any | any[]): boolean {
    if (Array.isArray(expected)) {
      return expected.includes(actual);
    }
    return actual === expected;
  }

  /**
   * Fuzzy string matching
   */
  private fuzzyMatch(str1?: string, str2?: string): boolean {
    if (!str1 || !str2) return false;
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();
    return s1.includes(s2) || s2.includes(s1);
  }
}
