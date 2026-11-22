import { getAI, GoogleAIBackend } from 'firebase/ai';
import app from './firebase';

/** Firebase AI (Gemini). Lives in its own module so it only loads with AI features. */
export const ai = getAI(app, { backend: new GoogleAIBackend() });
