// 🎧 Audiobook Utility - Modular & Robust
// Handles whitelist loading, button management, and fallback logic

class AudiobookUtility {
    constructor() {
        this.whitelist = [];
        this.forceList = [
            "The Key of the Enlightened",
            "How to Recognize Cults: A Guide to Protecting Yourself from Manipulation and Control",
            "The Battle Within: A Guide to Overcoming Inner Struggles",
            "The Legacy of the Lodges: Dr. Seelmanns 3rd case",
            "Nanogenesis: The Rise of Superhumans",
            "American Shadows: Hecate's Intervention - The Unofficial Sequel to American Gods",
            "Instructions for Staying in the Matrix Forever",
            "Deadly Echo: Dr. Seelmann's Second Case",
            "The Simulation Chronicles",
            "Self-Love Over Perfection: A Guide to Overcoming Female Narcissism"
        ];
        this.isInitialized = false;
    }

    // Initialize the utility
    async init() {
        console.log('🎧 [Utility] Initializing Audiobook Utility...');
        
        // Wait for whitelist to load
        await this.waitForWhitelist();
        
        // Process buttons
        this.processAudiobookButtons();
        
        this.isInitialized = true;
        console.log('🎧 [Utility] Audiobook Utility initialized successfully');
    }

    // Wait for whitelist to be loaded
    async waitForWhitelist() {
        if (window.appleAudiobookList && window.appleAudiobookList.audiobooks) {
            this.whitelist = window.appleAudiobookList.audiobooks.map(book => book.title);
            console.log('🎧 [Utility] Whitelist loaded:', this.whitelist.length, 'audiobooks');
            return;
        }

        console.log('⏳ [Utility] Waiting for whitelist to load...');
        
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (window.appleAudiobookList && window.appleAudiobookList.audiobooks) {
                    clearInterval(checkInterval);
                    this.whitelist = window.appleAudiobookList.audiobooks.map(book => book.title);
                    console.log('✅ [Utility] Whitelist loaded successfully:', this.whitelist.length, 'audiobooks');
                    resolve();
                }
            }, 100);
            
            // Timeout after 5 seconds
            setTimeout(() => {
                clearInterval(checkInterval);
                console.warn('⚠️ [Utility] Whitelist loading timeout - using force list only');
                resolve();
            }, 5000);
        });
    }

    // Normalize title for comparison
    normalizeTitle(title) {
        if (!title) return '';
        return title.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    // Check if book has audiobook (whitelist + force list)
    hasAudiobook(title) {
        if (!title) return false;
        
        const normalizedTitle = this.normalizeTitle(title);
        
        // Check whitelist first
        if (this.whitelist.length > 0) {
            const inWhitelist = this.whitelist.some(whitelistTitle => {
                const normalizedWhitelist = this.normalizeTitle(whitelistTitle);
                return normalizedWhitelist === normalizedTitle || 
                       normalizedWhitelist.includes(normalizedTitle) || 
                       normalizedTitle.includes(normalizedWhitelist);
            });
            
            if (inWhitelist) {
                console.log('🎧 [Utility] Book in whitelist:', title);
                return true;
            }
        }
        
        // Check force list as fallback
        const inForceList = this.forceList.some(forceTitle => {
            const normalizedForce = this.normalizeTitle(forceTitle);
            return normalizedForce === normalizedTitle || 
                   normalizedForce.includes(normalizedTitle) || 
                   normalizedTitle.includes(normalizedForce);
        });
        
        if (inForceList) {
            console.log('🎧 [Utility] Book in force list:', title);
            return true;
        }
        
        console.log('🎧 [Utility] Book not in whitelist or force list:', title);
        return false;
    }

    // Get title from card using multiple selectors
    getBookTitle(card) {
        const titleSelectors = ['.book-title', 'h3', '.title', '[data-title]'];
        
        for (const selector of titleSelectors) {
            const element = card.querySelector(selector);
            if (element) {
                const title = element.textContent?.trim() || element.getAttribute('data-title')?.trim();
                if (title && title !== 'undefined') {
                    return title;
                }
            }
        }
        
        return null;
    }

    // Get audiobook button from card using multiple selectors
    getAudiobookButton(card) {
        const buttonSelectors = ['.book-link.audiobook', '.audiobook-button', '.btn-audiobook-link'];
        
        for (const selector of buttonSelectors) {
            const button = card.querySelector(selector);
            if (button) {
                return button;
            }
        }
        
        return null;
    }

    // Process all audiobook buttons
    processAudiobookButtons() {
        console.log('🔧 [Utility] Processing audiobook buttons...');
        
        document.querySelectorAll('.book-card').forEach(card => {
            const bookTitle = this.getBookTitle(card);
            
            if (!bookTitle) {
                console.warn('🔧 [Utility] No title found for card');
                return;
            }
            
            const hasAudiobook = this.hasAudiobook(bookTitle);
            const audiobookButton = this.getAudiobookButton(card);
            
            if (audiobookButton) {
                if (hasAudiobook) {
                    // Keep and enable button
                    audiobookButton.style.display = 'inline-flex';
                    audiobookButton.setAttribute('data-audiobook-allowed', 'true');
                    console.log('✅ [Utility] KEEPING audiobook button for:', bookTitle);
                } else {
                    // Remove button
                    audiobookButton.remove();
                    console.log('❌ [Utility] REMOVING audiobook button for:', bookTitle);
                }
            } else if (hasAudiobook) {
                // Create button if missing
                this.createAudiobookButton(card, bookTitle);
                console.log('🛠️ [Utility] CREATED audiobook button for:', bookTitle);
            }
        });
        
        console.log('🔧 [Utility] Audiobook button processing completed');
    }

    // Create audiobook button
    createAudiobookButton(card, bookTitle) {
        const button = document.createElement('a');
        button.className = 'book-link audiobook btn-audiobook-link';
        button.href = 'https://books.apple.com/de/author/dirk-werner/id316714929?see-all=audio-books';
        button.target = '_blank';
        button.rel = 'noopener noreferrer';
        button.setAttribute('data-audiobook-allowed', 'true');
        button.innerHTML = '🎧 Hörbuch bei Apple Books';
        
        const linksContainer = card.querySelector('.book-links');
        if (linksContainer) {
            linksContainer.appendChild(button);
        } else {
            card.appendChild(button);
        }
    }

    // Force audiobook buttons for specific books
    forceAudiobookButtons() {
        console.log('🛠️ [Utility] Forcing audiobook buttons...');
        
        document.querySelectorAll('.book-card').forEach(card => {
            const bookTitle = this.getBookTitle(card);
            
            if (!bookTitle) return;
            
            const audiobookButton = this.getAudiobookButton(card);
            
            if (!audiobookButton) {
                this.createAudiobookButton(card, bookTitle);
                console.log('🛠️ [Utility] Forced audiobook button for:', bookTitle);
            }
        });
    }

    // Debug information
    debug() {
        console.log('🐞 [Utility] Debug Information:', {
            whitelistLoaded: this.whitelist.length > 0,
            whitelistCount: this.whitelist.length,
            forceListCount: this.forceList.length,
            isInitialized: this.isInitialized,
            totalBooks: document.querySelectorAll('.book-card').length,
            audiobookButtons: document.querySelectorAll('.book-link.audiobook, .audiobook-button, .btn-audiobook-link').length
        });
        
        // Test specific books
        const testBooks = [
            "The Key of the Enlightened",
            "How to Recognize Cults: A Guide to Protecting Yourself from Manipulation and Control",
            "Umgang mit Eifersüchtigen: So bewahrst du deine innere Stärke",
            "Psychotainment: Wie du auf jeder Party glänzt"
        ];
        
        testBooks.forEach(book => {
            const hasAudiobook = this.hasAudiobook(book);
            console.log(`🐞 [Test] "${book}": ${hasAudiobook ? '✅ HAS audiobook' : '❌ NO audiobook'}`);
        });
    }
}

// Global instance
window.audiobookUtility = new AudiobookUtility();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.audiobookUtility.init();
    });
} else {
    window.audiobookUtility.init();
}

console.log('🎧 [Utility] Audiobook Utility loaded'); 