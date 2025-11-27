/**
 * Tests for CRM Contact Entity
 */

import { createCRMContact, updateLeadStatus, updateEngagementScore, setNextAction } from '../entities/CRMContact';

describe('CRMContact Entity', () => {
  describe('createCRMContact', () => {
    it('should create a CRM contact with basic fields', () => {
      const contact = createCRMContact({
        uid: 'test-contact-1',
        full_name: 'John Doe',
        email: 'john@example.com',
        category: 'colleague',
      });

      expect(contact.uid).toBe('test-contact-1');
      expect(contact.type).toBe('crm.contact');
      expect(contact.metadata.full_name).toBe('John Doe');
      expect(contact.metadata.email).toBe('john@example.com');
      expect(contact.metadata.category).toBe('colleague');
    });

    it('should set default CRM fields', () => {
      const contact = createCRMContact({
        uid: 'test-contact-2',
        full_name: 'Jane Smith',
        category: 'client',
      });

      expect(contact.metadata.lead_status).toBe('new');
      expect(contact.metadata.lead_score).toBe(0);
      expect(contact.metadata.priority_level).toBe('medium');
      expect(contact.metadata.currency).toBe('USD');
    });

    it('should accept CRM-specific fields', () => {
      const contact = createCRMContact({
        uid: 'test-contact-3',
        full_name: 'Bob Johnson',
        category: 'client',
        lead_status: 'qualified',
        lead_score: 85,
        deal_value: 50000,
        priority_level: 'high',
        industry: 'Technology',
        decision_maker: true,
      });

      expect(contact.metadata.lead_status).toBe('qualified');
      expect(contact.metadata.lead_score).toBe(85);
      expect(contact.metadata.deal_value).toBe(50000);
      expect(contact.metadata.priority_level).toBe('high');
      expect(contact.metadata.industry).toBe('Technology');
      expect(contact.metadata.decision_maker).toBe(true);
    });
  });

  describe('updateLeadStatus', () => {
    it('should update lead status and track history', () => {
      const contact = createCRMContact({
        uid: 'test-contact-4',
        full_name: 'Alice Brown',
        category: 'client',
        lead_status: 'new',
      });

      const updated = updateLeadStatus(contact, 'contacted', 'First outreach completed');

      expect(updated.metadata.lead_status).toBe('contacted');
      expect(updated.metadata.status_change_history).toHaveLength(1);
      expect(updated.metadata.status_change_history[0].from).toBe('new');
      expect(updated.metadata.status_change_history[0].to).toBe('contacted');
      expect(updated.metadata.status_change_history[0].notes).toBe('First outreach completed');
    });
  });

  describe('updateEngagementScore', () => {
    it('should update engagement score', () => {
      const contact = createCRMContact({
        uid: 'test-contact-5',
        full_name: 'Charlie Davis',
        category: 'colleague',
        engagement_score: 50,
      });

      const updated = updateEngagementScore(contact, 75);

      expect(updated.metadata.engagement_score).toBe(75);
      expect(updated.metadata.last_engagement_date).toBeDefined();
    });

    it('should clamp engagement score between 0 and 100', () => {
      const contact = createCRMContact({
        uid: 'test-contact-6',
        full_name: 'Diana Evans',
        category: 'friend',
      });

      const tooHigh = updateEngagementScore(contact, 150);
      expect(tooHigh.metadata.engagement_score).toBe(100);

      const tooLow = updateEngagementScore(contact, -50);
      expect(tooLow.metadata.engagement_score).toBe(0);
    });
  });

  describe('setNextAction', () => {
    it('should set next action and date', () => {
      const contact = createCRMContact({
        uid: 'test-contact-7',
        full_name: 'Frank Green',
        category: 'client',
      });

      const updated = setNextAction(contact, 'Schedule demo call', '2025-12-01');

      expect(updated.metadata.next_action).toBe('Schedule demo call');
      expect(updated.metadata.next_action_date).toBe('2025-12-01');
      expect(updated.metadata.action_history).toHaveLength(1);
      expect(updated.metadata.action_history[0].action).toBe('Schedule demo call');
    });
  });
});
