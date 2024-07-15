import { User } from '@core';
import { IPageable } from "@shared";
import { IQuizAnswer } from "../../quizzes/interfaces";
import { IUserAnswer } from "../../questions/interfaces";
import { ISet } from "../../sets/interfaces";
import { ICategory } from "../../categories/interfaces";
import { ISource } from "../../sources/interfaces";

export interface ISession {
  id?: number | string | null;
  quizAnswers?: IQuizAnswer[];
  userAnswers?: IUserAnswer[];
  user?: User;
  questionSet?: ISet;
  finishedDate?: string;
  createdDate?: string;
  lastUpdateDate?: string;
}

export interface IPageableSession extends IPageable{
  _embedded?: {
    sessions: ISession[];
  };
}

export interface ISessionStartRequest {
  user?: User;
  questionSet?: ISet;
  category?: ICategory;
  source?: ISource;
  mode?: string;
  totalItems?: number;
}