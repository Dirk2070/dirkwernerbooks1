# 📖 Cover-Titel-Matcher für Dirk Werner Books

**Automatische Cover-Zuordnung und Qualitätskontrolle für Buchcover**

## 🚀 Features

- **Automatische Cover-Zuordnung** basierend auf Buchtitel
- **Titel-Normalisierung** für robuste Vergleiche
- **Vollständiges Mapping** für alle 28 Bücher
- **CI/CD Integration** mit GitHub Actions
- **Detailliertes Logging** für Qualitätskontrolle
- **Automatische Korrekturen** mit Backup-Funktion

## 📋 Verwendung

### Grundlegende Befehle

```bash
# Analyse aller Cover
node cover-title-matcher.js analyze

# Automatische Korrektur
node cover-title-matcher.js auto-correct

# Logging für CI/CD
node cover-title-matcher.js log
```

### Logging in Datei

```bash
# Logging mit Timestamp und Commit-Hash
node cover-title-matcher.js log >> logs/cover-fixes.log

# Für Husky Pre-commit Hook
node cover-title-matcher.js log
```

## 🔧 CI/CD Integration

### GitHub Actions

Das Repository enthält eine automatische Cover-Validierung:

- **Trigger:** Bei jedem Push und Pull Request
- **Validierung:** Automatische Prüfung aller Cover-Zuordnungen
- **Logging:** Detaillierte Berichte als GitHub Artifacts
- **PR-Kommentare:** Automatische Kommentare mit Validierungsergebnissen

### Husky Pre-commit Hook

```bash
# Installation
npm install --save-dev husky
npx husky init

# Pre-commit Hook erstellen
echo "node cover-title-matcher.js log" > .husky/pre-commit
chmod +x .husky/pre-commit
```

## 📊 Logging-Format

### Standard-Output

```
🕐 2025-07-28T02:18:22.998Z | Commit: 309ff36
🔍 Starte Cover-Analyse...
❌ ISSUE: "Buchtitel..." | Cover: 81k1jQeXgbL.jpg
✅ FIXED: "Buchtitel..." | New Cover: 71D0-qTLOuL.jpg
📊 SUMMARY: 4 issues found, 2 corrections made
🚨 CI/CD: 2 cover issues detected - consider fixing before deployment
```

### Exit Codes

- **0:** Alle Cover korrekt zugeordnet
- **1:** Kritische Fehler (zu viele Probleme)
- **0:** Warnungen (wenige Probleme, aber nicht kritisch)

## 🗂️ Dateistruktur

```
├── cover-title-matcher.js          # Hauptskript
├── .github/workflows/
│   └── cover-validation.yml        # GitHub Actions
├── logs/
│   └── cover-fixes.log             # Log-Dateien
├── .husky/
│   └── pre-commit                  # Git Hook
└── README-cover-matcher.md         # Diese Dokumentation
```

## 🔍 Mapping-System

### Titel-Normalisierung

```javascript
function normalizeTitle(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')   // Sonderzeichen entfernen
    .replace(/\s+/g, ' ')       // Mehrfache Leerzeichen
    .trim();
}
```

### Cover-Mapping

```javascript
const COVER_TITLE_MAPPING = {
  'https://m.media-amazon.com/images/I/71ta7WfuuoL.jpg': {
    title: '101 goldene Regeln für eine harmonische Paar-Beziehung',
    keywords: ['101 goldene', 'Paar-Beziehung', 'harmonische']
  },
  // ... weitere Mappings
};
```

## 🛠️ Entwicklung

### Neue Cover hinzufügen

1. **Cover-URL** in `COVER_TITLE_MAPPING` eintragen
2. **Titel** und **Keywords** definieren
3. **Testen** mit `node cover-title-matcher.js analyze`

### Mapping erweitern

```javascript
'https://m.media-amazon.com/images/I/NEW_COVER_ID.jpg': {
  title: 'Neuer Buchtitel',
  keywords: ['keyword1', 'keyword2', 'keyword3']
},
```

## 📈 Monitoring

### Log-Analyse

```bash
# Alle Logs anzeigen
cat logs/cover-fixes.log

# Letzte 10 Einträge
tail -10 logs/cover-fixes.log

# Fehler filtern
grep "❌ ISSUE" logs/cover-fixes.log
```

### GitHub Actions Dashboard

- **Actions Tab:** Alle Validierungsläufe
- **Artifacts:** Download der Log-Dateien
- **PR-Kommentare:** Automatische Berichte

## 🚨 Troubleshooting

### Häufige Probleme

1. **"Kein Cover gefunden"**
   - Mapping erweitern
   - Keywords anpassen

2. **"Doppelte Cover-Zuordnung"**
   - Mapping bereinigen
   - Korrekte Cover-URLs verwenden

3. **"CI/CD Fehler"**
   - Logs prüfen
   - Cover-Zuordnungen korrigieren

### Debug-Modus

```bash
# Detaillierte Ausgabe
DEBUG=true node cover-title-matcher.js analyze
```

## 📝 Changelog

### v2.0.0 - CI/CD Integration
- ✅ GitHub Actions Workflow
- ✅ Husky Pre-commit Hooks
- ✅ Detailliertes Logging
- ✅ Automatische PR-Kommentare

### v1.0.0 - Grundfunktionen
- ✅ Automatische Cover-Zuordnung
- ✅ Titel-Normalisierung
- ✅ Mapping-System
- ✅ Backup-Funktion

---

**🎯 Ziel:** Perfekte Cover-Zuordnung für alle Bücher von Dirk Werner 