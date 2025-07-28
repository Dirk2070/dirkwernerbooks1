/**
 * Internal Book Linking System
 * For Dirk Werner Books Website - SEO & User Engagement
 */

class InternalLinking {
    constructor() {
        this.books = [];
        this.currentBook = null;
        this.relatedBooks = [];
    }

    // Initialize the internal linking system
    async init() {
        try {
            await this.loadBooks();
            this.setupRelatedBooks();
            this.addInternalLinks();
        } catch (error) {
            console.error('❌ Error initializing internal linking:', error);
        }
    }

    // Load books data
    async loadBooks() {
        try {
            const response = await fetch('/books.json');
            this.books = await response.json();
            console.log(`📚 Loaded ${this.books.length} books for internal linking`);
        } catch (error) {
            console.error('❌ Error loading books:', error);
        }
    }

    // Detect current book from URL
    detectCurrentBook() {
        const path = window.location.pathname;
        const bookSlug = path.split('/').pop().replace('.html', '');
        
        this.currentBook = this.books.find(book => {
            const bookSlugFromTitle = this.generateSlug(book.title?.de || book.title);
            return bookSlugFromTitle === bookSlug;
        });
        
        if (this.currentBook) {
            console.log(`📖 Current book detected: ${this.currentBook.title?.de || this.currentBook.title}`);
        }
    }

    // Generate slug from title
    generateSlug(title) {
        return title
            .toLowerCase()
            .replace(/[äöüß]/g, (match) => {
                const replacements = { 'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss' };
                return replacements[match];
            })
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');
    }

    // Find related books based on genre, keywords, and language
    findRelatedBooks() {
        if (!this.currentBook) return [];

        const currentTitle = this.currentBook.title?.de || this.currentBook.title;
        const currentKeywords = this.extractKeywords(currentTitle);
        
        const related = this.books
            .filter(book => {
                const bookTitle = book.title?.de || book.title;
                const bookSlug = this.generateSlug(bookTitle);
                const currentSlug = this.generateSlug(currentTitle);
                
                // Don't include the current book
                if (bookSlug === currentSlug) return false;
                
                // Check for keyword matches
                const bookKeywords = this.extractKeywords(bookTitle);
                const keywordMatches = currentKeywords.filter(keyword => 
                    bookKeywords.includes(keyword)
                );
                
                return keywordMatches.length > 0;
            })
            .sort((a, b) => {
                // Sort by relevance score
                const aScore = this.calculateRelevanceScore(a, currentKeywords);
                const bScore = this.calculateRelevanceScore(b, currentKeywords);
                return bScore - aScore;
            })
            .slice(0, 6); // Show max 6 related books

        return related;
    }

    // Extract keywords from title
    extractKeywords(title) {
        const stopWords = ['der', 'die', 'das', 'und', 'oder', 'für', 'mit', 'von', 'zu', 'in', 'auf', 'an', 'the', 'and', 'or', 'for', 'with', 'from', 'to', 'in', 'on', 'at'];
        
        return title
            .toLowerCase()
            .split(/\s+/)
            .filter(word => word.length > 2 && !stopWords.includes(word))
            .map(word => word.replace(/[^\w]/g, ''));
    }

    // Calculate relevance score
    calculateRelevanceScore(book, currentKeywords) {
        const bookTitle = book.title?.de || book.title;
        const bookKeywords = this.extractKeywords(bookTitle);
        
        let score = 0;
        
        // Keyword matches
        currentKeywords.forEach(keyword => {
            if (bookKeywords.includes(keyword)) {
                score += 2;
            }
        });
        
        // Genre similarity (if available)
        if (book.genre && this.currentBook.genre && book.genre === this.currentBook.genre) {
            score += 3;
        }
        
        // Language similarity
        const currentLang = this.currentBook.language || 'de';
        const bookLang = book.language || 'de';
        if (currentLang === bookLang) {
            score += 1;
        }
        
        return score;
    }

    // Setup related books section
    setupRelatedBooks() {
        this.detectCurrentBook();
        this.relatedBooks = this.findRelatedBooks();
        
        if (this.relatedBooks.length > 0) {
            this.createRelatedBooksSection();
        }
    }

    // Create related books section
    createRelatedBooksSection() {
        const existingSection = document.querySelector('.related-books');
        if (existingSection) {
            existingSection.remove();
        }

        const section = document.createElement('section');
        section.className = 'related-books';
        section.innerHTML = `
            <div class="container">
                <h2 data-de="Vielleicht interessieren Sie sich auch für..." data-en="You might also be interested in...">
                    Vielleicht interessieren Sie sich auch für...
                </h2>
                <div class="related-books-grid">
                    ${this.relatedBooks.map(book => this.createBookCard(book)).join('')}
                </div>
            </div>
        `;

        // Insert before footer or at end of main content
        const footer = document.querySelector('footer');
        const main = document.querySelector('main');
        
        if (footer) {
            footer.parentNode.insertBefore(section, footer);
        } else if (main) {
            main.appendChild(section);
        } else {
            document.body.appendChild(section);
        }
    }

    // Create book card HTML
    createBookCard(book) {
        const title = book.title?.de || book.title;
        const description = book.description?.de || book.description || '';
        const coverUrl = book.image?.link || '';
        const bookSlug = this.generateSlug(title);
        const bookUrl = `/buecher/${bookSlug}.html`;
        
        return `
            <div class="book-card">
                <div class="book-cover">
                    <a href="${bookUrl}">
                        <img src="${coverUrl}" alt="Cover: ${title}" loading="lazy">
                    </a>
                </div>
                <div class="book-info">
                    <h3><a href="${bookUrl}">${title}</a></h3>
                    <p>${description.substring(0, 100)}${description.length > 100 ? '...' : ''}</p>
                    <div class="book-links">
                        <a href="${bookUrl}" class="btn btn-primary" data-de="Mehr erfahren" data-en="Learn more">
                            Mehr erfahren
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    // Add internal links to existing content
    addInternalLinks() {
        // Add internal links to book titles in content
        const contentElements = document.querySelectorAll('p, div, h1, h2, h3, h4, h5, h6');
        
        contentElements.forEach(element => {
            if (element.textContent) {
                element.innerHTML = this.addBookLinks(element.innerHTML);
            }
        });
    }

    // Add book links to text content
    addBookLinks(html) {
        this.books.forEach(book => {
            const title = book.title?.de || book.title;
            const bookSlug = this.generateSlug(title);
            const bookUrl = `/buecher/${bookSlug}.html`;
            
            // Create regex to match book titles (case insensitive)
            const regex = new RegExp(`(${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
            
            html = html.replace(regex, `<a href="${bookUrl}" class="internal-link">$1</a>`);
        });
        
        return html;
    }

    // Generate sitemap for internal links
    generateInternalSitemap() {
        const internalLinks = this.books.map(book => {
            const title = book.title?.de || book.title;
            const bookSlug = this.generateSlug(title);
            return {
                url: `/buecher/${bookSlug}.html`,
                title: title,
                lastmod: new Date().toISOString().split('T')[0]
            };
        });
        
        return internalLinks;
    }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.internalLinking = new InternalLinking();
    window.internalLinking.init();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InternalLinking;
} 