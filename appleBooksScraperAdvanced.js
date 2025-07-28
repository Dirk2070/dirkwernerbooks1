// 🕷️ Erweiterter Apple Books Audiobook Scraper mit Puppeteer
// Behandelt JavaScript-renderte Inhalte und dynamische Seiten

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// Apple Books Author URL
const AUTHOR_URL = 'https://books.apple.com/de/author/dirk-werner/id316714929?see-all=audio-books';

// Output-Datei für die aktualisierte Whitelist
const OUTPUT_FILE = 'audiobooks_on_apple_by_dirkwerner_updated.js';

async function fetchAudiobooksWithPuppeteer() {
    console.log('🕷️ [Scraper] Starte Apple Books Crawling mit Puppeteer...');
    
    let browser;
    try {
        // Browser starten
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ]
        });

        const page = await browser.newPage();
        
        // User-Agent setzen
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        // Viewport setzen
        await page.setViewport({ width: 1920, height: 1080 });
        
        console.log('🌐 [Scraper] Lade Apple Books-Seite...');
        
        // Seite laden und auf JavaScript warten
        await page.goto(AUTHOR_URL, { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });
        
        console.log('⏳ [Scraper] Warte auf Inhalte...');
        
        // Warten auf Inhalte
        await page.waitForTimeout(5000);
        
        // Verschiedene Selektoren versuchen
        const selectors = [
            '.product-name',
            '.section__title',
            'h2',
            'h3',
            '.book-title',
            '[data-testid="product-name"]',
            '.product__title',
            '.audiobook-title',
            '.product-grid .product',
            '.book-item',
            '.audiobook-item'
        ];
        
        const audiobooks = [];
        
        for (const selector of selectors) {
            console.log(`🔍 [Scraper] Versuche Selektor: ${selector}`);
            
            try {
                // Warten auf Selektor
                await page.waitForSelector(selector, { timeout: 5000 });
                
                const elements = await page.$$(selector);
                console.log(`📊 [Scraper] Gefunden: ${elements.length} Elemente mit ${selector}`);
                
                for (const element of elements) {
                    try {
                        const title = await element.evaluate(el => el.textContent?.trim());
                        const link = await element.evaluate(el => {
                            const linkEl = el.closest('a') || el.querySelector('a');
                            return linkEl?.href || null;
                        });
                        
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
                            
                            console.log(`📚 [Scraper] Gefunden: "${title}" (ID: ${appleId || 'nicht gefunden'})`);
                        }
                    } catch (elementError) {
                        console.log(`⚠️ [Scraper] Fehler beim Element: ${elementError.message}`);
                    }
                }
                
                if (audiobooks.length > 0) {
                    break; // Erfolgreich, nicht weiter versuchen
                }
                
            } catch (selectorError) {
                console.log(`⚠️ [Scraper] Selektor ${selector} nicht gefunden`);
            }
        }
        
        // Fallback: Screenshot für Debugging
        if (audiobooks.length === 0) {
            console.log('📸 [Scraper] Erstelle Screenshot für Debugging...');
            await page.screenshot({ 
                path: 'apple-books-debug.png', 
                fullPage: true 
            });
            
            // HTML-Inhalt für Debugging speichern
            const htmlContent = await page.content();
            await fs.writeFile('apple-books-debug.html', htmlContent);
            
            console.log('📁 [Scraper] Debug-Dateien erstellt: apple-books-debug.png, apple-books-debug.html');
        }
        
        // Entferne Duplikate
        const uniqueAudiobooks = audiobooks.filter((book, index, self) => 
            index === self.findIndex(b => b.title === book.title)
        );
        
        console.log(`📚 [Scraper] Gefundene Audiobooks: ${uniqueAudiobooks.length}`);
        
        return uniqueAudiobooks;
        
    } catch (error) {
        console.error('❌ [Scraper] Fehler beim Puppeteer-Crawling:', error.message);
        return [];
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

async function generateWhitelistFile(audiobooks) {
    console.log('📝 [Scraper] Generiere aktualisierte Whitelist-Datei...');
    
    const whitelistContent = `// 🎧 Automatisch generierte Apple Books Audiobook Whitelist
// Generiert am: ${new Date().toISOString()}
// Quelle: ${AUTHOR_URL}
// Methode: Puppeteer (JavaScript-renderte Inhalte)

window.appleAudiobookList = {
  "author": "Dirk Werner",
  "source": "Apple Books",
  "url": "${AUTHOR_URL}",
  "lastUpdated": "${new Date().toISOString()}",
  "scrapingMethod": "Puppeteer",
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
    console.log('🚀 [Scraper] Erweiterter Apple Books Audiobook Scraper gestartet');
    console.log('📅 [Scraper] Datum:', new Date().toLocaleString('de-DE'));
    console.log('🔗 [Scraper] URL:', AUTHOR_URL);
    console.log('🕷️ [Scraper] Methode: Puppeteer (JavaScript-renderte Inhalte)');
    console.log('---');
    
    const audiobooks = await fetchAudiobooksWithPuppeteer();
    
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
        console.log('💡 [Scraper] Tipp: Prüfen Sie die Debug-Dateien apple-books-debug.png und apple-books-debug.html');
    }
}

// Führe Scraper aus
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { fetchAudiobooksWithPuppeteer, generateWhitelistFile, compareWithExistingWhitelist }; 