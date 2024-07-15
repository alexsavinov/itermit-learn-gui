import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";

import { environment } from "@env/environment";
import { IPageableQuestion, IQuestion } from "../interfaces";


@Injectable({
  providedIn: 'root'
})
export class QuestionService {

  constructor(protected http: HttpClient) {
  }

  getAll(parameters: any): Observable<IPageableQuestion> {
    const params = new HttpParams().appendAll(parameters);
    return this.http.get<any>(`${environment.apiUrl}/questions`, {params});
  }

  getById(id: string): Observable<IQuestion> {
    return this.http.get<IQuestion>(`${environment.apiUrl}/questions/${id}`);
  }

  create(question: IQuestion): Observable<IQuestion> {
    return this.http.post<IQuestion>(
        `${environment.apiUrl}/questions`, question
    );
  }

  update(question: IQuestion): Observable<IQuestion> {
    return this.http.patch<IQuestion>(
        `${environment.apiUrl}/questions`, question
    );
  }

  deleteById(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${environment.apiUrl}/questions/${id}`);
  }

  saveImage(image: any): Observable<any> {
    const formData = new FormData();
    formData.append('file', image);

    return this.http.post<any>(environment.apiUrl + '/questions/saveImage', formData);
  }
}
