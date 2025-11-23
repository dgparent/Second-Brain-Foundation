import { PrivacyFilter } from '../PrivacyFilter';
import { PrivacyLevel } from '../types';

describe('PrivacyFilter', () => {
  let filter: PrivacyFilter;

  beforeEach(() => {
    filter = new PrivacyFilter();
  });

  describe('filterContent', () => {
    it('should not filter public content', () => {
      const content = 'This is public content with email@example.com';
      const result = filter.filterContent(content, PrivacyLevel.Public);

      expect(result.filtered).toBe(false);
      expect(result.filteredContent).toBe(content);
      expect(result.removedSections).toHaveLength(0);
    });

    it('should filter SSN from personal content', () => {
      const content = 'My SSN is 123-45-6789';
      const result = filter.filterContent(content, PrivacyLevel.Personal);

      expect(result.filtered).toBe(true);
      expect(result.filteredContent).toContain('[REDACTED]');
      expect(result.removedSections).toContain('123-45-6789');
    });

    it('should filter credit card from personal content', () => {
      const content = 'Card: 1234567890123456';
      const result = filter.filterContent(content, PrivacyLevel.Personal);

      expect(result.filtered).toBe(true);
      expect(result.filteredContent).toContain('[REDACTED]');
    });

    it('should filter email from private content', () => {
      const content = 'Contact me at john@example.com';
      const result = filter.filterContent(content, PrivacyLevel.Private);

      expect(result.filtered).toBe(true);
      expect(result.filteredContent).toContain('[REDACTED]');
      expect(result.removedSections).toContain('john@example.com');
    });

    it('should filter phone numbers from private content', () => {
      const content = 'Call me at 555-123-4567';
      const result = filter.filterContent(content, PrivacyLevel.Private);

      expect(result.filtered).toBe(true);
      expect(result.filteredContent).toContain('[REDACTED]');
    });

    it('should filter IP addresses from private content', () => {
      const content = 'Server IP: 192.168.1.1';
      const result = filter.filterContent(content, PrivacyLevel.Private);

      expect(result.filtered).toBe(true);
      expect(result.filteredContent).toContain('[REDACTED]');
    });

    it('should filter everything for confidential content', () => {
      const content = 'This is confidential';
      const result = filter.filterContent(content, PrivacyLevel.Confidential);

      expect(result.filtered).toBe(true);
      expect(result.filteredContent).toContain('[REDACTED]');
    });

    it('should handle multiple patterns in same content', () => {
      const content = 'Email: test@example.com, Phone: 555-1234, SSN: 123-45-6789';
      const result = filter.filterContent(content, PrivacyLevel.Private);

      expect(result.filtered).toBe(true);
      expect(result.removedSections.length).toBeGreaterThan(1);
    });
  });

  describe('addCustomPattern', () => {
    it('should add custom pattern to specified level', () => {
      const customPattern = /\b(SECRET_\d+)\b/g;
      filter.addCustomPattern(PrivacyLevel.Personal, customPattern);

      const content = 'Code: SECRET_12345';
      const result = filter.filterContent(content, PrivacyLevel.Personal);

      expect(result.filtered).toBe(true);
      expect(result.filteredContent).toContain('[REDACTED]');
    });
  });

  describe('removeAllPatterns', () => {
    it('should clear all patterns for specified level', () => {
      filter.removeAllPatterns(PrivacyLevel.Personal);

      const content = 'SSN: 123-45-6789';
      const result = filter.filterContent(content, PrivacyLevel.Personal);

      expect(result.filtered).toBe(false);
      expect(result.filteredContent).toBe(content);
    });
  });
});
