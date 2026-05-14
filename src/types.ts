/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer';

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options: string[];
  correctAnswer: number | string; // Index for choices, string for short answer
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  questions: Question[];
}

export interface AudioExercise {
  id: string;
  title: string;
  description: string;
  script: string;
  audioBase64?: string;
  comprehensionQuestions: Question[];
  finalQuiz?: Quiz;
  createdAt: number;
}

export type AppState = 'dashboard' | 'editor';

export interface EditorState {
  step: 'setup' | 'script' | 'questions' | 'quiz' | 'preview';
  exercise: AudioExercise;
}
