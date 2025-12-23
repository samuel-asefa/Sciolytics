# Sciolytics

Science Olympiad practice platform built with React, TypeScript, and Vite.

## Deployment on Vercel

This project uses **Vite**, not Create React App. Make sure Vercel is configured to use Vite:

1. The `vercel.json` file is already configured correctly
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. Framework Preset: Vite

## Environment Variables

Create a `.env` file with your Firebase configuration:

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
```

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Important Notes

- This project uses **Vite**, not Create React App (`react-scripts`)
- The build output is in the `dist` directory
- Make sure Vercel is set to use Vite framework, not Create React App
