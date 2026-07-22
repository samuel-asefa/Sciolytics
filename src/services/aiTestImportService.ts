import { getGenerativeModel, Schema } from 'firebase/ai';
import { ai } from '../config/firebase';
import type { Question } from '../data/questionBank';
import { v4 as uuidv4 } from 'uuid';

const testSchema = Schema.object({
  properties: {
    questions: Schema.array({
      items: Schema.object({
        properties: {
          subtopic: Schema.string(),
          difficulty: Schema.string(), // "Easy", "Medium", "Hard"
          type: Schema.string(), // "MCQ" or "FRQ"
          question: Schema.string(),
          options: Schema.array({ items: Schema.string() }),
          answer: Schema.string(),
          explanation: Schema.string()
        },
        required: ["subtopic", "difficulty", "type", "question", "answer"]
      })
    })
  },
  required: ["questions"]
});

const model = getGenerativeModel(ai, {
  model: "gemini-2.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: testSchema,
    temperature: 0.2,
  }
});

export const aiTestImportService = {
  async generateTestFromText(text: string, event: string): Promise<Question[]> {
    if (!text || text.trim().length === 0) {
      throw new Error("No text provided for import.");
    }

    const prompt = `You are an expert Science Olympiad test writer.
I will provide you with raw text/notes. Extract and generate high-quality test questions from this material.

Event: ${event}
Format constraints:
- Generate a mix of Multiple Choice Questions (MCQ) and Free Response Questions (FRQ).
- MCQ must have exactly 4 options. The "options" array should contain the 4 strings.
- "answer" for MCQ must perfectly match one of the options.
- "answer" for FRQ must be the correct expected response.
- "difficulty" must be one of: "Easy", "Medium", "Hard".
- "type" must be one of: "MCQ", "FRQ".
- Provide a brief "explanation" for why the answer is correct.

Here is the material to base the questions on:
---
${text}
---`;

    try {
      const result = await model.generateContent(prompt);
      const textResponse = result.response.text();
      
      let parsed;
      try {
        parsed = JSON.parse(textResponse);
      } catch (e) {
        console.error("Failed to parse AI response as JSON", textResponse);
        throw new Error("Invalid AI output format.");
      }

      if (!parsed || !Array.isArray(parsed.questions)) {
        throw new Error("Unexpected AI output structure.");
      }

      return parsed.questions.map((q: any) => ({
        id: uuidv4(),
        event,
        subtopic: q.subtopic || 'General',
        difficulty: (q.difficulty === 'Easy' || q.difficulty === 'Medium' || q.difficulty === 'Hard') ? q.difficulty : 'Medium',
        type: (q.type === 'MCQ' || q.type === 'FRQ') ? q.type : 'FRQ',
        question: q.question,
        options: q.type === 'MCQ' ? (q.options || []) : undefined,
        answer: q.answer,
        explanation: q.explanation || ''
      }));
    } catch (error) {
      console.error('Error generating test from text:', error);
      throw error;
    }
  }
};
