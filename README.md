# Rezeptplaner_DHBW_HDH

npm init -y
npm install express mongoose dotenv

# Rezeptplaner (NoSQL Projekt)

Ein flexibler digitaler Rezeptplaner auf Basis von Node.js und MongoDB, der die Verwaltung stark variierender Rezeptstrukturen ermöglicht.

## Voraussetzungen
* Node.js installiert
* MongoDB Cluster (z.B. MongoDB Atlas) oder lokale Instanz

## Installation & Start

1. Repository klonen:
   `git clone https://github.com/mwilke375/Rezeptplaner_DHBW_HDH.git`

2. In das Verzeichnis wechseln:
   `cd Rezeptplaner_DHBW_HDH`

3. Abhängigkeiten installieren:
   `npm install`

4. Umgebungsvariablen einrichten:
   Erstelle eine Datei namens `.env` im Hauptverzeichnis und füge folgenden Inhalt ein:
   `MONGO_URI=dein_mongodb_connection_string`
   `PORT=3000`

5. Server starten:
   `node server.js`