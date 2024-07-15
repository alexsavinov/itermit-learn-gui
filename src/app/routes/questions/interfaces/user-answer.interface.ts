import { IQuestion } from ".";
import { ISession } from "../../answer-sessions/interfaces";

export interface IUserAnswer {
  id?: number | string | null;
  content?: string;
  question?: IQuestion;
  session?: ISession;
}
