import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";

import { environment } from "@env/environment";
import { IPageableQuiz, IQuiz } from "../interfaces";


@Injectable({
  providedIn: 'root'
})
export class QuizService {

  constructor(protected http: HttpClient) {
  }

  getAll(parameters: any): Observable<IPageableQuiz> {
    const params = new HttpParams().appendAll(parameters);
    return this.http.get<any>(`${environment.apiUrl}/quizzes`, {params});
  }

  getById(id: string): Observable<IQuiz> {
    return this.http.get<IQuiz>(`${environment.apiUrl}/quizzes/${id}`);
  }

  create(question: IQuiz): Observable<IQuiz> {
    return this.http.post<IQuiz>(`${environment.apiUrl}/quizzes`, question);
  }

  update(question: IQuiz): Observable<IQuiz> {
    return this.http.patch<IQuiz>(`${environment.apiUrl}/quizzes`, question);
  }

  deleteById(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${environment.apiUrl}/quizzes/${id}`);
  }

  saveImage(image: any): Observable<any> {
    const formData = new FormData();
    formData.append('file', image);

    return this.http.post<any>(environment.apiUrl + '/quizzes/saveImage', formData);
  }
}
