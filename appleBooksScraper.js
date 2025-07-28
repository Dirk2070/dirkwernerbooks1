// 🕷️ Apple Books Audiobook Scraper für Dirk Werner
// Automatisches Crawling der Apple Books-Seite für aktuelle Audiobook-Liste

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');

// Apple Books Author URL
const AUTHOR_URL = 'https://books.apple.com/de/author/dirk-werner/id316714929?see-all=audio-books';

// Output-Datei für die aktualisierte Whitelist
const OUTPUT_FILE = 'audiobooks_on_apple_by_dirkwerner_updated.js';

async function fetchAudiobooks() {
    console.log('🕷️ [Scraper] Starte Apple Books Crawling...');
    
    try {
        // HTTP-Request mit User-Agent für bessere Kompatibilität
        const { data } = await axios.get(AUTHOR_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            },
            timeout: 10000
        });

        const $ = cheerio.load(data);
        const audiobooks = [];

        console.log('🔍 [Scraper] Analysiere HTML-Struktur...');

        // Verschiedene Selektoren für Apple Books-Struktur
        const selectors = [
            '.product-name',
            '.section__title',
            'h2',
            'h3',
            '.book-title',
            '[data-testid="product-name"]',
            '.product__title',
            '.audiobook-title'
        ];

        // Suche nach Audiobook-Elementen
        selectors.forEach(selector => {
            $(selector).each((i, el) => {
                const title = $(el).text().trim();
                const link = $(el).closest('a').attr('href') || $(el).find('a').attr('href');
                
                if (title && title.length > 10) {
                    // Extrahiere Apple ID aus Link
                    let appleId = null;
                    if (link) {
                        const idMatch = link.match(/\/id(\d+)/);
                        if (idMatch) {
                            appleId = idMatch[1];
                        }
                    }
                    
                    audiobooks.push({
                        title: title,
                        appleId: appleId,
                        link: link,
                        selector: selector
                    });
                }
            });
        });

        // Entferne Duplikate und filtere relevante Titel
        const uniqueAudiobooks = audiobooks.filter((book, index, self) => 
            index === self.findIndex(b => b.title === book.title)
        );

        console.log(`📚 [Scraper] Gefundene Audiobooks: ${uniqueAudiobooks.length}`);
        
        // Debug-Ausgabe
        uniqueAudiobooks.forEach((book, index) => {
            console.log(`${index + 1}. "${book.title}" (ID: ${book.appleId || 'nicht gefunden'})`);
        });

        return uniqueAudiobooks;

    } catch (error) {
        console.error('❌ [Scraper] Fehler beim Crawling:', error.message);
        
        if (error.response) {
            console.error('📡 [Scraper] HTTP Status:', error.response.status);
            console.error('📡 [Scraper] Response Headers:', error.response.headers);
        }
        
        return [];
    }
}

async function generateWhitelistFile(audiobooks) {
    console.log('📝 [Scraper] Generiere aktualisierte Whitelist-Datei...');
    
    const whitelistContent = `// 🎧 Automatisch generierte Apple Books Audiobook Whitelist
// Generiert am: ${new Date().toISOString()}
// Quelle: ${AUTHOR_URL}

window.appleAudiobookList = {
  "author": "Dirk Werner",
  "source": "Apple Books",
  "url": "${AUTHOR_URL}",
  "lastUpdated": "${new Date().toISOString()}",
  "audiobooks": [
${audiobooks.map(book => `    {
      "title": "${book.title.replace(/"/g, '\\"')}",
      "appleId": "${book.appleId || ''}",
      "appleLink": "${book.link || ''}",
      "year": "2025",
      "format": "Audiobook"
    }`).join(',\n')}
  ],
  "total_audiobooks": ${audiobooks.length},
  "extracted_date": "${new Date().toISOString().split('T')[0]}"
};

// Create lookup maps for faster access
window.appleAudiobookIds = window.appleAudiobookList.audiobooks.map(book => book.appleId).filter(id => id);
window.appleAudiobookTitles = window.appleAudiobookList.audiobooks.map(book => book.title);

// Helper function to check if a book has an audiobook - MULTIPLE IDENTIFICATION METHODS
window.isAppleAudiobook = function(bookIdentifier) {
  if (!window.appleAudiobookList || !window.appleAudiobookList.audiobooks) {
    console.warn('⚠️ [Audiobook] Whitelist not loaded');
    return false;
  }
  
  // Method 1: Direct Apple ID lookup (fastest)
  if (window.appleAudiobookIds && window.appleAudiobookIds.includes(bookIdentifier)) {
    console.log('🎧 [Audiobook] Apple ID match found:', bookIdentifier);
    return true;
  }
  
  // Method 2: Title-based matching (fallback)
  const normalizeTitle = (title) => {
    return title
      .trim()
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove special characters
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
  };
  
  const normalizedInputTitle = normalizeTitle(bookIdentifier);
  
  const hasAudiobook = window.appleAudiobookList.audiobooks.some(book => {
    const normalizedWhitelistTitle = normalizeTitle(book.title);
    
    // Try multiple matching strategies
    const exactMatch = normalizedWhitelistTitle === normalizedInputTitle;
    const containsMatch = normalizedWhitelistTitle.includes(normalizedInputTitle) || normalizedInputTitle.includes(normalizedWhitelistTitle);
    
    const matches = exactMatch || containsMatch;
    
    if (matches) {
      console.log('🎧 [Audiobook] Title match found:', {
        original: bookIdentifier,
        whitelist: book.title,
        exactMatch,
        containsMatch
      });
    }
    return matches;
  });
  
  console.log('🎧 [Audiobook] Checking:', bookIdentifier, 'Normalized:', normalizedInputTitle, 'Result:', hasAudiobook);
  return hasAudiobook;
};

console.log('✅ [Audiobook] Apple Books Whitelist loaded successfully!');
console.log('📊 [Audiobook] Total audiobooks available:', window.appleAudiobookList.total_audiobooks);
`;

    try {
        await fs.writeFile(OUTPUT_FILE, whitelistContent, 'utf8');
        console.log(`✅ [Scraper] Whitelist gespeichert in: ${OUTPUT_FILE}`);
        return true;
    } catch (error) {
        console.error('❌ [Scraper] Fehler beim Speichern:', error.message);
        return false;
    }
}

async function compareWithExistingWhitelist(newAudiobooks) {
    console.log('🔍 [Scraper] Vergleiche mit bestehender Whitelist...');
    
    try {
        // Lade bestehende Whitelist
        const existingFile = 'audiobooks_on_apple_by_dirkwerner.js';
        const existingContent = await fs.readFile(existingFile, 'utf8');
        
        // Extrahiere bestehende Titel (einfache Regex-Extraktion)
        const titleMatches = existingContent.match(/"title":\s*"([^"]+)"/g);
        const existingTitles = titleMatches ? titleMatches.map(match => {
            return match.match(/"title":\s*"([^"]+)"/)[1];
        }) : [];
        
        console.log(`📊 [Scraper] Bestehende Whitelist: ${existingTitles.length} Titel`);
        console.log(`📊 [Scraper] Neue Whitelist: ${newAudiobooks.length} Titel`);
        
        // Finde neue Titel
        const newTitles = newAudiobooks.filter(book => 
            !existingTitles.some(existing => 
                existing.toLowerCase().includes(book.title.toLowerCase()) ||
                book.title.toLowerCase().includes(existing.toLowerCase())
            )
        );
        
        // Finde entfernte Titel
        const removedTitles = existingTitles.filter(existing =>
            !newAudiobooks.some(book =>
                existing.toLowerCase().includes(book.title.toLowerCase()) ||
                book.title.toLowerCase().includes(existing.toLowerCase())
            )
        );
        
        if (newTitles.length > 0) {
            console.log('🆕 [Scraper] Neue Audiobooks gefunden:');
            newTitles.forEach(book => console.log(`  + "${book.title}"`));
        }
        
        if (removedTitles.length > 0) {
            console.log('❌ [Scraper] Entfernte Audiobooks:');
            removedTitles.forEach(title => console.log(`  - "${title}"`));
        }
        
        if (newTitles.length === 0 && removedTitles.length === 0) {
            console.log('✅ [Scraper] Keine Änderungen in der Audiobook-Liste');
        }
        
    } catch (error) {
        console.log('⚠️ [Scraper] Konnte bestehende Whitelist nicht laden:', error.message);
    }
}

// Hauptfunktion
async function main() {
    console.log('🚀 [Scraper] Apple Books Audiobook Scraper gestartet');
    console.log('📅 [Scraper] Datum:', new Date().toLocaleString('de-DE'));
    console.log('🔗 [Scraper] URL:', AUTHOR_URL);
    console.log('---');
    
    const audiobooks = await fetchAudiobooks();
    
    if (audiobooks.length > 0) {
        await compareWithExistingWhitelist(audiobooks);
        const success = await generateWhitelistFile(audiobooks);
        
        if (success) {
            console.log('---');
            console.log('✅ [Scraper] Crawling erfolgreich abgeschlossen!');
            console.log(`📁 [Scraper] Neue Whitelist: ${OUTPUT_FILE}`);
            console.log(`📊 [Scraper] Audiobooks gefunden: ${audiobooks.length}`);
        }
    } else {
        console.log('❌ [Scraper] Keine Audiobooks gefunden - Crawling fehlgeschlagen');
    }
}

// Führe Scraper aus
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { fetchAudiobooks, generateWhitelistFile, compareWithExistingWhitelist }; 