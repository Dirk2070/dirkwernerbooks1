// Global variables
let allBooks = [];
window.currentLanguage = 'de';
let filteredBooks = [];

// 📱 MOBILE vs DESKTOP: Plattform-spezifische Erkennung
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isDesktop = !isMobile;

console.log('📱 [Platform] Detected:', isMobile ? 'Mobile' : 'Desktop');

// 📊 GA4 Tracking Functions
function trackGA4Event(eventName, parameters = {}) {
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, parameters);
        console.log('📊 [GA4] Event tracked:', eventName, parameters);
    }
}

function trackBookInteraction(book, interactionType, linkType = null) {
    const title = book.title?.de || book.title?.en || book.title || 'Unknown Title';
    const category = book.category || 'General';
    const format = book.bookFormat?.de || book.bookFormat?.en || 'Unknown';
    
    trackGA4Event(interactionType, {
        item_id: book.asin || title,
        item_name: title,
        item_category: category,
        item_variant: format,
        currency: 'EUR',
        value: 0,
        link_type: linkType,
        author: book.author || 'Dirk Werner'
    });
}

function trackLanguageSwitch(language) {
    trackGA4Event('language_change', {
        language: language,
        page_location: window.location.href,
        page_title: document.title
    });
}

function trackSearch(searchTerm, resultsCount) {
    trackGA4Event('search', {
        search_term: searchTerm,
        results_count: resultsCount,
        page_location: window.location.href
    });
}

function trackGenreFilter(genre) {
    trackGA4Event('filter', {
        filter_type: 'genre',
        filter_value: genre,
        page_location: window.location.href
    });
}

// 🎯 EINFACHE BUCHANZEIGE: Wie in der funktionierenden Test-Seite
function displayAllBooksSimple() {
    const allBooksContainer = document.getElementById('allBooks');
    const featuredBooksContainer = document.getElementById('featuredBooks');
    
    if (allBooksContainer && filteredBooks && filteredBooks.length > 0) {
        console.log('🎯 [SimpleDisplay] Displaying books with simple logic...');
        
        const booksHTML = filteredBooks.map(book => {
            const title = book.title?.de || book.title?.en || book.title || 'Unbekannter Titel';
            const author = book.author || 'Dirk Werner';
            const description = book.description?.de || book.description?.en || book.description || 'Keine Beschreibung verfügbar';
            const image = book.image?.link || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
            
            // Track book view
            trackBookInteraction(book, 'view_item');
            
            return `
                <div class="book-card" data-asin="${book.asin || ''}">
                    <div class="book-image">
                        <img src="${image}" alt="Cover: ${title}" loading="lazy">
                    </div>
                    <div class="book-content">
                        <h3 class="book-title">${title}</h3>
                        <p class="book-author">von ${author}</p>
                        <p class="book-description">${description}</p>
                        <div class="book-links">
                            ${book.links?.amazon_de ? `<a href="${book.links.amazon_de}" target="_blank" class="book-link amazon-de" onclick="trackBookInteraction(${JSON.stringify(book)}, 'select_item', 'amazon_de')">📚 Bei Amazon DE kaufen</a>` : ''}
                            ${book.links?.amazon_us ? `<a href="${book.links.amazon_us}" target="_blank" class="book-link amazon-us" onclick="trackBookInteraction(${JSON.stringify(book)}, 'select_item', 'amazon_us')">🛒 Bei Amazon US kaufen</a>` : ''}
                            ${book.links?.apple_books ? `<a href="${book.links.apple_books}" target="_blank" class="book-link apple-books" onclick="trackBookInteraction(${JSON.stringify(book)}, 'select_item', 'apple_books')">📱 Bei Apple Books kaufen</a>` : ''}
                            ${book.links?.books2read ? `<a href="${book.links.books2read}" target="_blank" class="book-link books2read" onclick="trackBookInteraction(${JSON.stringify(book)}, 'select_item', 'books2read')">🌍 Bei Books2Read ansehen</a>` : ''}
                            ${book.detailedPage ? `<a href="${book.detailedPage}" class="book-link detailed-page" onclick="trackBookInteraction(${JSON.stringify(book)}, 'view_item_list', 'detailed_page')">📖 Mehr erfahren</a>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        allBooksContainer.innerHTML = booksHTML;
        
        // Featured Books (erste 3 Bücher)
        if (featuredBooksContainer) {
            const featuredHTML = filteredBooks.slice(0, 3).map(book => {
                const title = book.title?.de || book.title?.en || book.title || 'Unbekannter Titel';
                const author = book.author || 'Dirk Werner';
                const description = book.description?.de || book.description?.en || book.description || 'Keine Beschreibung verfügbar';
                const image = book.image?.link || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                
                return `
                    <div class="book-card" data-asin="${book.asin || ''}">
                        <div class="book-image">
                            <img src="${image}" alt="Cover: ${title}" loading="lazy">
                        </div>
                        <div class="book-content">
                            <h3 class="book-title">${title}</h3>
                            <p class="book-author">von ${author}</p>
                            <p class="book-description">${description}</p>
                            <div class="book-links">
                                ${book.links?.amazon_de ? `<a href="${book.links.amazon_de}" target="_blank" class="book-link amazon-de" onclick="trackBookInteraction(${JSON.stringify(book)}, 'select_item', 'amazon_de')">📚 Bei Amazon DE kaufen</a>` : ''}
                                ${book.links?.amazon_us ? `<a href="${book.links.amazon_us}" target="_blank" class="book-link amazon-us" onclick="trackBookInteraction(${JSON.stringify(book)}, 'select_item', 'amazon_us')">🛒 Bei Amazon US kaufen</a>` : ''}
                                ${book.links?.apple_books ? `<a href="${book.links.apple_books}" target="_blank" class="book-link apple-books" onclick="trackBookInteraction(${JSON.stringify(book)}, 'select_item', 'apple_books')">📱 Bei Apple Books kaufen</a>` : ''}
                                ${book.links?.books2read ? `<a href="${book.links.books2read}" target="_blank" class="book-link books2read" onclick="trackBookInteraction(${JSON.stringify(book)}, 'select_item', 'books2read')">🌍 Bei Books2Read ansehen</a>` : ''}
                                ${book.detailedPage ? `<a href="${book.detailedPage}" class="book-link detailed-page" onclick="trackBookInteraction(${JSON.stringify(book)}, 'view_item_list', 'detailed_page')">📖 Mehr erfahren</a>` : ''}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
            
            featuredBooksContainer.innerHTML = featuredHTML;
        }
        
        console.log('🎯 [SimpleDisplay] Books displayed successfully!');
    }
}

// 🚨 SOFORTIGE BUCHLADUNG: Fallback für Hauptseite
async function forceLoadBooksOnMainPage() {
    const allBooksContainer = document.getElementById('allBooks');
    if (allBooksContainer && (window.location.pathname === '/' || window.location.pathname === '/index.html')) {
        console.log('🚨 [ForceLoad] Main page detected, forcing book load...');
        
        // Zeige Loading-Animation
        allBooksContainer.innerHTML = '<div style="text-align: center; padding: 40px; font-size: 18px;">🔄 Bücher werden geladen...</div>';
        
        try {
            // Direkt books.json laden
            const response = await fetch('books.json');
            const data = await response.json();
            
            console.log('🚨 [ForceLoad] Books loaded:', data.length);
            allBooks = data;
            filteredBooks = [...data];
            
            // Track page view with book count
            trackGA4Event('page_view', {
                page_title: 'Dirk Werner Books - Homepage',
                page_location: window.location.href,
                book_count: data.length,
                total_books: data.length
            });
            
            // Sofort anzeigen mit einfacher Logik
            displayAllBooksSimple();
            
        } catch (error) {
            console.error('🚨 [ForceLoad] Error loading books:', error);
            allBooksContainer.innerHTML = `
                <div style="color: red; padding: 20px; background: #ffe6e6; border-radius: 4px;">
                    <h3>❌ Fehler beim Laden der Bücher</h3>
                    <p>${error.message}</p>
                    <button onclick="forceLoadBooksOnMainPage()">Erneut versuchen</button>
                </div>
            `;
            
            // Track error
            trackGA4Event('exception', {
                description: 'Error loading books',
                fatal: false
            });
        }
    }
}

// Einfache Sprachumschaltung
function translatePage(lang) {
    window.currentLanguage = lang;
    
    // Track language switch
    trackLanguageSwitch(lang);
    
    // Sprachbuttons aktualisieren
    document.querySelectorAll('.lang-btn, .mobile-lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.lang === lang) {
            btn.classList.add('active');
        }
    });
    
    // Übersetzbare Elemente aktualisieren
    document.querySelectorAll('[data-de][data-en]').forEach(element => {
        if (lang === 'de' && element.dataset.de) {
            element.textContent = element.dataset.de;
        } else if (lang === 'en' && element.dataset.en) {
            element.textContent = element.dataset.en;
        }
    });
    
    // Placeholder für Suchfeld
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        if (lang === 'de') {
            searchInput.placeholder = searchInput.dataset.dePlaceholder || 'Suche nach Titel...';
        } else {
            searchInput.placeholder = searchInput.dataset.enPlaceholder || 'Search by title...';
        }
    }
}

// Enhanced search and filter functions with GA4 tracking
function performSearch(searchTerm) {
    if (!searchTerm.trim()) {
        filteredBooks = [...allBooks];
    } else {
        filteredBooks = allBooks.filter(book => {
            const title = book.title?.de || book.title?.en || book.title || '';
            const description = book.description?.de || book.description?.en || book.description || '';
            const author = book.author || '';
            
            return title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   author.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }
    
    // Track search
    trackSearch(searchTerm, filteredBooks.length);
    
    displayAllBooksSimple();
}

function filterByGenre(genre) {
    if (genre === 'all') {
        filteredBooks = [...allBooks];
    } else {
        filteredBooks = allBooks.filter(book => {
            // Genre detection logic
            const title = book.title?.de || book.title?.en || book.title || '';
            const description = book.description?.de || book.description?.en || book.description || '';
            
            if (genre === 'krimi') {
                return title.toLowerCase().includes('dr. seelmann') || 
                       title.toLowerCase().includes('trance') || 
                       title.toLowerCase().includes('echo') || 
                       title.toLowerCase().includes('vermaechtnis');
            } else if (genre === 'beziehungen') {
                return title.toLowerCase().includes('beziehung') || 
                       title.toLowerCase().includes('eifersucht') || 
                       title.toLowerCase().includes('herzschmerz') || 
                       title.toLowerCase().includes('herzklopfen') || 
                       title.toLowerCase().includes('seminar');
            } else if (genre === 'selbsthilfe') {
                return title.toLowerCase().includes('selbst') || 
                       title.toLowerCase().includes('psychotainment') || 
                       title.toLowerCase().includes('dankbarkeit') || 
                       title.toLowerCase().includes('suizidpraevention') || 
                       title.toLowerCase().includes('emotionale');
            } else if (genre === 'belletristik') {
                return title.toLowerCase().includes('schlüssel') || 
                       title.toLowerCase().includes('simulation') || 
                       title.toLowerCase().includes('nanogenese') || 
                       title.toLowerCase().includes('american');
            }
            return false;
        });
    }
    
    // Track genre filter
    trackGenreFilter(genre);
    
    displayAllBooksSimple();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 [Main] DOM loaded, initializing...');
    
    // Track page view
    trackGA4Event('page_view', {
        page_title: document.title,
        page_location: window.location.href
    });
    
    // Sprachumschaltung
    document.querySelectorAll('.lang-btn, .mobile-lang-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const lang = this.dataset.lang;
            translatePage(lang);
        });
    });
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performSearch(this.value);
            }, 300);
        });
    }
    
    // Genre filter functionality
    const genreSelect = document.getElementById('genreSelect');
    if (genreSelect) {
        genreSelect.addEventListener('change', function() {
            filterByGenre(this.value);
        });
    }
    
    // Smooth Scrolling für Navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Track navigation clicks
                trackGA4Event('navigation_click', {
                    link_text: this.textContent,
                    link_href: this.getAttribute('href'),
                    page_location: window.location.href
                });
            }
        });
    });
    
    // Track external link clicks
    document.querySelectorAll('a[href^="http"]').forEach(link => {
        link.addEventListener('click', function() {
            trackGA4Event('external_link_click', {
                link_url: this.href,
                link_text: this.textContent,
                page_location: window.location.href
            });
        });
    });
    
    // Sofortige Buchladung für Hauptseite
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        console.log('🚀 [Main] Main page detected, loading books immediately...');
        forceLoadBooksOnMainPage();
    }
});

// Globale Funktionen für externe Aufrufe
window.forceLoadBooksOnMainPage = forceLoadBooksOnMainPage;
window.displayAllBooksSimple = displayAllBooksSimple;
window.translatePage = translatePage;
window.trackBookInteraction = trackBookInteraction;
window.trackLanguageSwitch = trackLanguageSwitch;
window.trackSearch = trackSearch;
window.trackGenreFilter = trackGenreFilter;
window.performSearch = performSearch;
window.filterByGenre = filterByGenre;