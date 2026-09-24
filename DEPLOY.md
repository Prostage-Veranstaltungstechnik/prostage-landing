# ProStage Deployment

Das Backend verwendet MySQL für Produkte und Anfragen. Das Schema wird beim
ersten API-Aufruf automatisch angelegt und der Produktkatalog einmalig aus
`src/data/products.json` befüllt.

## Lokale Konfiguration

```bash
cp .env.example .env
```

In `.env` müssen mindestens MySQL-Zugang, `ADMIN_PASSWORD` und ein zufälliger
`ADMIN_SESSION_SECRET` mit mindestens 32 Zeichen gesetzt werden. Für echten
Mailversand werden zusätzlich die SMTP-Werte benötigt.

## Docker Compose

```bash
docker compose up --build
```

Vorher die benötigten Werte in `.env` setzen. Compose startet:

- `app`: Next.js auf Port 3000
- `mysql`: MySQL 8.4 mit persistentem Volume
- ein separates Volume für hochgeladene Produktbilder

## Wichtige Routen

- `/mieten` – öffentlicher Produktkatalog
- `/anfrage` – Mietanfrage an `sales@prostage.de`
- `/kontakt` – Kontaktanfrage an `info@prostage.de`
- `/admin` – geschützte Produkt- und Anfrageverwaltung

## Spamschutz

Kontakt- und Mietanfragen werden durch mehrere serverseitige Regeln geschützt:

- unsichtbares Honeypot-Feld und Mindest-Ausfüllzeit
- Herkunftsprüfung gegen Cross-Site-POSTs
- persistentes Rate-Limit in MySQL: 5 Versuche je IP in 15 Minuten
- zusätzlich 3 Versuche je E-Mail-Adresse in 30 Minuten
- identische Nachrichten werden 15 Minuten lang blockiert
- Nachrichten mit mehr als vier Links werden abgewiesen

IP-Adressen werden hierfür nicht im Klartext, sondern nur als Hash gespeichert.
- `/api/health` – Status von Datenbank, Mail und Admin-Konfiguration

## Umgebungsvariablen

| Variable | Bedeutung |
| --- | --- |
| `DATABASE_URL` | Optionale vollständige MySQL-URL |
| `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DATABASE` | MySQL-Verbindung |
| `MYSQL_USER`, `MYSQL_PASSWORD` | MySQL-Zugang |
| `MYSQL_SSL` | `true` für TLS |
| `ADMIN_PASSWORD` | Passwort für `/admin` |
| `ADMIN_SESSION_SECRET` | Signaturschlüssel, mindestens 32 Zeichen |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE` | SMTP-Server |
| `SMTP_USER`, `SMTP_PASSWORD` | SMTP-Zugang |
| `MAIL_FROM` | Absender der Website-Mails |
| `SALES_EMAIL` | Ziel für Mietanfragen |
| `INFO_EMAIL` | Ziel für Kontaktanfragen |
| `DATA_PATH` | Persistenter Ordner für Produktbilder |

Wenn SMTP nicht konfiguriert ist, werden Anfragen weiterhin sicher in MySQL
gespeichert und im Adminbereich als „Nur gespeichert“ angezeigt.

## Backup

```bash
docker compose exec mysql mysqldump -u root -p prostage > prostage-backup.sql
```

Zusätzlich sollte das Volume `prostage-images` regelmäßig gesichert werden.
