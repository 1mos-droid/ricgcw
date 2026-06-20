import { describe, it, expect } from 'vitest';
import { 
  createSermonNote, 
  addScriptureToNote, 
  addTagToNote, 
  searchNotes, 
  formatNotesForExport 
} from './sermonNotes';

describe('Sermon Notes System', () => {
  describe('createSermonNote', () => {
    it('creates a sermon note with correct fields and a unique ID', () => {
      const note = createSermonNote('The Shield of Faith', 'Pastor Kofi', '2026-06-20', 'Notes content here');
      
      expect(note).toBeDefined();
      expect(note.id).toBeDefined();
      expect(typeof note.id).toBe('string');
      expect(note.title).toBe('The Shield of Faith');
      expect(note.preacher).toBe('Pastor Kofi');
      expect(note.date).toBe('2026-06-20');
      expect(note.notesText).toBe('Notes content here');
      expect(note.tags).toEqual([]);
      expect(note.scriptureReferences).toEqual([]);
    });

    it('falls back to current date if date is not specified', () => {
      const note = createSermonNote('Faith Over Fear', 'Pastor Kofi', null, 'Faith works.');
      expect(note.date).toBeDefined();
      expect(typeof note.date).toBe('string');
    });

    it('throws an error if title is empty or missing', () => {
      expect(() => createSermonNote('', 'Preacher', '2026-06-20')).toThrow();
    });
  });

  describe('addScriptureToNote', () => {
    it('adds scripture references to the note without mutating original note', () => {
      const note = createSermonNote('Grace', 'Pastor Kofi', '2026-06-20', 'Grace is free.');
      const updated = addScriptureToNote(note, 'Ephesians 2:8');
      
      expect(updated.scriptureReferences).toContain('Ephesians 2:8');
      expect(note.scriptureReferences).not.toContain('Ephesians 2:8'); // Immutable check
    });

    it('ignores duplicate scripture references', () => {
      const note = createSermonNote('Grace', 'Pastor Kofi', '2026-06-20', 'Grace is free.');
      const step1 = addScriptureToNote(note, 'Ephesians 2:8');
      const step2 = addScriptureToNote(step1, 'Ephesians 2:8');
      
      expect(step2.scriptureReferences).toEqual(['Ephesians 2:8']);
    });
  });

  describe('addTagToNote', () => {
    it('adds tags to the note without mutating original note', () => {
      const note = createSermonNote('Grace', 'Pastor Kofi', '2026-06-20', 'Grace is free.');
      const updated = addTagToNote(note, 'Grace');
      
      expect(updated.tags).toContain('Grace');
      expect(note.tags).not.toContain('Grace'); // Immutable check
    });

    it('ignores duplicate tags and trims whitespace', () => {
      const note = createSermonNote('Grace', 'Pastor Kofi', '2026-06-20', 'Grace is free.');
      const step1 = addTagToNote(note, '  Grace  ');
      const step2 = addTagToNote(step1, 'grace');
      
      // Case insensitive duplicate checking is a nice detail!
      expect(step2.tags).toEqual(['Grace']);
    });
  });

  describe('searchNotes', () => {
    const mockNotes = [
      {
        id: '1',
        title: 'Walk in Love',
        preacher: 'Apostle Paul',
        date: '2026-06-01',
        notesText: 'Love is patient and kind.',
        tags: ['Love', 'Character'],
        scriptureReferences: ['1 Corinthians 13:4']
      },
      {
        id: '2',
        title: 'The Shield of Faith',
        preacher: 'Pastor Kofi',
        date: '2026-06-10',
        notesText: 'Take up the shield of faith.',
        tags: ['Faith', 'Warfare'],
        scriptureReferences: ['Ephesians 6:16']
      }
    ];

    it('returns notes matching query in title or preacher case-insensitively', () => {
      const results1 = searchNotes(mockNotes, 'kofi');
      expect(results1).toHaveLength(1);
      expect(results1[0].id).toBe('2');

      const results2 = searchNotes(mockNotes, 'LOVE');
      expect(results2).toHaveLength(1);
      expect(results2[0].id).toBe('1');
    });

    it('returns notes matching query in tags', () => {
      const results = searchNotes(mockNotes, 'warfare');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('2');
    });

    it('returns all notes if query is empty or blank', () => {
      expect(searchNotes(mockNotes, '')).toHaveLength(2);
      expect(searchNotes(mockNotes, '   ')).toHaveLength(2);
    });
  });

  describe('formatNotesForExport', () => {
    it('formats note fields into a clean text study sheet structure', () => {
      const note = {
        id: '1',
        title: 'Walk in Love',
        preacher: 'Apostle Paul',
        date: '2026-06-01',
        notesText: 'Love is patient and kind.',
        tags: ['Love', 'Character'],
        scriptureReferences: ['1 Corinthians 13:4', '1 Corinthians 13:13']
      };

      const text = formatNotesForExport(note);
      
      expect(text).toContain('SERMON STUDY NOTES');
      expect(text).toContain('Title: Walk in Love');
      expect(text).toContain('Preacher: Apostle Paul');
      expect(text).toContain('Date: 2026-06-01');
      expect(text).toContain('Scriptures: 1 Corinthians 13:4, 1 Corinthians 13:13');
      expect(text).toContain('Tags: #Love, #Character');
      expect(text).toContain('Notes:\nLove is patient and kind.');
    });
  });
});
