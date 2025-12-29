/**
 * WikilinkResolver Unit Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { WikilinkResolver } from '../src/sync/WikilinkResolver';

describe('WikilinkResolver', () => {
  let resolver: WikilinkResolver;

  beforeEach(() => {
    resolver = new WikilinkResolver();
  });

  describe('extractLinks', () => {
    it('should extract simple wikilinks', () => {
      const content = 'This links to [[Note A]] and [[Note B]].';

      const links = resolver.extractLinks(content);

      expect(links).toHaveLength(2);
      expect(links[0].display).toBe('Note A');
      expect(links[1].display).toBe('Note B');
    });

    it('should extract wikilinks with aliases', () => {
      const content = 'Check [[Long Note Title|this note]].';

      const links = resolver.extractLinks(content);

      expect(links).toHaveLength(1);
      expect(links[0].target).toBe('Long Note Title');
      expect(links[0].alias).toBe('this note');
    });

    it('should extract wikilinks with headings', () => {
      const content = 'See [[Note#Section]] for details.';

      const links = resolver.extractLinks(content);

      expect(links).toHaveLength(1);
      expect(links[0].target).toBe('Note');
      expect(links[0].heading).toBe('Section');
    });

    it('should extract wikilinks with headings and aliases', () => {
      const content = 'Read [[Note#Details|the details]].';

      const links = resolver.extractLinks(content);

      expect(links).toHaveLength(1);
      expect(links[0].target).toBe('Note');
      expect(links[0].heading).toBe('Details');
      expect(links[0].alias).toBe('the details');
    });

    it('should handle multiple links in same line', () => {
      const content = '[[A]], [[B]], [[C]]';

      const links = resolver.extractLinks(content);

      expect(links).toHaveLength(3);
    });

    it('should extract embedded links', () => {
      const content = 'Image: ![[image.png]]';

      const links = resolver.extractLinks(content);

      expect(links).toHaveLength(1);
      expect(links[0].isEmbed).toBe(true);
      expect(links[0].target).toBe('image.png');
    });

    it('should return empty array for no links', () => {
      const content = 'No links here.';

      const links = resolver.extractLinks(content);

      expect(links).toHaveLength(0);
    });
  });

  describe('resolveToPath', () => {
    it('should resolve simple link to path', () => {
      const files = ['notes/Note A.md', 'projects/Project B.md'];

      const path = resolver.resolveToPath('Note A', files);

      expect(path).toBe('notes/Note A.md');
    });

    it('should match case-insensitively', () => {
      const files = ['Notes/My Note.md'];

      const path = resolver.resolveToPath('my note', files);

      expect(path).toBe('Notes/My Note.md');
    });

    it('should return null for unresolved links', () => {
      const files = ['notes/Other.md'];

      const path = resolver.resolveToPath('Nonexistent', files);

      expect(path).toBeNull();
    });

    it('should prefer exact matches', () => {
      const files = ['notes/Note.md', 'notes/Note Extra.md'];

      const path = resolver.resolveToPath('Note', files);

      expect(path).toBe('notes/Note.md');
    });
  });

  describe('resolveToUid', () => {
    it('should resolve link to UID', () => {
      const uidMap = new Map([
        ['notes/Note A.md', 'uid-123'],
        ['projects/Project.md', 'uid-456'],
      ]);
      const files = ['notes/Note A.md', 'projects/Project.md'];

      const uid = resolver.resolveToUid('Note A', files, uidMap);

      expect(uid).toBe('uid-123');
    });

    it('should return null for unresolved', () => {
      const uidMap = new Map([['notes/Other.md', 'uid-123']]);
      const files = ['notes/Other.md'];

      const uid = resolver.resolveToUid('Missing', files, uidMap);

      expect(uid).toBeNull();
    });
  });

  describe('convertToSBFLinks', () => {
    it('should convert wikilinks to SBF format', () => {
      const content = 'Link to [[Note A]] here.';
      const uidMap = new Map([['notes/Note A.md', 'uid-123']]);
      const files = ['notes/Note A.md'];

      const result = resolver.convertToSBFLinks(content, files, uidMap);

      expect(result).toContain('[Note A](sbf://uid-123)');
    });

    it('should preserve aliases in converted links', () => {
      const content = 'See [[Note A|the note]].';
      const uidMap = new Map([['notes/Note A.md', 'uid-123']]);
      const files = ['notes/Note A.md'];

      const result = resolver.convertToSBFLinks(content, files, uidMap);

      expect(result).toContain('[the note](sbf://uid-123)');
    });

    it('should leave unresolved links as wikilinks', () => {
      const content = 'Link to [[Missing Note]].';
      const uidMap = new Map();
      const files: string[] = [];

      const result = resolver.convertToSBFLinks(content, files, uidMap);

      expect(result).toContain('[[Missing Note]]');
    });
  });

  describe('convertToWikilinks', () => {
    it('should convert SBF links to wikilinks', () => {
      const content = 'See [Note A](sbf://uid-123).';
      const titleMap = new Map([['uid-123', 'Note A']]);

      const result = resolver.convertToWikilinks(content, titleMap);

      expect(result).toContain('[[Note A]]');
    });

    it('should handle links with different display text', () => {
      const content = 'Read [the note](sbf://uid-123).';
      const titleMap = new Map([['uid-123', 'Actual Title']]);

      const result = resolver.convertToWikilinks(content, titleMap);

      expect(result).toContain('[[Actual Title|the note]]');
    });
  });

  describe('buildRelationships', () => {
    it('should build relationship list from links', () => {
      const links = [
        { target: 'Note A', display: 'Note A', position: 0 },
        { target: 'Note B', display: 'Note B', position: 20 },
      ];
      const uidMap = new Map([
        ['notes/Note A.md', 'uid-a'],
        ['notes/Note B.md', 'uid-b'],
      ]);
      const files = ['notes/Note A.md', 'notes/Note B.md'];

      const relationships = resolver.buildRelationships(links, files, uidMap);

      expect(relationships).toHaveLength(2);
      expect(relationships[0].targetUid).toBe('uid-a');
      expect(relationships[1].targetUid).toBe('uid-b');
    });

    it('should skip unresolved links', () => {
      const links = [
        { target: 'Existing', display: 'Existing', position: 0 },
        { target: 'Missing', display: 'Missing', position: 10 },
      ];
      const uidMap = new Map([['notes/Existing.md', 'uid-123']]);
      const files = ['notes/Existing.md'];

      const relationships = resolver.buildRelationships(links, files, uidMap);

      expect(relationships).toHaveLength(1);
    });
  });
});
