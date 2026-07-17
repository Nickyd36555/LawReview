# LawReview

A website where clients find and review lawyers.

- **Search** lawyers by location (city or state) and filter by grade or stoplight.
- **Report-card grades (A–F)** — computed from real client reviews once a lawyer
  has any; an editorial base grade until then.
- **Stoplight (🔴 🟡 🟢)** — an independent bottom-line signal. Green means the
  lawyer is OK to hire, red means think twice, regardless of the letter grade.
- **Lawyer profile pages** — photo on the left, blurb about the lawyer, grade and
  stoplight on the right, client reviews underneath.
- **Free client accounts** — clients sign up free and can post one review per
  lawyer (posting again updates their earlier review).
- **Paid lawyer listings** — lawyers pay ($49/$99/$249 per month plans) to be
  listed. Paying never changes a grade or stoplight.

## Running it

```bash
npm install
npm run dev        # development, http://localhost:3000
# or
npm run build && npm start
```

The SQLite database is created automatically at `data/lawreview.db` and seeded
with 12 demo lawyers across six cities on first run. Delete that file to reset.

## Tech

- Next.js (App Router) + React
- SQLite via better-sqlite3
- Cookie-session auth with scrypt password hashing (set `SESSION_SECRET` in
  production)

## Not wired up yet

- **Payments** — the lawyer signup flow activates listings immediately for
  testing; the `/api/lawyers/join` route marks where Stripe checkout goes.
- Real lawyer photo uploads (profiles currently use generated avatars).
- Moderation tools, lawyer replies to reviews, email verification.
