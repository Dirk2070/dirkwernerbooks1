// 🎧 Automatisch generierte Apple Books Audiobook Whitelist
// Generiert am: 2025-07-27T17:54:21.969Z
// Quelle: https://books.apple.com/de/author/dirk-werner/id316714929?see-all=audio-books
// Methode: iTunes API (Echte Apple Books IDs)

window.appleAudiobookList = {
  "author": "Dirk Werner",
  "source": "Apple Books",
  "url": "https://books.apple.com/de/author/dirk-werner/id316714929?see-all=audio-books",
  "lastUpdated": "2025-07-27T17:54:21.969Z",
  "scrapingMethod": "iTunes API",
  "audiobooks": [
    {
      "title": "The Legacy of the Lodges: Dr. Seelmanns 3rd case",
      "appleId": "1799074036",
      "year": "2025",
      "format": "Audiobook"
    },
    {
      "title": "Nanogenesis: The Rise of Superhumans",
      "appleId": "1798829619",
      "year": "2025",
      "format": "Audiobook"
    },
    {
      "title": "The Key of the Enlightened",
      "appleId": "1798551433",
      "year": "2025",
      "format": "Audiobook"
    },
    {
      "title": "The Battle Within: A Guide to Overcoming Inner Struggles",
      "appleId": "1810717567",
      "year": "2025",
      "format": "Audiobook"
    },
    {
      "title": "How to Recognize Cults: A Guide to Protecting Yourself from Manipulation and Control",
      "appleId": "1810717772",
      "year": "2025",
      "format": "Audiobook"
    },
    {
      "title": "How to Recognize Cults: A Guide to Protecting Yourself from Manipulation and Control",
      "appleId": "1811457128",
      "year": "2025",
      "format": "Audiobook"
    },
    {
      "title": "American Shadows: Hecate's Intervention - The Unofficial Sequel to American Gods",
      "appleId": "1799074309",
      "year": "2025",
      "format": "Audiobook"
    },
    {
      "title": "Instructions for Staying in the Matrix Forever",
      "appleId": "1799074224",
      "year": "2025",
      "format": "Audiobook"
    },
    {
      "title": "Deadly Echo: Dr. Seelmann's Second Case",
      "appleId": "1798829616",
      "year": "2025",
      "format": "Audiobook"
    },
    {
      "title": "The Simulation Chronicles",
      "appleId": "1799233073",
      "year": "2025",
      "format": "Audiobook"
    },
    {
      "title": "Self-Love Over Perfection: A Guide to Overcoming Female Narcissism",
      "appleId": "1810717883",
      "year": "2025",
      "format": "Audiobook"
    }
  ],
  "total_audiobooks": 11,
  "extracted_date": "2025-07-27"
};

// Create lookup maps for faster access
window.appleAudiobookIds = window.appleAudiobookList.audiobooks.map(book => book.appleId).filter(id => id);
window.appleAudiobookTitles = window.appleAudiobookList.audiobooks.map(book => book.title);

// Helper function to check if a book has an audiobook - MULTIPLE IDENTIFICATION METHODS
window.isAppleAudiobook = function(bookIdentifier) {
  if (!window.appleAudiobookList || !window.appleAudiobookList.audiobooks) {
    console.warn('⚠️ [Audiobook] Whitelist not loaded');
    return false;
  }
  
  // Method 1: Direct Apple ID lookup (fastest)
  if (window.appleAudiobookIds && window.appleAudiobookIds.includes(bookIdentifier)) {
    console.log('🎧 [Audiobook] Apple ID match found:', bookIdentifier);
    return true;
  }
  
  // Method 2: Title-based matching (fallback)
  const normalizeTitle = (title) => {
    return title
      .trim()
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove special characters
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
  };
  
  const normalizedInputTitle = normalizeTitle(bookIdentifier);
  
  const hasAudiobook = window.appleAudiobookList.audiobooks.some(book => {
    const normalizedWhitelistTitle = normalizeTitle(book.title);
    
    // Try multiple matching strategies
    const exactMatch = normalizedWhitelistTitle === normalizedInputTitle;
    const containsMatch = normalizedWhitelistTitle.includes(normalizedInputTitle) || normalizedInputTitle.includes(normalizedWhitelistTitle);
    
    const matches = exactMatch || containsMatch;
    
    if (matches) {
      console.log('🎧 [Audiobook] Title match found:', {
        original: bookIdentifier,
        whitelist: book.title,
        exactMatch,
        containsMatch
      });
    }
    return matches;
  });
  
  console.log('🎧 [Audiobook] Checking:', bookIdentifier, 'Normalized:', normalizedInputTitle, 'Result:', hasAudiobook);
  return hasAudiobook;
};

console.log('✅ [Audiobook] Apple Books Whitelist loaded successfully!');
console.log('📊 [Audiobook] Total audiobooks available:', window.appleAudiobookList.total_audiobooks);

// Helper function to wait for whitelist to be loaded
window.waitForAudiobookList = function() {
    return new Promise((resolve) => {
        if (window.appleAudiobookList) {
            resolve();
        } else {
            const checkInterval = setInterval(() => {
                if (window.appleAudiobookList) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
            
            // Timeout after 5 seconds
            setTimeout(() => {
                clearInterval(checkInterval);
                console.warn('⚠️ [Audiobook] Whitelist loading timeout');
                resolve();
            }, 5000);
        }
    });
};
