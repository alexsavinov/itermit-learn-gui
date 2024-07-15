import { IPageable } from "@shared";
import { ICategory } from "../../categories/interfaces";
import { IQuiz } from "../../quizzes/interfaces";
import { IQuestion } from "../../questions/interfaces";
import { User } from "@core";

export interface ISet {
  id?: number | string | null;
  name?: string;
  custom?: boolean;
  category?: ICategory;
  user?: User;
  quizzes?: IQuiz[];
  questions?: IQuestion[];
  createdDate?: string;
  lastUpdateDate?: string;
}

export interface IPageableSet extends IPageable {
  _embedded?: {
    questionSets: ISet[];
  };
}
