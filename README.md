<div align="center">

<img src="public/favicon.svg" width="72" alt="Sciolytics logo" />

# Sciolytics

**The free study platform for Science Olympiad competitors, captains and coaches.**

Real tournament questions · AI-graded free response · spaced-repetition flashcards · print-ready cheat sheets · live partner tests · event wikis · team HQ · deep analytics

[![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%7C%20Firestore%20%7C%20AI%20Logic-ffca28?logo=firebase&logoColor=black)](https://firebase.google.com/)

[**sciolytics.com**](https://sciolytics.com)

</div>

---

## Contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Firebase setup](#firebase-setup)
- [Project structure](#project-structure)
- [Data model](#data-model)
- [Design system](#design-system)
- [Keyboard shortcuts](#keyboard-shortcuts)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Features

### Practice
- **Question bank** of real tournament questions across every 2026 event (Div B & C). Filter by event, subtopic, difficulty, division, type, or *only unanswered*.
- **Test runner** with timer, question navigator, keyboard controls, bookmarks, skip/return, and a "finish" review.
- **AI grading** for free-response answers against the official key, plus an **"Explain my mistake"** AI tutor for missed multiple-choice questions.
- **Results** with a score ring, per-subtopic breakdown, full answer review, **retry missed**, and **send misses to flashcards**.
- **Try-a-question demo** on the landing page: visitors can answer real questions before signing up.

### Study
- **Flashcards** (spaced repetition): every question becomes a card; Again/Hard/Good/Easy scheduling with a Mistakes deck and cram mode.
- **Cheat sheets**: markdown-style editor with a live 8.5×11 preview, 1–4 columns, adjustable type, wiki import, a **fit meter** for one-sheet (front & back) events, and print/PDF.
- **Event wiki** (public, SEO-indexed): clean notes per event with **highlights and personal annotations**, and one-click export of your notes to a cheat sheet.
- **Bookmarks**: reveal answers, filter by event, practice or flashcard your saved questions.

### Together
- **Partner mode**: share a 6-character code and take one test on a shared, real-time answer sheet. See who answered what, where your partner is, flag questions for each other, and submit on a shared timer.
- **Teams**: join codes, rosters by event with conflict blocks, team stream, assignments with due dates, roles & permissions, a shared calendar, notifications.
- **Community tests**: browse by event/division, sort by top-rated/newest/size, and **rate tests 1–5 stars**. Admins can approve and merge questions into the official bank.
- **Test builder**: write MCQ/FRQ by hand, **import with AI** from notes, and **modify any question with AI** (harder, easier, rephrase, stronger distractors, write explanation, convert MCQ↔FRQ, or custom instruction) with a before/after review. Organize tests in **folders** and tag them by event and division.

### Everywhere
- **Dashboard** with daily goal ring, streak, activity trend/heatmap, weakest-event focus areas, favorite events and quick tools.
- **⌘K command palette** to jump to any page, event, wiki or deck.
- **Themes**: 9 accent colors × 5 brightness modes (follows your OS on first visit), animated backgrounds.
- **Fully responsive** with a mobile drawer nav, and route-level code splitting so the landing page stays fast.

## Tech stack

| Layer | Choice |
| --- | --- |
| UI | React 19, TypeScript, React Router 7 |
| Build | Vite 6 (route-level `lazy()` + vendor chunks) |
| Styling | Vanilla CSS with design tokens (`src/index.css`), per-page CSS |
| Icons / charts | lucide-react, Recharts |
| Auth / DB | Firebase Authentication (Google), Cloud Firestore |
| AI | Gemini via **Firebase AI Logic** (`firebase/ai`); no API key in the client |
| Fonts | Geist, Geist Mono, Instrument Serif |

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build to dist/
npm run lint
```

Requires Node 18+.

## Firebase setup

The app ships with the production Firebase web config as a fallback. To point at your own project, create `.env.local`:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Then in the Firebase console:

1. **Authentication** → enable the Google provider and add your domains (e.g. `localhost`, `sciolytics.com`) to authorized domains.
2. **Firestore** → create a database.
3. **AI Logic** → enable the Gemini Developer API (used for FRQ grading, AI import, AI question editing and the tutor).
4. **Deploy the security rules** (required for community ratings and partner mode):

```bash
firebase deploy --only firestore:rules
```

## Project structure

```text
src/
├── components/        Layout (nav, drawer, footer), CommandPalette, TestRunner, Logo, Toast, loaders
├── contexts/          Auth, Theme, UserData providers
├── data/              questionBank.ts (static bank), wikiData.ts
├── lib/               events.ts (event metadata/icons/colors), sheetMarkup.tsx, testMeta.ts
├── pages/             one file (+ optional .css) per route
├── services/          firestoreService, studyService (flashcards, cheat sheets, wiki notes),
│                      partnerService, questionService, AI services
├── styles/            layout.css, test-runner.css, polish.css (legacy page modernization)
├── index.css          design tokens + shared .ui-* primitives
└── App.tsx            routes (public vs. protected), lazy loading, page titles
```

## Data model

| Path | Contents |
| --- | --- |
| `users/{uid}/progress/summary` | totals, accuracy, favorites, per-event / per-difficulty stats |
| `users/{uid}/sessions/{date}` | daily answered / correct |
| `users/{uid}/answers/*` | answer log |
| `users/{uid}/bookmarks/{questionId}` | saved questions |
| `users/{uid}/study/flashcards` | `{ cards: { [questionId]: { box, due, reviews, lapses, missed } } }` |
| `users/{uid}/cheatsheets/{id}` | title, event, content, columns, fontSize, format |
| `users/{uid}/wikiNotes/{eventId}` | highlights + notes |
| `customTests/{id}` | title, questions, isPublic, event, division, folder |
| `customTests/{id}/ratings/{uid}` | `{ stars: 1–5 }` |
| `partnerSessions/{CODE}` | questionIds, participants, shared answers, flags, results |
| `teams/**` | teams, subteams, stream, assignments, events, roles |
| `officialQuestions/*` | admin-approved community questions |

## Design system

Tokens live in `src/index.css`: `--primary-color`, `--accent-2`, `--canvas`, `--bg-white` (card surface), `--text-*`, `--border-*`, radii, shadows. Each brightness mode redefines the surface and text tokens, and each color theme redefines the accent. Shared primitives use the `.ui-` prefix (`.ui-btn`, `.ui-card`, `.ui-chip`, `.ui-segment`, `.ui-input`, `.ui-empty`, `.ui-kbd`, `.ui-modal`, …). New UI should compose these instead of inline styles.

## Keyboard shortcuts

| Where | Keys |
| --- | --- |
| Anywhere | `⌘K` / `Ctrl+K` or `/`: command palette |
| Tests | `A`–`D` / `1`–`4` answer · `Enter` check/next · `←` `→` navigate · `M` bookmark · `?` help · `⌘Enter` submit FRQ |
| Flashcards | `Space` flip · `1`–`4` rate |
| Cheat sheets | `⌘B` bold · `⌘H` highlight · `⌘S` save |
| Test builder | `⌘S` save |

## Deployment

Vercel (`vercel.json`) builds with `npm run build` and serves `dist/` with an SPA rewrite. `public/` holds the favicon, PWA manifest and icons, `og-image.jpg`, `robots.txt` and `sitemap.xml` (public wiki pages are listed for search engines).

## Contributing

Issues and PRs are welcome. To add questions, create a test in **Create**, make it public, and an admin can merge it into the official bank. For code, keep new pages on the design tokens and `.ui-*` primitives, and run `npm run lint && npm run build` before opening a PR.

---

<sub>Sciolytics is an independent, student-built project and is not affiliated with or endorsed by Science Olympiad, Inc.</sub>
