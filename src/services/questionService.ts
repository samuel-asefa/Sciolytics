import { questionBank as staticQuestionBank, getSubtopicList, type Question } from '../data/questionBank';
import { firestoreService } from './firestoreService';

export interface QuestionFilter {
  event?: string;
  subtopic?: string;
  division?: 'B' | 'C' | 'Both';
  type?: 'MCQ' | 'FRQ' | 'All';
  difficulty?: 'Easy' | 'Medium' | 'Hard' | 'All';
  limit?: number;
  /** Restrict to exactly these question ids (e.g. "retry missed"). */
  ids?: string[];
  /** Skip these ids (e.g. "only unanswered"). */
  excludeIds?: string[];
}

export interface UserProgress {
  questionsAnswered: number;
  questionsCorrect: number;
  accuracy: number;
  byEvent: Record<string, { answered: number; correct: number }>;
  bySubtopic: Record<string, { answered: number; correct: number }>;
  favorites: string[];
}

let combinedQuestionBank: Question[] = [...staticQuestionBank];
let isInitialized = false;

export const questionService = {
  async initialize() {
    if (isInitialized) return;
    try {
      const officialQuestions = await firestoreService.getOfficialQuestions();
      combinedQuestionBank = [...staticQuestionBank, ...officialQuestions];
      isInitialized = true;
    } catch (err) {
      console.error('Failed to load official questions:', err);
      // Fallback to just static bank
      combinedQuestionBank = [...staticQuestionBank];
    }
  },

  getAllQuestions(): Question[] {
    return combinedQuestionBank;
  },

  getQuestions(filter: QuestionFilter = {}): Question[] {
    let questions = [...combinedQuestionBank];

    if (filter.ids && filter.ids.length) {
      const wanted = new Set(filter.ids);
      questions = questions.filter(q => wanted.has(q.id));
    }
    if (filter.excludeIds && filter.excludeIds.length) {
      const skip = new Set(filter.excludeIds);
      questions = questions.filter(q => !skip.has(q.id));
    }
    if (filter.event) questions = questions.filter(q => q.event === filter.event);
    if (filter.subtopic && filter.event) questions = questions.filter(q => q.subtopic === filter.subtopic);
    if (filter.division && filter.division !== 'Both') questions = questions.filter(q => q.division === filter.division || q.division === 'Both');
    if (filter.type && filter.type !== 'All') questions = questions.filter(q => q.type === filter.type);
    if (filter.difficulty && filter.difficulty !== 'All') questions = questions.filter(q => q.difficulty === filter.difficulty);

    // Fisher–Yates: an unbiased shuffle (sort(() => Math.random() - 0.5) is skewed)
    for (let i = questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questions[i], questions[j]] = [questions[j], questions[i]];
    }
    if (filter.limit) questions = questions.slice(0, filter.limit);
    return questions;
  },

  getById(id: string): Question | undefined {
    return combinedQuestionBank.find(q => q.id === id);
  },

  getSubtopics(event: string): string[] {
    return getSubtopicList(event);
  },

  getProgress(): UserProgress {
    const saved = localStorage.getItem('userProgress');
    if (saved) return JSON.parse(saved);
    return { questionsAnswered: 0, questionsCorrect: 0, accuracy: 0, byEvent: {}, bySubtopic: {}, favorites: [] };
  },

  saveProgress(progress: UserProgress): void {
    localStorage.setItem('userProgress', JSON.stringify(progress));
  },

  recordAnswer(question: Question, isCorrect: boolean): void {
    const progress = this.getProgress();
    progress.questionsAnswered += 1;
    if (isCorrect) progress.questionsCorrect += 1;
    progress.accuracy = progress.questionsCorrect / progress.questionsAnswered * 100;

    if (!progress.byEvent[question.event]) progress.byEvent[question.event] = { answered: 0, correct: 0 };
    progress.byEvent[question.event].answered += 1;
    if (isCorrect) progress.byEvent[question.event].correct += 1;

    const subtopicKey = `${question.event}:${question.subtopic}`;
    if (!progress.bySubtopic[subtopicKey]) progress.bySubtopic[subtopicKey] = { answered: 0, correct: 0 };
    progress.bySubtopic[subtopicKey].answered += 1;
    if (isCorrect) progress.bySubtopic[subtopicKey].correct += 1;

    this.saveProgress(progress);
  },

  toggleFavorite(event: string): boolean {
    const progress = this.getProgress();
    const index = progress.favorites.indexOf(event);
    if (index > -1) {
      progress.favorites.splice(index, 1);
      this.saveProgress(progress);
      return false;
    } else {
      progress.favorites.push(event);
      this.saveProgress(progress);
      return true;
    }
  },

  isFavorite(event: string): boolean {
    return this.getProgress().favorites.includes(event);
  },

  getDailyStats(): { answered: number; correct: number; accuracy: number } {
    const today = new Date().toDateString();
    const saved = localStorage.getItem(`dailyStats_${today}`);
    if (saved) return JSON.parse(saved);
    return { answered: 0, correct: 0, accuracy: 0 };
  },

  recordDailyAnswer(isCorrect: boolean): void {
    const today = new Date().toDateString();
    const stats = this.getDailyStats();
    stats.answered += 1;
    if (isCorrect) stats.correct += 1;
    stats.accuracy = stats.correct / stats.answered * 100;
    localStorage.setItem(`dailyStats_${today}`, JSON.stringify(stats));
  },
};
