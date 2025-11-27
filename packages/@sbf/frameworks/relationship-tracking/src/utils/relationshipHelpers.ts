/**
 * Relationship Framework - Utility Functions
 * 
 * Helper functions for relationship management
 */

import type { SimpleEntity, ContactMetadata, InteractionMetadata } from '../types';

/**
 * Filter contacts by category
 */
export function filterContactsByCategory(
  contacts: SimpleEntity[],
  category: string
): SimpleEntity[] {
  return contacts.filter(contact => {
    const metadata = contact.metadata as ContactMetadata;
    return metadata.category === category;
  });
}

/**
 * Filter contacts by relationship strength
 */
export function filterContactsByStrength(
  contacts: SimpleEntity[],
  strength: string
): SimpleEntity[] {
  return contacts.filter(contact => {
    const metadata = contact.metadata as ContactMetadata;
    return metadata.relationship_strength === strength;
  });
}

/**
 * Filter contacts by tag
 */
export function filterContactsByTag(
  contacts: SimpleEntity[],
  tag: string
): SimpleEntity[] {
  return contacts.filter(contact => {
    const metadata = contact.metadata as ContactMetadata;
    return metadata.tags && metadata.tags.includes(tag);
  });
}

/**
 * Group contacts by company
 */
export function groupContactsByCompany(
  contacts: SimpleEntity[]
): Record<string, SimpleEntity[]> {
  const grouped: Record<string, SimpleEntity[]> = {};
  
  for (const contact of contacts) {
    const metadata = contact.metadata as ContactMetadata;
    const company = metadata.company || 'No Company';
    
    if (!grouped[company]) {
      grouped[company] = [];
    }
    grouped[company].push(contact);
  }
  
  return grouped;
}

/**
 * Group interactions by type
 */
export function groupInteractionsByType(
  interactions: SimpleEntity[]
): Record<string, SimpleEntity[]> {
  const grouped: Record<string, SimpleEntity[]> = {};
  
  for (const interaction of interactions) {
    const metadata = interaction.metadata as InteractionMetadata;
    const type = metadata.interaction_type;
    
    if (!grouped[type]) {
      grouped[type] = [];
    }
    grouped[type].push(interaction);
  }
  
  return grouped;
}

/**
 * Sort contacts by last contact date
 */
export function sortContactsByLastContact(
  contacts: SimpleEntity[],
  descending: boolean = true
): SimpleEntity[] {
  return [...contacts].sort((a, b) => {
    const metadataA = a.metadata as ContactMetadata;
    const metadataB = b.metadata as ContactMetadata;
    
    const dateA = metadataA.last_contact_date || metadataA.first_met_date || a.created;
    const dateB = metadataB.last_contact_date || metadataB.first_met_date || b.created;
    
    const comparison = new Date(dateB).getTime() - new Date(dateA).getTime();
    return descending ? comparison : -comparison;
  });
}

/**
 * Find upcoming birthdays in the next N days
 */
export function findUpcomingBirthdays(
  contacts: SimpleEntity[],
  daysAhead: number = 30
): Array<{ contact: SimpleEntity; days_until: number }> {
  const today = new Date();
  const result: Array<{ contact: SimpleEntity; days_until: number }> = [];
  
  for (const contact of contacts) {
    const metadata = contact.metadata as ContactMetadata;
    if (!metadata.birthday) continue;
    
    const birthday = new Date(metadata.birthday);
    const thisYearBirthday = new Date(
      today.getFullYear(),
      birthday.getMonth(),
      birthday.getDate()
    );
    
    // If birthday already passed this year, check next year
    if (thisYearBirthday < today) {
      thisYearBirthday.setFullYear(today.getFullYear() + 1);
    }
    
    const daysUntil = Math.ceil(
      (thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysUntil <= daysAhead) {
      result.push({ contact, days_until: daysUntil });
    }
  }
  
  return result.sort((a, b) => a.days_until - b.days_until);
}

/**
 * Calculate total interaction time for a contact
 */
export function calculateTotalInteractionTime(
  interactions: SimpleEntity[]
): number {
  return interactions.reduce((total, interaction) => {
    const metadata = interaction.metadata as InteractionMetadata;
    return total + (metadata.duration_minutes || 0);
  }, 0);
}

/**
 * Find interactions with pending follow-ups
 */
export function findPendingFollowUps(
  interactions: SimpleEntity[]
): SimpleEntity[] {
  const today = new Date().toISOString().split('T')[0];
  
  return interactions.filter(interaction => {
    const metadata = interaction.metadata as InteractionMetadata;
    return (
      metadata.follow_up_required &&
      metadata.follow_up_date &&
      metadata.follow_up_date <= today
    );
  });
}

/**
 * Export contact to vCard format
 */
export function exportToVCard(contact: SimpleEntity): string {
  const metadata = contact.metadata as ContactMetadata;
  
  let vcard = 'BEGIN:VCARD\n';
  vcard += 'VERSION:3.0\n';
  vcard += `FN:${metadata.full_name}\n`;
  
  if (metadata.email) {
    vcard += `EMAIL:${metadata.email}\n`;
  }
  
  if (metadata.phone) {
    vcard += `TEL:${metadata.phone}\n`;
  }
  
  if (metadata.company) {
    vcard += `ORG:${metadata.company}\n`;
  }
  
  if (metadata.job_title) {
    vcard += `TITLE:${metadata.job_title}\n`;
  }
  
  if (metadata.website) {
    vcard += `URL:${metadata.website}\n`;
  }
  
  if (metadata.notes) {
    vcard += `NOTE:${metadata.notes.replace(/\n/g, '\\n')}\n`;
  }
  
  vcard += 'END:VCARD';
  
  return vcard;
}
