/**
 * Multilingual Checker & SEO Meta Validator
 * For Dirk Werner Books Website
 */

class MultilingualChecker {
    constructor() {
        this.currentLanguage = 'de';
        this.books = [];
        this.seoIssues = [];
        this.languageIssues = [];
    }

    // Initialize the checker
    async init() {
        try {
            await this.loadBooks();
            this.detectCurrentLanguage();
            this.validateSEO();
            this.validateMultilingual();
            this.generateReport();
        } catch (error) {
            console.error('❌ Error initializing multilingual checker:', error);
        }
    }

    // Load books data
    async loadBooks() {
        try {
            const response = await fetch('/books.json');
            this.books = await response.json();
            console.log(`📚 Loaded ${this.books.length} books for multilingual checking`);
        } catch (error) {
            console.error('❌ Error loading books:', error);
        }
    }

    // Detect current language from page
    detectCurrentLanguage() {
        const htmlLang = document.documentElement.lang;
        const activeLangBtn = document.querySelector('.lang-btn.active');
        
        if (activeLangBtn) {
            this.currentLanguage = activeLangBtn.dataset.lang;
        } else if (htmlLang) {
            this.currentLanguage = htmlLang;
        }
        
        console.log(`🌍 Current language detected: ${this.currentLanguage}`);
    }

    // Validate SEO meta tags
    validateSEO() {
        console.log('🔍 Validating SEO meta tags...');
        
        // Check title
        const title = document.querySelector('title');
        if (title) {
            const titleText = title.textContent;
            if (titleText.length < 30) {
                this.seoIssues.push({
                    type: 'title',
                    issue: 'Title too short',
                    current: titleText.length,
                    recommended: '50-60 characters'
                });
            } else if (titleText.length > 60) {
                this.seoIssues.push({
                    type: 'title',
                    issue: 'Title too long',
                    current: titleText.length,
                    recommended: '50-60 characters'
                });
            }
        }

        // Check description
        const description = document.querySelector('meta[name="description"]');
        if (description) {
            const descText = description.content;
            if (descText.length < 120) {
                this.seoIssues.push({
                    type: 'description',
                    issue: 'Description too short',
                    current: descText.length,
                    recommended: '150-160 characters'
                });
            } else if (descText.length > 160) {
                this.seoIssues.push({
                    type: 'description',
                    issue: 'Description too long',
                    current: descText.length,
                    recommended: '150-160 characters'
                });
            }
        } else {
            this.seoIssues.push({
                type: 'description',
                issue: 'Missing meta description',
                current: 'none',
                recommended: 'Add meta description'
            });
        }

        // Check Open Graph tags
        const ogTitle = document.querySelector('meta[property="og:title"]');
        const ogDescription = document.querySelector('meta[property="og:description"]');
        const ogImage = document.querySelector('meta[property="og:image"]');
        
        if (!ogTitle) {
            this.seoIssues.push({
                type: 'og',
                issue: 'Missing Open Graph title',
                current: 'none',
                recommended: 'Add og:title'
            });
        }
        
        if (!ogDescription) {
            this.seoIssues.push({
                type: 'og',
                issue: 'Missing Open Graph description',
                current: 'none',
                recommended: 'Add og:description'
            });
        }
        
        if (!ogImage) {
            this.seoIssues.push({
                type: 'og',
                issue: 'Missing Open Graph image',
                current: 'none',
                recommended: 'Add og:image'
            });
        }

        // Check structured data
        const structuredData = document.querySelector('script[type="application/ld+json"]');
        if (!structuredData) {
            this.seoIssues.push({
                type: 'structured-data',
                issue: 'Missing structured data',
                current: 'none',
                recommended: 'Add Schema.org markup'
            });
        }
    }

    // Validate multilingual content
    validateMultilingual() {
        console.log('🌍 Validating multilingual content...');
        
        // Check for data-de and data-en attributes
        const elementsWithLang = document.querySelectorAll('[data-de], [data-en]');
        const elementsWithoutLang = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, a, button, span, div');
        
        // Find elements that should have language attributes but don't
        elementsWithoutLang.forEach(element => {
            if (element.textContent && element.textContent.trim().length > 0) {
                const hasLangAttr = element.hasAttribute('data-de') || element.hasAttribute('data-en');
                const isInLangContainer = element.closest('[data-de], [data-en]');
                
                if (!hasLangAttr && !isInLangContainer && !this.isSystemElement(element)) {
                    this.languageIssues.push({
                        type: 'missing-lang-attr',
                        element: element.tagName,
                        text: element.textContent.substring(0, 50) + '...',
                        recommended: 'Add data-de and data-en attributes'
                    });
                }
            }
        });

        // Check book titles for language consistency
        this.books.forEach(book => {
            const hasGermanTitle = book.title?.de;
            const hasEnglishTitle = book.title?.en;
            
            if (!hasGermanTitle && !hasEnglishTitle) {
                this.languageIssues.push({
                    type: 'book-title',
                    book: book.asin || 'Unknown',
                    issue: 'No language-specific titles',
                    recommended: 'Add title.de and title.en'
                });
            } else if (!hasGermanTitle) {
                this.languageIssues.push({
                    type: 'book-title',
                    book: book.asin || 'Unknown',
                    issue: 'Missing German title',
                    recommended: 'Add title.de'
                });
            } else if (!hasEnglishTitle) {
                this.languageIssues.push({
                    type: 'book-title',
                    book: book.asin || 'Unknown',
                    issue: 'Missing English title',
                    recommended: 'Add title.en'
                });
            }
        });
    }

    // Check if element is a system element (shouldn't have lang attributes)
    isSystemElement(element) {
        const systemClasses = ['nav', 'header', 'footer', 'container', 'btn', 'logo'];
        const systemIds = ['navigation', 'header', 'footer'];
        
        return systemClasses.some(cls => element.classList.contains(cls)) ||
               systemIds.some(id => element.id === id) ||
               element.tagName === 'SCRIPT' ||
               element.tagName === 'STYLE' ||
               element.tagName === 'META';
    }

    // Generate comprehensive report
    generateReport() {
        console.log('\n📊 Multilingual & SEO Validation Report');
        console.log('=' .repeat(50));
        
        // SEO Report
        if (this.seoIssues.length > 0) {
            console.log('\n🔍 SEO Issues Found:');
            this.seoIssues.forEach((issue, index) => {
                console.log(`${index + 1}. ${issue.type.toUpperCase()}: ${issue.issue}`);
                console.log(`   Current: ${issue.current} | Recommended: ${issue.recommended}`);
            });
        } else {
            console.log('\n✅ No SEO issues found!');
        }
        
        // Language Report
        if (this.languageIssues.length > 0) {
            console.log('\n🌍 Language Issues Found:');
            this.languageIssues.forEach((issue, index) => {
                console.log(`${index + 1}. ${issue.type.toUpperCase()}: ${issue.issue}`);
                if (issue.book) {
                    console.log(`   Book: ${issue.book}`);
                }
                if (issue.element) {
                    console.log(`   Element: ${issue.element}`);
                }
                console.log(`   Recommended: ${issue.recommended}`);
            });
        } else {
            console.log('\n✅ No language issues found!');
        }
        
        // Summary
        const totalIssues = this.seoIssues.length + this.languageIssues.length;
        console.log('\n📈 Summary:');
        console.log(`   SEO Issues: ${this.seoIssues.length}`);
        console.log(`   Language Issues: ${this.languageIssues.length}`);
        console.log(`   Total Issues: ${totalIssues}`);
        
        if (totalIssues === 0) {
            console.log('🎉 Perfect! Your website is fully optimized for SEO and multilingual support!');
        } else {
            console.log('⚠️  Please address the issues above for optimal performance.');
        }
        
        // Save report to localStorage for later reference
        this.saveReport();
    }

    // Save report to localStorage
    saveReport() {
        const report = {
            timestamp: new Date().toISOString(),
            seoIssues: this.seoIssues,
            languageIssues: this.languageIssues,
            currentLanguage: this.currentLanguage,
            totalBooks: this.books.length
        };
        
        localStorage.setItem('multilingual-seo-report', JSON.stringify(report));
    }

    // Get saved report
    getSavedReport() {
        const saved = localStorage.getItem('multilingual-seo-report');
        return saved ? JSON.parse(saved) : null;
    }

    // Fix common issues automatically
    autoFix() {
        console.log('🔧 Attempting to auto-fix common issues...');
        
        let fixesApplied = 0;
        
        // Auto-fix missing alt attributes
        const images = document.querySelectorAll('img:not([alt])');
        images.forEach(img => {
            const src = img.src;
            const filename = src.split('/').pop().split('.')[0];
            img.alt = filename;
            fixesApplied++;
        });
        
        // Auto-fix missing lang attributes on html element
        const html = document.documentElement;
        if (!html.lang) {
            html.lang = this.currentLanguage;
            fixesApplied++;
        }
        
        console.log(`✅ Applied ${fixesApplied} automatic fixes`);
        return fixesApplied;
    }

    // Generate SEO recommendations
    generateSEORecommendations() {
        const recommendations = [];
        
        if (this.seoIssues.length > 0) {
            recommendations.push('🔍 SEO Optimizations:');
            this.seoIssues.forEach(issue => {
                recommendations.push(`   • ${issue.issue}: ${issue.recommended}`);
            });
        }
        
        if (this.languageIssues.length > 0) {
            recommendations.push('🌍 Multilingual Optimizations:');
            this.languageIssues.forEach(issue => {
                recommendations.push(`   • ${issue.issue}: ${issue.recommended}`);
            });
        }
        
        return recommendations;
    }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.multilingualChecker = new MultilingualChecker();
    window.multilingualChecker.init();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MultilingualChecker;
} 