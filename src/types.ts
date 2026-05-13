/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number; // Index of the correct option
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
