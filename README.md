# Biendata Backend (Express)

Backend API for [Biendata](https://biendata.org), serving species, ranges, observations, occurrences, and trait data with download support. Built with Node.js and Express, backed by PostgreSQL.

## Features

- **Species & range data** — Lookup and query species, ranges, and species-range associations
- **Observations & occurrences** — Single and bulk (multi-species) observation/occurrence queries
- **Trait data** — Trait lookups and downloads
- **Download endpoints** — CSV/ZIP exports for observations, ranges, and traits (single and bulk)
- **Rate limiting** — 100 requests per 15 minutes per IP on `/api` routes
- **CORS** — Allowed origins: `biendata.org`, `www.biendata.org`, and `mint-pheasant.nceas.ucsb.edu:3004`

## Prerequisites

- **Node.js** (v14 or later)
- **PostgreSQL** — Two databases are used: one for main app data (`PGDATABASE`), one for traits/occurrences/species-ranges (`PGDATABASE2`)

## Setup

1. **Clone and install**

   ```bash
   npm install
   ```

2. **Environment variables**

   Create a `.env` file in the project root with:

   ```env
   PORT=3005
   PGHOST=localhost
   PGUSER=your_user
   PGPASSWORD=your_password
   PGDATABASE=your_main_database
   PGDATABASE2=your_secondary_database
   PGPORT=5432
   ```

   - `PGDATABASE` — Used by `config/db.js` and most range/observation logic
   - `PGDATABASE2` — Used by trait, occurrence, and species-range controllers

3. **Run the server**

   ```bash
   npm start
   ```

   Server listens on `PORT` (default `3005`).

## Scripts

| Command     | Description                    |
|------------|--------------------------------|
| `npm start` | Start server (`node server.js`) |
| `npm test`  | Placeholder (no tests yet)     |

## API Overview

All API routes are under `/api`. Rate limit: 100 requests per 15 minutes per IP.

| Base path                 | Description                          |
|---------------------------|--------------------------------------|
| `/api/species`            | Species lookup                       |
| `/api/range`              | Range data and range queries         |
| `/api/species-ranges`     | Species–range associations           |
| `/api/observations`       | Observation queries                  |
| `/api/occurrences`        | Occurrence queries                   |
| `/api/multi-occurrences`  | Bulk occurrence records              |
| `/api/multiple-species`   | Multi-species lookups                |
| `/api/multiple-ranges`    | Multi-species range data             |
| `/api/multiple-observations` | Multi-species observation lookups |
| `/api/traits`             | Trait data                           |
| `/api/download`           | Observation, range, and trait downloads (single and multi) |

Download routes support CSV and ZIP. Geometry is handled with `wkx` where applicable.

## Project structure

```
├── config/
│   └── db.js              # PostgreSQL pool (PGDATABASE)
├── controllers/           # Route handlers and DB logic
├── middleware/
│   └── errorHandler.js   # Global error handler
├── routes/               # Express routers
├── server.js             # App entry, CORS, rate limit, route mounting
├── package.json
└── README.md
```

## License

MIT
