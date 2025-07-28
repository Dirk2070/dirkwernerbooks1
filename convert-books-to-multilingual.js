const fs = require('fs');
const path = require('path');

// Pfad zur books.json
const BOOKS_PATH = path.join(__dirname, 'books.json');
const OUTPUT_PATH = path.join(__dirname, 'books_multilingual.json');

// Alle Felder, die multilingual werden sollen
const MULTILINGUAL_FIELDS = [
  'title',
  'description',
  'subtitle',
  'meta',
  'features',
  'bookFormat',
  'genre',
  'keywords',
  'authorBio',
  // beliebig erweiterbar
];

// Hilfsfunktion: Wandelt String zu Objekt um, falls nötig
function toMultilingualField(field, lang, fallback = '') {
  if (!field) return { de: fallback, en: fallback };
  if (typeof field === 'object' && field.de && field.en) return field; // Bereits multilingual
  if (typeof field === 'object') return { de: field[lang] || fallback, en: field[lang === 'de' ? 'en' : 'de'] || fallback };
  return { [lang]: field, [lang === 'de' ? 'en' : 'de']: field };
}

// Hauptfunktion
function convertBooks() {
  const books = JSON.parse(fs.readFileSync(BOOKS_PATH, 'utf-8'));
  const converted = books.map(book => {
    // Sprache raten (Fallback: de)
    const lang = (book.language && book.language.startsWith('en')) ? 'en' : 'de';
    const newBook = { ...book };
    
    MULTILINGUAL_FIELDS.forEach(field => {
      if (book.hasOwnProperty(field)) {
        newBook[field] = toMultilingualField(book[field], lang, '');
      }
    });
    
    return newBook;
  });

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(converted, null, 2), 'utf-8');
  console.log(`✅ books_multilingual.json wurde erstellt (${converted.length} Bücher).`);
  
  // Überprüfung
  const stringTitles = converted.filter(b => typeof b.title === 'string');
  const objectTitles = converted.filter(b => typeof b.title === 'object');
  console.log(`📊 String-Titel: ${stringTitles.length}, Objekt-Titel: ${objectTitles.length}`);
}

convertBooks(); 