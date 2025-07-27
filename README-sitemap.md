# Sitemap Generator für Dirk Werner Books

Dieses Node.js-Skript generiert automatisch eine `sitemap.xml` aus der `books-extended.json` Datei.

## 🚀 Verwendung

### Automatische Ausführung
```bash
node generate-sitemap.js
```

### Mit npm Script
```bash
npm run generate-sitemap
```

## 📁 Ausgabe

Die Sitemap wird in `public/sitemap.xml` gespeichert und enthält:

### Hauptseiten
- `https://dirkwernerbooks.com/` (Priority: 1.0)
- `https://dirkwernerbooks.com/en/` (Priority: 0.9)
- `https://dirkwernerbooks.com/impressum.html` (Priority: 0.3)
- `https://dirkwernerbooks.com/datenschutz.html` (Priority: 0.3)

### Buchseiten
- Format: `https://dirkwernerbooks.com/buecher/<slug>`
- Priority: 0.8
- Changefreq: monthly

## 🔧 Slug-Generierung

Das Skript generiert automatisch URL-freundliche Slugs aus den Buchtiteln:

### Regeln:
- Alles in Kleinbuchstaben
- Umlaute ersetzen: ä→ae, ö→oe, ü→ue, ß→ss
- Sonderzeichen und Klammern entfernen
- Leerzeichen durch Bindestriche ersetzen
- Mehrfache Bindestriche reduzieren

### Beispiele:
- `"Verhängnisvolle Trance: Dr. Seelmanns erster Fall"` → `"verhaengnisvolle-trance-dr-seelmanns-erster-fall"`
- `"The Simulation Chronicles (English Edition)"` → `"the-simulation-chronicles-english-edition"`
- `"Umgang mit Eifersüchtigen"` → `"umgang-mit-eifersuechtigen"`

## 📊 Statistiken

Das Skript zeigt nach der Ausführung:
- ✅ Erfolgsmeldung
- 📁 Speicherort der Sitemap
- 📊 Gesamtanzahl der URLs
- 📝 Beispiel-Slugs für die ersten 3 Bücher

## 🧪 Testen

```bash
npm test
```

Testet die Slug-Generierung mit einem Beispiel-Titel.

## 📋 Voraussetzungen

- Node.js >= 14.0.0
- Datei `books-extended.json` im Projektverzeichnis

## 🔄 Automatisierung

Das Skript kann in CI/CD-Pipelines integriert werden:

```yaml
# GitHub Actions Beispiel
- name: Generate Sitemap
  run: node generate-sitemap.js
```

## 📝 Anpassungen

### Base URL ändern
In `generate-sitemap.js` Zeile 35:
```javascript
const baseUrl = 'https://dirkwernerbooks.com';
```

### Prioritäten anpassen
Die Prioritäten können in den entsprechenden Zeilen geändert werden:
- Hauptseite: `priority>1.0</priority>`
- Englische Version: `priority>0.9</priority>`
- Bücher: `priority>0.8</priority>`
- Rechtliche Seiten: `priority>0.3</priority>` 