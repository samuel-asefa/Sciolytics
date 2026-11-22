import { getGenerativeModel, Schema } from 'firebase/ai';
import { ai } from '../config/ai';
import type { Question } from '../data/questionBank';

/**
 * Small AI helpers used across the app:
 *  - explainMistake: why the student's MCQ pick is wrong (practice + results)
 *  - modifyQuestion: rewrite a question in the test editor (issue #25)
 */

const tutorModel = getGenerativeModel(ai, {
  model: 'gemini-2.5-flash-lite',
  generationConfig: { temperature: 0.3, maxOutputTokens: 400 },
});

const questionSchema = Schema.object({
  properties: {
    question: Schema.string(),
    options: Schema.array({ items: Schema.string() }),
    answer: Schema.string(),
    explanation: Schema.string(),
    difficulty: Schema.string(),
  },
  required: ['question', 'answer', 'explanation'],
});

const editorModel = getGenerativeModel(ai, {
  model: 'gemini-2.5-flash',
  generationConfig: {
    responseMimeType: 'application/json',
    responseSchema: questionSchema,
    temperature: 0.5,
  },
});

export type QuestionModification =
  | 'harder'
  | 'easier'
  | 'rephrase'
  | 'distractors'
  | 'explanation'
  | 'toFRQ'
  | 'toMCQ'
  | 'custom';

const MOD_INSTRUCTIONS: Record<Exclude<QuestionModification, 'custom'>, string> = {
  harder: 'Make this question noticeably harder (deeper reasoning, multi-step, or finer distinctions) while staying on the same subtopic and Science Olympiad scope.',
  easier: 'Make this question easier and more direct, suitable for a newer competitor, while keeping it on the same subtopic.',
  rephrase: 'Rephrase the question for clarity and concision without changing what it tests or its answer.',
  distractors: 'Keep the question and correct answer, but write stronger, plausible distractor options that target common misconceptions.',
  explanation: 'Keep the question, options and answer exactly as they are, and write a clear, accurate 2-4 sentence explanation of why the answer is correct (and why common wrong answers are wrong, for MCQ).',
  toFRQ: 'Convert this into a free-response question with a concise model answer.',
  toMCQ: 'Convert this into a multiple-choice question with exactly 4 options, one correct.',
};

export const aiTutorService = {
  async explainMistake(q: Question, chosen: string): Promise<string> {
    const prompt = `You are a friendly, precise Science Olympiad coach for the event "${q.event}" (subtopic: ${q.subtopic}).
A student answered a multiple-choice question incorrectly. In 2-4 short sentences, explain the key idea, why their choice is wrong, and how to recognize the right answer next time. Do not restate the whole question. No markdown headings.

Question: ${q.question}
Options: ${(q.options ?? []).join(' | ')}
Student chose: ${chosen}
Correct answer: ${q.correctAnswer}
${q.explanation ? `Official explanation: ${q.explanation}` : ''}`;
    const res = await tutorModel.generateContent(prompt);
    return res.response.text().trim();
  },

  async modifyQuestion(q: Question, mode: QuestionModification, customInstruction?: string): Promise<Partial<Question>> {
    const instruction = mode === 'custom' ? (customInstruction || 'Improve this question.') : MOD_INSTRUCTIONS[mode];
    const targetType = mode === 'toFRQ' ? 'FRQ' : mode === 'toMCQ' ? 'MCQ' : q.type;
    const prompt = `You are an expert Science Olympiad test writer for the event "${q.event || 'General'}".
Task: ${instruction}

Rules:
- Output type must be ${targetType}.
- For MCQ: return exactly 4 "options"; "answer" must exactly equal one of the options.
- For FRQ: return an empty "options" array and a concise model "answer".
- "difficulty" must be one of Easy, Medium, Hard.
- Be scientifically accurate.

Current question (JSON):
${JSON.stringify({ type: q.type, question: q.question, options: q.options ?? [], answer: q.correctAnswer, explanation: q.explanation ?? '', difficulty: q.difficulty, subtopic: q.subtopic })}`;

    const res = await editorModel.generateContent(prompt);
    const raw = res.response.text().replace(/^```json\s*/, '').replace(/\s*```$/, '');
    const parsed = JSON.parse(raw) as { question: string; options?: string[]; answer: string; explanation: string; difficulty?: string };
    const difficulty = parsed.difficulty === 'Easy' || parsed.difficulty === 'Medium' || parsed.difficulty === 'Hard' ? parsed.difficulty : q.difficulty;
    const options = targetType === 'MCQ' ? (parsed.options ?? []).slice(0, 6) : [];
    let answer = parsed.answer;
    if (targetType === 'MCQ' && options.length && !options.includes(answer)) {
      // Snap to the closest option if the model drifted on punctuation/case
      const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
      answer = options.find(o => norm(o) === norm(answer)) ?? options[0];
    }
    return {
      type: targetType,
      question: parsed.question,
      options,
      correctAnswer: answer,
      explanation: parsed.explanation,
      difficulty,
    };
  },
};
