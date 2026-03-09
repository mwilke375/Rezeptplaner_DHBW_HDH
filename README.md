# Rezeptplaner_DHBW_HDH

## Voraussetzungen
* Node.js installiert
* MongoDB Cluster --> wir empfhelen MongoDB Atlas

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

6. Inhalt der DB:
Unsere DB enthält für Tests schon folgende Inhalte:
Unter Userstories.md finden sie (falls benötigt) eine Beschreibung/ Erklärung zu den einzelnen Userstories. 