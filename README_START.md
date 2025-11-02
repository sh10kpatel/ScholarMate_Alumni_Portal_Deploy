# Quick start: make the API available and open the listing page

This project ships with a small Node API in the `server/` folder. The frontend pages try to fetch data from `http://localhost:4000` (the API). If the API is not reachable the pages fall back to `alumni.json` for offline development.

To avoid running manual commands every time, use the provided `start-all.ps1` script which will:

- Start the Node API (runs `node index.js` inside `server/`) if it is not already listening on port 4000.
- Wait until `/health` responds, then open `mainalu.html` in your default browser.

Usage (PowerShell)

```powershell
# run from the project root
powershell -ExecutionPolicy Bypass -File .\start-all.ps1
```

Notes on MySQL

- The API will try to use MySQL if it is available using environment variables from `server/db.js`:
  - DB_HOST (default: localhost)
  - DB_USER (default: root)
  - DB_PASSWORD (default: empty)
  - DB_NAME (default: alumni_db)

- If MySQL is not available, the server will attempt to use sqlite (file `server/data.sqlite`) if `sqlite3` package is installed. Otherwise it falls back to an in-memory store.

Optional: run MySQL via docker-compose

1) Create a `docker-compose.yml` in the project root with a MySQL service and an adminer UI (example):

```yaml
version: '3.8'
services:
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: mysql
      MYSQL_DATABASE: alumni_db
    ports:
      - '3306:3306'
    volumes:
      - db-data:/var/lib/mysql
  adminer:
    image: adminer
    ports: ['8080:8080']
volumes:
  db-data:
```

2) Start the database (PowerShell):

```powershell
# requires Docker Desktop
docker compose up -d
```

3) Then run `start-all.ps1` to start the Node API (it will connect to the MySQL at localhost:3306 using the default credentials above).

If you'd like, I can add the docker-compose.yml and wire the `start-all.ps1` to auto-start Docker too — tell me if you want that.