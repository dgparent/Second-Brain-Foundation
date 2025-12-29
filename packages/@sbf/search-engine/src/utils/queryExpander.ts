/**
 * Query expander.
 * 
 * Expands search queries with synonyms and related terms.
 */

/**
 * Query expansion options.
 */
export interface ExpansionOptions {
  /** Maximum expanded terms per original term */
  maxExpansions?: number;
  
  /** Include original terms in output */
  includeOriginal?: boolean;
  
  /** Use stemming */
  useStemming?: boolean;
}

/**
 * Synonym dictionary entry.
 */
interface SynonymEntry {
  synonyms: string[];
  weight?: number;
}

/**
 * Default common synonyms for knowledge base searches.
 */
const DEFAULT_SYNONYMS: Record<string, SynonymEntry> = {
  // Actions
  create: { synonyms: ['make', 'build', 'generate', 'produce'] },
  delete: { synonyms: ['remove', 'destroy', 'erase', 'clear'] },
  update: { synonyms: ['modify', 'change', 'edit', 'revise'] },
  find: { synonyms: ['search', 'locate', 'discover', 'lookup'] },
  
  // Knowledge types
  note: { synonyms: ['memo', 'record', 'entry', 'annotation'] },
  idea: { synonyms: ['concept', 'thought', 'notion', 'insight'] },
  source: { synonyms: ['reference', 'origin', 'material', 'document'] },
  
  // Descriptors
  important: { synonyms: ['significant', 'critical', 'key', 'essential'] },
  related: { synonyms: ['connected', 'linked', 'associated', 'similar'] },
  recent: { synonyms: ['latest', 'new', 'current', 'fresh'] },
};

/**
 * Expand a query with synonyms.
 */
export function expandQuery(
  query: string,
  options: ExpansionOptions = {},
  customSynonyms?: Record<string, SynonymEntry>
): string[] {
  const {
    maxExpansions = 3,
    includeOriginal = true,
    useStemming = false,
  } = options;
  
  const synonyms = { ...DEFAULT_SYNONYMS, ...customSynonyms };
  const expanded: Set<string> = new Set();
  
  if (includeOriginal) {
    expanded.add(query);
  }
  
  // Tokenize query
  const tokens = tokenize(query);
  
  // Expand each token
  for (const token of tokens) {
    const lowerToken = token.toLowerCase();
    
    // Check for synonyms
    const entry = synonyms[lowerToken];
    if (entry) {
      const syns = entry.synonyms.slice(0, maxExpansions);
      for (const syn of syns) {
        // Create variant of query with synonym
        const variant = query.replace(new RegExp(escapeRegex(token), 'gi'), syn);
        expanded.add(variant);
      }
    }
    
    // Optional stemming
    if (useStemming) {
      const stemmed = simpleStem(lowerToken);
      if (stemmed !== lowerToken) {
        const variant = query.replace(new RegExp(escapeRegex(token), 'gi'), stemmed);
        expanded.add(variant);
      }
    }
  }
  
  return [...expanded];
}

/**
 * Extract keywords from query.
 */
export function extractKeywords(query: string): string[] {
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need',
    'it', 'its', 'this', 'that', 'these', 'those', 'what', 'which', 'who',
    'whom', 'how', 'when', 'where', 'why', 'all', 'each', 'every', 'both',
    'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
    'only', 'same', 'so', 'than', 'too', 'very', 'just', 'about', 'after',
  ]);
  
  return tokenize(query)
    .filter(token => !stopWords.has(token.toLowerCase()) && token.length > 2);
}

/**
 * Parse quoted phrases from query.
 */
export function parsePhrasesAndTerms(
  query: string
): { phrases: string[]; terms: string[] } {
  const phrases: string[] = [];
  const terms: string[] = [];
  
  // Extract quoted phrases
  const phraseRegex = /"([^"]+)"|'([^']+)'/g;
  let match: RegExpExecArray | null;
  let lastIndex = 0;
  let remainingQuery = query;
  
  while ((match = phraseRegex.exec(query)) !== null) {
    const phrase = match[1] || match[2];
    if (phrase) {
      phrases.push(phrase);
    }
    remainingQuery = remainingQuery.replace(match[0], ' ');
  }
  
  // Extract remaining terms
  terms.push(...tokenize(remainingQuery).filter(t => t.length > 0));
  
  return { phrases, terms };
}

/**
 * Build PostgreSQL tsquery from parsed query.
 */
export function buildTsQuery(
  phrases: string[],
  terms: string[],
  operator: 'and' | 'or' = 'and'
): string {
  const parts: string[] = [];
  
  // Add phrases (use <-> for phrase matching)
  for (const phrase of phrases) {
    const words = tokenize(phrase);
    if (words.length > 0) {
      parts.push(`(${words.join(' <-> ')})`);
    }
  }
  
  // Add individual terms
  parts.push(...terms);
  
  const joinOp = operator === 'and' ? ' & ' : ' | ';
  return parts.join(joinOp);
}

/**
 * Tokenize text into words.
 */
function tokenize(text: string): string[] {
  return text
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 0);
}

/**
 * Simple English stemmer (Porter-like, simplified).
 */
function simpleStem(word: string): string {
  // Very basic stemming rules
  const suffixes = [
    { suffix: 'ies', replacement: 'y' },
    { suffix: 'ied', replacement: 'y' },
    { suffix: 'es', replacement: '' },
    { suffix: 'ed', replacement: '' },
    { suffix: 's', replacement: '' },
    { suffix: 'ing', replacement: '' },
    { suffix: 'ly', replacement: '' },
    { suffix: 'ment', replacement: '' },
    { suffix: 'ness', replacement: '' },
    { suffix: 'tion', replacement: '' },
  ];
  
  for (const { suffix, replacement } of suffixes) {
    if (word.endsWith(suffix) && word.length > suffix.length + 2) {
      return word.slice(0, -suffix.length) + replacement;
    }
  }
  
  return word;
}

/**
 * Escape regex special characters.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
