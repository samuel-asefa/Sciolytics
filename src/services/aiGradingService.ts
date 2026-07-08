import { getGenerativeModel, Schema, Type } from 'firebase/ai';
import { ai } from '../config/firebase';

const gradingSchema = Schema.object({
  properties: {
    isCorrect: Schema.boolean(),
    feedback: Schema.string()
  },
  required: ["isCorrect", "feedback"]
});

const model = getGenerativeModel(ai, {
  model: "gemini-2.5-flash-lite",
  generationConfig: {
    responseMimeType: "application/json",
    schema: gradingSchema,
    temperature: 0.1,
  }
});

export const aiGradingService = {
  async gradeFRQ(question: string, correctAnswer: string, explanation: string, userAnswer: string): Promise<{ isCorrect: boolean, feedback: string }> {
    if (!userAnswer || userAnswer.trim().length === 0) {
      return { isCorrect: false, feedback: "You did not provide an answer." };
    }

    const prompt = `You are an expert Science Olympiad grader.

**Question:**
${question}

**Official Correct Answer:**
${correctAnswer}

**Official Explanation:**
${explanation || 'None provided.'}

**Student Answer:**
${userAnswer}

Determine if the student's answer is correct based on the official correct answer. 
Allow for partial matches, synonyms, and slight typos as long as the core scientific concept is correct. Be strict but fair.

Return a JSON object with:
- "isCorrect": true if the student got the core concept right, false otherwise.
- "feedback": a short 1-3 sentence explanation directed to the student on why their answer is correct or incorrect.`;
    
    try {
      const result = await model.generateContent(prompt);
      const textResponse = result.response.text();
      return JSON.parse(textResponse);
    } catch (error) {
      console.error("AI Grading failed:", error);
      // Fallback logic if AI fails
      const answerLower = userAnswer.trim().toLowerCase();
      const correctLower = correctAnswer.trim().toLowerCase();
      const isCorrectFallback = answerLower.length > 3 && correctLower.includes(answerLower);
      return {
        isCorrect: isCorrectFallback,
        feedback: "AI grading was unavailable. Graded using simple keyword matching fallback."
      };
    }
  }
};
