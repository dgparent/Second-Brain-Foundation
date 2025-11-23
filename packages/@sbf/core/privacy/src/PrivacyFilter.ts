/**
 * Privacy Filter - Content filtering engine
 * Filters sensitive content based on privacy levels
 */

import { PrivacyLevel, PrivacyFilterResult } from './types';

export class PrivacyFilter {
  private sensitivePatterns: Map<PrivacyLevel, RegExp[]> = new Map();

  constructor() {
    this.initializePatterns();
  }

  private initializePatterns(): void {
    // Public level - no filtering
    this.sensitivePatterns.set(PrivacyLevel.Public, []);

    // Personal level - filter highly sensitive data
    this.sensitivePatterns.set(PrivacyLevel.Personal, [
      /\b\d{3}-\d{2}-\d{4}\b/g, // SSN
      /\b\d{16}\b/g, // Credit card
      /\b(?:\d{1,3}\.){3}\d{1,3}\b/g, // IP addresses
    ]);

    // Private level - filter all personal identifiers
    this.sensitivePatterns.set(PrivacyLevel.Private, [
      /\b\d{3}-\d{2}-\d{4}\b/g, // SSN
      /\b\d{16}\b/g, // Credit card
      /\b(?:\d{1,3}\.){3}\d{1,3}\b/g, // IP addresses
      /\b[\w.-]+@[\w.-]+\.\w+\b/g, // Email
      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, // Phone numbers
      /\b[A-Z]{2}\d{6,}\b/g, // Government IDs
    ]);

    // Confidential level - no content should pass
    this.sensitivePatterns.set(PrivacyLevel.Confidential, [
      /.*/g, // Match everything
    ]);
  }

  filterContent(content: string, privacyLevel: PrivacyLevel): PrivacyFilterResult {
    const patterns = this.sensitivePatterns.get(privacyLevel) || [];
    
    if (patterns.length === 0) {
      return {
        filtered: false,
        originalContent: content,
        filteredContent: content,
        removedSections: [],
        privacyLevel,
      };
    }

    let filteredContent = content;
    const removedSections: string[] = [];

    for (const pattern of patterns) {
      const matches = content.match(pattern);
      if (matches) {
        removedSections.push(...matches);
        filteredContent = filteredContent.replace(pattern, '[REDACTED]');
      }
    }

    return {
      filtered: removedSections.length > 0,
      originalContent: content,
      filteredContent,
      removedSections,
      privacyLevel,
    };
  }

  addCustomPattern(level: PrivacyLevel, pattern: RegExp): void {
    const patterns = this.sensitivePatterns.get(level) || [];
    patterns.push(pattern);
    this.sensitivePatterns.set(level, patterns);
  }

  removeAllPatterns(level: PrivacyLevel): void {
    this.sensitivePatterns.set(level, []);
  }
}
