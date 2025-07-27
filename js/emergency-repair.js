// 🚨 Emergency Repair Script
// Restores detail page and fixes collateral damage

class EmergencyRepair {
    constructor() {
        this.repairAttempted = false;
    }

    // Check if detail page is accessible
    checkDetailPage() {
        const currentPath = window.location.pathname;
        const isDetailPage = currentPath.includes('/buecher/') && currentPath !== '/buecher/';
        
        if (isDetailPage) {
            console.log('🚨 [Emergency] Detail page detected:', currentPath);
            this.ensureDetailPageContent();
        }
    }

    // Ensure detail page content is properly displayed
    ensureDetailPageContent() {
        console.log('🚨 [Emergency] Ensuring detail page content...');
        
        // Check if main content is visible
        const mainContent = document.querySelector('main') || document.querySelector('.content') || document.querySelector('.book-detail');
        
        if (!mainContent || mainContent.children.length === 0) {
            console.warn('🚨 [Emergency] Main content missing or empty, attempting repair...');
            this.repairDetailPage();
        } else {
            console.log('🚨 [Emergency] Detail page content appears intact');
        }
    }

    // Repair detail page if content is missing
    repairDetailPage() {
        if (this.repairAttempted) {
            console.warn('🚨 [Emergency] Repair already attempted, skipping...');
            return;
        }
        
        this.repairAttempted = true;
        console.log('🚨 [Emergency] Starting detail page repair...');
        
        // Check if we're on the specific detail page
        if (window.location.pathname.includes('umgang-mit-eifersuechtigen')) {
            this.repairEifersuchtPage();
        } else {
            this.repairGenericDetailPage();
        }
    }

    // Repair the specific "Umgang mit Eifersüchtigen" page
    repairEifersuchtPage() {
        console.log('🚨 [Emergency] Repairing "Umgang mit Eifersüchtigen" page...');
        
        // Check if the page has been corrupted
        const body = document.body;
        const hasContent = body.querySelector('h1, h2, .book-title, .book-cover');
        
        if (!hasContent) {
            console.error('🚨 [Emergency] Page content completely missing, redirecting to homepage...');
            window.location.href = '/';
            return;
        }
        
        // Ensure book title is visible
        const titleElements = document.querySelectorAll('h1, h2, .book-title');
        titleElements.forEach(el => {
            if (el.textContent === 'undefined' || !el.textContent.trim()) {
                el.textContent = 'Umgang mit Eifersüchtigen: So bewahrst du deine innere Stärke';
                console.log('🚨 [Emergency] Fixed undefined title');
            }
        });
        
        // Ensure author is visible
        const authorElements = document.querySelectorAll('.author, .book-author');
        authorElements.forEach(el => {
            if (el.textContent === 'undefined' || !el.textContent.trim()) {
                el.textContent = 'Dirk Werner';
                console.log('🚨 [Emergency] Fixed undefined author');
            }
        });
        
        console.log('🚨 [Emergency] "Umgang mit Eifersüchtigen" page repair completed');
    }

    // Repair generic detail page
    repairGenericDetailPage() {
        console.log('🚨 [Emergency] Repairing generic detail page...');
        
        // Fix undefined titles and authors
        document.querySelectorAll('h1, h2, h3, .book-title, .title').forEach(el => {
            if (el.textContent === 'undefined') {
                el.textContent = 'Buch Titel';
                console.log('🚨 [Emergency] Fixed undefined title element');
            }
        });
        
        document.querySelectorAll('.author, .book-author').forEach(el => {
            if (el.textContent === 'undefined') {
                el.textContent = 'Dirk Werner';
                console.log('🚨 [Emergency] Fixed undefined author element');
            }
        });
        
        console.log('🚨 [Emergency] Generic detail page repair completed');
    }

    // Check for and fix undefined text in book cards
    fixUndefinedText() {
        console.log('🚨 [Emergency] Checking for undefined text...');
        
        const elements = document.querySelectorAll('*');
        let fixedCount = 0;
        
        elements.forEach(el => {
            if (el.childNodes.length === 1 && el.childNodes[0].nodeType === Node.TEXT_NODE) {
                const text = el.textContent;
                if (text === 'undefined') {
                    // Try to determine what this should be based on context
                    const parent = el.parentElement;
                    const className = parent?.className || '';
                    const tagName = parent?.tagName || '';
                    
                    if (className.includes('author') || tagName === 'AUTHOR') {
                        el.textContent = 'Dirk Werner';
                        fixedCount++;
                    } else if (className.includes('title') || tagName === 'TITLE') {
                        el.textContent = 'Buch Titel';
                        fixedCount++;
                    } else {
                        el.textContent = '';
                        fixedCount++;
                    }
                }
            }
        });
        
        if (fixedCount > 0) {
            console.log('🚨 [Emergency] Fixed', fixedCount, 'undefined text elements');
        } else {
            console.log('🚨 [Emergency] No undefined text found');
        }
    }

    // Restore audiobook buttons that were incorrectly removed
    restoreAudiobookButtons() {
        console.log('🚨 [Emergency] Checking for missing audiobook buttons...');
        
        const cards = document.querySelectorAll('.book-card');
        let restoredCount = 0;
        
        cards.forEach(card => {
            const audiobookButtons = card.querySelectorAll('.book-link.audiobook, .audiobook-button, .btn-audiobook-link');
            
            if (audiobookButtons.length === 0) {
                // Check if this book should have an audiobook button
                const title = card.querySelector('.book-title, h3, .title')?.textContent?.trim();
                
                if (title && this.shouldHaveAudiobook(title)) {
                    this.createAudiobookButton(card, title);
                    restoredCount++;
                }
            }
        });
        
        if (restoredCount > 0) {
            console.log('🚨 [Emergency] Restored', restoredCount, 'audiobook buttons');
        } else {
            console.log('🚨 [Emergency] No audiobook buttons needed restoration');
        }
    }

    // Check if book should have audiobook (simple check)
    shouldHaveAudiobook(title) {
        if (!title) return false;
        
        const audiobookTitles = [
            "The Key of the Enlightened",
            "How to Recognize Cults",
            "The Battle Within",
            "The Legacy of the Lodges",
            "Nanogenesis",
            "American Shadows",
            "Instructions for Staying in the Matrix",
            "Deadly Echo",
            "The Simulation Chronicles",
            "Self-Love Over Perfection"
        ];
        
        return audiobookTitles.some(audiobookTitle => 
            title.toLowerCase().includes(audiobookTitle.toLowerCase())
        );
    }

    // Create audiobook button
    createAudiobookButton(card, title) {
        const button = document.createElement('a');
        button.className = 'book-link audiobook btn-audiobook-link';
        button.href = 'https://books.apple.com/de/author/dirk-werner/id316714929?see-all=audio-books';
        button.target = '_blank';
        button.rel = 'noopener noreferrer';
        button.innerHTML = '🎧 Hörbuch bei Apple Books';
        
        const linksContainer = card.querySelector('.book-links');
        if (linksContainer) {
            linksContainer.appendChild(button);
        } else {
            card.appendChild(button);
        }
        
        console.log('🚨 [Emergency] Created audiobook button for:', title);
    }

    // Run all emergency repairs
    runEmergencyRepair() {
        console.log('🚨 [Emergency] Starting emergency repair sequence...');
        
        this.checkDetailPage();
        this.fixUndefinedText();
        this.restoreAudiobookButtons();
        
        console.log('🚨 [Emergency] Emergency repair sequence completed');
    }
}

// Global emergency repair instance
window.emergencyRepair = new EmergencyRepair();

// Auto-run emergency repair after page load
window.addEventListener('load', () => {
    setTimeout(() => {
        window.emergencyRepair.runEmergencyRepair();
    }, 1000);
});

console.log('🚨 [Emergency] Emergency Repair Script loaded'); 