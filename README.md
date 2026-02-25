# Rezeptplaner_DHBW_HDH

## Voraussetzungen
* Node.js installiert
* MongoDB Cluster (z.B. MongoDB Atlas) oder lokale Instanz???

## Installation & Start

1. Repository klonen:
   `git clone https://github.com/mwilke375/Rezeptplaner_DHBW_HDH.git`

2. In das Verzeichnis wechseln:
   `cd Rezeptplaner_DHBW_HDH`????????

3. Abhängigkeiten installieren:
   `npm install`

4. Umgebungsvariablen einrichten:
   Erstelle eine Datei namens `.env` im Hauptverzeichnis und füge folgenden Inhalt ein:
   `MONGO_URI=dein_mongodb_connection_string`
   `PORT=3000`?????

5. Server starten:
   `node server.js`

   ## Testen der API

Da dieses Projekt als reine REST-Schnittstelle (API) ohne Frontend umgesetzt wurde, empfehlen wir für den Test das Tool **Thunder Client** (VS Code Erweiterung).

### Beispiel-Routen:

**1. Neues Rezept anlegen (POST)**
* URL: `http://localhost:3000/api/recipes`
* Body (JSON):
{
  "title": "Smoked Pulled Pork",
  "creatorId": "user123",
  "ingredients": [
    { "name": "Schweineschulter", "amount": 2.5, "unit": "kg" }
  ],
  "steps": ["Fleisch mit Rub einreiben."],
  "flexibleAttributes": {
    "grill_temp_celsius": 110
  }
}

**2. Alle Rezepte abrufen (GET)**
* URL: `http://localhost:3000/api/recipes`


vorgefertigte rollen bei scharle oder erstellt er selber
Aufgstellung nochmal durchschauen
MONGO download dafür????