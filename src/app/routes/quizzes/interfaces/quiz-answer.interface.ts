import { IQuiz } from "./quiz.interface";

export interface IQuizAnswer {
  id?: number | string | null;
  content?: string;
  sequence?: number;
  correct?: boolean;
  quiz?: IQuiz;
}
