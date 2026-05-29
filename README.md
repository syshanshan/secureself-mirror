# SecureSelf Mirror

A mobile-first Next.js web app that helps anxious attachment users transform relationship messages into secure attachment communication.

## Features

- **Pattern Analysis** — Identifies anxious attachment patterns in draft messages
- **Anxiety Score** — Visual 0–100 score showing activation level
- **Secure Rewrite** — AI-generated message in a grounded, secure tone
- **Boundary Statement** — A clear boundary you can hold
- **Next Action** — A self-regulating step to take
- **What Not To Do** — Compassionate guidance on what to avoid
- **History** — Saved reflections scoped to your browser session (Supabase or local fallback)

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS 4
- Supabase (`mirror_entries` table)
- OpenAI API (gpt-4o-mini)
- Deployable to Vercel

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Recommended | OpenAI API key for real AI analysis |
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | Server-side writes if RLS blocks anon insert |

Without `OPENAI_API_KEY`, the app uses a mock analyzer for local development.
Without Supabase, analyses are saved to browser localStorage and still appear in history.

### 3. Set up Supabase (optional)

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL in `supabase/schema.sql` in the SQL Editor
3. Add your project URL and anon key to `.env.local`

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Build for production

```bash
npm run build
npm start
```

## Deploy to Vercel

1. Push to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add environment variables in Project Settings → Environment Variables
4. Deploy

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home — intro and CTA |
| `/input` | Enter situation + draft message |
| `/result/[id]` | Analysis result by ID (Supabase or local) |
| `/history` | Past reflections for this browser session |

## User Flow

1. User describes their relationship situation and draft message on `/input`
2. `POST /api/analyze` calls OpenAI (or mock) for analysis
3. Result is saved to Supabase `mirror_entries` or browser localStorage
4. User is redirected to `/result/[id]` with anxiety score, rewrite, boundaries, and guidance
5. Past reflections appear on `/history`

## License

MIT
