const fs = require('fs');
const path = require('path');

// Pfad zur books.json
const BOOKS_PATH = path.join(__dirname, 'books.json');

// Cover-Titel-Mapping (basierend auf visueller Analyse)
const COVER_TITLE_MAPPING = {
  // 101 goldene Regeln - Paar im Blumenfeld mit Schmetterlingen
  'https://m.media-amazon.com/images/I/81LKWtbbD0L.jpg': {
    title: '101 goldene Regeln für eine harmonische Paar-Beziehung',
    keywords: ['101 goldene', 'Paar-Beziehung', 'harmonische', 'Blumenfeld', 'Schmetterlinge']
  },
  
  // Umgang mit Eifersüchtigen
  'https://m.media-amazon.com/images/I/7120r0YodfL.jpg': {
    title: 'Umgang mit Eifersüchtigen: So bewahrst du deine innere Stärke',
    keywords: ['Umgang', 'Eifersüchtigen', 'innere Stärke']
  },
  
  // Wie man Sekten erkennt
  'https://m.media-amazon.com/images/I/81U7rDDkknL.jpg': {
    title: 'Wie man Sekten erkennt: Ein Leitfaden zum Schutz vor Manipulation und Kontrolle',
    keywords: ['Sekten', 'Manipulation', 'Kontrolle', 'Schutz']
  },
  
  // Psychotainment
  'https://m.media-amazon.com/images/I/81JdaN0VGXL.jpg': {
    title: 'Psychotainment: Wie du auf jeder Party glänzt',
    keywords: ['Psychotainment', 'Party', 'psychologische Fakten']
  },
  
  // Der Schlüssel der Erleuchteten
  'https://m.media-amazon.com/images/I/81jq2h0h4mL.jpg': {
    title: 'Der Schlüssel der Erleuchteten',
    keywords: ['Schlüssel', 'Erleuchteten', 'spirituell']
  },
  
  // Anweisungen zum ewigen Verbleib in der Matrix
  'https://m.media-amazon.com/images/I/714ARxqExxL.jpg': {
    title: 'Anweisungen zum ewigen Verbleib in der Matrix',
    keywords: ['Matrix', 'Verbleib', 'philosophisch']
  },
  
  // Erwachen: Der Lyra-Code
  'https://m.media-amazon.com/images/I/81Rd35sljmL.jpg': {
    title: 'Erwachen: Der Lyra-Code',
    keywords: ['Erwachen', 'Lyra-Code', 'Science Fiction']
  },
  
  // Das Vermächtnis der Logen (English)
  'https://m.media-amazon.com/images/I/712Ox66YbtL.jpg': {
    title: 'Das Vermächtnis der Logen: Dr. Seelmanns 3. Fall',
    keywords: ['Vermächtnis', 'Logen', 'Dr. Seelmann', 'mysteriös']
  },
  
  // Das Vermächtnis der Logen (German)
  'https://m.media-amazon.com/images/I/71D9FYxTxsL.jpg': {
    title: 'Das Vermächtnis der Logen: Dr. Seelmanns 3. Fall',
    keywords: ['Vermächtnis', 'Logen', 'Dr. Seelmann', 'mysteriös']
  },
  
  // Tödliches Echo (English)
  'https://m.media-amazon.com/images/I/81AoFGBLsmL.jpg': {
    title: 'Tödliches Echo: Dr. Seelmanns zweiter Fall',
    keywords: ['Tödliches Echo', 'Dr. Seelmann', 'mysteriös']
  },
  
  // Tödliches Echo (German)
  'https://m.media-amazon.com/images/I/816JUw-0OzL.jpg': {
    title: 'Tödliches Echo: Dr. Seelmanns zweiter Fall',
    keywords: ['Tödliches Echo', 'Dr. Seelmann', 'mysteriös']
  },
  
  // Verhängnisvolle Trance
  'https://m.media-amazon.com/images/I/81YYu9nYi-L.jpg': {
    title: 'Verhängnisvolle Trance: Dr. Seelmanns erster Fall',
    keywords: ['Verhängnisvolle Trance', 'Dr. Seelmann', 'mysteriös']
  },
  
  // Die Simulations-Chroniken
  'https://m.media-amazon.com/images/I/81KlVMcAm0L._SY522_.jpg': {
    title: 'Die Simulations-Chroniken',
    keywords: ['Simulations-Chroniken', 'Science Fiction', 'Realität']
  },
  
  // Souverän durch ihre Tests
  'https://m.media-amazon.com/images/I/71a3wgFoXiL.jpg': {
    title: 'Souverän durch ihre Tests: Ein Handbuch für Männer',
    keywords: ['Souverän', 'Tests', 'Männer', 'Beziehung']
  },
  
  // Seminar der Herzen
  'https://m.media-amazon.com/images/I/81Tlc4xcLHL.jpg': {
    title: 'Seminar der Herzen: Eine Geschichte, die Beziehungen erklärt',
    keywords: ['Seminar', 'Herzen', 'Beziehungen', 'Geschichte']
  },
  
  // Herzklopfen für die Ewigkeit
  'https://m.media-amazon.com/images/I/81qDfFOusrL.jpg': {
    title: 'Herzklopfen für die Ewigkeit: Der Weg zu dauerhafter Liebe',
    keywords: ['Herzklopfen', 'Ewigkeit', 'dauerhafte Liebe']
  },
  
  // Malen gegen den Schmerz
  'https://m.media-amazon.com/images/I/71RnxxsHRyL.jpg': {
    title: 'Malen gegen den Schmerz: Dein Weg zur Heilung',
    keywords: ['Malen', 'Schmerz', 'Heilung', 'Traumabewältigung']
  },
  
  // Suizidprävention - Hände mit Sonnen-Emoji
  'https://m.media-amazon.com/images/I/71ta7WfuuoL.jpg': {
    title: 'Suizidprävention: Basics',
    keywords: ['Suizidprävention', 'Hände', 'Sonne', 'Emoji', 'Tagebuch']
  },
  
  // Dankbarkeit im Alltag - The Battle Within Cover (temporär)
  'https://m.media-amazon.com/images/I/81S1MQ4bhkL.jpg': {
    title: 'Dankbarkeit im Alltag: Ein interaktives Tagebuch',
    keywords: ['Dankbarkeit', 'Tagebuch', 'Zufriedenheit', 'Lebensfreude']
  },
  
  // Selbstsabotage - Dunkles Cover mit Gehirn/Neuronen
  'https://m.media-amazon.com/images/I/81cZff5qtCL.jpg': {
    title: 'Selbstsabotage überwinden: Entfessle dein wahres Potenzial',
    keywords: ['Selbstsabotage', 'Potenzial', 'Gehirn', 'Neuronen', 'dunkel']
  },
  
  // Emotionale Intelligenz - Blaue Figuren mit Licht
  'https://m.media-amazon.com/images/I/61Y+6IwoGDL.jpg': {
    title: 'Emotionale Intelligenz und Leadership: Wie Sie Ihre Stärken optimal nutzen',
    keywords: ['Emotionale Intelligenz', 'Leadership', 'Stärken', 'blaue Figuren']
  },
  
  // The Battle Within - Person auf Felsgipfel
  'https://m.media-amazon.com/images/I/81S1MQ4bhkL.jpg': {
    title: 'The Battle Within: A Guide to Overcoming Inner Struggles',
    keywords: ['Battle Within', 'Felsgipfel', 'Person', 'Arme ausgebreitet']
  },
  
  // American Shadows - Dunkles Cover
  'https://m.media-amazon.com/images/I/81LKWtbbD0L.jpg': {
    title: 'American Shadows: Hecates Intervention',
    keywords: ['American Shadows', 'Hecate', 'dunkel', 'Schatten']
  },
  
  // Nanogenesis - Science Fiction Cover
  'https://m.media-amazon.com/images/I/81k1jQeXgbL.jpg': {
    title: 'Nanogenesis: The Rise of Superhumans',
    keywords: ['Nanogenesis', 'Superhumans', 'Science Fiction', 'Nanotechnologie']
  },
  
  // Self-Love Over Perfection - Rosa/Pink Cover
  'https://m.media-amazon.com/images/I/71D0-qTLOuL.jpg': {
    title: 'Self-Love Over Perfection: A Guide to Overcoming Female Narcissism',
    keywords: ['Self-Love', 'Perfection', 'Female Narcissism', 'rosa', 'pink']
  },
  
  // Der Herzschmerz-Ratgeber - Warmes Cover
  'https://m.media-amazon.com/images/I/71tNwpSTWXL.jpg': {
    title: 'Der Herzschmerz-Ratgeber: Eine Schritt-für-Schritt-Anleitung zur Heilung und zum Neuanfang',
    keywords: ['Herzschmerz', 'Ratgeber', 'Heilung', 'Neuanfang', 'warm']
  },
  
  // Gemeinsam den Weg gehen - Empathie Cover
  'https://m.media-amazon.com/images/I/61SP9kW4IhL.jpg': {
    title: 'Gemeinsam den Weg gehen: Empathie im Umgang mit psychischen Erkrankungen',
    keywords: ['Gemeinsam', 'Weg', 'Empathie', 'psychische Erkrankungen']
  },
  
  // Kosmische Matrix - Geometrische Muster
  'https://m.media-amazon.com/images/I/81SB6qaE+uL.jpg': {
    title: 'Kosmische Matrix: Heilige Geometrie zum Ausmalen',
    keywords: ['Kosmische Matrix', 'Heilige Geometrie', 'Ausmalen', 'geometrisch']
  },
  
  // Malen gegen den Schmerz - Therapeutisches Cover
  'https://m.media-amazon.com/images/I/81cZff5qtCL.jpg': {
    title: 'Malen gegen den Schmerz: Dein Weg zur Heilung',
    keywords: ['Malen', 'Schmerz', 'Heilung', 'Traumabewältigung', 'therapeutisch']
  }
};

// Hilfsfunktion: Titel aus Cover-URL erkennen
function recognizeTitleFromCover(coverUrl) {
  const mapping = COVER_TITLE_MAPPING[coverUrl];
  if (mapping) {
    return {
      title: mapping.title,
      confidence: 'high',
      keywords: mapping.keywords
    };
  }
  
  // Fallback: Versuche Titel aus URL zu extrahieren
  const urlParts = coverUrl.split('/');
  const filename = urlParts[urlParts.length - 1];
  
  return {
    title: 'Unbekanntes Cover',
    confidence: 'low',
    filename: filename,
    url: coverUrl
  };
}

// Hauptfunktion: Bücher mit Cover-Titel-Mapping aktualisieren
function updateBooksWithCoverTitles() {
  try {
    const books = JSON.parse(fs.readFileSync(BOOKS_PATH, 'utf-8'));
    const updatedBooks = [];
    const unrecognizedCovers = [];
    
    console.log('🔍 Analysiere Buchcover...\n');
    
    books.forEach((book, index) => {
      const coverUrl = book.image?.link;
      const currentTitle = book.title?.de || book.title || 'Unbekannt';
      
      if (coverUrl) {
        const recognition = recognizeTitleFromCover(coverUrl);
        
        if (recognition.confidence === 'high') {
          console.log(`✅ Buch ${index + 1}: "${currentTitle.substring(0, 40)}..."`);
          console.log(`   Cover erkannt: "${recognition.title}"`);
          console.log(`   Keywords: ${recognition.keywords.join(', ')}`);
          
          // Prüfe, ob Titel übereinstimmt
          const titleMatches = recognition.keywords.some(keyword => 
            currentTitle.toLowerCase().includes(keyword.toLowerCase())
          );
          
          if (titleMatches) {
            console.log(`   ✅ Titel stimmt überein`);
          } else {
            console.log(`   ⚠️  Titel stimmt NICHT überein - möglicher Fehler!`);
          }
        } else {
          console.log(`❓ Buch ${index + 1}: "${currentTitle.substring(0, 40)}..."`);
          console.log(`   Cover nicht erkannt: ${recognition.filename}`);
          unrecognizedCovers.push({
            book: currentTitle,
            cover: coverUrl,
            filename: recognition.filename
          });
        }
      } else {
        console.log(`❌ Buch ${index + 1}: "${currentTitle.substring(0, 40)}..." - Kein Cover`);
      }
      
      console.log('---');
      updatedBooks.push(book);
    });
    
    // Bericht über nicht erkannte Covers
    if (unrecognizedCovers.length > 0) {
      console.log('\n📋 Nicht erkannte Covers:');
      unrecognizedCovers.forEach((item, index) => {
        console.log(`${index + 1}. "${item.book}"`);
        console.log(`   Cover: ${item.cover}`);
        console.log(`   Datei: ${item.filename}`);
      });
      
      // Erstelle Mapping-Vorschläge
      console.log('\n💡 Mapping-Vorschläge für COVER_TITLE_MAPPING:');
      unrecognizedCovers.forEach((item, index) => {
        console.log(`'${item.cover}': {`);
        console.log(`  title: '${item.book}',`);
        console.log(`  keywords: ['${item.book.split(' ').slice(0, 3).join("', '")}']`);
        console.log(`},`);
      });
    }
    
    console.log(`\n✅ Analyse abgeschlossen: ${books.length} Bücher geprüft`);
    console.log(`   ✅ Erkannt: ${books.length - unrecognizedCovers.length}`);
    console.log(`   ❓ Nicht erkannt: ${unrecognizedCovers.length}`);
    
    return {
      books: updatedBooks,
      unrecognized: unrecognizedCovers
    };
    
  } catch (error) {
    console.error('❌ Fehler beim Lesen der books.json:', error.message);
    return null;
  }
}

// Funktion: Automatische Korrektur von Cover-Zuordnungen
function autoCorrectCoverAssignments() {
  console.log('🤖 Starte automatische Cover-Zuordnung...\n');
  
  const result = updateBooksWithCoverTitles();
  if (!result) return;
  
  // Hier könnte die automatische Korrektur implementiert werden
  console.log('\n💡 Für automatische Korrekturen:');
  console.log('1. Erweitere COVER_TITLE_MAPPING mit den nicht erkannten Covers');
  console.log('2. Implementiere Logik für automatische Titel-Korrektur');
  console.log('3. Speichere korrigierte books.json');
}

// CLI-Befehle
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'analyze':
      updateBooksWithCoverTitles();
      break;
    case 'auto-correct':
      autoCorrectCoverAssignments();
      break;
    default:
      console.log('📖 Cover-Titel-Matcher für Dirk Werner Books');
      console.log('');
      console.log('Verwendung:');
      console.log('  node cover-title-matcher.js analyze     - Analysiere alle Cover');
      console.log('  node cover-title-matcher.js auto-correct - Automatische Korrektur');
      console.log('');
      console.log('Beispiele:');
      console.log('  node cover-title-matcher.js analyze');
      break;
  }
}

module.exports = {
  recognizeTitleFromCover,
  updateBooksWithCoverTitles,
  autoCorrectCoverAssignments,
  COVER_TITLE_MAPPING
}; 