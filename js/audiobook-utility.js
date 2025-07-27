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
        this.safetyChecks = {
            maxCardRemovals: 0,
            maxButtonRemovals: 0,
            protectedElements: new Set()
        };
    }

    // Initialize the utility
    async init() {
        console.log('🎧 [Utility] Initializing Audiobook Utility...');
        
        try {
            // Wait for whitelist to load
            await this.waitForWhitelist();
            
            // Process buttons with safety wrapper (for overview pages)
            this.processAudiobookButtonsSafe();
            
            // Process detail page buttons (for individual book pages)
            this.processDetailPageAudiobookButtons();
            
            this.isInitialized = true;
            console.log('🎧 [Utility] Audiobook Utility initialized successfully');
        } catch (error) {
            console.error('❌ [Utility] Initialization failed:', error);
        }
    }

    // Wait for whitelist to be loaded
    async waitForWhitelist() {
        if (window.appleAudiobookList && window.appleAudiobookList.audiobooks) {
            this.whitelist = window.appleAudiobookList.audiobooks.map(book => {
                // Handle multilingual title objects
                if (typeof book.title === 'string') {
                    return book.title;
                }
                if (book.title && typeof book.title === 'object') {
                    return book.title['de'] || book.title['en'] || 'Unknown Title';
                }
                return 'Unknown Title';
            });
            console.log('🎧 [Utility] Whitelist loaded:', this.whitelist.length, 'audiobooks');
            return;
        }

        console.log('⏳ [Utility] Waiting for whitelist to load...');
        
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (window.appleAudiobookList && window.appleAudiobookList.audiobooks) {
                    clearInterval(checkInterval);
                    this.whitelist = window.appleAudiobookList.audiobooks.map(book => {
                        // Handle multilingual title objects
                        if (typeof book.title === 'string') {
                            return book.title;
                        }
                        if (book.title && typeof book.title === 'object') {
                            return book.title['de'] || book.title['en'] || 'Unknown Title';
                        }
                        return 'Unknown Title';
                    });
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
            .replace(/\(english edition\)/gi, '')  // Remove "(English Edition)"
            .replace(/\(german edition\)/gi, '')   // Remove "(German Edition)"
            .replace(/[^\w\s]/g, '')               // Remove special characters
            .replace(/\s+/g, ' ')                  // Normalize whitespace
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

    // SAFE: Get title from card using multiple selectors
    getBookTitleSafe(card) {
        if (!card || !card.querySelector) {
            console.warn('⚠️ [Utility] Invalid card element provided');
            return null;
        }

        const titleSelectors = ['.book-title', 'h3', '.title', '[data-title]'];
        
        for (const selector of titleSelectors) {
            try {
                const element = card.querySelector(selector);
                if (element) {
                    const title = element.textContent?.trim() || element.getAttribute('data-title')?.trim();
                    if (title && title !== 'undefined' && title.length > 0) {
                        return title;
                    }
                }
            } catch (error) {
                console.warn('⚠️ [Utility] Error getting title with selector:', selector, error);
            }
        }
        
        console.warn('⚠️ [Utility] No valid title found for card:', card);
        return null;
    }

    // SAFE: Get audiobook button from card using multiple selectors
    getAudiobookButtonSafe(card) {
        if (!card || !card.querySelector) {
            console.warn('⚠️ [Utility] Invalid card element provided');
            return null;
        }

        const buttonSelectors = ['.book-link.audiobook', '.audiobook-button', '.btn-audiobook-link'];
        
        for (const selector of buttonSelectors) {
            try {
                const button = card.querySelector(selector);
                if (button) {
                    return button;
                }
            } catch (error) {
                console.warn('⚠️ [Utility] Error getting button with selector:', selector, error);
            }
        }
        
        return null;
    }

    // SAFE: Remove button without affecting card structure
    removeButtonSafe(button, bookTitle) {
        if (!button) {
            console.warn('⚠️ [Utility] No button to remove for:', bookTitle);
            return false;
        }

        try {
            // Check if button is still in DOM
            if (button.parentNode) {
                button.remove();
                this.safetyChecks.maxButtonRemovals++;
                console.log('❌ [Utility] SAFELY REMOVED audiobook button for:', bookTitle);
                return true;
            } else {
                console.warn('⚠️ [Utility] Button already removed for:', bookTitle);
                return false;
            }
        } catch (error) {
            console.error('❌ [Utility] Error removing button for:', bookTitle, error);
            return false;
        }
    }

    // SAFE: Show button without affecting card structure
    showButtonSafe(button, bookTitle) {
        if (!button) {
            console.warn('⚠️ [Utility] No button to show for:', bookTitle);
            return false;
        }

        try {
            button.style.display = 'inline-flex';
            button.style.visibility = 'visible';
            button.style.opacity = '1';
            button.style.pointerEvents = 'auto';
            button.setAttribute('data-audiobook-allowed', 'true');
            
            // Mobile-specific enhancements
            const isMobile = window.innerWidth <= 768;
            if (isMobile) {
                button.style.width = '100%';
                button.style.justifyContent = 'center';
                button.style.minHeight = '44px';
                console.log('📱 [Utility] Applied mobile-specific styling for:', bookTitle);
            }
            
            console.log('✅ [Utility] SAFELY SHOWED audiobook button for:', bookTitle);
            return true;
        } catch (error) {
            console.error('❌ [Utility] Error showing button for:', bookTitle, error);
            return false;
        }
    }

    // SAFE: Create audiobook button without affecting card structure
    createAudiobookButtonSafe(card, bookTitle) {
        if (!card || !bookTitle) {
            console.warn('⚠️ [Utility] Invalid parameters for button creation');
            return false;
        }

        try {
            const button = document.createElement('a');
            button.className = 'book-link audiobook btn-audiobook-link';
            button.href = 'https://books.apple.com/de/author/dirk-werner/id316714929?see-all=audio-books';
            button.target = '_blank';
            button.rel = 'noopener noreferrer';
            button.setAttribute('data-audiobook-allowed', 'true');
            button.innerHTML = '🎧 Hörbuch bei Apple Books';
            
            // Find the best place to insert the button
            const linksContainer = card.querySelector('.book-links');
            if (linksContainer) {
                linksContainer.appendChild(button);
                console.log('🛠️ [Utility] SAFELY CREATED audiobook button in .book-links for:', bookTitle);
            } else {
                // Fallback: insert at the end of the card
                card.appendChild(button);
                console.log('🛠️ [Utility] SAFELY CREATED audiobook button at end of card for:', bookTitle);
            }
            
            return true;
        } catch (error) {
            console.error('❌ [Utility] Error creating button for:', bookTitle, error);
            return false;
        }
    }

    // SAFE: Process all audiobook buttons with comprehensive error protection
    processAudiobookButtonsSafe() {
        console.log('🔧 [Utility] SAFELY Processing audiobook buttons...');
        
        // Wait for whitelist to be loaded before processing
        if (!this.whitelist || this.whitelist.length === 0) {
            console.log('⏳ [Utility] Whitelist not ready, delaying processing...');
            setTimeout(() => this.processAudiobookButtonsSafe(), 1000);
            return;
        }
        
        const cards = document.querySelectorAll('.book-card');
        console.log('🔧 [Utility] Found', cards.length, 'book cards');
        
        // Mobile-specific processing
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            console.log('📱 [Utility] Mobile device detected, applying mobile-specific logic');
            // Force mobile audiobook button visibility
            setTimeout(() => {
                document.querySelectorAll('.book-link.audiobook').forEach(btn => {
                    btn.style.display = 'inline-flex';
                    btn.style.visibility = 'visible';
                    btn.style.opacity = '1';
                    btn.style.pointerEvents = 'auto';
                });
            }, 100);
        }
        
        let processedCards = 0;
        let successfulOperations = 0;
        
        cards.forEach((card, index) => {
            try {
                // Safety check: ensure card is valid
                if (!card || !card.querySelector) {
                    console.warn('⚠️ [Utility] Invalid card at index:', index);
                    return;
                }

                // Get book title safely
                const bookTitle = this.getBookTitleSafe(card);
                if (!bookTitle) {
                    console.warn('⚠️ [Utility] No title found for card at index:', index);
                    return;
                }

                // Check if book should have audiobook
                const hasAudiobook = this.hasAudiobook(bookTitle);
                
                // Get audiobook button safely
                const audiobookButton = this.getAudiobookButtonSafe(card);
                
                if (audiobookButton) {
                    if (hasAudiobook) {
                        // Keep and enable button
                        if (this.showButtonSafe(audiobookButton, bookTitle)) {
                            successfulOperations++;
                        }
                    } else {
                        // Remove button safely
                        if (this.removeButtonSafe(audiobookButton, bookTitle)) {
                            successfulOperations++;
                        }
                    }
                } else if (hasAudiobook) {
                    // Create button if missing
                    if (this.createAudiobookButtonSafe(card, bookTitle)) {
                        successfulOperations++;
                    }
                }
                
                processedCards++;
                
            } catch (error) {
                console.error('❌ [Utility] Error processing card at index:', index, error);
            }
        });
        
        console.log('🔧 [Utility] SAFE processing completed:', {
            processedCards,
            successfulOperations,
            maxButtonRemovals: this.safetyChecks.maxButtonRemovals
        });
    }

    // SPECIALIZED: Process audiobook buttons on detail pages
    processDetailPageAudiobookButtons() {
        console.log('🔧 [Utility] Processing audiobook buttons on DETAIL PAGE...');
        
        // Check if we're on a detail page
        const currentPath = window.location.pathname;
        const isDetailPage = currentPath.includes('/buecher/') && currentPath !== '/buecher/';
        
        if (!isDetailPage) {
            console.log('🔧 [Utility] Not on detail page, skipping detail processing');
            return;
        }
        
        console.log('🔧 [Utility] Detail page detected:', currentPath);
        
        // Get the main book title from the detail page
        const titleSelectors = [
            'h1.book-title',
            'h1',
            '.book-title',
            '.title',
            '[data-title]',
            'h2.book-title',
            'h2'
        ];
        
        let bookTitle = null;
        for (const selector of titleSelectors) {
            const element = document.querySelector(selector);
            if (element) {
                bookTitle = element.textContent?.trim() || element.getAttribute('data-title')?.trim();
                if (bookTitle && bookTitle !== 'undefined' && bookTitle.length > 0) {
                    console.log('🔧 [Utility] Found book title on detail page:', bookTitle);
                    break;
                }
            }
        }
        
        if (!bookTitle) {
            console.warn('⚠️ [Utility] No book title found on detail page');
            return;
        }
        
        // Check if this book should have an audiobook
        const hasAudiobook = this.hasAudiobook(bookTitle);
        console.log('🔧 [Utility] Book should have audiobook:', hasAudiobook);
        
        // Special case: "Umgang mit Eifersüchtigen" definitely has NO audiobook
        if (bookTitle.toLowerCase().includes('eifersüchtigen') || bookTitle.toLowerCase().includes('eifersucht')) {
            console.log('🔧 [Utility] Special case: Eifersucht book - NO audiobook available');
            this.removeDetailPageAudiobookButtons();
            return;
        }
        
        if (!hasAudiobook) {
            console.log('🔧 [Utility] Book does not have audiobook, removing any existing buttons');
            this.removeDetailPageAudiobookButtons();
            return;
        }
        
        // Find or create audiobook button on detail page
        this.ensureDetailPageAudiobookButton(bookTitle);
    }

    // Remove audiobook buttons from detail page
    removeDetailPageAudiobookButtons() {
        const buttonSelectors = [
            '.book-link.audiobook',
            '.audiobook-button',
            '.btn-audiobook-link',
            '.book-action.audiobook-button'
        ];
        
        let removedCount = 0;
        buttonSelectors.forEach(selector => {
            const buttons = document.querySelectorAll(selector);
            buttons.forEach(button => {
                try {
                    button.remove();
                    removedCount++;
                    console.log('❌ [Utility] Removed audiobook button from detail page');
                } catch (error) {
                    console.warn('⚠️ [Utility] Error removing button:', error);
                }
            });
        });
        
        if (removedCount > 0) {
            console.log('🔧 [Utility] Removed', removedCount, 'audiobook buttons from detail page');
        }
    }

    // Ensure audiobook button exists on detail page
    ensureDetailPageAudiobookButton(bookTitle) {
        console.log('🔧 [Utility] Ensuring audiobook button on detail page for:', bookTitle);
        
        // Check if button already exists
        const existingButton = document.querySelector('.book-link.audiobook, .audiobook-button, .btn-audiobook-link, .book-action.audiobook-button');
        
        if (existingButton) {
            console.log('🔧 [Utility] Audiobook button already exists on detail page');
            // Make sure it's visible
            existingButton.style.display = 'inline-flex';
            existingButton.setAttribute('data-audiobook-allowed', 'true');
            return;
        }
        
        // Create new button
        console.log('🔧 [Utility] Creating new audiobook button on detail page');
        this.createDetailPageAudiobookButton(bookTitle);
    }

    // Create audiobook button on detail page
    createDetailPageAudiobookButton(bookTitle) {
        try {
            const button = document.createElement('a');
            button.className = 'book-link audiobook btn-audiobook-link';
            button.href = 'https://books.apple.com/de/author/dirk-werner/id316714929?see-all=audio-books';
            button.target = '_blank';
            button.rel = 'noopener noreferrer';
            button.setAttribute('data-audiobook-allowed', 'true');
            button.innerHTML = '🎧 Hörbuch bei Apple Books';
            
            // Find the best place to insert the button on detail page
            const insertionSelectors = [
                '.book-links',
                '.book-actions',
                '.book-meta',
                '.book-description',
                '.book-info',
                '.book-details',
                '.purchase-links',
                '.buy-links'
            ];
            
            let inserted = false;
            for (const selector of insertionSelectors) {
                const container = document.querySelector(selector);
                if (container) {
                    container.appendChild(button);
                    console.log('🛠️ [Utility] Created audiobook button in', selector, 'for:', bookTitle);
                    inserted = true;
                    break;
                }
            }
            
            // Fallback: insert after the title
            if (!inserted) {
                const titleElement = document.querySelector('h1, h2, .book-title, .title');
                if (titleElement && titleElement.parentNode) {
                    titleElement.parentNode.insertBefore(button, titleElement.nextSibling);
                    console.log('🛠️ [Utility] Created audiobook button after title for:', bookTitle);
                    inserted = true;
                }
            }
            
            // Last resort: insert at the end of the body
            if (!inserted) {
                document.body.appendChild(button);
                console.log('🛠️ [Utility] Created audiobook button at end of body for:', bookTitle);
            }
            
        } catch (error) {
            console.error('❌ [Utility] Error creating detail page audiobook button:', error);
        }
    }

    // Force audiobook buttons for specific books (SAFE)
    forceAudiobookButtonsSafe() {
        console.log('🛠️ [Utility] SAFELY Forcing audiobook buttons...');
        
        const cards = document.querySelectorAll('.book-card');
        let forcedButtons = 0;
        
        cards.forEach((card, index) => {
            try {
                const bookTitle = this.getBookTitleSafe(card);
                if (!bookTitle) return;
                
                const audiobookButton = this.getAudiobookButtonSafe(card);
                
                if (!audiobookButton) {
                    if (this.createAudiobookButtonSafe(card, bookTitle)) {
                        forcedButtons++;
                    }
                }
            } catch (error) {
                console.error('❌ [Utility] Error forcing button for card at index:', index, error);
            }
        });
        
        console.log('🛠️ [Utility] SAFELY forced', forcedButtons, 'audiobook buttons');
    }

    // Debug information with safety checks
    debug() {
        console.log('🐞 [Utility] Debug Information:', {
            whitelistLoaded: this.whitelist.length > 0,
            whitelistCount: this.whitelist.length,
            forceListCount: this.forceList.length,
            isInitialized: this.isInitialized,
            totalBooks: document.querySelectorAll('.book-card').length,
            audiobookButtons: document.querySelectorAll('.book-link.audiobook, .audiobook-button, .btn-audiobook-link').length,
            safetyChecks: this.safetyChecks
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

        // Check for undefined titles
        console.log('🐞 [Utility] Checking for undefined titles...');
        document.querySelectorAll('.book-card').forEach((card, index) => {
            const title = this.getBookTitleSafe(card);
            if (!title || title === 'undefined') {
                console.warn('🐞 [Utility] Card at index', index, 'has invalid title:', title);
            }
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

console.log('🎧 [Utility] Audiobook Utility loaded with safety protection'); 