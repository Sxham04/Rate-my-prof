# Rate My Professor

A student-built platform for DIT University students to anonymously rate and review their professors. Built to help students make informed decisions when selecting courses and professors each semester.

> **Not officially affiliated with DIT University.**

---

## What it does

- Browse all 225+ DIT University faculty members across 10 schools
- View professor profiles with bio, courses taught, and department info
- Read student reviews rated across Teaching Quality, Approachability, and Fairness
- Submit reviews using your `@dituniversity.edu.in` email (magic link login — no password needed)
- Edit or delete your own reviews from your account page
- Search professors by name, department, or course
- Filter by school or sort by rating

---

## Project Structure

```
rate-my-prof/
├── scraper/                  # Python data collection scripts
│   ├── main.py               # Entrypoint — runs the full scrape
│   ├── prof_parser.py        # Extracts data from each profile page
│   ├── cleaner.py            # Normalises and deduplicates data
│   ├── fill_missing.py       # Patches missing fields without overwriting manual edits
│   ├── patch_emails.py       # Patches null emails only
│   ├── requirements.txt      # Python dependencies
│   └── output/               # Scraped JSON output (gitignored)
│
├── web-app/                  # Next.js application
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── seed.ts           # Seeds professors.json into the database
│   ├── src/
│   │   ├── app/              # Next.js App Router pages and API routes
│   │   ├── components/       # Reusable React components
│   │   ├── lib/              # Prisma client, auth config, utilities
│   │   └── types/            # TypeScript type definitions
│   └── .env.example          # Environment variable template
│
└── README.md
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma |
| Authentication | NextAuth.js v5 + Resend magic links |
| Deployment | Vercel |
| Scraping | Playwright + BeautifulSoup |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- A [Supabase](https://supabase.com) account (free tier)
- A [Resend](https://resend.com) account (free tier)

### 1. Clone the repository

```bash
git clone https://github.com/Sxham04/rate-my-prof.git
cd rate-my-prof
```

### 2. Run the scraper (optional — output already included)

```bash
cd scraper
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
playwright install chromium
python main.py
```

Output is saved to `scraper/output/professors.json`.

### 3. Set up the web app

```bash
cd web-app
npm install
```

Create a `.env` file based on `.env.example`:

```env
DATABASE_URL="your_supabase_connection_string"
NEXTAUTH_URL="http://localhost:3000"
AUTH_SECRET="your_auth_secret"
AUTH_RESEND_KEY="your_resend_api_key"
RESEND_API_KEY="your_resend_api_key"
```

### 4. Set up the database

```bash
npx prisma db push
npx prisma generate
```

Copy `scraper/output/professors.json` to `web-app/prisma/professors.json`, then seed:

```bash
npx ts-node prisma/seed.ts
```

### 5. Run the development server

```bash
npm run dev
```

Visit `http://localhost:3000`.

---

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Supabase PostgreSQL connection string |
| `NEXTAUTH_URL` | Base URL of the app (`http://localhost:3000` in dev) |
| `AUTH_SECRET` | Random secret for NextAuth session encryption |
| `AUTH_RESEND_KEY` | Resend API key for sending magic link emails |
| `RESEND_API_KEY` | Resend API key for sending feedback emails |

---

## Data Sources

Professor data was scraped from the official [DIT University faculty directory](https://www.dituniversity.edu.in/faculty). Some profiles may have incomplete or outdated information. If you find an error, use the "Report an issue" button on the site.

---

## Disclaimer

This project is an independent student initiative and is not officially affiliated with, endorsed by, or connected to DIT University in any way. All professor data is sourced from publicly available information on the university's official website.

---

## License

MIT
