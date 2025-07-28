/**
 * Image Validator - Detects broken image paths
 * For Dirk Werner Books Website
 */

class ImageValidator {
    constructor() {
        this.brokenImages = [];
        this.checkedImages = 0;
        this.totalImages = 0;
    }

    // Validate a single image
    validateImage(coverUrl, bookTitle = 'Unknown') {
        return new Promise((resolve) => {
            const img = new Image();
            
            img.onload = () => {
                this.checkedImages++;
                console.log(`✅ Image loaded successfully: ${bookTitle}`);
                resolve({ success: true, url: coverUrl, title: bookTitle });
            };
            
            img.onerror = () => {
                this.brokenImages.push({ url: coverUrl, title: bookTitle });
                console.error(`❌ Broken image detected: ${coverUrl} (${bookTitle})`);
                resolve({ success: false, url: coverUrl, title: bookTitle });
            };
            
            img.src = coverUrl;
        });
    }

    // Validate all book covers from books.json
    async validateAllBookCovers() {
        try {
            const response = await fetch('/books.json');
            const books = await response.json();
            
            console.log('🔍 Starting image validation for all book covers...');
            this.totalImages = books.length;
            
            const validationPromises = books.map(book => {
                const coverUrl = book.image?.link;
                const title = book.title?.de || book.title || 'Unknown';
                
                if (coverUrl) {
                    return this.validateImage(coverUrl, title);
                } else {
                    console.warn(`⚠️ No cover URL found for: ${title}`);
                    return Promise.resolve({ success: false, url: null, title });
                }
            });
            
            const results = await Promise.all(validationPromises);
            
            this.generateReport(results);
            
        } catch (error) {
            console.error('❌ Error loading books.json:', error);
        }
    }

    // Generate validation report
    generateReport(results) {
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        
        console.log('\n📊 Image Validation Report:');
        console.log(`✅ Successful: ${successful}/${this.totalImages}`);
        console.log(`❌ Failed: ${failed}/${this.totalImages}`);
        console.log(`📈 Success Rate: ${((successful / this.totalImages) * 100).toFixed(1)}%`);
        
        if (this.brokenImages.length > 0) {
            console.log('\n🚨 Broken Images Found:');
            this.brokenImages.forEach((img, index) => {
                console.log(`${index + 1}. ${img.title}: ${img.url}`);
            });
            
            // Send to analytics/logging service if needed
            this.logBrokenImages();
        } else {
            console.log('\n🎉 All images are loading correctly!');
        }
    }

    // Log broken images for monitoring
    logBrokenImages() {
        if (this.brokenImages.length > 0) {
            const logData = {
                timestamp: new Date().toISOString(),
                brokenImages: this.brokenImages,
                userAgent: navigator.userAgent,
                url: window.location.href
            };
            
            // You can send this to your logging service
            console.log('📝 Log data for broken images:', logData);
            
            // Optionally send to server
            // fetch('/api/log-broken-images', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(logData)
            // });
        }
    }

    // Validate images on current page
    validatePageImages() {
        const images = document.querySelectorAll('img');
        console.log(`🔍 Validating ${images.length} images on current page...`);
        
        images.forEach((img, index) => {
            const imgUrl = img.src;
            const altText = img.alt || `Image ${index + 1}`;
            
            this.validateImage(imgUrl, altText).then(result => {
                if (!result.success) {
                    // Add visual indicator for broken images
                    img.style.border = '2px solid red';
                    img.style.opacity = '0.5';
                    img.title = 'Broken image detected';
                }
            });
        });
    }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.imageValidator = new ImageValidator();
    
    // Validate page images in development mode
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('🔧 Development mode: Validating page images...');
        window.imageValidator.validatePageImages();
    }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImageValidator;
} 