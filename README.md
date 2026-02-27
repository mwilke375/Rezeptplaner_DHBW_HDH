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

  ### Bestehende Rezepte bearbeiten (US02)

Rezept-Creator und Administratoren können bestehende Rezepte im Nachhinein anpassen und verbessern. Die API stellt sicher, dass das spezifische Dokument in der Datenbank aktualisiert wird, ohne dass sich dessen eindeutige ID (`_id`) ändert. Die Berechtigung wird vor der Änderung geprüft.

* **Methode:** `PUT`
* **URL:** `http://localhost:3000/api/recipes/{REZEPT_ID}`
* **Body (JSON):**
{
  "userId": "ID_DES_ERSTELLERS_ODER_ADMINS",
  "title": "Neuer verbesserter Titel",
  "prepTime": 30
}
* **Erwartetes Ergebnis:** * Status 200 und das aktualisierte Rezept-Dokument (mit identischer `_id`), wenn die Berechtigung vorliegt.
  * Status 403 ("Zugriff verweigert"), wenn ein normaler Nutzer oder ein fremder Creator versucht, das Rezept zu bearbeiten.

### Flexible Felder anlegen (US03)

Um die Vorteile der NoSQL-Datenbank MongoDB optimal zu nutzen, wurde das Rezept-Schema flexibel gestaltet (`strict: false` in Mongoose). Rezept-Creator können dadurch jederzeit völlig neue Datenfelder (wie z. B. "Rauchtemperatur" oder "Backzeit") anlegen, ohne dass dafür die Tabellenstruktur (Schema) der Datenbank angepasst werden muss. 

Die Flexibilität greift bei zwei verschiedenen HTTP-Methoden:
* **`POST` (Neues Rezept):** Wird verwendet, wenn ein Rezept *neu angelegt* wird und direkt bei der Erstellung individuelle Zusatzfelder enthalten soll (URL: `http://localhost:3000/api/recipes`).
* **`PUT` (Bestehendes Rezept):** Wird verwendet, wenn ein bereits *in der Datenbank existierendes* Rezept im Nachhinein um neue, bisher nicht vorhandene Felder erweitert wird (URL: `http://localhost:3000/api/recipes/{REZEPT_ID}`).

* **Beispiel Body für PUT (Ergänzung eines bestehenden Rezepts):**
{
  "userId": "ID_DES_ERSTELLERS",
  "backzeit": "12-15 Minuten bei 250 Grad",
  "ofenEinstellung": "Ober-/Unterhitze"
}
* **Erwartetes Ergebnis:** Status 201 (Created bei POST) oder 200 (OK bei PUT). Die Datenbank akzeptiert die neuen, unbekannten Attribute ohne Schema-Fehlermeldung und speichert sie fehlerfrei im Rezept-Dokument ab[cite: 42].

  ### Eigene Rezepte löschen (US04)

Rezept-Creator haben die volle Kontrolle über ihre eigenen Inhalte und können diese unwiderruflich aus der Datenbank entfernen. Das System prüft dabei, ob die anfragende `userId` mit der im Rezept hinterlegten `creatorId` übereinstimmt.

* **Methode:** `DELETE`
* **URL:** `http://localhost:3000/api/recipes/{REZEPT_ID}`
* **Body (JSON):**
{
  "userId": "ID_DES_ERSTELLERS"
}
* **Erwartetes Ergebnis:** * Status 200 ("Rezept erfolgreich gelöscht"), wenn der Nutzer der Eigentümer ist.
  * Status 403 ("Zugriff verweigert"), wenn ein anderer Nutzer (ohne Admin-Rechte) versucht, das Rezept zu löschen.

  ### Nach Rezepten suchen (US09)

Nutzer können die Rezeptdatenbank gezielt nach Begriffen im Titel durchsuchen. Die Suche ist fehlertolerant bezüglich Groß- und Kleinschreibung (case-insensitive) und findet auch Teilbegriffe innerhalb eines Titels.

* **Methode:** `GET`
* **URL:** `http://localhost:3000/api/recipes?search={SUCHBEGRIFF}`
* **Beispiel:** `http://localhost:3000/api/recipes?search=pizza`
* **Erwartetes Ergebnis:** Status 200 und eine JSON-Liste (Array), die nur jene Rezepte enthält, in deren Titel der Suchbegriff vorkommt. Ist der Suchparameter leer oder nicht vorhanden, werden alle Rezepte ausgegeben.

### Filtern nach Kategorien/Tags (US10)

Nutzer können Rezepte nach bestimmten Kategorien (Tags) filtern. Die API durchsucht hierfür die Array-Struktur der NoSQL-Datenbank. Die Suche ist dabei fehlertolerant bezüglich Groß- und Kleinschreibung (case-insensitive). Es ist zudem möglich, nach mehreren Tags gleichzeitig zu filtern, indem diese mit einem Komma getrennt werden.

* **Methode:** `GET`
* **URL:** `http://localhost:3000/api/recipes?tags={TAG_NAME}`
* **Beispiele:** * Einzelner Tag: `http://localhost:3000/api/recipes?tags=vegetarisch`
  * Mehrere Tags: `http://localhost:3000/api/recipes?tags=vegetarisch,scharf`
* **Erwartetes Ergebnis:** Status 200 und eine JSON-Liste der Rezepte, die die übergebenen Tags (unabhängig von der genauen Schreibweise) in ihrem `tags`-Array enthalten.

### Suchergebnisse sortieren (US11)

Nutzer können die angezeigten Rezepte sortieren, um einen besseren Überblick zu erhalten. Wenn nach der Zubereitungszeit sortiert wird, erscheinen die Rezepte mit der kürzesten Zeit zuerst (aufsteigend)[cite: 44]. Die API nutzt hierfür das numerische Feld `prepTime` (Angabe in Minuten). Um das Ergebnis nicht durch Null-Werte zu verfälschen, werden bei aktiver Sortierung automatisch alle Dokumente ausgeblendet, bei denen das Feld `prepTime` fehlt.

* **Methode:** `GET`
* **URL:** `http://localhost:3000/api/recipes?sort=zeit`
* **Beispiel (Kombination aus Tag-Filter und Sortierung):** `http://localhost:3000/api/recipes?tags=Vegetarisch&sort=zeit`
* **Erwartetes Ergebnis:** Status 200 und eine JSON-Liste der Rezepte. Ein Salat (`prepTime`: 10) wird vor einem Auflauf (`prepTime`: 45) gelistet. Rezepte ohne `prepTime` werden im Suchergebnis ignoriert.

### Rezepte nach Zutaten ausschließen / Allergiefilter (US12)

Um die Sicherheit für Nutzer mit Allergien oder Unverträglichkeiten zu gewährleisten, können Rezepte basierend auf ihren Zutaten ausgeschlossen werden. Die API durchsucht hierfür tiefgreifend das verschachtelte `ingredients`-Array. Die Filterung erfolgt case-insensitive und greift auch bei Teilwörtern (z.B. filtert "Nuss" auch "Walnuss" heraus). Es können mehrere Zutaten kommasepariert übergeben werden.

* **Methode:** `GET`
* **URL:** `http://localhost:3000/api/recipes?exclude={ZUTAT}`
* **Beispiel (Kombination aus Suche und Ausschluss):** `http://localhost:3000/api/recipes?search=kuchen&exclude=nüsse,milch`
* **Erwartetes Ergebnis:** Status 200 und eine JSON-Liste der Rezepte. Jedes Rezept, das mindestens eine der ausgeschlossenen Zutaten im Feld `ingredients.name` enthält, wird serverseitig aus der Ergebnisliste entfernt.

### Zutatenmengen dynamisch umrechnen (US13)

Nutzer können die Zutatenmengen eines Rezepts dynamisch an eine gewünschte Portionenzahl anpassen, um den Kochalltag zu erleichtern. Hierfür wurde eine dedizierte Einzelabruf-Route (`GET /:id`) implementiert. Wenn der Parameter `?portions=` übergeben wird, berechnet die API serverseitig den Umrechnungsfaktor basierend auf dem Ursprungswert (`portions`) des Rezepts und passt die Mengen (`amount`) im `ingredients`-Array für die Rückgabe an. Das Originaldokument in der Datenbank bleibt dabei unverändert.

### Persönliche Favoriten markieren (US14)

Nutzer können Rezepte als Favoriten markieren, um schnelleren Zugriff darauf zu haben. Da es sich um eine reine Backend-Anwendung handelt, wird der Klick auf ein "Herz-Icon" im Frontend durch einen POST-Request an die Nutzer-Route simuliert. Die Rezept-ID wird daraufhin dauerhaft in einem Array (`favorites`) im Profil-Dokument des jeweiligen Nutzers gespeichert.

* **Methode:** `POST`
* **URL:** `http://localhost:3000/api/users/favorites`
* **Body (JSON):**
{
  "userId": "ID_DES_NUTZERS",
  "recipeId": "ID_DES_REZEPTS"
}
* **Erwartetes Ergebnis:** Status 200 (OK). Die ID des Rezepts wird in das `favorites`-Array des Nutzers eingefügt. Befindet sich das Rezept bereits in der Liste, wird dies erkannt und eine Duplizierung verhindert.

* **Methode:** `GET`
* **URL:** `http://localhost:3000/api/recipes/{REZEPT_ID}?portions={WUNSCH_ANZAHL}`
* **Beispiel:** `http://localhost:3000/api/recipes/699f474269fdc5298b6592bf?portions=2`
* **Erwartetes Ergebnis:** Status 200 und das Rezept-Dokument als JSON. Ist das Rezept regulär für 4 Portionen ausgelegt, werden durch den Parameter `?portions=2` alle Mengen in der Ausgabe halbiert.

  ### Rezepte durch Admin löschen (US19)

Um die Plattform moderieren zu können, besitzt der Administrator das Recht, jedes beliebige Rezept zu löschen, unabhängig davon, wer es erstellt hat. Dies dient der Entfernung unpassender Inhalte.

* **Methode:** `DELETE`
* **URL:** `http://localhost:3000/api/recipes/{REZEPT_ID}`
* **Body (JSON):**
{
  "userId": "ID_DES_ADMINS"
}
* **Erwartetes Ergebnis:** * Status 200 ("Rezept erfolgreich gelöscht"), da die Rolle `admin` jegliche Eigentümer-Prüfung überschreibt.
  * Status 403 ("Zugriff verweigert"), falls die ID nicht zu einem Admin-Konto gehört.

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