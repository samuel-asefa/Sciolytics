# Sciolytics 🔬

[![React](https://img.shields.io/badge/React-18-blue.svg?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-Fast-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Backend-FFCA28.svg?logo=firebase)](https://firebase.google.com/)
[![Gemini](https://img.shields.io/badge/AI-Gemini-8E75B2.svg?logo=google)](https://deepmind.google/technologies/gemini/)

A powerful, modern practice platform and community hub built for **Science Olympiad** competitors, coaches, and teams. 

Sciolytics goes beyond simple multiple-choice quizzes by offering deep analytics, team collaboration, custom test creation, and AI-powered study tools to help you dominate your events.

---

## 📚 Table of Contents
1. [Features](#-features)
2. [Tech Stack](#-tech-stack)
3. [Project Structure](#-project-structure)
4. [Getting Started (Local Development)](#-getting-started-local-development)
5. [Deployment](#-deployment)
6. [Security & Roles](#-security--roles)
7. [Contributing](#-contributing)

---

## ✨ Features

- **Massive Dynamic Question Bank**: Practice tests covering all major Science Olympiad events (Divisions B & C). Filter by difficulty, question type (MCQ/FRQ), subtopic, and unanswered questions.
- **Gemini AI Test Importer**: Paste your study guides, rule manuals, or Wikipedia articles. Using Google's Gemini AI, Sciolytics will instantly extract and generate high-quality multiple-choice and free-response questions.
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

## 📂 Project Structure

```text
Sciolytics/
├── src/
│   ├── components/      # Reusable UI components (NavBar, Modals, Loading screens)
│   ├── contexts/        # React context providers (AuthContext, ThemeContext, UserDataContext)
│   ├── data/            # Static data, default configurations, and wiki data
│   ├── pages/           # Main route components (Dashboard, TestEditor, Teams, Practice)
│   ├── services/        # Firebase integrations (firestoreService.ts, geminiService.ts)
│   ├── App.tsx          # Main application routing and wrapper
│   └── index.css        # Global CSS, theme variables, and shared utility classes
├── firestore.rules      # Security rules for Firebase Cloud Firestore
├── vercel.json          # Deployment configuration for Vercel SPA routing
└── package.json         # Node.js dependencies and scripts
```

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

## ☁️ Deployment

Sciolytics is built with **Vite** (not Create React App). 
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Framework Preset**: Vite

If deploying to Vercel, the included `vercel.json` ensures that single-page application (SPA) routing works correctly by redirecting all paths to `index.html`.

---

## 🔒 Security & Roles

- **Admin Capabilities**: Accounts designated as admins (e.g., in `firestoreService.ts`) have the ability to review community tests and officially publish them.
- **Firestore Rules**: Ensure your `firestore.rules` are deployed using `firebase deploy --only firestore:rules` to properly restrict read/write access for teams, private tests, and official question banks.

---

## 🤝 Contributing

We welcome contributions to expand the Sciolytics ecosystem!
1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

*Sciolytics - Practice smarter, not harder.*
