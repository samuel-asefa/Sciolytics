# Sciolytics 🔬

A powerful, modern practice platform and community hub built for **Science Olympiad** competitors, coaches, and teams. 

Sciolytics goes beyond simple multiple-choice quizzes by offering deep analytics, team collaboration, custom test creation, and AI-powered study tools to help you dominate your events.

---

## ✨ Features

- **Massive Dynamic Question Bank**: Practice tests covering all major Science Olympiad events (Divisions B & C). Filter by difficulty, question type (MCQ/FRQ), subtopic, and unanswered questions.
- **Antigravity AI Test Importer**: Paste your study guides, rule manuals, or Wikipedia articles. Using Google's Gemini AI, Sciolytics will instantly extract and generate high-quality multiple-choice and free-response questions.
- **Custom Test Creator**: Build your own tests from scratch. Save drafts, preview them, and print them as PDFs for physical study sessions.
- **Teams & Collaboration**: 
  - Create custom teams and invite members using a unique 6-digit join code.
  - Chat and share resources in the Team Stream.
  - Assign specific custom tests to team members with due dates.
  - View real-time team leaderboards and track member progress.
- **Community Hub**: Share your custom tests publicly! Anyone on Sciolytics can take community-created tests. 
- **Admin Approval System**: Verified admins can review community tests and seamlessly merge high-quality user-submitted questions into the official, global Sciolytics question bank.
- **Deep Analytics Dashboard**: Track your accuracy, event-specific performance, subtopic mastery, and overall test history with beautiful interactive charts.
- **Wiki & Study Hub**: Dedicated event pages containing guidelines, rules, and reference materials.

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Vanilla CSS (CSS Variables, Glassmorphism, CSS Grid/Flexbox)
- **Icons**: Lucide React
- **Backend & Database**: Firebase Authentication, Cloud Firestore
- **AI Integration**: Google Gemini (via `@google/genai`) for the AI Test Importer
- **Charts**: Recharts

---

## 🚀 Getting Started (Local Development)

### 1. Prerequisites
- Node.js (v18+)
- A Firebase project (for Auth & Firestore)
- A Google Gemini API Key (for the AI Test Importer)

### 2. Environment Variables
Create a `.env` file in the root directory and add your keys:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id

# For the AI Test Importer
VITE_GEMINI_API_KEY=your-gemini-api-key
```

### 3. Installation & Run
```bash
npm install
npm run dev
```
Navigate to `http://localhost:5173`.

---

## ☁️ Deployment (Vercel / Firebase Hosting)

Sciolytics is built with **Vite** (not Create React App). 
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Framework Preset**: Vite

If deploying to Vercel, the included `vercel.json` ensures that single-page application (SPA) routing works correctly by redirecting all paths to `index.html`.

---

## 🔒 Security & Roles

- **Admin Capabilities**: Accounts designated as admins (e.g., in `firestoreService.ts`) have the ability to review community tests and officially publish them.
- **Firestore Rules**: Ensure your `firestore.rules` are deployed using `firebase deploy --only firestore:rules` to properly restrict read/write access for teams, private tests, and official question banks.
