# JobRadar

**Track Every Application, Land Every Opportunity**

JobRadar is an AI-powered job application tracker built for serious job seekers. Paste a job listing URL and let AI extract the company, role, required skills, salary range, and experience level — then track your entire pipeline from first click to signed offer, with skill match scoring, a Kanban board, and analytics dashboard.

## Status

🚧 Early development — currently through Day 3 of the build (project setup, auth, and Supabase schema).

## Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: Tailwind CSS v4
- **Database & Auth**: Supabase (Postgres + Auth + Row Level Security)
- **AI**: Google Gemini API (job description extraction)
- **Data fetching**: TanStack React Query
- **Forms**: React Hook Form + Zod
- **Drag & drop**: dnd-kit (Kanban board)
- **Charts**: Recharts
- **Fonts**: Syne (display) + JetBrains Mono (data/numbers)

## Features (planned / in progress)

- 🔐 Email/password auth with Supabase
- 🪄 AI-powered job description extraction — paste a URL, auto-fill the form
- 📋 Application tracker — table view with search, filters, and sorting
- 🗂️ Kanban board — drag applications across status stages
- 🎯 Skills match scoring — compares your profile skills against job requirements
- 📊 Dashboard analytics — application volume, status breakdown, response rates
- 👤 Profile — skills, target role, salary expectations, work preferences

## Application statuses

`Applied` → `Response` → `Interview` → `Tech Test` → `Offer` / `Rejected` / `Ghosted`

## Getting Started

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project
- A [Google Gemini API](https://ai.google.dev/) key

### Setup

1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file in the project root:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

3. Run the Supabase schema migration (see `/supabase` or SQL Editor) to set up the `profiles` and `applications` tables, enums, triggers, and RLS policies.

4. Start the dev server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login & register pages
│   ├── (protected)/     # Dashboard, applications, board, profile
│   ├── api/              # API routes (auth callback, AI extraction)
│   └── page.tsx          # Landing page
├── components/
│   └── ui/                # Reusable UI primitives
├── hooks/                 # React Query hooks
├── lib/
│   ├── supabase/          # Browser & server Supabase clients
│   └── utils.ts            # Shared helpers, status colors/labels
├── providers/             # React Query provider
├── types/                  # Shared TypeScript types
└── proxy.ts                # Route protection (Next.js 16 proxy)
```

## Design

- **Theme**: Dark-first, with light mode support
- **Palette**: Indigo (`#6366F1`) primary, Cyan (`#22D3EE`) accent
- **Typography**: Syne for headings/UI, JetBrains Mono for data and numbers

## Deployment

- **Frontend**: [Vercel](https://vercel.com)
- **Database**: [Supabase](https://supabase.com)

## License

Personal project — license TBD.
