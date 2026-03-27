# Rezeptplaner_DHBW_HDH

### Hinweise
- Um die Daten übersichtlich zu visualisieren empfehlen wir mongoDB compass
- Wir haben für die Userstories im folgenden Text Testdaten erstellt. Wenn es mehrere Daten sind, sind diese im Body durch "---" getrennt (sprich einfach jeden Body separat kopieren und über die gleiche Methode & URL anlegen). Natürlich können sie sonst auch eigene Testdaten anlegen, die von unseren Beispielen abweichen.

### Testcreator anlegen (koch, creator, admin)

* **Methode:** `POST`
* **URL:** `http://localhost:3000/api/users/register`
* **Body (JSON):**
{
  "username": "Koch1",
  "email": "koch@test.de",
  "password": "passwort123",
  "role": "koch"
}
---
{
  "username": "Creator1",
  "email": "creator@test.de",
  "password": "passwort123",
  "role": "creator"
}
---
{
  "username": "Admin1",
  "email": "admin@test.de",
  "password": "passwort123",
  "role": "admin"
}

### Rezept erstellen (US01)

Nutzer mit der Rolle `creator` oder `admin` können neue Rezepte im System anlegen. Versucht ein normaler `koch` ein Rezept zu erstellen, wird dies aus Sicherheitsgründen blockiert.
Voraussetzung: Es muss vorab ein Nutzer (Creator oder Admin) registriert und dessen `_id` kopiert werden.
* **Methode:** `POST`
* **URL:** `http://localhost:3000/api/recipes`
* **Body (JSON):**
{
  "title": "Spaghetti Napoli Originale",
  "creatorId": "HIER_DIE_ID_DES_CREATORS_EINTRAGEN",
  "prepTime": 25,
  "portions": 4,
  "ingredients": [
    { "name": "Spaghetti", "amount": 500, "unit": "Gramm" },
    { "name": "Tomaten", "amount": 400, "unit": "Gramm" },
    { "name": "Knoblauch", "amount": 2, "unit": "Stück" }
  ],
  "steps": [
    "Wasser in einem großen Topf zum Kochen bringen",
    "Die Spaghetti hineingeben und kochen",
    "Währenddessen die Tomaten in einer Pfanne erwärmen",
    "Die Nudeln abgießen und mit der Soße vermengen"
  ],
  "tags": ["Vegetarisch", "Pasta", "Hauptspeise"]
}
---
{
  "title": "Haselnuss-Pancakes",
  "creatorId": "HIER_DIE_ID_DES_CREATORS_EINTRAGEN",
  "prepTime": 15,
  "portions": 2,
  "ingredients": [
    { "name": "Mehl", "amount": 200, "unit": "Gramm" },
    { "name": "Milch", "amount": 300, "unit": "Milliliter" },
    { "name": "Haselnüsse", "amount": 50, "unit": "Gramm" }
  ],
  "steps": [
    "Trockene Zutaten mischen",
    "Milch einrühren",
    "In der Pfanne goldbraun ausbacken"
  ],
  "tags": ["Vegetarisch", "Frühstück", "Süß"]
}
---
{
  "title": "Schneller Beilagen-Salat",
  "creatorId": "HIER_DIE_ID_DES_CREATORS_EINTRAGEN",
  "prepTime": 10,
  "portions": 2,
  "ingredients": [
    { "name": "Kopfsalat", "amount": 1, "unit": "Stück" },
    { "name": "Tomaten", "amount": 200, "unit": "Gramm" },
    { "name": "Gurke", "amount": 1, "unit": "Stück" }
  ],
  "steps": [
    "Gemüse waschen und kleinschneiden",
    "Dressing anrühren",
    "Alles in einer Schüssel vermengen"
  ],
  "tags": ["Vegetarisch", "Beilage", "Salat"]
}
* **Erwartete Ergebnisse:** * Status 201 ("Created"), wenn die `creatorId` gültig ist. Das Rezept wird in der Datenbank gespeichert.
  * Status 403 ("Zugriff verweigert"), wenn die ID zu einem normalen `koch` gehört oder ungültig ist.

  ### Bestehende Rezepte bearbeiten (US02)

Rezept-Creator und Administratoren können bestehende Rezepte im Nachhinein anpassen und verbessern. Die API stellt sicher, dass das spezifische Dokument in der Datenbank aktualisiert wird, ohne dass sich dessen eindeutige ID (`_id`) ändert. Die Berechtigung wird vor der Änderung geprüft.

* **Methode:** `PUT`
* **URL:** `http://localhost:3000/api/recipes/{REZEPT_ID_SPAGHETTI}`
* **Body (JSON):**
{
  "userId": "HIER_DIE_ID_DES_CREATORS_EINTRAGEN",
  "title": "Spaghetti Napoli Originale (Verbessertes Rezept)",
  "prepTime": 30
}
* **Erwartetes Ergebnis:** * Status 200 und das aktualisierte Rezept-Dokument (mit identischer `_id`), wenn die Berechtigung vorliegt.
  * Status 403 ("Zugriff verweigert"), wenn ein normaler Nutzer oder ein fremder Creator versucht, das Rezept zu bearbeiten.

### Flexible Felder anlegen (US03)

Als ein Rezept-Creator möchte ich neue Felder anlegen können, um flexibler komplexe Rezepte anlegen zu können. Um die Vorteile der NoSQL-Datenbank MongoDB optimal zu nutzen, wurde das Rezept-Schema flexibel gestaltet (strict: false in Mongoose). Rezept-Creator können dadurch direkt bei der Erstellung völlig neue Datenfelder anlegen, ohne dass dafür die Tabellenstruktur (Schema) der Datenbank angepasst werden muss.

* **Methode:** `POST`
* **URL:** `http://localhost:3000/api/recipes`
* **Body (JSON):**
{
  "title": "Smoked Pulled Pork",
  "creatorId": "HIER_DIE_ID_DES_CREATORS_EINTRAGEN",
  "prepTime": 720,
  "portions": 8,
  "rauchtemperatur": "110 Grad Celsius",
  "holzart": "Apfelbaumholz",
  "ingredients": [
    { "name": "Schweinenacken", "amount": 2500, "unit": "Gramm" }
  ],
  "steps": [
    "Fleisch mit Rub würzen",
    "Smoker einheizen",
    "Fleisch smoken bis die Kerntemperatur stimmt"
  ]
}
* **Erwartetes Ergebnis:** Status 201 (Created bei POST). Die Datenbank akzeptiert die neuen, unbekannten Attribute ohne Schema-Fehlermeldung und speichert sie fehlerfrei im Rezept-Dokument ab.

  ### Rezepte löschen (US04)

Rezept-Creator haben die volle Kontrolle über ihre eigenen Inhalte und können diese unwiderruflich aus der Datenbank entfernen. Das System prüft dabei, ob die anfragende `userId` mit der im Rezept hinterlegten `creatorId` übereinstimmt. Admins können logischerweise auch Rezepte löschen (US19). Wir empfehlen, hierfür die ID des soeben in US03 erstellten "Smoked Pulled Pork"-Rezepts zu verwenden. So bleiben die Test-Rezepte 1 bis 3 für die nachfolgenden Such- und Filter-Funktionen in der Datenbank erhalten.

* **Methode:** `DELETE`
* **URL:** `http://localhost:3000/api/recipes/{ID_DES_PULLED_PORK_REZEPTS_EINTRAGEN}`
* **Body (JSON):**
{
  "userId": "ID_DES_CREATORS"
}
* **Erwartetes Ergebnis:** * Status 200 ("Rezept erfolgreich gelöscht"), wenn der Nutzer der Eigentümer ist.
  * Status 403 ("Zugriff verweigert"), wenn ein anderer Nutzer (ohne Admin-Rechte) versucht, das Rezept zu löschen.

### Links von Bildern direkt einbetten (US05)

In Dokumenten-basierten NoSQL-Datenbanken wie MongoDB werden zusammengehörige Daten bevorzugt in einem einzigen ("atomaren") Dokument gespeichert, anstatt sie wie in relationalen SQL-Datenbanken über externe Tabellen zu verknüpfen. Um Links (z. B. Bilder des Endprodukts) einzubetten, wurde das Rezept-Schema um das Feld `imageLink` erweitert. 

* **Methode:** `PUT` (oder `POST` bei neuen Rezepten)
* **URL:** `http://localhost:3000/api/recipes/{ID_DER_SPAGHETTI_EINTRAGEN}`
* **Body (JSON):**
{
  "userId": "HIER_DIE_ID_DES_CREATORS_EINTRAGEN",
  "imageLink": "https://www.beispiel-bild.de/spaghetti-napoli-originale.jpg"
}
* **Erwartetes Ergebnis:** Status 200. Der Link wird als String direkt in das atomare Rezept-Dokument geschrieben. Ein Join über eine separate Bild-Tabelle entfällt beim Abruf vollständig.

### Reihenfolge von Zubereitungsschritten (US06)

Die API nutzt die nativen Eigenschaften von BSON-Arrays in MongoDB, um die Reihenfolge von Zubereitungsschritten ohne zusätzlichen Aufwand (wie Sortier-Spalten in SQL) zu gewährleisten. Das Feld `steps` im Rezept-Schema ist als Array von Strings definiert. Wir verwenden hier die ID des Test-Rezepts "Haselnuss-Pancakes" und vertauschen die ersten beiden Schritte, um die einfache Neusortierung des Arrays zu demonstrieren.

* **Methode:** `PUT`
* **URL:** `http://localhost:3000/api/recipes/{ID_DER_PANCAKES_EINTRAGEN}`
* **Body (JSON):**
{
  "userId": "HIER_DIE_ID_DES_CREATORS_EINTRAGEN",
  "steps": [
    "Milch einrühren",
    "Trockene Zutaten mischen",
    "In der Pfanne goldbraun ausbacken"
  ]
}
* **Erwartetes Ergebnis:** Status 200. Wird das Array der Arbeitsschritte vom Frontend in einer neuen Reihenfolge gesendet, überschreibt Mongoose das bestehende Array. Die neue Sortierung bleibt nativ im Dokument erhalten, sodass das Frontend die Daten direkt iterieren und korrekt formatiert anzeigen kann.

### Verschiedene Maßeinheiten parallel nutzen (US07)

Die API nutzt eingebettete Dokumente (Subdocuments) innerhalb eines Arrays, um Rezeptzutaten flexibel und ohne komplexe Relationen (wie in SQL-Tabellen) zu speichern. Das `ingredients`-Array im Rezept-Schema definiert `unit` als einfachen String. Dadurch können verschiedene Einheiten-Typen im selben Dokument problemlos gemischt werden. Wir verwenden hier die ID des Test-Rezepts "Schneller Beilagen-Salat" und erweitern das Zutaten-Array um Olivenöl und Salz, um die Nutzung völlig neuer Maßeinheiten zu demonstrieren.

* **Methode:** `PUT`
* **URL:** `http://localhost:3000/api/recipes/{ID_DES_SALATS_EINTRAGEN}`
* **Body (JSON):**
{
  "userId": "HIER_DIE_ID_DES_CREATORS_EINTRAGEN",
  "ingredients": [
    { "name": "Kopfsalat", "amount": 1, "unit": "Stück" },
    { "name": "Tomaten", "amount": 200, "unit": "Gramm" },
    { "name": "Gurke", "amount": 1, "unit": "Stück" },
    { "name": "Olivenöl", "amount": 2, "unit": "Esslöffel" },
    { "name": "Salz", "amount": 1, "unit": "Prise" }
  ]
}
* **Erwartetes Ergebnis:** Status 200 (OK). Die unterschiedlichen Einheiten werden als Strings an die jeweiligen Zutaten-Objekte gebunden und im atomaren Rezept-Dokument gespeichert. Es sind keine separaten Datenbank-Migrationen oder Lookup-Tabellen für neue Einheiten nötig.

### Bestehende Rezepte um neue Attribute erweitern (US08)

Als ein Rezept-Creator möchte ich bestehende Rezepte um neue Attribute erweitern können, um nicht die komplette Datenbank migrieren zu müssen. Da jedes Dokument in MongoDB für sich selbst steht, können alte Entitäten problemlos nachträglich erweitert werden.
Voraussetzung: Ein altes Rezept ohne das Feld "Nutri-Score" existiert in der Datenbank. Wir nutzen die ID des Test-Rezepts "Haselnuss-Pancakes" (das aktuell das Feld "nutriScore" noch nicht besitzt).

* **Methode:** `PUT`
* **URL:** `http://localhost:3000/api/recipes/{ID_DER_PANCAKES_EINTRAGEN}`
* **Body (JSON):**
{
  "userId": "HIER_DIE_ID_DES_CREATORS_EINTRAGEN",
  "nutriScore": "C"
}
* **Erwartetes Ergebnis:** Status 200. Das neue Attribut `nutriScore` wird exklusiv dem adressierten Rezept-Dokument hinzugefügt. Alle bestehenden Rezepte in der Datenbank bleiben von dieser Änderung völlig unberührt und erfordern keine Anpassung, was fehleranfällige und zeitaufwändige Migrationen erspart.

  ### Nach Rezepten suchen (US09)

Nutzer können die Rezeptdatenbank gezielt nach Begriffen im Titel durchsuchen. Die Suche ist fehlertolerant bezüglich Groß- und Kleinschreibung (case-insensitive) und findet auch Teilbegriffe innerhalb eines Titels. Um direkt einen erfolgreichen Treffer in unseren Testdaten zu erzielen, suchen wir nach einem Teilbegriff unserer Hauptspeise in Kleinschreibung.

* **Methode:** `GET`
* **URL:** `http://localhost:3000/api/recipes?search=spaghetti`
* **Erwartetes Ergebnis:** Status 200 (OK) und eine JSON-Liste (Array), die exakt ein Rezept enthält: Unser "Spaghetti Napoli Originale"-Dokument. Ist der Suchparameter leer oder nicht vorhanden, werden alle Rezepte ausgegeben.

### Filtern nach Kategorien/Tags (US10)

Nutzer können Rezepte nach bestimmten Kategorien (Tags) filtern. Die API durchsucht hierfür die Array-Struktur der NoSQL-Datenbank. Die Suche ist dabei fehlertolerant bezüglich Groß- und Kleinschreibung (case-insensitive). Es ist zudem möglich, nach mehreren Tags gleichzeitig zu filtern, indem diese mit einem Komma getrennt werden. Alle drei unserer angelegten Test-Rezepte besitzen den Tag "Vegetarisch". Um die Kombination mehrerer Filter zu testen, suchen wir nach "vegetarisch" in Kombination mit "hauptspeise".

* **Methode:** `GET`
* **URL:** `http://localhost:3000/api/recipes?tags=vegetarisch,hauptspeise`
* **Erwartetes Ergebnis:** Status 200 und eine JSON-Liste der Rezepte, die die übergebenen Tags in ihrem `tags`-Array enthalten.

### Suchergebnisse sortieren (US11)

Nutzer können die angezeigten Rezepte sortieren, um einen besseren Überblick zu erhalten. Wenn nach der Zubereitungszeit sortiert wird, erscheinen die Rezepte mit der kürzesten Zeit zuerst (aufsteigend)[cite: 44]. Die API nutzt hierfür das numerische Feld `prepTime` (Angabe in Minuten). Um das Ergebnis nicht durch Null-Werte zu verfälschen, werden bei aktiver Sortierung automatisch alle Dokumente ausgeblendet, bei denen das Feld `prepTime` fehlt. 

* **Methode:** `GET`
* **URL (Kombination aus Tag-Filter und Sortierung):** `http://localhost:3000/api/recipes?tags=Vegetarisch&sort=zeit`
* **Erwartetes Ergebnis:** Status 200 (OK) und eine JSON-Liste der Rezepte. Die API liefert exakt diese aufsteigende Reihenfolge zurück:

Schneller Beilagen-Salat (prepTime: 10)

Haselnuss-Pancakes (prepTime: 15)

Spaghetti Napoli Originale (prepTime: 25)
(Rezepte ganz ohne prepTime würden im Suchergebnis serverseitig ignoriert werden).

### Rezepte nach Zutaten ausschließen / Allergiefilter (US12)

Um die Sicherheit für Nutzer mit Allergien oder Unverträglichkeiten zu gewährleisten, können Rezepte basierend auf ihren Zutaten ausgeschlossen werden. Die API durchsucht hierfür tiefgreifend das verschachtelte `ingredients`-Array. Die Filterung erfolgt case-insensitive und greift auch bei Teilwörtern (z.B. filtert "Nuss" auch "Walnuss" heraus). Es können mehrere Zutaten kommasepariert übergeben werden. Wir rufen alle vegetarischen Gerichte ab, schließen aber gezielt "nuss" und "milch" aus. Unsere "Haselnuss-Pancakes" aus den Testdaten dienen hier als perfekte Allergie-Falle.

* **Methode:** `GET`
* **URL (Kombination aus Suche und Ausschluss):** `http://localhost:3000/api/recipes?tags=vegetarisch&exclude=nuss,milch`
* **Erwartetes Ergebnis:** Status 200 und eine JSON-Liste der Rezepte. Jedes Rezept, das mindestens eine der ausgeschlossenen Zutaten im Feld `ingredients.name` enthält, wird serverseitig aus der Ergebnisliste entfernt.

### Zutatenmengen dynamisch umrechnen (US13)

Nutzer können die Zutatenmengen eines Rezepts dynamisch an eine gewünschte Portionenzahl anpassen, um den Kochalltag zu erleichtern. Hierfür wurde eine dedizierte Einzelabruf-Route (`GET /:id`) implementiert. Wenn der Parameter `?portions=` übergeben wird, berechnet die API serverseitig den Umrechnungsfaktor basierend auf dem Ursprungswert (`portions`) des Rezepts und passt die Mengen (`amount`) im `ingredients`-Array für die Rückgabe an. Das Originaldokument in der Datenbank bleibt dabei unverändert. Wir verwenden hier die ID des Test-Rezepts "Spaghetti Napoli Originale". In der Datenbank ist es für 4 Personen angelegt (500g Spaghetti, 400g Tomaten, 2 Stück Knoblauch). Wir fordern es nun für 2 Personen an.
* **Methode:** `GET`
* **URL:** `http://localhost:3000/api/recipes/{ID_DER_SPAGHETTI_EINTRAGEN}?portions=2`

* **Erwartetes Ergebnis:** Status 200 (OK). Die API liefert das JSON-Dokument des Rezepts zurück. In dieser dynamischen Ansicht wurden die Portionen auf 2 reduziert und die Zutatenmengen exakt halbiert (die Spaghetti werden nun mit 250 Gramm, die Tomaten mit 200 Gramm und der Knoblauch mit 1 Stück ausgegeben). In der Datenbank selbst bleibt das Rezept unangetastet bei 4 Portionen.

### Persönliche Favoriten verwalten (US14)

Nutzer (Köche) können Rezepte als Favoriten markieren, um schnelleren Zugriff darauf zu haben. Da die Anwendung als reine Backend-API fungiert, wird der "Klick auf das Herz-Icon" im Frontend durch einen gezielten POST-Request simuliert. Das Abrufen der Favoriten nutzt die `.populate()`-Methode von Mongoose, um die gespeicherten IDs direkt in vollständige Rezept-Dokumente umzuwandeln. Die Ansicht der gespiecherten Favoriten wird in US17/18 aufgegriffen.

**Rezept als Favorit markieren**
* **Methode:** `POST`
* **URL:** `http://localhost:3000/api/users/favorites`
* **Body (JSON):**
{
  "userId": "HIER_DIE_ID_VON_KOCH1_EINTRAGEN",
  "recipeId": "HIER_DIE_ID_DER_SPAGHETTI_EINTRAGEN"
}
* **Erwartetes Ergebnis:** Status 200. Die Rezept-ID wird dauerhaft im Array `favorites` des Nutzer-Dokuments gespeichert. Duplikate werden serverseitig verhindert.

### Rezepte über Referenzen verknüpfen / Beilagen (US15)

Um Hauptspeisen mit passenden Beilagen zu verknüpfen, macht sich die API die NoSQL-Referenzierung zunutze. Das Rezept-Schema wurde dafür um ein Array (`sideDishes`) erweitert. Wir verwenden hier die Test-Rezepte aus US01. Wir verknüpfen die "Spaghetti Napoli Originale" (Hauptspeise) mit dem "Schnellen Beilagen-Salat".

**Schritt 1: Beilage mit Hauptspeise verknüpfen**
* **Methode:** `PUT`
* **URL:** `http://localhost:3000/api/recipes/{ID_DER_SPAGHETTI_EINTRAGEN}`
* **Body (JSON):**
{
  "userId": "HIER_DIE_ID_DES_CREATORS_EINTRAGEN",
  "sideDishes": ["HIER_DIE_ID_DES_SALATS_EINTRAGEN"]
}
* **Erwartetes Ergebnis:** Status 200. Die IDs der Beilagen werden im Hauptspeisen-Dokument gespeichert.

**Schritt 2: Hauptspeise inklusive Beilagen-Empfehlung abrufen**
* **Methode:** `GET`
* **URL:** `http://localhost:3000/api/recipes/{ID_DER_SPAGHETTI_EINTRAGEN}`
* **Erwartetes Ergebnis:** Status 200. Beim Abruf der Hauptspeise löst Mongoose die IDs im Feld `sideDishes` automatisch auf. Die Beilagen-Dokumente werden direkt als fertige Empfehlung im JSON der Hauptspeise eingeblendet.

### Einkaufsliste generieren (US16)

Nutzer können eine kumulierte Einkaufsliste auf Basis mehrerer ausgewählter Rezepte generieren lassen. Die API nimmt hierfür ein Array an Rezept-IDs entgegen, ruft die entsprechenden Dokumente aus der MongoDB ab und aggregiert die darin enthaltenen Zutaten in Echtzeit. Zutaten mit identischem Namen und gleicher Maßeinheit werden zu einer einzigen Position summiert. Zur effizienten Datenverwaltung wird jede generierte Liste nach sieben Tagen durch einen Time to Live Index automatisch von der Datenbank gelöscht. Wir verwenden hier die IDs unserer Test-Rezepte "Spaghetti Napoli Originale" (400g Tomaten) und "Schneller Beilagen-Salat" (200g Tomaten), um die intelligente Summierung zu beweisen.

* **Methode:** `POST`
* **URL:** `http://localhost:3000/api/recipes/shopping-list`
* **Body (JSON):**
{
  "recipeIds": ["ID_DER_SPAGHETTI_EINTRAGEN", "ID_DES_SALATS_EINTRAGEN"],
  "userId": "HIER_DIE_ID_VON_KOCH1_EINTRAGEN"
}
* **Erwartetes Ergebnis:** Status 200 (OK). Ein JSON-Array, das alle extrahierten Zutaten summiert darstellt. Als Beweis für die korrekte Aggregation werden die 400g Tomaten (aus den Spaghetti) und die 200g Tomaten (aus dem Salat) fehlerfrei zu einer einzigen Position "600 Gramm Tomaten" zusammengefasst. Zudem enthält die Antwort den Zeitstempel für die automatische Löschung nach sieben Tagen direkt durch die MongoDB Engine.

### Authentifizierung & Persönlicher Bereich (US17)

Um auf persönliche Daten zugreifen zu können, können sich Nutzer über die API authentifizieren. Im Backend wird die Anmeldung über einen POST-Request abgewickelt, der die Zugangsdaten mit der MongoDB abgleicht. Um das Akzeptanzkriterium (Zugriff auf Favoriten & eigene Rezepte) vollständig abzubilden, führt die Login-Route zwei wichtige Datenbank-Operationen durch:
1. Sie löst mittels `.populate('favorites')` die gespeicherten Favoriten-IDs direkt in vollständige Rezept-Dokumente auf.
2. Sie führt zeitgleich eine Abfrage (`Recipe.find`) durch, um alle vom Nutzer erstellten Rezepte anhand seiner `_id` (`creatorId`) zu ermitteln.

Wir loggen uns hier als "Koch1" ein, der in US14 die Spaghetti als Favorit markiert hat.

* **Methode:** `POST`
* **URL:** `http://localhost:3000/api/users/login`
* **Body (JSON):**
{
  "username": "Koch1",
  "password": "passwort123"
}
* **Erwartetes Ergebnis:** Status 200 (OK). Die API liefert ein JSON-Objekt zurück. Dieses enthält neben der Erfolgsmeldung das komplette Nutzerprofil. Im Array favorites sind nun nicht mehr nur IDs, sondern das vollständige Dokument der "Spaghetti Napoli Originale" enthalten. Das separate Array ownRecipes zeigt alle Rezepte, die dieser Nutzer selbst erstellt hat (bei "Koch1" aktuell noch leer, bei "Creator1" wären hier die drei Test-Rezepte zu sehen).

### Zentrale Dashboard-Ansicht / Navigation (US18)

Da diese Anwendung als reine Backend-API konzipiert ist, wird die geforderte "Dashboard-Navigation" über die Bereitstellung der entsprechenden zentralen Endpunkte erfüllt. Wenn ein Frontend nach dem Login das Dashboard lädt, ruft es die Profil-Route ab, um alle initialen Daten für die Navigation und Übersicht zu erhalten. Wir rufen hier das Profil von "Creator1" ab. Da dieser Nutzer die drei Test-Rezepte erstellt hat, liefert die API hier das perfekte Datenpaket für ein gefülltes Dashboard.

* **Dashboard laden & Profilansicht:** `GET http://localhost:3000/api/users/{ID_VON_CREATOR1_EINTRAGEN}` (Liefert die Basisdaten, Favoriten und eigene Rezepte auf einen Schlag).
* **Navigation zur Suche (Filtern & Finden):**
  `GET http://localhost:3000/api/recipes` (Unterstützt Query-Parameter wie `?search=`, `?tags=` oder `?exclude=`).
* **Navigation zur Erstellung (Neues Rezept):**
  `POST http://localhost:3000/api/recipes` (Nimmt den Body des neuen Rezepts entgegen und prüft die Berechtigung anhand der übergebenen `creatorId`).

Mit diesen Endpunkten ist die funktionale Grundlage für ein vollumfängliches, navigierbares Frontend-Dashboard vollständig abgedeckt.

  ### Rezepte durch Admin löschen (US19)

Um die Plattform moderieren zu können, besitzt der Administrator das Recht, jedes beliebige Rezept zu löschen, unabhängig davon, wer es erstellt hat. Dies dient der Entfernung unpassender Inhalte. Wir verwenden hier die ID des Nutzers "Admin1" (aus dem Registrierungs-Schritt) und lassen ihn das Test-Rezept "Haselnuss-Pancakes" löschen, welches ursprünglich von "Creator1" angelegt wurde.

* **Methode:** `DELETE`
* **URL:** `http://localhost:3000/api/recipes/{ID_DER_PANCAKES_EINTRAGEN}`
* **Body (JSON):**
{
  "userId": "HIER_DIE_ID_DES_ADMINS_EINTRAGEN"
}
* **Erwartetes Ergebnis:** 
* Status 200 ("Rezept erfolgreich gelöscht"), da die Rolle `admin` jegliche Eigentümer-Prüfung überschreibt.
* Status 403 ("Zugriff verweigert"), falls die ID nicht zu einem Admin-Konto gehört.

### Nutzer verwalten / löschen (US20)

Um bei Missbrauch eingreifen zu können, können Nutzerprofile unwiderruflich aus der Datenbank gelöscht werden. Aus Sicherheitsgründen ist diese Funktion autorisiert: Es muss die ID eines Administrators im Body der Anfrage mitgesendet werden, um die Rechte zu prüfen. Wir lassen den "Admin1" das Profil von "Koch1" löschen, um die administrative Kontrolle über die Nutzerbasis zu demonstrieren.

* **Methode:** `DELETE`
* **URL:** `http://localhost:3000/api/users/{ID_VON_KOCH1_EINTRAGEN}`
* **Body (JSON):**
{
  "adminId": "HIER_DIE_ID_DES_ADMINS_EINTRAGEN"
}
* **Erwartetes Ergebnis:** 
* Status 200 ("Nutzer erfolgreich vom Admin gelöscht"), wenn die Autorisierung erfolgreich war.
* Status 403 ("Zugriff verweigert"), falls die mitgesendete ID keinem Admin gehört.