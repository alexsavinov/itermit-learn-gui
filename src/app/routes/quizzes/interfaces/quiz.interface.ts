import { IPageable } from "@shared";
import { IQuizAnswer } from ".";
import { ISource } from "../../sources/interfaces";
import { ICategory } from "../../categories/interfaces";

export interface IQuiz {
  id?: number | string | null;
  title?: string;
  content?: string;
  category?: ICategory;
  source?: ISource;
  quizAnswers?: IQuizAnswer[];
  createdDate?: string;
  lastUpdateDate?: string;
}

export interface IPageableQuiz extends IPageable {
  _embedded?: {
    quizzes: IQuiz[];
  };
}