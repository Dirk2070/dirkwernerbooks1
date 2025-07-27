// 🔍 Debug Links Script
// Monitors link behavior and detects inconsistencies

class LinkDebugger {
    constructor() {
        this.linkDecisions = new Map();
        this.inconsistencies = [];
    }

    // Log link decision for a book
    logLinkDecision(bookTitle, hasDetailPage, url, reason) {
        const decision = {
            bookTitle,
            hasDetailPage,
            url,
            reason,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        };
        
        this.linkDecisions.set(bookTitle, decision);
        console.log('🔍 [LinkDebug] Decision:', decision);
    }

    // Check for inconsistencies
    checkInconsistencies() {
        console.log('🔍 [LinkDebug] Checking for inconsistencies...');
        
        const decisions = Array.from(this.linkDecisions.values());
        const booksByTitle = new Map();
        
        decisions.forEach(decision => {
            const key = decision.bookTitle.toLowerCase().trim();
            if (!booksByTitle.has(key)) {
                booksByTitle.set(key, []);
            }
            booksByTitle.get(key).push(decision);
        });
        
        booksByTitle.forEach((decisions, title) => {
            if (decisions.length > 1) {
                const uniqueUrls = [...new Set(decisions.map(d => d.url))];
                const uniqueHasDetailPage = [...new Set(decisions.map(d => d.hasDetailPage))];
                
                if (uniqueUrls.length > 1 || uniqueHasDetailPage.length > 1) {
                    this.inconsistencies.push({
                        bookTitle: title,
                        decisions,
                        uniqueUrls,
                        uniqueHasDetailPage
                    });
                    
                    console.warn('⚠️ [LinkDebug] INCONSISTENCY DETECTED:', {
                        bookTitle: title,
                        uniqueUrls,
                        uniqueHasDetailPage,
                        decisions
                    });
                }
            }
        });
        
        return this.inconsistencies;
    }

    // Monitor link clicks
    monitorLinkClicks() {
        document.addEventListener('click', (event) => {
            const link = event.target.closest('a');
            if (link && (link.classList.contains('book-detail-link') || link.classList.contains('detail-link'))) {
                const bookCard = link.closest('.book-card');
                const bookTitle = bookCard?.querySelector('.book-title')?.textContent?.trim();
                const hasDetailPage = bookCard?.getAttribute('data-has-detail-page') === 'true';
                const url = link.href;
                
                console.log('🔍 [LinkDebug] Link clicked:', {
                    bookTitle,
                    hasDetailPage,
                    url,
                    isFallback: link.hasAttribute('data-fallback'),
                    target: link.target,
                    userAgent: navigator.userAgent,
                    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                });
            }
        });
    }

    // Generate debug report
    generateReport() {
        console.log('🔍 [LinkDebug] === LINK DEBUG REPORT ===');
        console.log('🔍 [LinkDebug] Total decisions:', this.linkDecisions.size);
        console.log('🔍 [LinkDebug] Inconsistencies:', this.inconsistencies.length);
        
        if (this.inconsistencies.length > 0) {
            console.log('🔍 [LinkDebug] Inconsistency details:', this.inconsistencies);
        }
        
        console.log('🔍 [LinkDebug] All decisions:', Array.from(this.linkDecisions.values()));
        console.log('🔍 [LinkDebug] === END REPORT ===');
    }

    // Auto-run monitoring
    start() {
        console.log('🔍 [LinkDebug] Starting link monitoring...');
        this.monitorLinkClicks();
        
        // Generate report after 5 seconds
        setTimeout(() => {
            this.checkInconsistencies();
            this.generateReport();
        }, 5000);
    }
}

// Global debugger instance
window.linkDebugger = new LinkDebugger();

// Auto-start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.linkDebugger.start();
    });
} else {
    window.linkDebugger.start();
}

console.log('🔍 [LinkDebug] Link Debugger loaded'); 