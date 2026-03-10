# Rezeptplaner_DHBW_HDH

### Hinweis zur Übersicht
Um die Daten übersichtlich zu visulaisieren empfhelen wir mongoDB compass

### User anlegen

* **Methode:** `POST`
* **URL:** `http://localhost:3000/api/users/register`
* **Body (JSON):**
{
  "username": "Koch1",
  "email": "koch@test.de",
  "password": "passwort123",
  "role": "koch"
}
{
  "username": "Creator1",
  "email": "creator@test.de",
  "password": "passwort123",
  "role": "creator"
}
{
  "username": "Admin1",
  "email": "admin@test.de",
  "password": "passwort123",
  "role": "admin"
}

### Rezept erstellen (US01)

Nutzer mit der Rolle `creator` oder `admin` können neue Rezepte im System anlegen. Versucht ein normaler `koch` ein Rezept zu erstellen, wird dies aus Sicherheitsgründen blockiert.

* **Voraussetzung:** Es muss vorab ein Nutzer (Creator oder Admin) registriert und dessen `_id` kopiert werden.
* **Methode:** `POST`
* **URL:** `http://localhost:3000/api/recipes`
* **Body (JSON):**
{
  "title": "Spaghetti Napoli Originale",
  "creatorId": "HIER DIE ID DES CREATORS EINTRAGEN",
  "prepTime": 25,
  "portions": 4,
  "ingredients": [
    { "name": "Spaghetti", "amount": 500, "unit": "Gramm" },
    { "name": "Tomaten", "amount": 400, "unit": "Milliliter" },
    { "name": "Knoblauch", "amount": 2, "unit": "Stück" }
  ],
  "steps": [
    "Wasser in einem großen Topf zum Kochen bringen",
    "Die Spaghetti hineingeben und kochen",
    "Währenddessen die Tomatensoße in einer Pfanne erwärmen",
    "Die Nudeln abgießen und mit der Soße vermengen"
  ],
  "tags": ["Vegetarisch", "Pasta", "Hauptspeise"]
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

### Links von Bildern direkt einbetten (US05)

In Dokumenten-basierten NoSQL-Datenbanken wie MongoDB werden zusammengehörige Daten bevorzugt in einem einzigen ("atomaren") Dokument gespeichert, anstatt sie wie in relationalen SQL-Datenbanken über externe Tabellen zu verknüpfen. Um Links (z. B. Bilder des Endprodukts) einzubetten, wurde das Rezept-Schema um das Feld `imageLink` erweitert. 

* **Methode:** `PUT` (bei bestehenden) oder `POST` (bei neuen Rezepten)
* **URL:** `http://localhost:3000/api/recipes/{REZEPT_ID}`
* **Body (JSON):**
{
  "userId": "ID_DES_ERSTELLERS",
  "imageLink": "https://link-zum-bild.de/bild.jpg"
}
* **Erwartetes Ergebnis:** Status 200. Der Link wird als String direkt in das atomare Rezept-Dokument geschrieben. Ein Join über eine separate Bild-Tabelle entfällt beim Abruf vollständig.

### Reihenfolge von Zubereitungsschritten (US06)

Die API nutzt die nativen Eigenschaften von BSON-Arrays in MongoDB, um die Reihenfolge von Zubereitungsschritten ohne zusätzlichen Aufwand (wie Sortier-Spalten in SQL) zu gewährleisten. Das Feld `steps` im Rezept-Schema ist als Array von Strings (`[String]`) definiert.

* **Methode:** `PUT`
* **URL:** `http://localhost:3000/api/recipes/{REZEPT_ID}`
* **Body (JSON):**
{
  "userId": "ID_DES_ERSTELLERS",
  "steps": ["Schritt 3", "Schritt 1", "Schritt 2"]
}
* **Erwartetes Ergebnis:** Status 200. Wird das Array der Arbeitsschritte vom Frontend in einer neuen Reihenfolge gesendet, überschreibt Mongoose das bestehende Array. Die neue Sortierung bleibt nativ im Dokument erhalten, sodass das Frontend die Daten direkt iterieren und korrekt formatiert anzeigen kann.

### Verschiedene Maßeinheiten parallel nutzen (US07)

Die API nutzt eingebettete Dokumente (Subdocuments) innerhalb eines Arrays, um Rezeptzutaten flexibel und ohne komplexe Relationen (wie in SQL-Tabellen) zu speichern. Das `ingredients`-Array im Rezept-Schema definiert `unit` als einfachen String. Dadurch können verschiedene Einheiten-Typen im selben Dokument problemlos gemischt werden.

* **Methode:** `POST` / `PUT`
* **URL:** `http://localhost:3000/api/recipes/{REZEPT_ID}`
* **Body (JSON):**
{
  "userId": "ID_DES_ERSTELLERS",
  "ingredients": [
    { "name": "Mehl", "amount": 500, "unit": "Gramm" },
    { "name": "Eier", "amount": 2, "unit": "Stück" }
  ]
}
* **Erwartetes Ergebnis:** Status 200 (OK). Die unterschiedlichen Einheiten werden als Strings an die jeweiligen Zutaten-Objekte gebunden und im atomaren Rezept-Dokument gespeichert. Es sind keine separaten Datenbank-Migrationen oder Lookup-Tabellen für neue Einheiten nötig.

### Bestehende Rezepte um neue Attribute erweitern (US08)

Einer der größten Vorteile von dokumentenbasierten NoSQL-Datenbanken (MongoDB) ist die Schema-Flexibilität. Da jedes Dokument für sich selbst steht, erfordern nachträgliche Erweiterungen von Entitäten keine systemweiten Datenbank-Migrationen (wie z. B. `ALTER TABLE` in SQL). Das Mongoose-Schema für Rezepte wurde mit der Option `{ strict: false }` konfiguriert. 

* **Methode:** `PUT`
* **URL:** `http://localhost:3000/api/recipes/{REZEPT_ID}`
* **Body (JSON):**
{
  "userId": "ID_DES_ERSTELLERS",
  "nutriScore": "A"
}
* **Erwartetes Ergebnis:** Status 200. Das neue Attribut `nutriScore` wird exklusiv dem adressierten Rezept-Dokument hinzugefügt. Alle bestehenden Rezepte in der Datenbank bleiben von dieser Änderung völlig unberührt und erfordern keine Anpassung, was fehleranfällige und zeitaufwändige Migrationen erspart.

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

### Persönliche Favoriten verwalten (US14)

Nutzer (Köche) können Rezepte als Favoriten markieren, um schnelleren Zugriff darauf zu haben. Da die Anwendung als reine Backend-API fungiert, wird der "Klick auf das Herz-Icon" im Frontend durch einen gezielten POST-Request simuliert. Das Abrufen der Favoriten nutzt die `.populate()`-Methode von Mongoose, um die gespeicherten IDs direkt in vollständige Rezept-Dokumente umzuwandeln.

**Rezept als Favorit markieren**
* **Methode:** `POST`
* **URL:** `http://localhost:3000/api/users/favorites`
* **Body (JSON):**
{
  "userId": "ID_DES_NUTZERS",
  "recipeId": "ID_DES_REZEPTS"
}
* **Erwartetes Ergebnis:** Status 200. Die Rezept-ID wird dauerhaft im Array `favorites` des Nutzer-Dokuments gespeichert. Duplikate werden serverseitig verhindert.

### Rezepte über Referenzen verknüpfen / Beilagen (US15)

Um Hauptspeisen mit passenden Beilagen zu verknüpfen, macht sich die API die NoSQL-Referenzierung zunutze. Das Rezept-Schema wurde dafür um ein Array (`sideDishes`) erweitert. 

**Schritt 1: Beilage mit Hauptspeise verknüpfen**
* **Methode:** `PUT`
* **URL:** `http://localhost:3000/api/recipes/{HAUPTSPEISEN_ID}`
* **Body (JSON):**
{
  "userId": "ID_DES_ERSTELLERS",
  "sideDishes": ["ID_DER_BEILAGE_1", "ID_DER_BEILAGE_2"]
}
* **Erwartetes Ergebnis:** Status 200. Die IDs der Beilagen werden im Hauptspeisen-Dokument gespeichert.

**Schritt 2: Hauptspeise inklusive Beilagen-Empfehlung abrufen**
* **Methode:** `GET`
* **URL:** `http://localhost:3000/api/recipes/{HAUPTSPEISEN_ID}`
* **Erwartetes Ergebnis:** Status 200. Beim Abruf der Hauptspeise löst Mongoose die IDs im Feld `sideDishes` automatisch auf. Die Beilagen-Dokumente werden direkt als fertige Empfehlung im JSON der Hauptspeise eingeblendet.

### Einkaufsliste generieren (US16)

Nutzer können eine kumulierte Einkaufsliste auf Basis mehrerer ausgewählter Rezepte generieren lassen. Die API nimmt hierfür ein Array an Rezept-IDs entgegen, ruft die entsprechenden Dokumente aus der MongoDB ab und aggregiert die darin enthaltenen Zutaten in Echtzeit. Zutaten mit identischem Namen und gleicher Maßeinheit werden zu einer einzigen Position summiert. Zur effizienten Datenverwaltung wird jede generierte Liste nach sieben Tagen durch einen Time to Live Index automatisch von der Datenbank gelöscht.

* **Methode:** `POST`
* **URL:** `http://localhost:3000/api/recipes/shopping-list`
* **Body (JSON):**
{
  "recipeIds": ["ID_1", "ID_2", "ID_3"]
}
* **Erwartetes Ergebnis:** Status 200. Ein JSON-Array, das alle extrahierten Zutaten summiert darstellt (z.B. werden "200g Mehl" und "300g Mehl" aus zwei verschiedenen Rezepten sauber zu "500g Mehl" zusammengefasst), sowie der Zeitstempel für die Löschung nach sieben Tagen.

### Authentifizierung & Persönlicher Bereich (US17)

Um auf persönliche Daten zugreifen zu können, können sich Nutzer über die API authentifizieren. Im Backend wird die Anmeldung über einen POST-Request abgewickelt, der die Zugangsdaten mit der MongoDB abgleicht. Um das Akzeptanzkriterium (Zugriff auf Favoriten & eigene Rezepte) vollständig abzubilden, führt die Login-Route zwei wichtige Datenbank-Operationen durch:
1. Sie löst mittels `.populate('favorites')` die gespeicherten Favoriten-IDs direkt in vollständige Rezept-Dokumente auf.
2. Sie führt zeitgleich eine Abfrage (`Recipe.find`) durch, um alle vom Nutzer erstellten Rezepte anhand seiner `_id` (`creatorId`) zu ermitteln.

* **Methode:** `POST`
* **URL:** `http://localhost:3000/api/users/login`
* **Body (JSON):**
{
  "username": "TestCreator",
  "password": "123"
}
* **Erwartetes Ergebnis:** Status 200 (OK). Die API liefert ein JSON-Objekt zurück. Dieses enthält neben der Erfolgsmeldung das komplette Nutzerprofil (inklusive der eingebetteten Favoriten im Array `favorites`) sowie das separate Array `ownRecipes` mit allen selbst erstellten Rezept-Dokumenten.

### Zentrale Dashboard-Ansicht / Navigation (US18)

Da diese Anwendung als reine Backend-API (ohne grafische Benutzeroberfläche) konzipiert ist, wird die geforderte "Dashboard-Navigation" über die Bereitstellung der entsprechenden zentralen Endpunkte erfüllt. Wenn das Frontend nach dem erfolgreichen Login das Dashboard lädt, ruft es zunächst die Profil-Route ab, um alle initialen Daten zu rendern. Die im Akzeptanzkriterium geforderten Kernfunktionen sind für das Frontend über folgende dedizierte API-Routen erreichbar:

* **Dashboard laden & Profilansicht:** `GET /api/users/{USER_ID}` (Liefert die Basisdaten, vollständig aufgelöste Favoriten und eigene Rezepte auf einen Schlag).
* **Navigation zur Suche (Filtern & Finden):**
  `GET /api/recipes` (Unterstützt Query-Parameter wie `?search=`, `?tags=` oder `?exclude=`).
* **Navigation zur Erstellung (Neues Rezept):**
  `POST /api/recipes` (Nimmt den Body des neuen Rezepts entgegen und prüft die Berechtigung anhand der übergebenen `creatorId`).

Mit diesen Endpunkten ist die funktionale Grundlage für ein vollumfängliches, navigierbares Frontend-Dashboard vollständig abgedeckt.

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