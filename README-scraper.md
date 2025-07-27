# 🕷️ Apple Books Audiobook Scraper

Automatisches Crawling der Apple Books-Seite für Dirk Werner's Website, um die Audiobook-Whitelist aktuell zu halten.

## 🚀 Features

- **Automatisches Crawling** der Apple Books Author-Seite
- **Apple ID Extraktion** aus den Buch-Links
- **Vergleich mit bestehender Whitelist** für Änderungsdetektion
- **Automatische Backup-Erstellung** vor Updates
- **Scheduler-System** für regelmäßige Updates
- **Detailliertes Logging** aller Aktivitäten

## 📋 Voraussetzungen

- Node.js (Version 14 oder höher)
- npm oder yarn
- Internetverbindung für Apple Books-Zugriff

## 🛠️ Installation

1. **Dependencies installieren:**
```bash
npm install
```

2. **Erste Ausführung testen:**
```bash
npm run scrape
```

## 📖 Verwendung

### Einmaliges Crawling
```bash
# Manuelles Crawling
npm run scrape

# Oder direkt
node appleBooksScraper.js
```

### Automatisierter Scheduler
```bash
# Scheduler starten (täglich um 6:00 Uhr, wöchentlich am Sonntag um 8:00 Uhr)
node scheduler.js

# Test-Modus (jede Minute für Entwicklung)
node scheduler.js --test

# Sofortiges Crawling
node scheduler.js --run-now
```

### CLI-Optionen

| Option | Beschreibung |
|--------|-------------|
| `--test`, `-t` | Test-Modus: Crawling jede Minute |
| `--run-now`, `-r` | Sofortiges Crawling und Beenden |

## 📁 Ausgabedateien

### Generierte Dateien
- `audiobooks_on_apple_by_dirkwerner_updated.js` - Neue Whitelist
- `scraper-logs.txt` - Log-Datei mit allen Aktivitäten
- `audiobooks_backup_YYYY-MM-DD.js` - Backup der alten Whitelist

### Dateistruktur
```
├── appleBooksScraper.js      # Haupt-Scraper
├── scheduler.js              # Automatisierter Scheduler
├── package.json              # Dependencies
├── audiobooks_on_apple_by_dirkwerner.js          # Aktuelle Whitelist
├── audiobooks_on_apple_by_dirkwerner_updated.js  # Neue Whitelist
├── scraper-logs.txt          # Log-Datei
└── audiobooks_backup_*.js    # Backup-Dateien
```

## ⚙️ Konfiguration

### Scheduler-Zeiten anpassen
In `scheduler.js` können Sie die Crawling-Zeiten ändern:

```javascript
const CONFIG = {
    // Tägliches Crawling um 6:00 Uhr
    dailySchedule: '0 6 * * *',
    
    // Wöchentliches Crawling am Sonntag um 8:00 Uhr
    weeklySchedule: '0 8 * * 0',
    
    // Test-Schedule (jede Minute)
    testSchedule: '* * * * *'
};
```

### Cron-Syntax
```
┌───────────── Minute (0-59)
│ ┌─────────── Stunde (0-23)
│ │ ┌───────── Tag des Monats (1-31)
│ │ │ ┌─────── Monat (1-12)
│ │ │ │ ┌───── Wochentag (0-7, 0 und 7 = Sonntag)
│ │ │ │ │
* * * * *
```

## 🔍 Debugging

### Log-Datei prüfen
```bash
# Letzte 50 Zeilen der Log-Datei anzeigen
tail -50 scraper-logs.txt

# Log-Datei in Echtzeit verfolgen
tail -f scraper-logs.txt
```

### Manuelle Tests
```bash
# Test-Crawling mit detaillierter Ausgabe
node appleBooksScraper.js

# Scheduler im Test-Modus
node scheduler.js --test
```

## 🚨 Fehlerbehebung

### Häufige Probleme

1. **"ECONNREFUSED" oder "ETIMEDOUT"**
   - Internetverbindung prüfen
   - Apple Books-Seite manuell aufrufen
   - Proxy-Einstellungen prüfen

2. **"Keine Audiobooks gefunden"**
   - HTML-Struktur der Apple Books-Seite hat sich geändert
   - Selektoren in `appleBooksScraper.js` anpassen

3. **"Permission denied"**
   - Schreibrechte im Verzeichnis prüfen
   - Datei-Pfade überprüfen

### Selektoren anpassen
Falls die Apple Books-Seite ihre HTML-Struktur ändert, passen Sie die Selektoren in `appleBooksScraper.js` an:

```javascript
const selectors = [
    '.product-name',           // Standard Apple Books
    '.section__title',         // Alternative
    'h2',                      // Überschriften
    'h3',                      // Unterüberschriften
    '.book-title',             // Buch-Titel
    '[data-testid="product-name"]', // Test-IDs
    '.product__title',         // Produkt-Titel
    '.audiobook-title'         // Audiobook-spezifisch
];
```

## 🔄 Integration in Website

### Automatische Updates
1. Scheduler auf Server starten
2. Neue Whitelist wird automatisch generiert
3. Website lädt aktualisierte Whitelist

### Manuelle Updates
1. Scraper ausführen
2. Neue Whitelist prüfen
3. Manuell in Website integrieren

## 📊 Monitoring

### Log-Analyse
```bash
# Erfolgreiche Crawlings zählen
grep "Crawling erfolgreich" scraper-logs.txt | wc -l

# Fehler in den letzten 24 Stunden
grep "$(date -d '1 day ago' +%Y-%m-%d)" scraper-logs.txt | grep "Fehler"
```

### Status-Check
```bash
# Letztes Update prüfen
grep "Whitelist aktualisiert" scraper-logs.txt | tail -1

# Anzahl gefundener Audiobooks
grep "Audiobooks gefunden" scraper-logs.txt | tail -1
```

## 🤝 Beitragen

### Entwicklung
1. Fork erstellen
2. Feature-Branch erstellen
3. Änderungen testen
4. Pull Request einreichen

### Bug Reports
- Log-Datei beifügen
- Schritte zur Reproduktion beschreiben
- Erwartetes vs. tatsächliches Verhalten

## 📄 Lizenz

MIT License - siehe LICENSE-Datei für Details.

## 🆘 Support

Bei Problemen oder Fragen:
1. Log-Datei prüfen
2. Debug-Modus aktivieren
3. Issue auf GitHub erstellen

---

**Entwickelt für Dirk Werner's Buchwebsite** 📚 