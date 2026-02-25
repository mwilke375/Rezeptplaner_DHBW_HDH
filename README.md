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


### Rezept erstellen (US01)

Nutzer mit der Rolle `creator` oder `admin` können neue Rezepte im System anlegen. Versucht ein normaler `koch` ein Rezept zu erstellen, wird dies aus Sicherheitsgründen blockiert.

* **Voraussetzung:** Es muss vorab ein Nutzer (Creator oder Admin) registriert und dessen `_id` kopiert werden.
* **Methode:** `POST`
* **URL:** `http://localhost:3000/api/recipes`
* **Body (JSON):**
{
  "title": "Spaghetti Napoli",
  "creatorId": "HIER_DIE_ID_DES_CREATORS_EINTRAGEN",
  "ingredients": [
    { "name": "Nudeln", "amount": 500, "unit": "g" },
    { "name": "Tomatensoße", "amount": 400, "unit": "ml" }
  ],
  "steps": [
    "Nudeln kochen.",
    "Soße erwärmen und mischen."
  ],
  "tags": ["Vegetarisch", "Pasta"]
}
* **Erwartete Ergebnisse:** * Status 201 ("Created"), wenn die `creatorId` gültig ist. Das Rezept wird in der Datenbank gespeichert.
  * Status 403 ("Zugriff verweigert"), wenn die ID zu einem normalen `koch` gehört oder ungültig ist.

### Nutzer verwalten / löschen (US20 - Admin-Funktion)

Um bei Missbrauch eingreifen zu können, können Nutzerprofile unwiderruflich aus der Datenbank gelöscht werden. Aus Sicherheitsgründen ist diese Funktion autorisiert: Es muss die ID eines Administrators im Body der Anfrage mitgesendet werden, um die Rechte zu prüfen.

* **Methode:** `DELETE`
* **URL:** `http://localhost:3000/api/users/{ZIEL_NUTZER_ID_HIER_EINSETZEN}`
* **Body (JSON):**
{
  "adminId": "HIER_DIE_ID_DES_ADMINS_EINTRAGEN"
}
* **Erwartetes Ergebnis:** * Status 200 ("Nutzer erfolgreich vom Admin gelöscht"), wenn die Autorisierung erfolgreich war.
  * Status 403 ("Zugriff verweigert"), falls die mitgesendete ID keinem Admin gehört.