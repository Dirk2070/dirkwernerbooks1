const fs = require('fs');
const path = require('path');

// Function to generate slug from title (same as sitemap generator)
function generateSlug(title) {
    return title
        .toLowerCase()
        // Replace German umlauts
        .replace(/ä/g, 'ae')
        .replace(/ö/g, 'oe')
        .replace(/ü/g, 'ue')
        .replace(/ß/g, 'ss')
        // Remove special characters and parentheses
        .replace(/[^\w\s-]/g, '')
        // Replace spaces with hyphens
        .replace(/\s+/g, '-')
        // Remove multiple consecutive hyphens
        .replace(/-+/g, '-')
        // Remove leading and trailing hyphens
        .replace(/^-+|-+$/g, '');
}

// Function to generate HTML for individual book page
function generateBookPageHTML(book) {
    // Handle multilingual title structure
    const title = book.title?.de || book.title?.en || book.title;
    const description = book.description?.de || book.description?.en || book.description;
    const slug = generateSlug(title);
    
    return `<!DOCTYPE html>
<html lang="${book.language || 'de'}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- SEO Meta Tags -->
    <title>${title} von Dirk Werner - ${description ? description.substring(0, 60) + '...' : 'Buchdetails'}</title>
    <meta name="description" content="${description || 'Entdecken Sie ' + title + ' von Dirk Werner - Psychologe und Autor.'}">
    
    <!-- Open Graph -->
    <meta property="og:title" content="${title} von Dirk Werner">
    <meta property="og:description" content="${description || 'Entdecken Sie dieses Buch von Dirk Werner'}">
    <meta property="og:image" content="${book.image.link}">
    <meta property="og:url" content="https://dirkwernerbooks.com/buecher/${slug}">
    <meta property="og:type" content="book">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title} von Dirk Werner">
    <meta name="twitter:description" content="${description || 'Entdecken Sie dieses Buch von Dirk Werner'}">
    <meta name="twitter:image" content="${book.image.link}">
    
    <!-- Schema.org Book Markup -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Book",
        "name": "${title}",
        "author": {
            "@type": "Person",
            "name": "Dirk Werner"
        },
        "bookFormat": "${book.bookFormat || 'EBook'}",
        "inLanguage": "${book.language || 'de'}",
        "description": "${book.description || ''}",
        "image": "${book.image.link}",
        "offers": {
            "@type": "Offer",
            "url": "${book.links?.amazon_de || book.link}",
            "priceCurrency": "EUR"
        }${book.asin ? `,
        "isbn": "${book.asin}"` : ''}
    }
    </script>
    
    <!-- Canonical URL -->
    <link rel="canonical" href="https://dirkwernerbooks.com/buecher/${slug}">
    
    <!-- Styles -->
    <link rel="stylesheet" href="/css/style.css">
    
    <!-- Breadcrumb Schema -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Startseite",
                "item": "https://dirkwernerbooks.com"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Bücher",
                "item": "https://dirkwernerbooks.com/#books"
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": "${title}",
                "item": "https://dirkwernerbooks.com/buecher/${slug}"
            }
        ]
    }
    </script>
</head>
<body>
    <!-- Header -->
    <header class="header">
        <div class="container">
            <div class="header-content">
                <div class="header-left">
                    <div class="header-brand">
                        <a href="/">
                            <img src="/assets/logo.png" alt="Werner Productions Logo" class="header-logo" loading="lazy">
                        </a>
                        <div class="header-text">
                            <h1 class="header-title">Dirk Werner – Psychologe & Autor</h1>
                            <p class="header-subtitle">Bücher über Psychologie, Beziehungen & mehr</p>
                        </div>
                    </div>
                </div>
                <div class="header-right">
                    <div class="language-switch">
                        <button class="lang-btn active" onclick="switchLanguage('de')">DE</button>
                        <button class="lang-btn" onclick="switchLanguage('en')">EN</button>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <!-- Navigation -->
    <nav class="nav">
        <div class="container">
            <ul class="nav-list">
                <li><a href="/">Startseite</a></li>
                <li><a href="/#books">Bücher</a></li>
                <li><a href="/#about">Über mich</a></li>
                <li><a href="/#genres">Genres</a></li>
            </ul>
        </div>
    </nav>

    <!-- Breadcrumb -->
    <div class="breadcrumb">
        <div class="container">
            <nav aria-label="Breadcrumb">
                <ol class="breadcrumb-list">
                    <li><a href="/">Startseite</a></li>
                    <li><a href="/#books">Bücher</a></li>
                    <li aria-current="page">${title}</li>
                </ol>
            </nav>
        </div>
    </div>

    <!-- Book Detail Section -->
    <main class="book-detail">
        <div class="container">
            <div class="book-detail-content">
                <!-- Modern Grid Layout -->
                <div class="book-detail-grid">
                    <!-- Book Cover Column -->
                    <div class="book-detail-cover">
                        <img src="${book.image.link}" alt="Buchcover: ${title} von Dirk Werner" loading="lazy" class="book-detail-image">
                        
                        <!-- Back to Overview Button -->
                        <div class="back-to-overview">
                            <a href="/#books" class="btn-back">
                                ← Zurück zur Übersicht
                            </a>
                        </div>
                    </div>
                    
                    <!-- Book Info Column -->
                    <div class="book-detail-info">
                        <div class="book-detail-header">
                            <h1 class="book-detail-title">${title}</h1>
                            <p class="book-detail-author">von Dirk Werner</p>
                        </div>
                        
                        ${description ? `<div class="book-detail-description">
                            <h2>Über dieses Buch</h2>
                            <p>${description}</p>
                        </div>` : ''}
                        
                        <div class="book-detail-meta">
                            <div class="meta-grid">
                                <div class="meta-item">
                                    <span class="meta-label">Sprache:</span>
                                    <span class="meta-value">${book.language === 'en' ? 'Englisch' : 'Deutsch'}</span>
                                </div>
                                <div class="meta-item">
                                    <span class="meta-label">Format:</span>
                                    <span class="meta-value">${book.bookFormat === 'Paperback' ? 'Taschenbuch' : 'E-Book'}</span>
                                </div>
                                ${book.asin ? `<div class="meta-item">
                                    <span class="meta-label">ASIN:</span>
                                    <span class="meta-value">${book.asin}</span>
                                </div>` : ''}
                            </div>
                        </div>
                        
                        <div class="book-detail-actions">
                            <h3>Jetzt kaufen</h3>
                            <div class="action-buttons">
                                ${book.links?.amazon_de ? `<a href="${book.links.amazon_de}" class="action-btn amazon-de" target="_blank" rel="noopener noreferrer" aria-label="Buch '${title}' bei Amazon Deutschland kaufen">
                                    📚 Bei Amazon DE kaufen
                                </a>` : ''}
                                
                                ${book.links?.amazon_us ? `<a href="${book.links.amazon_us}" class="action-btn amazon-com" target="_blank" rel="noopener noreferrer" aria-label="Buch '${title}' bei Amazon USA kaufen">
                                    🛒 Bei Amazon US kaufen
                                </a>` : ''}
                                
                                ${book.links?.apple_books ? `<a href="${book.links.apple_books}" class="action-btn apple-books" target="_blank" rel="noopener noreferrer" aria-label="Buch '${title}' bei Apple Books kaufen">
                                    📱 Bei Apple Books kaufen
                                </a>` : ''}
                                
                                ${book.links?.books2read ? `<a href="${book.links.books2read}" class="action-btn books2read" target="_blank" rel="noopener noreferrer" aria-label="Buch '${title}' bei Books2Read ansehen">
                                    🌍 Bei Books2Read ansehen
                                </a>` : ''}
                            </div>
                            
                            ${book.hasAudiobook ? `<div class="audiobook-section">
                                <h4>🎧 Hörbuch verfügbar</h4>
                                <a href="https://books.apple.com/de/author/dirk-werner/id316714929?see-all=audio-books" class="action-btn audiobook" target="_blank" rel="noopener noreferrer" aria-label="Hörbuch '${title}' bei Apple Books anhören">
                                    🎧 Hörbuch bei Apple Books
                                </a>
                            </div>` : ''}
                        </div>
                    </div>
                </div>
            
            <!-- Related Books Section -->
            <div class="related-books">
                <h2>Weitere Bücher von Dirk Werner</h2>
                <div class="books-grid" id="relatedBooks">
                    <!-- Related books will be loaded via JavaScript -->
                </div>
            </div>
        </div>
    </main>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <a href="/" aria-label="Zur Startseite" class="footer-logo-link">
                        <img src="/assets/logo.png" alt="Werner Productions Logo" class="footer-logo" loading="lazy">
                    </a>
                </div>
                <div class="footer-section">
                    <h3>Rechtliches</h3>
                    <div class="footer-links">
                        <a href="/impressum.html">Impressum</a>
                        <a href="/datenschutz.html">Datenschutz</a>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2025 Dirk Werner. Alle Rechte vorbehalten.</p>
            </div>
        </div>
    </footer>

    <!-- Scripts -->
    <script src="/js/main.js"></script>
    <script>
        // Load related books
        async function loadRelatedBooks() {
            try {
                const response = await fetch('/books.json');
                const allBooks = await response.json();
                
                // Filter out current book and get 6 random books
                const otherBooks = allBooks.filter(b => {
                    const bookTitle = b.title?.de || b.title?.en || b.title;
                    return bookTitle !== '${title}';
                });
                const relatedBooks = otherBooks.sort(() => 0.5 - Math.random()).slice(0, 6);
                
                const relatedContainer = document.getElementById('relatedBooks');
                const bookCards = await Promise.all(relatedBooks.map(book => createBookCard(book)));
                relatedContainer.innerHTML = bookCards.join('');
                
            } catch (error) {
                console.error('Error loading related books:', error);
            }
        }
        
        // Initialize page
        document.addEventListener('DOMContentLoaded', function() {
            loadRelatedBooks();
        });
    </script>
</body>
</html>`;
}

// Function to generate all book pages
function generateBookPages() {
    try {
        // Read the books.json file (main source of truth)
        const booksData = JSON.parse(fs.readFileSync('books.json', 'utf8'));
        
        // Create buecher directory if it doesn't exist
        const buecherDir = 'buecher';
        if (!fs.existsSync(buecherDir)) {
            fs.mkdirSync(buecherDir, { recursive: true });
        }
        
        let generatedCount = 0;
        
        // Generate individual pages for each book
        booksData.forEach(book => {
            const title = book.title?.de || book.title?.en || book.title;
            const slug = generateSlug(title);
            const html = generateBookPageHTML(book);
            
            // Write the HTML file
            fs.writeFileSync(path.join(buecherDir, `${slug}.html`), html, 'utf8');
            generatedCount++;
            
            console.log(`✅ Generated: ${slug}.html`);
        });
        
        console.log(`\n🎉 Successfully generated ${generatedCount} book pages!`);
        console.log(`📁 Location: ${buecherDir}/`);
        const firstBookTitle = booksData[0].title?.de || booksData[0].title?.en || booksData[0].title;
        console.log(`🌐 Example URL: https://dirkwernerbooks.com/buecher/${generateSlug(firstBookTitle)}`);
        
        // Generate index file for the buecher directory
        generateBuecherIndex(booksData);
        
    } catch (error) {
        console.error('❌ Error generating book pages:', error.message);
        process.exit(1);
    }
}

// Function to generate index page for buecher directory
function generateBuecherIndex(booksData) {
    const indexHTML = `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Alle Bücher von Dirk Werner - Bücherverzeichnis</title>
    <meta name="description" content="Entdecken Sie alle Bücher von Dirk Werner - Psychologe und Autor. Psychologie, Beziehungen, Psychothriller und mehr.">
    <link rel="canonical" href="https://dirkwernerbooks.com/buecher/">
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
    <header class="header">
        <div class="container">
            <div class="header-content">
                <div class="header-left">
                    <div class="header-brand">
                        <a href="/">
                            <img src="/assets/logo.png" alt="Werner Productions Logo" class="header-logo" loading="lazy">
                        </a>
                        <div class="header-text">
                            <h1 class="header-title">Dirk Werner – Psychologe & Autor</h1>
                            <p class="header-subtitle">Bücherverzeichnis</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <main class="books-directory">
        <div class="container">
            <h1>Alle Bücher von Dirk Werner</h1>
            <p>Entdecken Sie die vollständige Sammlung meiner Bücher - von Psychologie-Ratgebern bis hin zu spannenden Psychothrillern.</p>
            
            <div class="books-grid">
                ${booksData.map(book => {
                    const title = book.title?.de || book.title?.en || book.title;
                    const description = book.description?.de || book.description?.en || book.description;
                    const slug = generateSlug(title);
                    return `<div class="book-card">
                        <div class="book-image">
                            <a href="/buecher/${slug}.html">
                                <img src="${book.image.link}" alt="Buchcover: ${title} von Dirk Werner" loading="lazy">
                            </a>
                        </div>
                        <div class="book-content">
                            <h3 class="book-title">
                                <a href="/buecher/${slug}.html">${title}</a>
                            </h3>
                            <p class="book-author">von Dirk Werner</p>
                            ${description ? `<p class="book-description">${description.substring(0, 100)}...</p>` : ''}
                            <a href="/buecher/${slug}.html" class="book-link books2read">Mehr erfahren</a>
                        </div>
                    </div>`;
                }).join('')}
            </div>
        </div>
    </main>

    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <a href="/" aria-label="Zur Startseite" class="footer-logo-link">
                        <img src="/assets/logo.png" alt="Werner Productions Logo" class="footer-logo" loading="lazy">
                    </a>
                </div>
            </div>
        </div>
    </footer>
</body>
</html>`;
    
    fs.writeFileSync(path.join('buecher', 'index.html'), indexHTML, 'utf8');
    console.log(`✅ Generated: buecher/index.html`);
}

// Run the script
if (require.main === module) {
    console.log('🚀 Starting book pages generation...\n');
    generateBookPages();
}

module.exports = { generateBookPages, generateSlug }; 