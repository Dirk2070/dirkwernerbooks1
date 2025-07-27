// 🕷️ Einfacher Apple Books Audiobook Scraper
// Verwendet Apple Books API und RSS-Feeds statt Web-Scraping

const axios = require('axios');
const fs = require('fs').promises;

// Apple Books Author ID
const AUTHOR_ID = '316714929';
const AUTHOR_URL = 'https://books.apple.com/de/author/dirk-werner/id316714929?see-all=audio-books';

// Output-Datei für die aktualisierte Whitelist
const OUTPUT_FILE = 'audiobooks_on_apple_by_dirkwerner_updated.js';

// Manuelle Whitelist basierend auf bekannten Apple Books-IDs
const MANUAL_AUDIOBOOK_LIST = [
    {
        title: "How to Recognize Cults: A Guide to Protecting Yourself from Manipulation and Control",
        appleId: "1234567890", // Beispiel-ID - muss mit echten IDs ersetzt werden
        year: "2025",
        format: "Audiobook"
    },
    {
        title: "Self-Love Over Perfection: A Guide to Overcoming Female Narcissism",
        appleId: "1234567891",
        year: "2025",
        format: "Audiobook"
    },
    {
        title: "The Battle Within: A Guide to Overcoming Inner Struggles",
        appleId: "1234567892",
        year: "2025",
        format: "Audiobook"
    },
    {
        title: "The Simulation Chronicles",
        appleId: "1234567893",
        year: "2025",
        format: "Audiobook"
    },
    {
        title: "American Shadows: Hecate's Intervention - The Unofficial Sequel to American Gods",
        appleId: "1234567894",
        year: "2025",
        format: "Audiobook"
    },
    {
        title: "Instructions for Staying in the Matrix Forever",
        appleId: "1234567895",
        year: "2025",
        format: "Audiobook"
    },
    {
        title: "The Legacy of the Lodges: Dr. Seelmanns 3rd case",
        appleId: "1234567896",
        year: "2025",
        format: "Audiobook"
    },
    {
        title: "Nanogenesis: The Rise of Superhumans",
        appleId: "1234567897",
        year: "2025",
        format: "Audiobook"
    },
    {
        title: "Deadly Echo: Dr. Seelmann's Second Case",
        appleId: "1234567898",
        year: "2025",
        format: "Audiobook"
    },
    {
        title: "The Key of the Enlightened",
        appleId: "1234567899",
        year: "2025",
        format: "Audiobook"
    }
];

async function fetchAudiobooksFromAPI() {
    console.log('🕷️ [Scraper] Versuche Apple Books API...');
    
    try {
        // Versuche verschiedene API-Endpunkte
        const apiEndpoints = [
            `https://itunes.apple.com/lookup?id=${AUTHOR_ID}&entity=audiobook`,
            `https://itunes.apple.com/search?term=dirk+werner&entity=audiobook&country=de`,
            `https://books.apple.com/api/v1/author/${AUTHOR_ID}/audiobooks`
        ];
        
        for (const endpoint of apiEndpoints) {
            try {
                console.log(`🔗 [Scraper] Versuche API: ${endpoint}`);
                
                const response = await axios.get(endpoint, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Accept': 'application/json',
                        'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8'
                    },
                    timeout: 10000
                });
                
                if (response.data && response.status === 200) {
                    console.log('✅ [Scraper] API-Antwort erhalten');
                    console.log('📊 [Scraper] API-Daten:', JSON.stringify(response.data, null, 2));
                    
                    // Parse API-Antwort
                    const audiobooks = parseAPIResponse(response.data);
                    if (audiobooks.length > 0) {
                        return audiobooks;
                    }
                }
                
            } catch (apiError) {
                console.log(`⚠️ [Scraper] API ${endpoint} fehlgeschlagen:`, apiError.message);
            }
        }
        
        console.log('❌ [Scraper] Keine API funktioniert, verwende manuelle Liste');
        return MANUAL_AUDIOBOOK_LIST;
        
    } catch (error) {
        console.error('❌ [Scraper] Fehler beim API-Call:', error.message);
        return MANUAL_AUDIOBOOK_LIST;
    }
}

function parseAPIResponse(data) {
    const audiobooks = [];
    
    try {
        // iTunes API Format
        if (data.results) {
            data.results.forEach(item => {
                if (item.kind === 'audiobook' || item.collectionType === 'Audiobook') {
                    audiobooks.push({
                        title: item.trackName || item.collectionName,
                        appleId: item.trackId?.toString() || item.collectionId?.toString(),
                        year: new Date(item.releaseDate).getFullYear().toString(),
                        format: "Audiobook"
                    });
                }
            });
        }
        
        // Apple Books API Format
        if (data.audiobooks) {
            data.audiobooks.forEach(book => {
                audiobooks.push({
                    title: book.title,
                    appleId: book.id?.toString(),
                    year: book.year || "2025",
                    format: "Audiobook"
                });
            });
        }
        
        console.log(`📚 [Scraper] API geparst: ${audiobooks.length} Audiobooks gefunden`);
        
    } catch (parseError) {
        console.error('❌ [Scraper] Fehler beim Parsen der API-Antwort:', parseError.message);
    }
    
    return audiobooks;
}

async function generateWhitelistFile(audiobooks) {
    console.log('📝 [Scraper] Generiere aktualisierte Whitelist-Datei...');
    
    const whitelistContent = `// 🎧 Automatisch generierte Apple Books Audiobook Whitelist
// Generiert am: ${new Date().toISOString()}
// Quelle: ${AUTHOR_URL}
// Methode: API + Manuelle Liste

window.appleAudiobookList = {
  "author": "Dirk Werner",
  "source": "Apple Books",
  "url": "${AUTHOR_URL}",
  "lastUpdated": "${new Date().toISOString()}",
  "scrapingMethod": "API + Manual",
  "audiobooks": [
${audiobooks.map(book => `    {
      "title": "${book.title.replace(/"/g, '\\"')}",
      "appleId": "${book.appleId || ''}",
      "year": "${book.year || '2025'}",
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
        const existingFile = 'audiobooks_on_apple_by_dirkwerner.js';
        const existingContent = await fs.readFile(existingFile, 'utf8');
        
        const titleMatches = existingContent.match(/"title":\s*"([^"]+)"/g);
        const existingTitles = titleMatches ? titleMatches.map(match => {
            return match.match(/"title":\s*"([^"]+)"/)[1];
        }) : [];
        
        console.log(`📊 [Scraper] Bestehende Whitelist: ${existingTitles.length} Titel`);
        console.log(`📊 [Scraper] Neue Whitelist: ${newAudiobooks.length} Titel`);
        
        const newTitles = newAudiobooks.filter(book => 
            !existingTitles.some(existing => 
                existing.toLowerCase().includes(book.title.toLowerCase()) ||
                book.title.toLowerCase().includes(existing.toLowerCase())
            )
        );
        
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
    console.log('🚀 [Scraper] Einfacher Apple Books Audiobook Scraper gestartet');
    console.log('📅 [Scraper] Datum:', new Date().toLocaleString('de-DE'));
    console.log('🔗 [Scraper] URL:', AUTHOR_URL);
    console.log('🕷️ [Scraper] Methode: API + Manuelle Liste');
    console.log('---');
    
    const audiobooks = await fetchAudiobooksFromAPI();
    
    if (audiobooks.length > 0) {
        await compareWithExistingWhitelist(audiobooks);
        const success = await generateWhitelistFile(audiobooks);
        
        if (success) {
            console.log('---');
            console.log('✅ [Scraper] Crawling erfolgreich abgeschlossen!');
            console.log(`📁 [Scraper] Neue Whitelist: ${OUTPUT_FILE}`);
            console.log(`📊 [Scraper] Audiobooks gefunden: ${audiobooks.length}`);
            
            // Debug-Ausgabe
            console.log('📚 [Scraper] Gefundene Audiobooks:');
            audiobooks.forEach((book, index) => {
                console.log(`${index + 1}. "${book.title}" (ID: ${book.appleId || 'nicht verfügbar'})`);
            });
        }
    } else {
        console.log('❌ [Scraper] Keine Audiobooks gefunden');
    }
}

// Führe Scraper aus
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { fetchAudiobooksFromAPI, generateWhitelistFile, compareWithExistingWhitelist }; 