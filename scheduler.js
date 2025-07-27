// ⏰ Automatisierter Apple Books Scraper Scheduler
// Führt den Scraper regelmäßig aus und aktualisiert die Whitelist

const cron = require('node-cron');
const { fetchAudiobooks, generateWhitelistFile, compareWithExistingWhitelist } = require('./appleBooksScraper.js');
const fs = require('fs').promises;

// Konfiguration
const CONFIG = {
    // Tägliches Crawling um 6:00 Uhr
    dailySchedule: '0 6 * * *',
    
    // Wöchentliches Crawling am Sonntag um 8:00 Uhr
    weeklySchedule: '0 8 * * 0',
    
    // Test-Schedule (jede Minute für Entwicklung)
    testSchedule: '* * * * *',
    
    // Log-Datei
    logFile: 'scraper-logs.txt'
};

// Logging-Funktion
async function logMessage(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    
    console.log(logEntry.trim());
    
    try {
        await fs.appendFile(CONFIG.logFile, logEntry);
    } catch (error) {
        console.error('❌ [Scheduler] Fehler beim Logging:', error.message);
    }
}

// Hauptfunktion für das Crawling
async function runScheduledScraping() {
    await logMessage('🚀 [Scheduler] Geplantes Crawling gestartet');
    
    try {
        const audiobooks = await fetchAudiobooks();
        
        if (audiobooks.length > 0) {
            await compareWithExistingWhitelist(audiobooks);
            const success = await generateWhitelistFile(audiobooks);
            
            if (success) {
                await logMessage(`✅ [Scheduler] Crawling erfolgreich - ${audiobooks.length} Audiobooks gefunden`);
                
                // Optional: Backup der alten Whitelist erstellen
                try {
                    const backupName = `audiobooks_backup_${new Date().toISOString().split('T')[0]}.js`;
                    await fs.copyFile('audiobooks_on_apple_by_dirkwerner.js', backupName);
                    await logMessage(`💾 [Scheduler] Backup erstellt: ${backupName}`);
                } catch (backupError) {
                    await logMessage(`⚠️ [Scheduler] Backup fehlgeschlagen: ${backupError.message}`);
                }
                
                // Optional: Neue Whitelist als aktuelle Datei verwenden
                try {
                    await fs.copyFile('audiobooks_on_apple_by_dirkwerner_updated.js', 'audiobooks_on_apple_by_dirkwerner.js');
                    await logMessage('🔄 [Scheduler] Whitelist aktualisiert');
                } catch (updateError) {
                    await logMessage(`⚠️ [Scheduler] Whitelist-Update fehlgeschlagen: ${updateError.message}`);
                }
                
            } else {
                await logMessage('❌ [Scheduler] Whitelist-Generierung fehlgeschlagen');
            }
        } else {
            await logMessage('❌ [Scheduler] Keine Audiobooks gefunden');
        }
        
    } catch (error) {
        await logMessage(`❌ [Scheduler] Crawling-Fehler: ${error.message}`);
    }
    
    await logMessage('🏁 [Scheduler] Geplantes Crawling beendet');
}

// Scheduler-Initialisierung
function initializeScheduler() {
    console.log('⏰ [Scheduler] Initialisiere Apple Books Scraper Scheduler...');
    
    // Tägliches Crawling
    cron.schedule(CONFIG.dailySchedule, async () => {
        await logMessage('📅 [Scheduler] Tägliches Crawling gestartet');
        await runScheduledScraping();
    }, {
        scheduled: true,
        timezone: "Europe/Berlin"
    });
    
    // Wöchentliches Crawling
    cron.schedule(CONFIG.weeklySchedule, async () => {
        await logMessage('📅 [Scheduler] Wöchentliches Crawling gestartet');
        await runScheduledScraping();
    }, {
        scheduled: true,
        timezone: "Europe/Berlin"
    });
    
    console.log('✅ [Scheduler] Scheduler initialisiert');
    console.log(`📅 [Scheduler] Tägliches Crawling: ${CONFIG.dailySchedule}`);
    console.log(`📅 [Scheduler] Wöchentliches Crawling: ${CONFIG.weeklySchedule}`);
    console.log(`📝 [Scheduler] Logs werden in ${CONFIG.logFile} gespeichert`);
}

// Test-Modus (für Entwicklung)
function startTestMode() {
    console.log('🧪 [Scheduler] Test-Modus aktiviert - Crawling jede Minute');
    
    cron.schedule(CONFIG.testSchedule, async () => {
        await logMessage('🧪 [Scheduler] Test-Crawling gestartet');
        await runScheduledScraping();
    });
}

// CLI-Argumente verarbeiten
const args = process.argv.slice(2);

if (args.includes('--test') || args.includes('-t')) {
    startTestMode();
} else if (args.includes('--run-now') || args.includes('-r')) {
    console.log('🚀 [Scheduler] Sofortiges Crawling gestartet');
    runScheduledScraping().then(() => {
        console.log('✅ [Scheduler] Sofortiges Crawling beendet');
        process.exit(0);
    }).catch(error => {
        console.error('❌ [Scheduler] Fehler beim sofortigen Crawling:', error);
        process.exit(1);
    });
} else {
    initializeScheduler();
    
    // Keep the process running
    console.log('⏰ [Scheduler] Scheduler läuft... Drücke Ctrl+C zum Beenden');
    
    process.on('SIGINT', () => {
        console.log('\n🛑 [Scheduler] Scheduler wird beendet...');
        process.exit(0);
    });
}

module.exports = { runScheduledScraping, initializeScheduler }; 