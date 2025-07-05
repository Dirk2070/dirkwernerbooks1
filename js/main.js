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

// Generate purchase links
function generatePurchaseLinks(book) {
    const links = [];
    
    // Amazon DE (always available from the JSON)
    if (book.link) {
        links.push({
            url: book.link,
            text: translations[currentLanguage]['Auf Amazon DE ansehen'],
            class: 'amazon-de'
        });
    }
    
    // Amazon US (convert DE link to US)
    if (book.link) {
        const usLink = book.link.replace('amazon.de', 'amazon.com');
        links.push({
            url: usLink,
            text: translations[currentLanguage]['Auf Amazon US ansehen'],
            class: 'amazon-com'
        });
    }
    
    // Apple Books (construct link)
    const appleSearchTitle = encodeURIComponent(book.title.replace(/[^\w\s]/gi, ''));
    links.push({
        url: `https://books.apple.com/search?term=${appleSearchTitle}%20dirk%20werner`,
        text: translations[currentLanguage]['Bei Apple Books'],
        class: 'apple-books'
    });
    
    // Books2Read (construct link)
    links.push({
        url: 'https://books2read.com/dirk-werner-author/',
        text: translations[currentLanguage]['Bei Books2Read'],
        class: 'books2read'
    });
    
    return links;
}

// Create book card HTML
function createBookCard(book) {
    const genre = classifyGenre(book.title);
    const links = generatePurchaseLinks(book);
    
    const linksHTML = links.map(link => 
        `<a href="${link.url}" target="_blank" class="book-link ${link.class}">${link.text}</a>`
    ).join('');
    
    return `
        <div class="book-card fade-in" data-genre="${genre}" data-title="${book.title.toLowerCase()}">
            <div class="book-image">
                <img src="${book.image.link}" alt="${book.title}" loading="lazy">
            </div>
            <div class="book-content">
                <h3 class="book-title">${book.title}</h3>
                <div class="book-links">
                    ${linksHTML}
                </div>
            </div>
        </div>
    `;
}

// Load and display books
async function loadBooks() {
    try {
        const response = await fetch('books.json');
        allBooks = await response.json();
        filteredBooks = [...allBooks];
        
        displayFeaturedBooks();
        displayAllBooks();
        
    } catch (error) {
        console.error('Error loading books:', error);
        document.getElementById('featuredBooks').innerHTML = '<p>Fehler beim Laden der Bücher.</p>';
        document.getElementById('allBooks').innerHTML = '<p>Fehler beim Laden der Bücher.</p>';
    }
}

// Display featured books (first 6)
function displayFeaturedBooks() {
    const featuredContainer = document.getElementById('featuredBooks');
    const featuredBooks = allBooks.slice(0, 6);
    
    featuredContainer.innerHTML = featuredBooks.map(book => createBookCard(book)).join('');
}

// Display all books
function displayAllBooks() {
    const allBooksContainer = document.getElementById('allBooks');
    allBooksContainer.innerHTML = filteredBooks.map(book => createBookCard(book)).join('');
    
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
function switchLanguage(lang) {
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
    
    // Reload books to update button texts
    displayFeaturedBooks();
    displayAllBooks();
}

// Smooth scrolling for navigation links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Initialize search functionality
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    let searchTimeout;
    
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchBooks(this.value);
        }, 300);
    });
}

// Initialize genre filter
function initGenreFilter() {
    const genreFilter = document.getElementById('genreFilter');
    
    genreFilter.addEventListener('change', function() {
        filterByGenre(this.value);
    });
}

// Initialize language switching
function initLanguageSwitching() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            switchLanguage(this.dataset.lang);
        });
    });
}

// Add loading animation
function showLoading(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '<div class="loading"></div>';
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
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
            nav.style.transform = 'translateY(-100%)';
        } else {
            nav.style.transform = 'translateY(0)';
        }
        lastScrollY = window.scrollY;
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Show loading animation
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
    switchLanguage('de');
    
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

