/**
 * Tests for Contact Search Utility
 */

import { ContactSearchUtility } from '../utils/ContactSearchUtility';
import { createCRMContact } from '../entities/CRMContact';
import type { SimpleEntity } from '@sbf/frameworks-relationship-tracking';

describe('ContactSearchUtility', () => {
  let search: ContactSearchUtility;
  let mockMemoryEngine: any;
  let testContacts: SimpleEntity[];

  beforeEach(() => {
    // Create test contacts
    testContacts = [
      createCRMContact({
        uid: 'contact-1',
        full_name: 'John Doe',
        email: 'john@acme.com',
        company: 'Acme Corp',
        category: 'client',
        lead_status: 'qualified',
        lead_score: 85,
        deal_value: 50000,
        priority_level: 'high',
      }),
      createCRMContact({
        uid: 'contact-2',
        full_name: 'Jane Smith',
        email: 'jane@techstart.com',
        company: 'TechStart Inc',
        category: 'colleague',
        lead_status: 'customer',
        lead_score: 95,
        deal_value: 100000,
        priority_level: 'critical',
      }),
      createCRMContact({
        uid: 'contact-3',
        full_name: 'Bob Johnson',
        email: 'bob@gmail.com',
        category: 'friend',
        lead_status: 'new',
        lead_score: 30,
        priority_level: 'low',
      }),
    ];

    mockMemoryEngine = {
      query: jest.fn().mockResolvedValue(testContacts),
    };

    search = new ContactSearchUtility(mockMemoryEngine);
  });

  describe('findContacts', () => {
    it('should find contacts by company', async () => {
      const results = await search.findContacts({ company: 'Acme Corp' });
      
      expect(results).toHaveLength(1);
      expect(results[0].metadata.full_name).toBe('John Doe');
    });

    it('should find contacts by category', async () => {
      const results = await search.findContacts({ category: 'client' });
      
      expect(results).toHaveLength(1);
      expect(results[0].uid).toBe('contact-1');
    });

    it('should find contacts by lead status', async () => {
      const results = await search.findContacts({ lead_status: 'qualified' });
      
      expect(results).toHaveLength(1);
      expect(results[0].uid).toBe('contact-1');
    });

    it('should find contacts by priority level', async () => {
      const results = await search.findContacts({ priority_level: ['high', 'critical'] });
      
      expect(results).toHaveLength(2);
    });

    it('should find contacts by deal value range', async () => {
      const results = await search.findContacts({ 
        min_deal_value: 40000,
        max_deal_value: 150000,
      });
      
      expect(results).toHaveLength(2);
    });

    it('should find contacts by lead score range', async () => {
      const results = await search.findContacts({
        min_lead_score: 80,
      });
      
      expect(results).toHaveLength(2);
    });
  });

  describe('quickSearch', () => {
    it('should search by name', async () => {
      const results = await search.quickSearch('john');
      
      expect(results).toHaveLength(2); // John Doe and Bob Johnson
    });

    it('should search by email', async () => {
      const results = await search.quickSearch('acme');
      
      expect(results).toHaveLength(1);
      expect(results[0].metadata.email).toBe('john@acme.com');
    });

    it('should search by company', async () => {
      const results = await search.quickSearch('techstart');
      
      expect(results).toHaveLength(1);
      expect(results[0].metadata.company).toBe('TechStart Inc');
    });

    it('should be case-insensitive', async () => {
      const results = await search.quickSearch('ACME');
      
      expect(results).toHaveLength(1);
    });
  });

  describe('findHighValueContacts', () => {
    it('should find contacts with high deal value', async () => {
      const results = await search.findHighValueContacts(50000);
      
      expect(results).toHaveLength(2);
      expect(results.every(c => (c.metadata.deal_value || 0) >= 50000)).toBe(true);
    });
  });

  describe('findHotLeads', () => {
    it('should find high-scoring non-customer leads', async () => {
      const results = await search.findHotLeads();
      
      expect(results).toHaveLength(1);
      expect(results[0].uid).toBe('contact-1');
      expect(results[0].metadata.lead_status).toBe('qualified');
    });
  });
});
