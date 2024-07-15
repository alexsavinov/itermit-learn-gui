import { IPageable } from "@shared";
import { IAnswer } from ".";
import { ISource } from "../../sources/interfaces";
import { ICategory } from "../../categories/interfaces";

export interface IQuestion {
  id?: number | string | null;
  title?: string;
  content?: string;
  answer?: IAnswer;
  category?: ICategory;
  source?: ISource;
  createdDate?: string;
  lastUpdateDate?: string;
}

export interface IPageableQuestion extends IPageable {
  _embedded?: {
    questions: IQuestion[];
  };
}