/**
 * @typedef {Object} SermonNote
 * @property {string} id - Unique identifier
 * @property {string} title - Sermon title
 * @property {string} preacher - Preacher's name
 * @property {string} date - Date of sermon (ISO string or YYYY-MM-DD)
 * @property {string} notesText - Content of notes
 * @property {string[]} tags - Categorization tags (e.g. "Faith", "Grace")
 * @property {string[]} scriptureReferences - Related scripture references (e.g. "John 3:16")
 */

/**
 * Creates a new sermon note.
 * @param {string} title
 * @param {string} preacher
 * @param {string} date
 * @param {string} notesText
 * @returns {SermonNote}
 */
export const createSermonNote = (title, preacher, date, notesText) => {
  if (!title || !title.trim()) {
    throw new Error('Sermon title is required');
  }
  const resolvedDate = date || new Date().toISOString().split('T')[0];
  return {
    id: Math.random().toString(36).substring(2, 9),
    title: title.trim(),
    preacher: preacher ? preacher.trim() : '',
    date: resolvedDate,
    notesText: notesText || '',
    tags: [],
    scriptureReferences: []
  };
};

/**
 * Adds a scripture reference to a sermon note.
 * @param {SermonNote} note
 * @param {string} scriptureReference
 * @returns {SermonNote} New sermon note instance
 */
export const addScriptureToNote = (note, scriptureReference) => {
  if (!scriptureReference || !scriptureReference.trim()) return note;
  const cleanedRef = scriptureReference.trim();
  if (note.scriptureReferences.includes(cleanedRef)) {
    return note;
  }
  return {
    ...note,
    scriptureReferences: [...note.scriptureReferences, cleanedRef]
  };
};

/**
 * Adds a tag to a sermon note.
 * @param {SermonNote} note
 * @param {string} tag
 * @returns {SermonNote} New sermon note instance
 */
export const addTagToNote = (note, tag) => {
  if (!tag || !tag.trim()) return note;
  const cleanedTag = tag.trim();
  const duplicate = note.tags.some(t => t.toLowerCase() === cleanedTag.toLowerCase());
  if (duplicate) {
    return note;
  }
  return {
    ...note,
    tags: [...note.tags, cleanedTag]
  };
};

/**
 * Searches sermon notes based on a query.
 * @param {SermonNote[]} notes
 * @param {string} query
 * @returns {SermonNote[]} Matching notes
 */
export const searchNotes = (notes, query) => {
  if (!query || !query.trim()) return notes;
  const cleanedQuery = query.trim().toLowerCase();
  return notes.filter(note => {
    const inTitle = note.title.toLowerCase().includes(cleanedQuery);
    const inPreacher = note.preacher.toLowerCase().includes(cleanedQuery);
    const inNotes = note.notesText.toLowerCase().includes(cleanedQuery);
    const inTags = note.tags.some(t => t.toLowerCase().includes(cleanedQuery));
    const inRefs = note.scriptureReferences.some(r => r.toLowerCase().includes(cleanedQuery));
    return inTitle || inPreacher || inNotes || inTags || inRefs;
  });
};

/**
 * Formats a sermon note for plain text export.
 * @param {SermonNote} note
 * @returns {string} Formatted text
 */
export const formatNotesForExport = (note) => {
  const tagsStr = note.tags.map(t => `#${t}`).join(', ');
  const refsStr = note.scriptureReferences.join(', ');
  return `========================================
           SERMON STUDY NOTES
========================================
Title: ${note.title}
Preacher: ${note.preacher}
Date: ${note.date}

Scriptures: ${refsStr || 'None listed'}
Tags: ${tagsStr || 'None'}

Notes:
${note.notesText}
========================================`;
};
