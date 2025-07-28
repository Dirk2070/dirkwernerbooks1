// Global variables
let allBooks = [];
window.currentLanguage = 'de';
let filteredBooks = [];

// Ensure translations are available globally
if (typeof window.translations === 'undefined') {
    window.translations = {
        de: {
            // Navigation
            'Startseite': 'Startseite',
            'Bücher': 'Bücher',
            'Über mich': 'Über mich',
            'Genres': 'Genres',
            
            // Buttons and links
            'Auf Amazon DE ansehen': 'Auf Amazon DE ansehen',
            'Auf Amazon US ansehen': 'Auf Amazon US ansehen',
            'Bei Apple Books': 'Bei Apple Books',
            'Bei Books2Read': 'Bei Books2Read',
            'Hörbuch': 'Hörbuch',
            'Hörbuch bei Apple Books': 'Hörbuch bei Apple Books',
            'Mehr erfahren': 'Mehr erfahren',
            
            // Placeholders
            'Suche nach Titel...': 'Suche nach Titel...',
            'Alle Genres': 'Alle Genres',
            'Psychologie': 'Psychologie',
            'Krimi': 'Krimi',
            'Beziehungen': 'Beziehungen',
            'Belletristik': 'Belletristik',
            
            // Sections
            'Bestseller-Highlights': 'Bestseller-Highlights',
            'Alle Bücher': 'Alle Bücher',
            'Über den Autor': 'Über den Autor',
            'Meine Genres': 'Meine Genres',
            
            // Book detail page specific
            'Weitere Bücher von Dirk Werner': 'Weitere Bücher von Dirk Werner',
            'Sprache:': 'Sprache:',
            'Deutsch': 'Deutsch',
            'Format:': 'Format:',
            'E-Book & Taschenbuch': 'E-Book & Taschenbuch',
            'Jetzt kaufen': 'Jetzt kaufen',
            'Bei Books2Read kaufen': 'Bei Books2Read kaufen',
            'E-Book Amazon.de': 'E-Book Amazon.de',
            'Taschenbuch Amazon.de': 'Taschenbuch Amazon.de',
            'Apple Books': 'Apple Books'
        },
        en: {
            // Navigation
            'Startseite': 'Home',
            'Bücher': 'Books',
            'Über mich': 'About',
            'Genres': 'Genres',
            
            // Buttons and links
            'Auf Amazon DE ansehen': 'View on Amazon DE',
            'Auf Amazon US ansehen': 'View on Amazon US',
            'Bei Apple Books': 'On Apple Books',
            'Bei Books2Read': 'On Books2Read',
            'Hörbuch': 'Audiobook',
            'Hörbuch bei Apple Books': 'Experience the Audiobook on Apple',
            'Mehr erfahren': 'Learn More',
            
            // Placeholders
            'Suche nach Titel...': 'Search by title...',
            'Alle Genres': 'All Genres',
            'Psychologie': 'Psychology',
            'Krimi': 'Crime',
            'Beziehungen': 'Relationships',
            'Belletristik': 'Fiction',
            
            // Sections
            'Bestseller-Highlights': 'Bestseller Highlights',
            'Alle Bücher': 'All Books',
            'Über den Autor': 'About the Author',
            'Meine Genres': 'My Genres',
            
            // Book detail page specific
            'Weitere Bücher von Dirk Werner': 'More Books by Dirk Werner',
            'Sprache:': 'Language:',
            'Deutsch': 'German',
            'Format:': 'Format:',
            'E-Book & Taschenbuch': 'E-Book & Paperback',
            'Jetzt kaufen': 'Buy Now',
            'Bei Books2Read kaufen': 'Buy on Books2Read',
            'E-Book Amazon.de': 'E-Book Amazon.de',
            'Taschenbuch Amazon.de': 'Paperback Amazon.de',
            'Apple Books': 'Apple Books'
        }
    };
}

// Genre classification based on title keywords
function classifyGenre(title) {
    // Handle multilingual title objects
    const titleString = typeof title === 'string' ? title : getLocalizedText(title, window.currentLanguage || 'de');
    const titleLower = titleString.toLowerCase();
    
    if (titleLower.includes('seelmann') || titleLower.includes('trance') || titleLower.includes('echo') || 
        titleLower.includes('legacy') || titleLower.includes('vermächtnis') || titleLower.includes('tödlich')) {
        return 'crime';
    }
    
    if (titleLower.includes('beziehung') || titleLower.includes('relationship') || titleLower.includes('herz') || 
        titleLower.includes('heart') || titleLower.includes('liebe') || titleLower.includes('love') || 
        titleLower.includes('paar') || titleLower.includes('souverän') || titleLower.includes('tests')) {
        return 'relationships';
    }
    
    if (titleLower.includes('psycho') || titleLower.includes('intelligenz') || titleLower.includes('intelligence') || 
        titleLower.includes('selbst') || titleLower.includes('self') || titleLower.includes('suizid') || 
        titleLower.includes('suicide') || titleLower.includes('therapie') || titleLower.includes('therapy') ||
        titleLower.includes('dankbarkeit') || titleLower.includes('gratitude') || titleLower.includes('battle') ||
        titleLower.includes('gemeinsam') || titleLower.includes('empathie') || titleLower.includes('cult') ||
        titleLower.includes('leadership') || titleLower.includes('emotionale')) {
        return 'psychology';
    }
    
    if (titleLower.includes('american') || titleLower.includes('shadows') || titleLower.includes('nanogenesis') || 
        titleLower.includes('lyra') || titleLower.includes('awakening') || titleLower.includes('matrix') || 
        titleLower.includes('enlightened') || titleLower.includes('seminar') || titleLower.includes('kosmische')) {
        return 'fiction';
    }
    
    return 'psychology'; // Default to psychology
}

// Generate Schema.org Book markup
function generateBookSchema(book) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Book",
        "name": getLocalizedText(book.title, window.currentLanguage || 'de'),
        "author": {
            "@type": "Person",
            "name": book.author || "Dirk Werner"
        },
        "bookFormat": book.bookFormat || "EBook",
        "inLanguage": book.language || "de",
        "description": getLocalizedText(book.description, window.currentLanguage || 'de') || "",
        "offers": {
            "@type": "Offer",
            "url": book.links?.amazon_de || book.link,
            "priceCurrency": "EUR"
        }
    };
    
    if (book.asin) {
        schema.isbn = book.asin;
    }
    
    return schema;
}

// Generate purchase links
function generatePurchaseLinks(book) {
    const links = [];
    const currentLang = window.currentLanguage || 'de';
    
    // Amazon DE
    if (book.links && book.links.amazon_de) {
        links.push({
            url: book.links.amazon_de,
            text: `📚 ${window.translations[currentLang]['Auf Amazon DE ansehen']}`,
            class: 'amazon-de'
        });
    } else if (book.link) {
        links.push({
            url: book.link,
            text: `📚 ${window.translations[currentLang]['Auf Amazon DE ansehen']}`,
            class: 'amazon-de'
        });
    }
    
    // Amazon US
    if (book.links && book.links.amazon_us) {
        links.push({
            url: book.links.amazon_us,
            text: `🛒 ${window.translations[currentLang]['Auf Amazon US ansehen']}`,
            class: 'amazon-com'
        });
    } else if (book.link) {
        // Ersetze amazon.de durch amazon.com für US-Link
        const usLink = book.link.replace('amazon.de', 'amazon.com');
        links.push({
            url: usLink,
            text: `🛒 ${window.translations[currentLang]['Auf Amazon US ansehen']}`,
            class: 'amazon-com'
        });
    }
    
    // Apple Books - nur anzeigen wenn explizit vorhanden
    if (book.links && book.links.apple_books) {
        // Spezifischer Apple Books Link vorhanden
        links.push({
            url: book.links.apple_books,
            text: `📱 ${window.translations[currentLang]['Bei Apple Books']}`,
            class: 'apple-books'
        });
    }
    
    // Books2Read - immer hinzufügen
    if (book.links && book.links.books2read) {
        links.push({
            url: book.links.books2read,
            text: `🌍 ${window.translations[currentLang]['Bei Books2Read']}`,
            class: 'books2read'
        });
    } else {
        links.push({
            url: 'https://books2read.com/Dirk-Werner-Author',
            text: `🌍 ${window.translations[currentLang]['Bei Books2Read']}`,
            class: 'books2read'
        });
    }
    
    return links;
}

// Helper function to get localized text from multilingual objects
function getLocalizedText(textObj, lang) {
    if (typeof textObj === 'string') {
        return textObj; // Fallback for old format
    }
    if (textObj && typeof textObj === 'object') {
        return textObj[lang] || textObj['de'] || textObj['en'] || 'No description available';
    }
    return 'No description available';
}

// Funktion für IP-basierte geolokationsbasierte Apple Books-Links
async function setAudiobookLinksByCountry() {
  const fallback = "https://books.apple.com/de/author/dirk-werner/id316714929?see-all=audio-books";
  const linksByCountry = {
    US: "https://books.apple.com/us/author/dirk-werner/id316714929?see-all=audio-books",
    GB: "https://books.apple.com/gb/author/dirk-werner/id316714929?see-all=audio-books",
    DE: fallback
  };

  let link = fallback;

  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    const countryCode = (data.country_code || "").toUpperCase();
    if (linksByCountry[countryCode]) {
      link = linksByCountry[countryCode];
    }
  } catch (e) {
    console.warn("Geolocation failed. Using fallback link.");
  }

  // Alle Buttons auf der Seite setzen
  document.querySelectorAll('.btn-audiobook-link').forEach(btn => {
    btn.setAttribute('href', link);
    // Ensure button is visible if it has audiobook data
    const bookCard = btn.closest('.book-card');
    if (bookCard && bookCard.dataset.hasAudiobook === 'true') {
      btn.style.display = 'inline-flex';
      btn.style.visibility = 'visible';
      console.log('🎧 [Audiobook] Button visible for:', bookCard.dataset.title);
    } else {
      btn.style.display = 'none';
      console.log('🎧 [Audiobook] Button hidden for:', bookCard?.dataset.title || 'unknown');
    }
  });

  // Auch Hero-Button setzen
  const heroBtn = document.querySelector('.btn-audiobook-hero');
  if (heroBtn) {
    heroBtn.setAttribute('href', link);
    // Zusätzlich: Event Listener entfernen und neu hinzufügen
    heroBtn.removeEventListener('click', heroBtn._audiobookClickHandler);
    heroBtn._audiobookClickHandler = function(e) {
      e.preventDefault();
      e.stopPropagation();
      window.open(link, '_blank', 'noopener,noreferrer');
    };
    heroBtn.addEventListener('click', heroBtn._audiobookClickHandler);
    console.log('🎧 [Hero] Hero button updated with link:', link);
  } else {
    console.log('🎧 [Hero] Hero button not found in DOM - likely on book detail page');
  }
  
  // Update audiobook buttons in related books
  const relatedBooksContainer = document.getElementById('relatedBooks');
  if (relatedBooksContainer) {
    relatedBooksContainer.querySelectorAll('.btn-audiobook-link').forEach(btn => {
      btn.setAttribute('href', link);
      const bookCard = btn.closest('.book-card');
      if (bookCard && bookCard.dataset.hasAudiobook === 'true') {
        btn.style.display = 'inline-flex';
        btn.style.visibility = 'visible';
        console.log('🎧 [Audiobook] Related button visible for:', bookCard.dataset.title);
      } else {
        btn.style.display = 'none';
        console.log('🎧 [Audiobook] Related button hidden for:', bookCard?.dataset.title || 'unknown');
      }
    });
  }
  
  // Force visibility of all audiobook buttons that should be visible
  document.querySelectorAll('.book-card[data-has-audiobook="true"] .book-link.audiobook').forEach(btn => {
    btn.style.display = 'inline-flex';
    btn.style.visibility = 'visible';
    btn.setAttribute('href', link);
    const bookCard = btn.closest('.book-card');
    console.log('🎧 [Audiobook] Force visible for:', bookCard?.dataset.title || 'unknown');
  });
  
  console.log('🎧 [Audiobook] Updated audiobook links for country, link:', link);
  
  return link;
}

// Generate aria-label for accessibility
function getAriaLabel(linkClass, bookTitle) {
    const labels = {
        'amazon-de': `Buch "${bookTitle}" bei Amazon Deutschland ansehen`,
        'amazon-com': `Buch "${bookTitle}" bei Amazon USA ansehen`,
        'apple-books': `Buch "${bookTitle}" bei Apple Books ansehen`,
        'books2read': `Buch "${bookTitle}" bei Books2Read ansehen`
    };
    return labels[linkClass] || `Buch "${bookTitle}" ansehen`;
}

// Create book card HTML
async function createBookCard(book) {
    const genre = classifyGenre(book.title);
    const links = generatePurchaseLinks(book);
    const currentLang = window.currentLanguage || 'de';
    
    // Cache-Busting für Cover-Bilder
    const coverUrl = book.image?.link || '';
    const cacheBustedCover = coverUrl ? `${coverUrl}${coverUrl.includes('?') ? '&' : '?'}nocache=${Date.now()}` : '';
    
    // Wait for whitelist to be loaded
    if (!window.appleAudiobookList && typeof window.waitForAudiobookList === 'function') {
        await window.waitForAudiobookList();
    }
    
    // Shop-Links (Amazon DE, Amazon US, Apple Books, Books2Read)
    const shopLinks = links.filter(link => link.class !== 'audiobook');
    const shopLinksHTML = shopLinks.map(link => {
        const ariaLabel = getAriaLabel(link.class, getLocalizedText(book.title, currentLang));
        return `<a href="${link.url}" target="_blank" class="book-link ${link.class}" aria-label="${ariaLabel}">${link.text}</a>`;
    }).join('');
    
    // Hörbuch-Button - NUR durch JavaScript nach Whitelist-Check
    let audiobookHTML = '';
    
    // Try multiple identification methods: JSON field first, then ISBN, then title
    const titleString = getLocalizedText(book.title, currentLang);
    const hasAudiobook = (
        (book.hasAudiobook === true) ||
        (book.asin && typeof window.isAppleAudiobook === 'function' && window.isAppleAudiobook(book.asin)) ||
        (typeof window.isAppleAudiobook === 'function' && window.isAppleAudiobook(titleString))
    );
    
    console.log('🎧 [Audiobook] Checking book:', titleString, 'ASIN:', book.asin, 'JSON hasAudiobook:', book.hasAudiobook, 'Final result:', hasAudiobook, 'Whitelist loaded:', !!window.appleAudiobookList);
    console.log('🎧 [Audiobook] Whitelist details:', {
        whitelistExists: !!window.appleAudiobookList,
        whitelistLength: window.appleAudiobookList?.audiobooks?.length || 0,
        isAppleAudiobookFunction: typeof window.isAppleAudiobook === 'function',
        bookTitle: titleString,
        asinCheck: book.asin && typeof window.isAppleAudiobook === 'function' ? window.isAppleAudiobook(book.asin) : 'N/A',
        titleCheck: typeof window.isAppleAudiobook === 'function' ? window.isAppleAudiobook(titleString) : 'N/A'
    });
    
    if (hasAudiobook) {
        const ariaLabel = `Hörbuch "${titleString}" bei Apple Books anhören`;
        audiobookHTML = `<a class="book-link audiobook btn-audiobook-link" href="#" target="_blank" rel="noopener noreferrer" aria-label="${ariaLabel}" data-audiobook-allowed="true" data-lang="${currentLang}">🎧 ${window.translations[currentLang]['Hörbuch bei Apple Books']}</a>`;
        console.log('🎧 [Audiobook] ADDING audiobook button for:', titleString);
    } else {
        console.log('🎧 [Audiobook] NO audiobook button for:', titleString);
        // NO HTML for audiobook button - completely prevent rendering
    }
    
    // Generate Schema.org markup
    const schema = generateBookSchema(book);
    const schemaScript = `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
    
    // Generate slug for book detail page - ALL books should have detail pages
    let slug;
    let hasDetailPage = true; // Default to true for all books
    
    // Generate slug from title (same logic as generate-book-pages.js)
    slug = titleString
        .toLowerCase()
        // Replace German umlauts
        .replace(/ä/g, 'ae')
        .replace(/ö/g, 'oe')
        .replace(/ü/g, 'ue')
        .replace(/ß/g, 'ss')
        // Remove special characters and parentheses
        .replace(/[^\w\s-]/g, '')
        // Replace spaces with hyphens
        .replace(/\s+/g, '-')
        // Remove multiple consecutive hyphens
        .replace(/-+/g, '-')
        // Remove leading and trailing hyphens
        .replace(/^-+|-+$/g, '');
    
    console.log('🔗 [Link] Generated slug for book:', titleString, '→', slug);
    
    // Log decision for debugging
    if (window.linkDebugger) {
        window.linkDebugger.logLinkDecision(
            titleString, 
            hasDetailPage, 
            `/buecher/${slug}`, 
            'Detail page available for all books'
        );
    }
    
    console.log('🔗 [Link] Final decision for', titleString, ':', {
        hasDetailPage,
        detailLink: `/buecher/${slug}`,
        userAgent: navigator.userAgent,
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    });
    
    // Ensure we have valid URLs
    const detailPageUrl = hasDetailPage ? `/buecher/${slug}` : null;
    const books2readUrl = 'https://books2read.com/Dirk-Werner-Author';
    
    // Validate URLs before creating HTML
    if (hasDetailPage && (!slug || slug.length === 0)) {
        console.warn('⚠️ [Link] Invalid slug detected, falling back to Books2Read:', titleString);
        hasDetailPage = false;
    }
    
    // All books should have detail pages - no special cases needed
    console.log('🔧 [Link] All books have detail pages:', titleString);
    
    // CRITICAL FIX: Only set data-fallback="true" for books WITHOUT detail pages
    const shouldUseFallback = !hasDetailPage;
    console.log('🔧 [Link] Book:', titleString, 'hasDetailPage:', hasDetailPage, 'shouldUseFallback:', shouldUseFallback);
    
    return `
        <div class="book-card fade-in" data-genre="${genre}" data-title="${titleString.toLowerCase()}" data-asin="${book.asin || ''}" data-has-audiobook="${hasAudiobook}" data-has-detail-page="${hasDetailPage}">
            ${schemaScript}
            <!-- 🎯 SAUBERES BUCHCOVER: Nur das Bild, keine Titel-Overlays -->
            <div class="book-image">
                <a href="${detailPageUrl}" class="book-cover-link" aria-label="Mehr über ${titleString} erfahren">
                    <img src="${cacheBustedCover}" alt="Buchcover" loading="lazy" class="book-cover-image" title="">
                </a>
            </div>
            <!-- 📚 BUCH-INFO: Titel und Beschreibung NUR unterhalb des Covers -->
            <div class="book-info">
                <h3 class="book-title">
                    <a href="${detailPageUrl}" class="book-title-link" aria-label="Mehr über ${getLocalizedText(book.title, currentLang)} erfahren">${getLocalizedText(book.title, currentLang)}</a>
                </h3>
                <p class="book-author">${book.author}</p>
                <p class="book-description">${getLocalizedText(book.description, currentLang)}</p>
                <div class="book-links">
                    <a href="${detailPageUrl}" class="book-link detail-link" aria-label="Mehr über ${titleString} erfahren">
                        📖 ${window.translations[currentLang]['Mehr erfahren'] || 'Mehr erfahren'}
                    </a>
                    ${shopLinksHTML}
                    ${audiobookHTML}
                </div>
            </div>
        </div>
    `;
}

// Load and display books
async function loadBooks() {
    // STRICT URL-based book detail page detection
    const currentPath = window.location.pathname;
    const isBookDetailPage = currentPath.startsWith('/buecher/') && currentPath !== '/buecher/';
    const isOverviewPage = currentPath === '/' || currentPath === '/index.html';
    
    // ONLY load books on overview page
    if (!isOverviewPage || isBookDetailPage) {
        console.log('📚 [Books] Not on overview page - SKIPPING loadBooks()', {
            currentPath,
            isOverviewPage,
            isBookDetailPage
        });
        return;
    }
    
    // Additional safety check: if we're on a detail page, don't load books
    if (document.querySelector('.book-detail')) {
        console.log('📚 [Books] Book detail container found - SKIPPING loadBooks()');
        return;
    }
    
    const featuredContainer = document.getElementById('featuredBooks');
    const allBooksContainer = document.getElementById('allBooks');
    
    // Only proceed if we have book containers (main page)
    if (featuredContainer || allBooksContainer) {
        try {
            const response = await fetch('books.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Check content type to ensure it's JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new TypeError('books.json is not valid JSON - received HTML instead');
            }
            
            const text = await response.text();
            
            // Additional check for HTML content
            if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
                throw new TypeError('Server returned HTML instead of JSON - likely 404 page');
            }
            
            // Try to parse JSON
            let parsedData;
            try {
                parsedData = JSON.parse(text);
            } catch (parseError) {
                throw new TypeError(`Invalid JSON format: ${parseError.message}`);
            }
            
            allBooks = parsedData;
            // Filterfunktion: hasAudiobook verwenden (falls nicht gesetzt, dann false)
            allBooks = allBooks.map(book => {
                book.hasAudiobook = book.hasAudiobook === true;
                return book;
            });
            filteredBooks = [...allBooks];
            
            await displayFeaturedBooks();
            await displayAllBooks();
            
            // Emergency cleanup: Remove audiobook buttons for books not in whitelist
            setTimeout(() => {
                console.log('🧹 [Emergency] Cleaning up unauthorized audiobook buttons...');
                console.log('🧹 [Emergency] Whitelist status:', {
                    exists: !!window.appleAudiobookList,
                    functionExists: typeof window.isAppleAudiobook === 'function',
                    audiobooksCount: window.appleAudiobookList?.audiobooks?.length || 0
                });
                
                document.querySelectorAll('.book-card').forEach(card => {
                    const bookTitle = card.querySelector('.book-title')?.textContent?.trim();
                    const audiobookButton = card.querySelector('.book-link.audiobook');
                    
                    if (audiobookButton && bookTitle) {
                        console.log('🧹 [Emergency] Checking book:', bookTitle);
                        
                        // Direct whitelist check
                        let shouldHaveAudiobook = false;
                        
                        if (window.appleAudiobookList && window.appleAudiobookList.audiobooks) {
                            const normalizedTitle = bookTitle.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
                            
                            shouldHaveAudiobook = window.appleAudiobookList.audiobooks.some(book => {
                                const whitelistTitle = getLocalizedText(book.title, window.currentLanguage || 'de').toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
                                return whitelistTitle === normalizedTitle || whitelistTitle.includes(normalizedTitle) || normalizedTitle.includes(whitelistTitle);
                            });
                        }
                        
                        console.log('🧹 [Emergency] Book:', bookTitle, 'Should have audiobook:', shouldHaveAudiobook);
                        
                        if (!shouldHaveAudiobook) {
                            console.log('🧹 [Emergency] REMOVING unauthorized audiobook button for:', bookTitle);
                            audiobookButton.remove();
                        } else {
                            console.log('🧹 [Emergency] KEEPING authorized audiobook button for:', bookTitle);
                        }
                    }
                });
                
                console.log('🧹 [Emergency] Cleanup completed');
            }, 3000); // Wait 3 seconds after page load
            
        } catch (error) {
            console.error('❌ [Books] Fehler beim Laden der Bücher:', error);
            
            // Show user-friendly error message
            const errorMessage = `
                <div class="error-message">
                    <p>⚠️ Bücher konnten nicht geladen werden. Bitte versuchen Sie es später erneut.</p>
                    <p><small>Technischer Fehler: ${error.message}</small></p>
                </div>
            `;
            
            if (featuredContainer) {
                featuredContainer.innerHTML = errorMessage;
            }
            if (allBooksContainer) {
                allBooksContainer.innerHTML = errorMessage;
            }
        }
    }
}

// Remove duplicate books based on base title (without format suffix)
function removeDuplicateBooks(books) {
    const bookMap = new Map(); // Map to store the best version of each book
    
    books.forEach(book => {
        // Extract base title by removing format suffixes
        let baseTitle = getLocalizedText(book.title, window.currentLanguage || 'de');
        
        // Remove common format suffixes
        const formatSuffixes = [
            ' (Taschenbuch)',
            ' (Paperback)',
            ' (E-Book)',
            ' (Kindle)',
            ' (English Edition)',
            ' (German Edition)'
        ];
        
        formatSuffixes.forEach(suffix => {
            if (baseTitle.endsWith(suffix)) {
                baseTitle = baseTitle.slice(0, -suffix.length);
            }
        });
        
        // Special case: "Umgang mit Eifersüchtigen" - always prefer the E-Book version
        if (baseTitle.includes('Umgang mit Eifersüchtigen')) {
            baseTitle = 'Umgang mit Eifersüchtigen: So bewahrst du deine innere Stärke';
        }
        
        // If we haven't seen this base title before, add the book
        if (!bookMap.has(baseTitle)) {
            bookMap.set(baseTitle, book);
        } else {
            // If we already have a book with this base title, keep the one with more links
            const existingBook = bookMap.get(baseTitle);
            const existingLinksCount = existingBook.links ? Object.keys(existingBook.links).length : 0;
            const newLinksCount = book.links ? Object.keys(book.links).length : 0;
            
            // Special priority for E-Book over Paperback
            const existingIsEbook = existingBook.bookFormat === 'EBook' || !existingBook.bookFormat;
            const newIsEbook = book.bookFormat === 'EBook' || !book.bookFormat;
            
            if (newIsEbook && !existingIsEbook) {
                console.log(`📚 [Duplicate] Replacing "${getLocalizedText(existingBook.title, window.currentLanguage || 'de')}" with "${getLocalizedText(book.title, window.currentLanguage || 'de')}" (E-Book preferred)`);
                bookMap.set(baseTitle, book);
            } else if (existingIsEbook && !newIsEbook) {
                console.log(`📚 [Duplicate] Skipping "${getLocalizedText(book.title, window.currentLanguage || 'de')}" (E-Book preferred)`);
            } else if (newLinksCount > existingLinksCount) {
                console.log(`📚 [Duplicate] Replacing "${getLocalizedText(existingBook.title, window.currentLanguage || 'de')}" with "${getLocalizedText(book.title, window.currentLanguage || 'de')}" (more links: ${newLinksCount} vs ${existingLinksCount})`);
                bookMap.set(baseTitle, book);
            } else {
                console.log(`📚 [Duplicate] Skipping "${getLocalizedText(book.title, window.currentLanguage || 'de')}" (fewer links: ${newLinksCount} vs ${existingLinksCount})`);
            }
        }
    });
    
    return Array.from(bookMap.values());
}

// Display featured books (first 6)
async function displayFeaturedBooks() {
    const featuredContainer = document.getElementById('featuredBooks');
    if (featuredContainer && allBooks) {
        // Remove duplicates before displaying
        const uniqueBooks = removeDuplicateBooks(allBooks);
        const featuredBooks = uniqueBooks.slice(0, 6);
        const bookCards = await Promise.all(featuredBooks.map(book => createBookCard(book)));
        featuredContainer.innerHTML = bookCards.join('');
    }
}

// Display all books
async function displayAllBooks() {
    const allBooksContainer = document.getElementById('allBooks');
    if (allBooksContainer && filteredBooks) {
        // Remove duplicates before displaying
        const uniqueBooks = removeDuplicateBooks(filteredBooks);
        const bookCards = await Promise.all(uniqueBooks.map(book => createBookCard(book)));
        allBooksContainer.innerHTML = bookCards.join('');
        
        // Add fade-in animation
        setTimeout(() => {
            document.querySelectorAll('.book-card').forEach((card, index) => {
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 100);
            });
        }, 100);
    }
}

// Filter books by genre
function filterByGenre(genre) {
    if (genre === 'all') {
        filteredBooks = [...allBooks];
    } else {
        filteredBooks = allBooks.filter(book => classifyGenre(book.title) === genre);
    }
    
    displayAllBooks();
}

// Search books by title
function searchBooks(query) {
    const searchTerm = query.toLowerCase();
    
    if (searchTerm === '') {
        filteredBooks = [...allBooks];
    } else {
        filteredBooks = allBooks.filter(book => {
            const titleString = getLocalizedText(book.title, window.currentLanguage || 'de');
            return titleString.toLowerCase().includes(searchTerm);
        });
    }
    
    displayAllBooks();
}

// Universal translation function
function translatePage(lang) {
    // Ensure translations object exists
    if (!window.translations) {
        console.warn('⚠️ [Translate] Translations object not found, initializing basic translations');
        window.translations = {
            de: {
                'Auf Amazon DE ansehen': 'Auf Amazon DE ansehen',
                'Bei Apple Books': 'Bei Apple Books',
                'Bei Books2Read': 'Bei Books2Read',
                'Hörbuch bei Apple Books': 'Hörbuch bei Apple Books'
            },
            en: {
                'Auf Amazon DE ansehen': 'View on Amazon DE',
                'Bei Apple Books': 'On Apple Books',
                'Bei Books2Read': 'On Books2Read',
                'Hörbuch bei Apple Books': '🎧 Listen to Audiobook on Apple Books Now'
            }
        };
    }
    
    const translations = window.translations[lang];
    if (!translations) {
        console.warn(`⚠️ [Translate] No translations found for language: ${lang}`);
        return;
    }
    
    window.currentLanguage = lang;
    
    // Update active language button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.lang === lang) {
            btn.classList.add('active');
        }
    });
    
    // Update all translatable elements with data-de/data-en
    document.querySelectorAll('[data-de]').forEach(element => {
        if (element.tagName === 'INPUT') {
            element.placeholder = element.dataset[lang + 'Placeholder'] || element.dataset[lang];
        } else {
            element.textContent = element.dataset[lang];
        }
    });
    
    // Update elements with data-label-* attributes
    document.querySelectorAll('[data-label-de]').forEach(element => {
        const labelKey = `label-${lang}`;
        if (element.dataset[labelKey]) {
            element.textContent = element.dataset[labelKey];
        }
    });
    
    // Update document title and meta description
    const title = document.querySelector('title');
    const metaDesc = document.querySelector('meta[name="description"]');
    
    if (title && title.dataset[lang]) {
        title.textContent = title.dataset[lang];
    }
    
    if (metaDesc && metaDesc.dataset[lang]) {
        metaDesc.setAttribute('content', metaDesc.dataset[lang]);
    }
    
    // Update HTML lang attribute
    document.documentElement.lang = lang;
    
    // Reload books to update button texts (only if elements exist)
    const featuredContainer = document.getElementById('featuredBooks');
    const allBooksContainer = document.getElementById('allBooks');
    
    if (featuredContainer || allBooksContainer) {
        try {
            displayFeaturedBooks();
            displayAllBooks();
        } catch (error) {
            console.log('Error updating book display:', error);
        }
    }
    
    // Update related books on detail page if they exist
    const relatedBooksContainer = document.getElementById('relatedBooks');
    if (relatedBooksContainer && typeof window.loadRelatedBooks === 'function') {
        try {
            window.loadRelatedBooks();
        } catch (error) {
            console.log('Error updating related books:', error);
        }
    }
    
    // Update audiobook links after language switch
    setAudiobookLinksByCountry();
    
    // Force re-render of any dynamic content
    const event = new CustomEvent('languageChanged', { detail: { language: lang } });
    document.dispatchEvent(event);
    
    console.log('🌐 [Translation] Page translated to:', lang);
}

// Smooth scrolling for navigation links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            // Nur für interne Links (die mit # beginnen)
            if (href && href.startsWith('#')) {
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

// Initialize search functionality
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let searchTimeout;
        
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchBooks(this.value);
            }, 300);
        });
    } else {
        console.log('🔍 [Search] Search input not found - likely on book detail page');
    }
}

// Initialize genre filter
function initGenreFilter() {
    const genreFilter = document.getElementById('genreFilter');
    if (genreFilter) {
        genreFilter.addEventListener('change', function() {
            filterByGenre(this.value);
        });
    } else {
        console.log('🎭 [Filter] Genre filter not found - likely on book detail page');
    }
}

// Initialize language switching
function initLanguageSwitching() {
    // Check URL parameter first, then localStorage, then default to 'de'
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    const localStorageLang = localStorage.getItem('preferredLang');
    
    let preferredLang = 'de'; // default
    
    if (urlLang && (urlLang === 'de' || urlLang === 'en')) {
        preferredLang = urlLang;
        // Update localStorage with URL parameter
        localStorage.setItem('preferredLang', preferredLang);
        console.log('🌐 [Language] Language set from URL parameter:', preferredLang);
    } else if (localStorageLang) {
        preferredLang = localStorageLang;
        console.log('🌐 [Language] Language set from localStorage:', preferredLang);
    } else {
        console.log('🌐 [Language] Using default language:', preferredLang);
    }
    
    window.currentLanguage = preferredLang;
    
    // Set initial active state
    document.querySelectorAll('.lang-btn').forEach(btn => {
        if (btn.dataset.lang === preferredLang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Add click event listeners
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const selectedLang = this.dataset.lang;
            localStorage.setItem('preferredLang', selectedLang);
            translatePage(selectedLang);
        });
    });
    
    // Apply initial translation
    translatePage(preferredLang);
}

// Add loading animation
function showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = '<div class="loading"></div>';
    }
}

// Initialize intersection observer for animations
function initAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, {
        threshold: 0.1
    });
    
    // Observe sections for animation
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
}

// Handle responsive navigation
function initResponsiveNav() {
    // Mobile navigation toggle
    const mobileToggle = document.querySelector('.mobile-nav-toggle');
    const navList = document.querySelector('.nav-list');
    
    if (mobileToggle && navList) {
        mobileToggle.addEventListener('click', function() {
            navList.classList.toggle('active');
            
            // Update aria-label for accessibility
            const isOpen = navList.classList.contains('active');
            mobileToggle.setAttribute('aria-label', isOpen ? 'Menü schließen' : 'Menü öffnen');
            mobileToggle.textContent = isOpen ? '✕' : '☰';
        });
        
        // Close mobile menu when clicking on a link
        const navLinks = navList.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navList.classList.remove('active');
                mobileToggle.setAttribute('aria-label', 'Menü öffnen');
                mobileToggle.textContent = '☰';
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!navList.contains(event.target) && !mobileToggle.contains(event.target)) {
                navList.classList.remove('active');
                mobileToggle.setAttribute('aria-label', 'Menü öffnen');
                mobileToggle.textContent = '☰';
            }
        });
    }
    
    // Add mobile menu functionality if needed
    const nav = document.querySelector('.nav');
    if (nav) {
        let lastScrollY = window.scrollY;
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > lastScrollY && window.scrollY > 100) {
                nav.style.transform = 'translateY(-100%)';
            } else {
                nav.style.transform = 'translateY(0)';
            }
            lastScrollY = window.scrollY;
        });
    } else {
        console.log('📱 [Nav] Navigation not found - likely on book detail page');
    }
}

    // Initialize everything when DOM is loaded
    document.addEventListener('DOMContentLoaded', async function() {
        console.log('🚀 [Init] DOMContentLoaded event fired');
        
        // WAIT FOR WHITELIST TO LOAD
        if (!window.appleAudiobookList) {
            console.log('⏳ [Init] Waiting for whitelist to load...');
            await new Promise(resolve => {
                const checkInterval = setInterval(() => {
                    if (window.appleAudiobookList) {
                        clearInterval(checkInterval);
                        console.log('✅ [Init] Whitelist loaded successfully');
                        resolve();
                    }
                }, 100);
                
                // Timeout after 5 seconds
                setTimeout(() => {
                    clearInterval(checkInterval);
                    console.warn('⚠️ [Init] Whitelist loading timeout - using fallback');
                    resolve();
                }, 5000);
            });
        }
        
        // STRICT URL-based book detail page detection
        const currentPath = window.location.pathname;
        const isBookDetailPage = currentPath.startsWith('/buecher/') && currentPath !== '/buecher/';
        const isOverviewPage = currentPath === '/' || currentPath === '/index.html';
    
    // Check for page elements
    const featuredContainer = document.getElementById('featuredBooks');
    const allBooksContainer = document.getElementById('allBooks');
    const bookDetailContainer = document.querySelector('.book-detail');
    
    // Set initial language
    window.currentLanguage = window.currentLanguage || 'de';
    
    console.log('🔍 [Init] Page type detection:', {
        isBookDetailPage,
        isOverviewPage,
        currentPath,
        hasBookDetail: !!bookDetailContainer,
        hasFeaturedBooks: !!featuredContainer,
        hasAllBooks: !!allBooksContainer,
        scriptSrc: document.currentScript?.src || 'unknown'
    });
    
    // ONLY load books on overview page
    if (isOverviewPage && !isBookDetailPage) {
        console.log('🏠 [Init] Initializing main page');
        
        // Show loading animation only if elements exist
        if (featuredContainer) showLoading('featuredBooks');
        if (allBooksContainer) showLoading('allBooks');
        
        // Initialize all functionality for main page
        await loadBooks();
        initSmoothScrolling();
        
        // Only initialize search and filter on overview page
        const isOverviewPage = window.location.pathname === '/' || window.location.pathname === '/index.html';
        if (isOverviewPage) {
            initSearch();
            initGenreFilter();
        }
        
        initLanguageSwitching();
        initAnimations();
        initResponsiveNav();
        
        // Set initial language
        translatePage('de');
        
        // Set audiobook links by country (mit Verzögerung für Hero-Button)
        setTimeout(async () => {
            await setAudiobookLinksByCountry();
        }, 100);
        
        // Zusätzliche Sicherheit: Hero-Button nach 500ms nochmal prüfen
        setTimeout(async () => {
            await setAudiobookLinksByCountry();
        }, 500);
        
        // Final check after all content is loaded
        setTimeout(async () => {
            await setAudiobookLinksByCountry();
            // Force re-render of audiobook buttons
            document.querySelectorAll('.book-card[data-has-audiobook="true"] .book-link.audiobook').forEach(btn => {
                btn.style.display = 'inline-flex';
            });
            
            // Mobile-specific audiobook button enforcement
            const isMobile = window.innerWidth <= 768;
            if (isMobile) {
                console.log('📱 [Main] Mobile detected - enforcing audiobook button visibility');
                document.querySelectorAll('.book-link.audiobook').forEach(btn => {
                    btn.style.display = 'inline-flex';
                    btn.style.visibility = 'visible';
                    btn.style.opacity = '1';
                    btn.style.pointerEvents = 'auto';
                    btn.style.width = '100%';
                    btn.style.justifyContent = 'center';
                    btn.style.minHeight = '44px';
                });
            }
            
                    // Use Audiobook Utility for button management (SAFE)
        if (window.audiobookUtility && window.audiobookUtility.isInitialized) {
            console.log('🔧 [Main] Using Audiobook Utility for SAFE button management');
            window.audiobookUtility.processAudiobookButtonsSafe();
            window.audiobookUtility.processDetailPageAudiobookButtons();
        } else {
            console.log('🔧 [Main] Audiobook Utility not ready, waiting...');
            // Wait for utility to be ready with longer delay
            setTimeout(() => {
                if (window.audiobookUtility) {
                    console.log('🔧 [Main] Audiobook Utility ready, processing buttons...');
                    window.audiobookUtility.processAudiobookButtonsSafe();
                    window.audiobookUtility.processDetailPageAudiobookButtons();
                } else {
                    console.log('🔧 [Main] Audiobook Utility still not ready, retrying...');
                    // Retry after another 3 seconds
                    setTimeout(() => {
                        if (window.audiobookUtility) {
                            window.audiobookUtility.processAudiobookButtonsSafe();
                            window.audiobookUtility.processDetailPageAudiobookButtons();
                        }
                    }, 3000);
                }
            }, 3000);
        }
        }, 1000);
    } else {
        console.log('📚 [Init] Initializing book detail page - SKIPPING loadBooks()');
        
        // Initialize only necessary functionality for book detail page
        initSmoothScrolling();
        initAnimations();
        initResponsiveNav();
        initLanguageSwitching(); // Add language switching for detail pages
        
        // Set initial language for detail page
        translatePage('de');
        
        // Set audiobook links by country for detail page
        setTimeout(async () => {
            await setAudiobookLinksByCountry();
        }, 100);
        
        // Additional audiobook link update after related books load
        setTimeout(async () => {
            await setAudiobookLinksByCountry();
            // Force re-render of audiobook buttons on detail page
            document.querySelectorAll('.book-card[data-has-audiobook="true"] .book-link.audiobook').forEach(btn => {
                btn.style.display = 'inline-flex';
            });
        }, 1000);
    }
    
    console.log('✅ Dirk Werner Author Website initialized successfully!');
    
    // Validate and fix links after initialization
    setTimeout(() => {
        validateAndFixLinks();
    }, 500);
    
    // Additional validation after content is fully loaded
    setTimeout(() => {
        validateAndFixLinks();
        console.log('🔧 [Main] Second link validation completed');
    }, 2000);
    
    // WEB COMPONENT: Custom audiobook button element
    if (!customElements.get('audiobook-button')) {
        class AudiobookButton extends HTMLElement {
            constructor() {
                super();
                this.attachShadow({ mode: 'open' });
            }
            
            connectedCallback() {
                const bookTitle = this.getAttribute('data-title');
                const bookAsin = this.getAttribute('data-asin');
                const currentLang = window.currentLanguage || 'de';
                
                // Check if audiobook is allowed
                const hasAudiobook = (
                    (this.getAttribute('data-has-audiobook') === 'true') ||
                    (bookAsin && typeof window.isAppleAudiobook === 'function' && window.isAppleAudiobook(bookAsin)) ||
                    (bookTitle && typeof window.isAppleAudiobook === 'function' && window.isAppleAudiobook(bookTitle))
                );
                
                if (hasAudiobook) {
                    const ariaLabel = `Hörbuch "${bookTitle}" bei Apple Books anhören`;
                    const buttonText = window.translations?.[currentLang]?.['Hörbuch bei Apple Books'] || '🎧 Hörbuch bei Apple Books';
                    
                    this.shadowRoot.innerHTML = `
                        <style>
                            :host {
                                display: inline-flex;
                                align-items: center;
                                justify-content: center;
                                padding: 8px 16px;
                                background: linear-gradient(135deg, #007AFF, #0056CC);
                                color: white;
                                text-decoration: none;
                                border-radius: 8px;
                                font-weight: 600;
                                font-size: 14px;
                                transition: all 0.3s ease;
                                cursor: pointer;
                                min-width: 130px;
                                max-width: 200px;
                            }
                            :host:hover {
                                transform: translateY(-2px);
                                box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
                            }
                        </style>
                        <a href="#" target="_blank" rel="noopener noreferrer" aria-label="${ariaLabel}">
                            ${buttonText}
                        </a>
                    `;
                    
                    console.log('🎭 [Web Component] Audiobook button created for:', bookTitle);
                } else {
                    console.log('🎭 [Web Component] No audiobook button for:', bookTitle);
                    this.style.display = 'none';
                }
            }
        }
        
        customElements.define('audiobook-button', AudiobookButton);
        console.log('🎭 [Web Component] AudiobookButton component registered');
    }
    
    // DEBUG PANEL: Show audiobook status for all books
    setTimeout(() => {
        console.log('🐞 [DEBUG PANEL] Audiobook Status Report:');
        document.querySelectorAll('.book-card').forEach((card, index) => {
            const bookTitle = card.querySelector('.book-title')?.textContent;
            const audiobookButton = card.querySelector('.book-link.audiobook');
            const hasAudiobookAttr = card.getAttribute('data-has-audiobook');
            const audiobookAllowed = audiobookButton?.getAttribute('data-audiobook-allowed');
            const bookAsin = card.getAttribute('data-asin');
            
            if (bookTitle) {
                const shouldHaveAudiobook = (
                    (hasAudiobookAttr === 'true') ||
                    (bookAsin && typeof window.isAppleAudiobook === 'function' && window.isAppleAudiobook(bookAsin)) ||
                    (typeof window.isAppleAudiobook === 'function' && window.isAppleAudiobook(bookTitle))
                );
                
                console.log(`🐞 [Book ${index + 1}] "${bookTitle}"`, {
                    asin: bookAsin,
                    shouldHaveAudiobook,
                    hasAudiobookAttr,
                    audiobookAllowed,
                    buttonVisible: !!audiobookButton,
                    buttonDisplay: audiobookButton?.style.display || 'not found',
                    identificationMethods: {
                        jsonField: hasAudiobookAttr === 'true',
                        asinMatch: bookAsin && typeof window.isAppleAudiobook === 'function' && window.isAppleAudiobook(bookAsin),
                        titleMatch: typeof window.isAppleAudiobook === 'function' && window.isAppleAudiobook(bookTitle)
                    }
                });
            }
        });
        
        // Show whitelist status
        console.log('🐞 [DEBUG PANEL] Whitelist Status:', {
            totalAudiobooks: window.appleAudiobookList?.audiobooks?.length || 0,
            audiobookTitles: window.appleAudiobookTitles || [],
            appleIds: window.appleAudiobookIds || [],
            functionAvailable: typeof window.isAppleAudiobook === 'function',
            whitelistLoaded: !!window.appleAudiobookList
        });
        
        // Test specific books
        const testBooks = [
            "The Key of the Enlightened",
            "How to Recognize Cults: A Guide to Protecting Yourself from Manipulation and Control",
            "Umgang mit Eifersüchtigen: So bewahrst du deine innere Stärke",
            "Psychotainment: Wie du auf jeder Party glänzt"
        ];
        
        testBooks.forEach(book => {
            const hasAudiobook = typeof window.isAppleAudiobook === 'function' && window.isAppleAudiobook(book);
            console.log(`🐞 [Test] "${book}": ${hasAudiobook ? '✅ HAS audiobook' : '❌ NO audiobook'}`);
        });
    }, 3000);
    
    // EMERGENCY FIX: Remove audiobook buttons for books not in whitelist
    setTimeout(() => {
        console.log('🔧 [Emergency Fix] Checking all audiobook buttons...');
        console.log('🔧 [Emergency Fix] Whitelist loaded:', !!window.appleAudiobookList);
        console.log('🔧 [Emergency Fix] Audiobooks in whitelist:', window.appleAudiobookList?.audiobooks?.length || 0);
        
        document.querySelectorAll('.book-card').forEach(card => {
            const bookTitle = card.querySelector('.book-title')?.textContent?.trim();
            if (bookTitle) {
                // Direct whitelist check
                let shouldHaveAudiobook = false;
                
                if (window.appleAudiobookList && window.appleAudiobookList.audiobooks) {
                    const normalizedTitle = bookTitle.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
                    
                    shouldHaveAudiobook = window.appleAudiobookList.audiobooks.some(book => {
                        const whitelistTitle = getLocalizedText(book.title, window.currentLanguage || 'de').toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
                        return whitelistTitle === normalizedTitle || whitelistTitle.includes(normalizedTitle) || normalizedTitle.includes(whitelistTitle);
                    });
                }
                
                const audiobookButton = card.querySelector('.book-link.audiobook');
                
                if (audiobookButton && !shouldHaveAudiobook) {
                    console.log('🔧 [Emergency Fix] REMOVING audiobook button for:', bookTitle);
                    audiobookButton.remove();
                } else if (audiobookButton && shouldHaveAudiobook) {
                    console.log('🔧 [Emergency Fix] KEEPING audiobook button for:', bookTitle);
                    // Ensure button has correct attributes
                    audiobookButton.setAttribute('data-audiobook-allowed', 'true');
                    audiobookButton.style.display = 'inline-flex';
                }
            }
        });
        
            // FINAL CHECK: Hide any remaining unauthorized buttons
    document.querySelectorAll('.book-link.audiobook:not([data-audiobook-allowed="true"])').forEach(btn => {
        console.log('🔧 [Final Check] Hiding unauthorized audiobook button');
        btn.style.display = 'none';
        btn.style.visibility = 'hidden';
        btn.style.opacity = '0';
        btn.style.pointerEvents = 'none';
    });
    
    // INTERSECTION OBSERVER: Lazy audiobook button removal
    if ('IntersectionObserver' in window) {
        const audiobookObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const card = entry.target;
                    const bookTitle = card.querySelector('.book-title')?.textContent;
                    const bookIsbn = card.getAttribute('data-isbn');
                    const audiobookButton = card.querySelector('.book-link.audiobook');
                    
                    if (audiobookButton && bookTitle) {
                        // Try multiple identification methods
                        const shouldHaveAudiobook = (
                            (bookIsbn && typeof window.isAppleAudiobook === 'function' && window.isAppleAudiobook(bookIsbn)) ||
                            (typeof window.isAppleAudiobook === 'function' && window.isAppleAudiobook(bookTitle))
                        );
                        
                        if (!shouldHaveAudiobook) {
                            console.log('👁️ [Observer] Removing audiobook button for:', bookTitle);
                            audiobookButton.remove();
                        } else {
                            console.log('👁️ [Observer] Keeping audiobook button for:', bookTitle);
                            audiobookButton.setAttribute('data-audiobook-allowed', 'true');
                        }
                    }
                }
            });
        }, { threshold: 0.1, rootMargin: '50px' });
        
        // Observe all book cards
        document.querySelectorAll('.book-card').forEach(card => {
            audiobookObserver.observe(card);
        });
        
        console.log('👁️ [Observer] IntersectionObserver initialized for audiobook buttons');
    }
    }, 2000);
});

// Handle window resize
window.addEventListener('resize', function() {
    // Recalculate layouts if needed
    // This can be expanded for more responsive features
});

// Validate and fix inconsistent links
function validateAndFixLinks() {
    console.log('🔧 [LinkFix] Starting link validation...');
    
    // Fix ALL books that have detail pages but wrong data-fallback attributes
    document.querySelectorAll('.book-card').forEach(card => {
        const hasDetailPage = card.getAttribute('data-has-detail-page') === 'true';
        const bookTitle = card.querySelector('.book-title')?.textContent?.trim();
        
        console.log('🔧 [LinkFix] Checking book:', bookTitle, 'hasDetailPage:', hasDetailPage);
        
        if (hasDetailPage) {
            // This book SHOULD have detail page links (no green arrow)
            const titleLink = card.querySelector('.book-title a');
            const mehrErfahrenBtn = card.querySelector('.detail-link');
            const coverLink = card.querySelector('.book-image a');
            
            // Remove data-fallback from all links
            [titleLink, mehrErfahrenBtn, coverLink].forEach(link => {
                if (link && link.hasAttribute('data-fallback')) {
                    console.log('🔧 [LinkFix] Removing data-fallback from link for:', bookTitle);
                    link.removeAttribute('data-fallback');
                }
            });
            
            // Ensure links point to detail page (for Eifersucht book)
            if (bookTitle && bookTitle.toLowerCase().includes('eifersüchtigen')) {
                const detailUrl = '/buecher/umgang-mit-eifersuechtigen-so-bewahrst-du-deine-innere-staerke';
                
                [titleLink, mehrErfahrenBtn, coverLink].forEach(link => {
                    if (link && !link.href.includes('/buecher/')) {
                        console.log('🔧 [LinkFix] Fixing link to detail page for:', bookTitle);
                        link.href = detailUrl;
                        link.removeAttribute('target');
                        link.removeAttribute('rel');
                    }
                });
            }
        } else {
            // This book should use Books2Read fallback (with green arrow)
            console.log('🔧 [LinkFix] Book should use Books2Read fallback:', bookTitle);
        }
    });
    
    console.log('🔧 [LinkFix] Link validation completed');
}

// Manual trigger for link validation (for debugging)
window.fixGreenArrows = function() {
    console.log('🔧 [Manual] Manually fixing green arrows...');
    
    // Force remove all data-fallback attributes (IMMEDIATE FIX)
    const elementsWithFallback = document.querySelectorAll('[data-fallback="true"]');
    console.log('🔧 [Manual] Found', elementsWithFallback.length, 'elements with data-fallback="true"');
    
    elementsWithFallback.forEach((element, index) => {
        console.log('🔧 [Manual] Removing data-fallback from element', index + 1, ':', element);
        element.removeAttribute('data-fallback');
    });
    
    // Also run the full validation
    validateAndFixLinks();
    
    console.log('🔧 [Manual] Green arrows should be fixed now! Check the page...');
    
    // Verify the fix
    const remainingFallbacks = document.querySelectorAll('[data-fallback="true"]');
    console.log('🔧 [Manual] Remaining elements with data-fallback:', remainingFallbacks.length);
    
    return `Fixed ${elementsWithFallback.length} green arrows!`;
};

// Iron Man's solution for saving Green Arrow
window.ironManFix = function() {
    console.log('🦸‍♂️ [Iron Man] Suiting up...');
    console.log('🦸‍♂️ [Iron Man] JARVIS, locate all green arrows on the website...');
    
    const greenArrows = document.querySelectorAll('[data-fallback="true"]');
    console.log('🦸‍♂️ [Iron Man] Found', greenArrows.length, 'green arrows to rescue!');
    
    if (greenArrows.length === 0) {
        console.log('🦸‍♂️ [Iron Man] No green arrows found! Green Arrow must already be safe.');
        return 'Green Arrow is already on the island!';
    }
    
    console.log('🦸‍♂️ [Iron Man] Activating repulsors...');
    
    greenArrows.forEach((arrow, index) => {
        console.log(`🦸‍♂️ [Iron Man] Rescuing green arrow ${index + 1}/${greenArrows.length}...`);
        arrow.removeAttribute('data-fallback');
        console.log('🦸‍♂️ [Iron Man] Green arrow removed from:', arrow.textContent?.substring(0, 50) + '...');
    });
    
    console.log('🦸‍♂️ [Iron Man] Mission accomplished! Green Arrow is back on the island!');
    console.log('🦸‍♂️ [Iron Man] JARVIS, confirm all green arrows have been removed...');
    
    const remainingArrows = document.querySelectorAll('[data-fallback="true"]');
    console.log('🦸‍♂️ [Iron Man] Remaining green arrows:', remainingArrows.length);
    
    if (remainingArrows.length === 0) {
        console.log('🦸‍♂️ [Iron Man] Perfect! All green arrows have been successfully removed!');
        return '🎯 Mission Accomplished! Green Arrow is safe on the island!';
    } else {
        console.log('🦸‍♂️ [Iron Man] Some green arrows still remain. Need to call the Avengers...');
        return '⚠️ Some green arrows still need rescue!';
    }
};

// CSS Witchcraft - Advanced Green Arrow Detection and Removal
window.cssWitchcraft = function() {
    console.log('🧙‍♂️ [CSS Witchcraft] Casting detection spells...');
    
    // Test 1: Find all SVG and IMG elements with arrow/fallback references
    const svgImgArrows = [...document.querySelectorAll('svg, img')].filter(el => 
        el.outerHTML.includes('arrow') || 
        el.outerHTML.includes('fallback') || 
        el.outerHTML.includes('check')
    );
    console.log('🧙‍♂️ [CSS Witchcraft] Found', svgImgArrows.length, 'SVG/IMG elements with arrow references');
    
    // Test 2: Direct selector for fallback icons
    const fallbackIcons = document.querySelectorAll('.fallback-icon, .green-arrow');
    console.log('🧙‍♂️ [CSS Witchcraft] Found', fallbackIcons.length, 'fallback icons');
    
    // Test 3: Background image arrows
    const backgroundArrows = [...document.querySelectorAll('*')].filter(el => {
        const style = getComputedStyle(el);
        return style.backgroundImage && style.backgroundImage.includes('arrow');
    });
    console.log('🧙‍♂️ [CSS Witchcraft] Found', backgroundArrows.length, 'elements with arrow background images');
    
    // Test 4: CSS pseudo-elements (::after content)
    const pseudoArrows = [...document.querySelectorAll('*')].filter(el => {
        const style = getComputedStyle(el, '::after');
        return style.content && (style.content.includes('↗') || style.content.includes('arrow'));
    });
    console.log('🧙‍♂️ [CSS Witchcraft] Found', pseudoArrows.length, 'elements with arrow pseudo-elements');
    
    // Test 5: Data-fallback attributes
    const dataFallbacks = document.querySelectorAll('[data-fallback="true"]');
    console.log('🧙‍♂️ [CSS Witchcraft] Found', dataFallbacks.length, 'elements with data-fallback="true"');
    
    // Comprehensive removal
    const totalArrows = svgImgArrows.length + fallbackIcons.length + backgroundArrows.length + pseudoArrows.length + dataFallbacks.length;
    console.log('🧙‍♂️ [CSS Witchcraft] Total arrow-related elements found:', totalArrows);
    
    if (totalArrows === 0) {
        console.log('🧙‍♂️ [CSS Witchcraft] No arrows found! The spell worked!');
        return '✨ No green arrows detected!';
    }
    
    // Apply CSS Witchcraft
    console.log('🧙‍♂️ [CSS Witchcraft] Applying removal spells...');
    
    // Remove SVG/IMG arrows
    svgImgArrows.forEach(el => {
        console.log('🧙‍♂️ [CSS Witchcraft] Removing SVG/IMG arrow:', el);
        el.remove();
    });
    
    // Remove fallback icons
    fallbackIcons.forEach(el => {
        console.log('🧙‍♂️ [CSS Witchcraft] Removing fallback icon:', el);
        el.remove();
    });
    
    // Remove data-fallback attributes
    dataFallbacks.forEach(el => {
        console.log('🧙‍♂️ [CSS Witchcraft] Removing data-fallback from:', el);
        el.removeAttribute('data-fallback');
    });
    
    // Apply CSS override for background arrows
    if (backgroundArrows.length > 0) {
        const css = document.createElement('style');
        css.id = 'css-witchcraft-override';
        css.textContent = `
            *[style*="arrow"] {
                background-image: none !important;
            }
        `;
        document.head.appendChild(css);
        console.log('🧙‍♂️ [CSS Witchcraft] Applied CSS override for background arrows');
    }
    
    console.log('🧙‍♂️ [CSS Witchcraft] All spells cast! Green arrows should be gone!');
    return `✨ Removed ${totalArrows} green arrow elements!`;
};

// Quick CSS Fix (permanent, fast, effective)
window.quickCssFix = function() {
    console.log('🧼 [Quick CSS Fix] Applying instant CSS override...');
    
    const css = document.createElement('style');
    css.id = 'quick-css-fix';
    css.textContent = `
        .fallback-icon, 
        .green-arrow, 
        svg[data-fallback="true"],
        [data-fallback="true"]::after,
        .book-detail-link[data-fallback="true"]::after {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
        }
    `;
    
    document.head.appendChild(css);
    console.log('🧼 [Quick CSS Fix] CSS override applied! Green arrows should disappear immediately!');
    return '🧼 Quick CSS Fix applied!';
};

// Anti-Pfeil-Code - Direct Zombie Icon Removal
window.antiPfeilCode = function() {
    console.log('🎯 [Anti-Pfeil] Hunting down zombie icons...');
    
    // Find all potential green arrow elements
    const rogueArrows = [...document.querySelectorAll('svg, span, i, img')]
        .filter(el => 
            el.outerHTML.includes('check') || 
            el.outerHTML.includes('arrow') || 
            el.className.includes('fallback') || 
            el.className.includes('green') || 
            el.dataset.fallback === "true"
        );
    
    console.log('🎯 [Anti-Pfeil] Found', rogueArrows.length, 'rogue green icons');
    
    if (rogueArrows.length === 0) {
        console.log('🎯 [Anti-Pfeil] No zombie icons found!');
        return '✨ No zombie icons detected!';
    }
    
    // Remove each zombie icon
    rogueArrows.forEach((el, index) => {
        console.log(`🧹 [Anti-Pfeil] Removing zombie icon ${index + 1}/${rogueArrows.length}:`, el);
        el.remove();
    });
    
    console.log('🎯 [Anti-Pfeil] All zombie icons eliminated!');
    return `🧹 Eliminated ${rogueArrows.length} zombie icons!`;
};

// CSS Anti-Pfeil Overlay (permanent visual fix)
window.cssAntiPfeil = function() {
    console.log('🧼 [CSS Anti-Pfeil] Applying permanent CSS overlay...');
    
    const style = document.createElement('style');
    style.id = 'css-anti-pfeil';
    style.innerHTML = `
        .green-arrow, 
        .fallback-icon, 
        svg[data-fallback="true"], 
        span.icon-green, 
        img[src*="arrow"],
        [data-fallback="true"]::after,
        .book-detail-link[data-fallback="true"]::after {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
        }
    `;
    
    document.head.appendChild(style);
    console.log('🧼 [CSS Anti-Pfeil] Permanent CSS overlay applied!');
    return '🧼 CSS Anti-Pfeil overlay applied!';
};

// Ultimate Iron Man Fix (JS + CSS combination)
window.ultimateIronManFix = function() {
    console.log('🦸‍♂️ [Ultimate Iron Man] Deploying full arsenal...');
    
    // Step 1: Remove zombie icons from DOM
    const jsResult = window.antiPfeilCode();
    console.log('🦸‍♂️ [Ultimate Iron Man] JS removal result:', jsResult);
    
    // Step 2: Apply CSS overlay for permanent hiding
    const cssResult = window.cssAntiPfeil();
    console.log('🦸‍♂️ [Ultimate Iron Man] CSS overlay result:', cssResult);
    
    // Step 3: Remove data-fallback attributes
    const dataFallbacks = document.querySelectorAll('[data-fallback="true"]');
    dataFallbacks.forEach(el => {
        el.removeAttribute('data-fallback');
        console.log('🦸‍♂️ [Ultimate Iron Man] Removed data-fallback from:', el);
    });
    
    console.log('🦸‍♂️ [Ultimate Iron Man] Ultimate mission accomplished!');
    return `🦸‍♂️ Ultimate Iron Man Fix completed! Removed ${dataFallbacks.length} data-fallback attributes!`;
};

// Export functions for potential external use
window.DirkWernerSite = {
    translatePage,
    filterByGenre,
    searchBooks,
    validateAndFixLinks,
    fixGreenArrows,
    ironManFix,
    cssWitchcraft,
    quickCssFix,
    antiPfeilCode,
    cssAntiPfeil,
    ultimateIronManFix,
    // loadBooks removed to prevent external calls on detail pages
};

