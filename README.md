# 🎯 AI Radar — LLM Visibility Monitor

Track whether your brand gets cited in ChatGPT, Perplexity, and Gemini. The affordable LLM citation monitoring tool for growing brands.

## Problem

67% of product discovery is shifting to LLMs. Google Rank #1 ≠ AI Citation #1. Brands have zero visibility into whether AI assistants recommend them.

**Competitors charge $49-219/mo.** AI Radar starts free.

## Features

- 🔍 **Multi-LLM Scanning** — Query ChatGPT, Perplexity, and Gemini
- 📊 **Citation Scoring** — See what % of AI queries mention your brand
- 📈 **Trend Tracking** — Monitor your AI visibility over time
- 🆚 **Competitor Comparison** — See how you stack up
- 📧 **Weekly Reports** — Get insights delivered to your inbox
- 🔐 **Magic Link Auth** — Passwordless sign-in via email

## Tech Stack

- **Framework:** Next.js 16 + TypeScript + Tailwind CSS v4
- **Database:** SQLite (via better-sqlite3)
- **AI APIs:** OpenAI, Perplexity, Google Gemini
- **Email:** Resend
- **Charts:** Recharts
- **Deployment:** Vercel

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Add your API keys to .env.local
# At minimum: OPENAI_API_KEY and JWT_SECRET

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | For real scans | OpenAI API key for ChatGPT queries |
| `PERPLEXITY_API_KEY` | Optional | Perplexity API key |
| `GEMINI_API_KEY` | Optional | Google Gemini API key |
| `JWT_SECRET` | Yes | Secret for auth tokens |
| `RESEND_API_KEY` | For emails | Resend API key for magic links |
| `NEXT_PUBLIC_BASE_URL` | For emails | Your app's public URL |

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page with demo
│   ├── dashboard/page.tsx    # User dashboard with charts
│   ├── settings/page.tsx     # Brand/competitor config
│   └── api/
│       ├── auth/             # Magic link auth
│       ├── scan/             # LLM scanning endpoints
│       ├── brands/           # Brand CRUD
│       └── dashboard/        # Dashboard data
├── components/
│   ├── Navbar.tsx
│   ├── DemoForm.tsx          # Interactive landing page demo
│   ├── ScoreCard.tsx         # Citation score cards
│   ├── TrendChart.tsx        # Line chart over time
│   ├── LLMBreakdown.tsx      # Per-platform breakdown
│   └── PricingSection.tsx
└── lib/
    ├── db.ts                 # SQLite database
    ├── auth.ts               # JWT auth helpers
    ├── llm-scanner.ts        # ChatGPT/Perplexity/Gemini queries
    └── demo-data.ts          # Simulated data for demo
```

## Pricing

| Plan | Price | Features |
|------|-------|----------|
| Free | $0/mo | 3 scans/month, 1 competitor |
| Pro | $19/mo | Unlimited scans, 3 competitors, weekly reports |
| Business | $49/mo | 10 competitors, API access, daily scans |

## Deployment

### Vercel (Recommended)

> **Note:** SQLite won't persist on Vercel's serverless functions. For production, migrate to Turso, PlanetScale, or Neon. The demo endpoints work without a database.

```bash
npm i -g vercel
vercel --prod
```

### Self-hosted

```bash
npm run build
npm start
```

## License

MIT — Built by [Go Digital Apps](https://godigitalapps.com)
