const fs = require('fs');
const path = require('path');

// Function to generate slug from title
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

// Function to generate sitemap XML
function generateSitemap() {
    try {
        // Read the books-extended.json file
        const booksData = JSON.parse(fs.readFileSync('books-extended.json', 'utf8'));
        
        // Base URL
        const baseUrl = 'https://dirkwernerbooks.com';
        
        // Current date in ISO format
        const currentDate = new Date().toISOString().split('T')[0];
        
        // Start building the XML
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
        
        // Add main pages
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/</loc>\n`;
        xml += `    <lastmod>${currentDate}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>1.0</priority>\n`;
        xml += `  </url>\n`;
        
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/en/</loc>\n`;
        xml += `    <lastmod>${currentDate}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.9</priority>\n`;
        xml += `  </url>\n`;
        
        // Add legal pages
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/impressum.html</loc>\n`;
        xml += `    <lastmod>${currentDate}</lastmod>\n`;
        xml += `    <changefreq>yearly</changefreq>\n`;
        xml += `    <priority>0.3</priority>\n`;
        xml += `  </url>\n`;
        
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/datenschutz.html</loc>\n`;
        xml += `    <lastmod>${currentDate}</lastmod>\n`;
        xml += `    <changefreq>yearly</changefreq>\n`;
        xml += `    <priority>0.3</priority>\n`;
        xml += `  </url>\n`;
        
        // Add book pages
        booksData.forEach(book => {
            const slug = generateSlug(book.title);
            xml += `  <url>\n`;
            xml += `    <loc>${baseUrl}/buecher/${slug}</loc>\n`;
            xml += `    <lastmod>${currentDate}</lastmod>\n`;
            xml += `    <changefreq>monthly</changefreq>\n`;
            xml += `    <priority>0.8</priority>\n`;
            xml += `  </url>\n`;
        });
        
        xml += '</urlset>';
        
        // Create public directory if it doesn't exist
        const publicDir = 'public';
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true });
        }
        
        // Write the sitemap to file
        fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml, 'utf8');
        
        console.log('✅ Sitemap successfully generated!');
        console.log(`📁 Location: ${path.join(publicDir, 'sitemap.xml')}`);
        console.log(`📊 Total URLs: ${booksData.length + 4} (${booksData.length} books + 4 main pages)`);
        
        // Show some example slugs
        console.log('\n📝 Example slugs generated:');
        booksData.slice(0, 3).forEach(book => {
            console.log(`   "${book.title}" → "${generateSlug(book.title)}"`);
        });
        
    } catch (error) {
        console.error('❌ Error generating sitemap:', error.message);
        process.exit(1);
    }
}

// Function to test slug generation
function testSlugGeneration() {
    console.log('🧪 Testing slug generation:');
    
    const testTitles = [
        'Verhängnisvolle Trance: Dr. Seelmanns erster Fall',
        'The Simulation Chronicles (English Edition)',
        'Umgang mit Eifersüchtigen: So bewahrst du deine innere Stärke',
        'Psychotainment: Wie du auf jeder Party glänzt',
        'American Shadows: Hecate\'s Intervention'
    ];
    
    testTitles.forEach(title => {
        console.log(`   "${title}" → "${generateSlug(title)}"`);
    });
    
    console.log('');
}

// Run the script
if (require.main === module) {
    console.log('🚀 Starting sitemap generation...\n');
    testSlugGeneration();
    generateSitemap();
}

module.exports = { generateSitemap, generateSlug }; 