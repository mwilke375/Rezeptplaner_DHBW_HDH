# Rezeptplaner_DHBW_HDH

## Voraussetzungen
* Node.js installiert
* MongoDB Cluster --> wir empfehlen MongoDB Atlas

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

5. Thunder Client installieren (VSC Erweiterung)
Klicke auf Extensions und suche Thunder Client, dann auf install

6. Server starten:
   `node server.js`