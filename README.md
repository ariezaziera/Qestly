# ⚔️ Qestly

**Main quest: get hired.**

Qestly is an AI-powered job application tracker built for serious job
seekers. Paste a job listing URL and Groq AI (Llama 3.3 70B) auto-extracts
the company, role, required skills, salary range, and experience level.
Track your entire pipeline from first click to signed offer — with skill
match scoring, a Kanban board, map view, analytics dashboard, AI-generated
cover letters, interview prep, and email reminders.

---

## ✨ Features

- 🔐 **Auth** — Email/password authentication via Supabase
- 🪄 **AI Job Extraction** — Paste a URL, auto-fill the application form using Groq (Llama 3.3 70B)
- 📋 **Application Tracker** — Table view with search, filters, and sorting
- 🗂️ **Kanban Board** — Drag applications across status stages (dnd-kit)
- 🎯 **Skill Match Scoring** — Compares your profile skills against job requirements
- 📊 **Analytics Dashboard** — Application volume, status breakdown, response rates
- 🌍 **Map View** — See your applications plotted on an interactive Leaflet map
- 🔍 **Job Discovery** — Browse relevant jobs from Jooble with AI fit scoring and reasoning
- ✉️ **AI Cover Letters** — Generate tailored cover letters per application
- 🧠 **Interview Prep** — AI-generated prep notes based on the job description
- 🔔 **Email Reminders** — Schedule follow-up, interview, and deadline reminders via Resend
- 📤 **Export** — Download your applications as PDF or CSV
- 📱 **PWA** — Installable on mobile and desktop, with offline support
- 🌙 **Dark / Light Mode** — Dark-first design with theme toggle

---

## 🗺️ Application Status Flow

`Applied` → `Response` → `Interview` → `Tech Test` → `Offer` / `Rejected` / `Ghosted`

---

## 🛠️ Tech Stack
|-------------------|---------------------------------------|
| Layer             | Technology                            |
|-------------------|---------------------------------------|
| Framework         | Next.js 16 (App Router, TypeScript)   |
| Styling           | Tailwind CSS v4                       |
| Database & Auth   | Supabase (Postgres + RLS)             |
| AI                | Groq API (Llama 3.3 70B)              |
| Data Fetching     | TanStack React Query                  |
| Forms             | React Hook Form + Zod                 |
| Drag & Drop       | dnd-kit                               |
| Charts            | Recharts                              |
| Maps              | Leaflet + react-leaflet               |
| Geocoding         | OpenStreetMap Nominatim               |
| Email             | Resend                                |
| Job Data          | Jooble API                            |
| Export            | jsPDF + jspdf-autotable               |
| PWA               | next-pwa                              |
| Fonts             | Syne + JetBrains Mono                 |
|-------------------|---------------------------------------|

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project
- A [Groq API](https://console.groq.com/) key
- A [Resend](https://resend.com) account (for email reminders)
- A [Jooble API](https://jooble.org/api/about) key (for job discovery)

### Setup

1. Clone the repo and install dependencies:

```bash
git clone https://github.com/ariezaaziera/qestly.git
cd qestly
npm install
```

2. Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
GROQ_API_KEY=your_groq_api_key
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=your_verified_sender_email
JOOBLE_API_KEY=your_jooble_api_key
CRON_SECRET=your_cron_secret
```

3. Run the Supabase schema migration via the SQL Editor in your Supabase
dashboard to set up the `profiles`, `applications`, `reminders`, and
`discovered_jobs` tables, enums, triggers, and RLS policies.

4. Start the dev server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) — quest begins. ⚔️

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login & register pages
│   ├── (protected)/      # Dashboard, applications, board, profile, map, discover
│   ├── api/              # API routes (auth, AI extraction, reminders, discovery)
│   └── page.tsx          # Landing page
├── components/
│   ├── applications/     # Application detail, cover letter, interview prep, reminders
│   ├── board/            # Kanban card components
│   ├── dashboard/        # Dashboard charts and widgets
│   ├── layout/           # Sidebar and mobile nav
│   ├── map/               # Leaflet map components
│   └── ui/                # Reusable UI primitives
├── hooks/                # React Query hooks
├── lib/
│   ├── supabase/         # Browser & server Supabase clients
│   ├── email/            # Email templates and sending logic
│   ├── export.ts         # PDF/CSV export
│   ├── geocode.ts        # Location geocoding (Nominatim)
│   ├── jooble.ts          # Job discovery search
│   └── utils.ts          # Shared helpers, status colors/labels
├── providers/            # React Query and theme providers
├── proxy.ts              # Route protection middleware
└── types/                # Shared TypeScript types
```

---

## 🎨 Design

- **Theme** — Dark-first with light mode support
- **Palette** — Indigo `#6366F1` primary · Cyan `#22D3EE` accent · Emerald `#10B981` success
- **Typography** — Syne for headings/UI · JetBrains Mono for data and numbers

---

## 🚢 Deployment

Deploy the frontend to [Vercel](https://vercel.com) and connect your
[Supabase](https://supabase.com) project. Add all environment variables
in the Vercel dashboard.

```bash
vercel deploy
```

Live at [qestly.vercel.app](https://qestly.vercel.app).

---

## 👩‍💻 Built By

**Arieza Aziera** — Frontend & Full-Stack Developer
- Portfolio: [ariezaaziera-studio.vercel.app](https://ariezaaziera-studio.vercel.app)
- GitHub: [@ariezaaziera](https://github.com/ariezaaziera)

---

*Every application is a mission. Every offer is a boss defeated.*
*Quest complete when you land the job.* ⚔️

---

## 📄 License

Personal project — license TBD.