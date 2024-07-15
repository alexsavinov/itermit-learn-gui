import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';
import { IPageableSession, ISession, ISessionStartRequest } from "../interfaces";
import { IQuizAnswer } from "../../quizzes/interfaces";
import { IUserAnswer } from "../../questions/interfaces";


@Injectable({
  providedIn: 'root',
})
export class SessionsService {
  constructor(protected http: HttpClient) {
  }

  getAll(parameters: any): Observable<IPageableSession> {
    const params = new HttpParams().appendAll(parameters);
    return this.http.get<any>(`${environment.apiUrl}/sessions`, {params});
  }

  getById(id: string): Observable<ISession> {
    return this.http.get<ISession>(`${environment.apiUrl}/sessions/${id}`);
  }

  create(session: ISession): Observable<ISession> {
    return this.http.post<ISession>(
        `${environment.apiUrl}/sessions`, session
    );
  }

  addQuizAnswer(id: string, answer: IQuizAnswer): Observable<ISession> {
    return this.http.post<ISession>(
        `${environment.apiUrl}/sessions/${id}/quiz-answer`, answer
    );
  }

  addUserAnswer(id: string, answer: IUserAnswer): Observable<ISession> {
    return this.http.post<ISession>(
        `${environment.apiUrl}/sessions/${id}/user-answer`, answer
    );
  }

  update(session: ISession): Observable<ISession> {
    return this.http.patch<ISession>(
        `${environment.apiUrl}/sessions`, session
    );
  }

  deleteById(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${environment.apiUrl}/sessions/${id}`);
  }

  start(request: ISessionStartRequest) {
    return this.http.post<ISession>(`${environment.apiUrl}/sessions/start`, request);
  }

  finish(id: string): Observable<ISession> {
    return this.http.patch<ISession>(
        `${environment.apiUrl}/sessions/${id}/finish`, {}
    );
  }
}
