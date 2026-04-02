import { doc, writeBatch } from "firebase/firestore";
import { db } from "../firebase";
import { bibleBooks } from "../data/bibleData"; // Import local data for specific chapters

const BOOKS_DATA = [
  { name: "Genesis", chapters: 50 },
  { name: "Exodus", chapters: 40 },
  { name: "Leviticus", chapters: 27 },
  { name: "Numbers", chapters: 36 },
  { name: "Deuteronomy", chapters: 34 },
  { name: "Joshua", chapters: 24 },
  { name: "Judges", chapters: 21 },
  { name: "Ruth", chapters: 4 },
  { name: "1 Samuel", chapters: 31 },
  { name: "2 Samuel", chapters: 24 },
  { name: "1 Kings", chapters: 22 },
  { name: "2 Kings", chapters: 25 },
  { name: "1 Chronicles", chapters: 29 },
  { name: "2 Chronicles", chapters: 36 },
  { name: "Ezra", chapters: 10 },
  { name: "Nehemiah", chapters: 13 },
  { name: "Esther", chapters: 10 },
  { name: "Job", chapters: 42 },
  { name: "Psalms", chapters: 150 },
  { name: "Proverbs", chapters: 31 },
  { name: "Ecclesiastes", chapters: 12 },
  { name: "Song of Solomon", chapters: 8 },
  { name: "Isaiah", chapters: 66 },
  { name: "Jeremiah", chapters: 52 },
  { name: "Lamentations", chapters: 5 },
  { name: "Ezekiel", chapters: 48 },
  { name: "Daniel", chapters: 12 },
  { name: "Hosea", chapters: 14 },
  { name: "Joel", chapters: 3 },
  { name: "Amos", chapters: 9 },
  { name: "Obadiah", chapters: 1 },
  { name: "Jonah", chapters: 4 },
  { name: "Micah", chapters: 7 },
  { name: "Nahum", chapters: 3 },
  { name: "Habakkuk", chapters: 3 },
  { name: "Zephaniah", chapters: 3 },
  { name: "Haggai", chapters: 2 },
  { name: "Zechariah", chapters: 14 },
  { name: "Malachi", chapters: 4 },
  { name: "Matthew", chapters: 28 },
  { name: "Mark", chapters: 16 },
  { name: "Luke", chapters: 24 },
  { name: "John", chapters: 21 },
  { name: "Acts", chapters: 28 },
  { name: "Romans", chapters: 16 },
  { name: "1 Corinthians", chapters: 16 },
  { name: "2 Corinthians", chapters: 13 },
  { name: "Galatians", chapters: 6 },
  { name: "Ephesians", chapters: 6 },
  { name: "Philippians", chapters: 4 },
  { name: "Colossians", chapters: 4 },
  { name: "1 Thessalonians", chapters: 5 },
  { name: "2 Thessalonians", chapters: 3 },
  { name: "1 Timothy", chapters: 6 },
  { name: "2 Timothy", chapters: 4 },
  { name: "Titus", chapters: 3 },
  { name: "Philemon", chapters: 1 },
  { name: "Hebrews", chapters: 13 },
  { name: "James", chapters: 5 },
  { name: "1 Peter", chapters: 5 },
  { name: "2 Peter", chapters: 3 },
  { name: "1 John", chapters: 5 },
  { name: "2 John", chapters: 1 },
  { name: "3 John", chapters: 1 },
  { name: "Jude", chapters: 1 },
  { name: "Revelation", chapters: 22 }
];

export const seedBible = async () => {
  console.log("Starting Bible seed...");
  try {
    const batch = writeBatch(db);
    let operationCount = 0;

    // 1. Create Book Documents
    for (let i = 0; i < BOOKS_DATA.length; i++) {
      const book = BOOKS_DATA[i];
      const bookRef = doc(db, "bible_books", book.name);
      
      batch.set(bookRef, {
        name: book.name,
        order: i + 1,
        chapterCount: book.chapters
      });
      operationCount++;
    }

    // 2. Populate Specific Chapters from local file
    // We iterate through our local `bibleBooks` array which has the full content
    for (const localBook of bibleBooks) {
      if (localBook.chapters && localBook.chapters.length > 0) {
        for (const localChapter of localBook.chapters) {
          // Verify we have verses
          if (localChapter.verses && localChapter.verses.length > 0) {
             const chapterRef = doc(db, "bible_books", localBook.name, "chapters", String(localChapter.chapterNumber));
             batch.set(chapterRef, {
               chapterNumber: localChapter.chapterNumber,
               verses: localChapter.verses
             });
             operationCount++;
             console.log(`Prepared ${localBook.name} Chapter ${localChapter.chapterNumber}`);
          }
        }
      }
    }

    console.log(`Committing batch with ${operationCount} operations...`);
    await batch.commit();
    console.log("Bible seed completed successfully!");
    return { success: true, count: operationCount };

  } catch (error) {
    console.error("Error seeding Bible data:", error);
    return { success: false, error };
  }
};
