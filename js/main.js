// Global variables
let allBooks = [];
let currentLanguage = 'de';
let filteredBooks = [];

// Translations
const translations = {
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
        'Meine Genres': 'Meine Genres'
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
        'Meine Genres': 'My Genres'
    }
};

// Genre classification based on title keywords
function classifyGenre(title) {
    const titleLower = title.toLowerCase();
    
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
        "name": book.title,
        "author": {
            "@type": "Person",
            "name": book.author || "Dirk Werner"
        },
        "bookFormat": book.bookFormat || "EBook",
        "inLanguage": book.language || "de",
        "description": book.description || "",
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
    // Amazon DE
    if (book.links && book.links.amazon_de) {
        links.push({
            url: book.links.amazon_de,
            text: `📚 ${translations[currentLanguage]['Auf Amazon DE ansehen']}`,
            class: 'amazon-de'
        });
    } else if (book.link) {
        links.push({
            url: book.link,
            text: `📚 ${translations[currentLanguage]['Auf Amazon DE ansehen']}`,
            class: 'amazon-de'
        });
    }
    // Amazon US
    if (book.links && book.links.amazon_us) {
        links.push({
            url: book.links.amazon_us,
            text: `🛒 ${translations[currentLanguage]['Auf Amazon US ansehen']}`,
            class: 'amazon-com'
        });
    } else if (book.link) {
        // Ersetze amazon.de durch amazon.com für US-Link
        const usLink = book.link.replace('amazon.de', 'amazon.com');
        links.push({
            url: usLink,
            text: `🛒 ${translations[currentLanguage]['Auf Amazon US ansehen']}`,
            class: 'amazon-com'
        });
    }
    // Apple Books - nur anzeigen wenn explizit vorhanden
    if (book.links && book.links.apple_books) {
        links.push({
            url: book.links.apple_books,
            text: `📱 ${translations[currentLanguage]['Bei Apple Books']}`,
            class: 'apple-books'
        });
    }
    // Books2Read - immer hinzufügen
    if (book.links && book.links.books2read) {
        links.push({
            url: book.links.books2read,
            text: `🌍 ${translations[currentLanguage]['Bei Books2Read']}`,
            class: 'books2read'
        });
    } else {
        links.push({
            url: 'https://books2read.com/dirk-werner-author/',
            text: `🌍 ${translations[currentLanguage]['Bei Books2Read']}`,
            class: 'books2read'
        });
    }
    // Der Platzhalter-Link 'Hörbuch erleben' wird entfernt!
    return links;
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
    
    // Shop-Links (Amazon DE, Amazon US, Apple Books, Books2Read)
    const shopLinks = links.filter(link => link.class !== 'audiobook');
    const shopLinksHTML = shopLinks.map(link => {
        const ariaLabel = getAriaLabel(link.class, book.title);
        return `<a href="${link.url}" target="_blank" class="book-link ${link.class}" aria-label="${ariaLabel}">${link.text}</a>`;
    }).join('');
    
    // Hörbuch-Button mit IP-basierter Geolocation
    let audiobookHTML = '';
    if (book.hasAudiobook && book.links && book.links.apple_books) {
        const ariaLabel = `Hörbuch "${book.title}" bei Apple Books anhören`;
        audiobookHTML = `<a class="book-link audiobook btn-audiobook-link" href="#" target="_blank" rel="noopener noreferrer" aria-label="${ariaLabel}">🎧 ${translations[currentLanguage]['Hörbuch bei Apple Books']}</a>`;
    }
    
    // Generate Schema.org markup
    const schema = generateBookSchema(book);
    const schemaScript = `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
    
    // Generate slug for book detail page
    const slug = book.title
        .toLowerCase()
        .replace(/ä/g, 'ae')
        .replace(/ö/g, 'oe')
        .replace(/ü/g, 'ue')
        .replace(/ß/g, 'ss')
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
    
    return `
        <div class="book-card fade-in" data-genre="${genre}" data-title="${book.title.toLowerCase()}">
            ${schemaScript}
                                        <div class="book-image">
                                ${book.title === "Umgang mit Eifersüchtigen: So bewahrst du deine innere Stärke" ? `
                                <a href="/buecher/${slug}" aria-label="Mehr über ${book.title} erfahren">
                                    <img src="${book.image.link}" alt="Buchcover: ${book.title} von Dirk Werner" loading="lazy">
                                </a>
                                ` : `
                                <img src="${book.image.link}" alt="Buchcover: ${book.title} von Dirk Werner" loading="lazy">
                                `}
                            </div>
                            <div class="book-content">
                                <h3 class="book-title">
                                    ${book.title === "Umgang mit Eifersüchtigen: So bewahrst du deine innere Stärke" ? `
                                    <a href="/buecher/${slug}" aria-label="Mehr über ${book.title} erfahren">${book.title}</a>
                                    ` : book.title}
                                </h3>
                <p class="book-author">${book.author || 'Dirk Werner'}</p>
                ${book.description ? `<p class="book-description">${book.description}</p>` : ''}
                <div class="book-links">
                    ${shopLinksHTML}
                </div>
                ${audiobookHTML ? `<div class="audiobook-links">${audiobookHTML}</div>` : ''}
                                                ${book.title === "Umgang mit Eifersüchtigen: So bewahrst du deine innere Stärke" ? `
                                <div class="book-detail-link">
                                    <a href="/buecher/${slug}" class="btn-detail-link" aria-label="Mehr über ${book.title} erfahren">
                                        📖 Mehr über dieses Buch
                                    </a>
                                </div>
                                ` : ''}
            </div>
        </div>
    `;
}

// Load and display books
async function loadBooks() {
    try {
        const response = await fetch('books.json');
        allBooks = await response.json();
        // Filterfunktion: hasAudiobook setzen
        allBooks = allBooks.map(book => {
            if (book.links && book.links.apple_books) {
                book.hasAudiobook = true;
            } else {
                book.hasAudiobook = false;
            }
            return book;
        });
        filteredBooks = [...allBooks];
        
        await displayFeaturedBooks();
        await displayAllBooks();
        
    } catch (error) {
        console.error('📚 [Books] Error loading books:', error);
        
        // Only show error messages if containers exist
        const featuredContainer = document.getElementById('featuredBooks');
        const allBooksContainer = document.getElementById('allBooks');
        
        if (featuredContainer) {
            featuredContainer.innerHTML = '<p>Fehler beim Laden der Bücher.</p>';
        }
        if (allBooksContainer) {
            allBooksContainer.innerHTML = '<p>Fehler beim Laden der Bücher.</p>';
        }
        
        // If we're on a book detail page, this is expected
        if (!featuredContainer && !allBooksContainer) {
            console.log('📚 [Books] Book containers not found - likely on book detail page');
        }
    }
}

// Remove duplicate books based on base title (without format suffix)
function removeDuplicateBooks(books) {
    const uniqueBooks = [];
    const seenTitles = new Set();
    
    books.forEach(book => {
        // Extract base title by removing format suffixes
        let baseTitle = book.title;
        
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
        
        // If we haven't seen this base title before, add the book
        if (!seenTitles.has(baseTitle)) {
            uniqueBooks.push(book);
            seenTitles.add(baseTitle);
        } else {
            console.log(`📚 [Duplicate] Skipping duplicate: "${book.title}" (base: "${baseTitle}")`);
        }
    });
    
    return uniqueBooks;
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
        filteredBooks = allBooks.filter(book => 
            book.title.toLowerCase().includes(searchTerm)
        );
    }
    
    displayAllBooks();
}

// Language switching functionality
async function switchLanguage(lang) {
    currentLanguage = lang;
    
    // Update active language button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.lang === lang) {
            btn.classList.add('active');
        }
    });
    
    // Update all translatable elements
    document.querySelectorAll('[data-de]').forEach(element => {
        if (element.tagName === 'INPUT') {
            element.placeholder = element.dataset[lang + 'Placeholder'] || element.dataset[lang];
        } else {
            element.textContent = element.dataset[lang];
        }
    });
    
    // Update document title and meta description
    const title = document.querySelector('title');
    const metaDesc = document.querySelector('meta[name="description"]');
    
    if (title) {
        title.textContent = title.dataset[lang];
    }
    
    if (metaDesc) {
        metaDesc.setAttribute('content', metaDesc.dataset[lang]);
    }
    
    // Update HTML lang attribute
    document.documentElement.lang = lang;
    
    // Reload books to update button texts (only if elements exist)
    try {
        await displayFeaturedBooks();
        await displayAllBooks();
    } catch (error) {
        // Elements don't exist on book detail pages, which is fine
        console.log('Book display elements not found - likely on book detail page');
    }
    
    // Update audiobook links after language switch
    await setAudiobookLinksByCountry();
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
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            await switchLanguage(this.dataset.lang);
        });
    });
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
    // Show loading animation only if elements exist
    showLoading('featuredBooks');
    showLoading('allBooks');
    
    // Initialize all functionality
    loadBooks();
    initSmoothScrolling();
    initSearch();
    initGenreFilter();
    initLanguageSwitching();
    initAnimations();
    initResponsiveNav();
    
    // Set initial language
    await switchLanguage('de');
    
    // Set audiobook links by country (mit Verzögerung für Hero-Button)
    setTimeout(async () => {
        await setAudiobookLinksByCountry();
    }, 100);
    
    // Zusätzliche Sicherheit: Hero-Button nach 500ms nochmal prüfen
    setTimeout(async () => {
        await setAudiobookLinksByCountry();
    }, 500);
    
    console.log('Dirk Werner Author Website initialized successfully!');
});

// Handle window resize
window.addEventListener('resize', function() {
    // Recalculate layouts if needed
    // This can be expanded for more responsive features
});

// Export functions for potential external use
window.DirkWernerSite = {
    switchLanguage,
    filterByGenre,
    searchBooks,
    loadBooks
};

