import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';
import { IPageableSet, ISet } from "../interfaces";


@Injectable({
  providedIn: 'root',
})
export class SetsService {
  constructor(protected http: HttpClient) {
  }

  getAll(parameters: any): Observable<IPageableSet> {
    const params = new HttpParams().appendAll(parameters);
    return this.http.get<any>(`${environment.apiUrl}/question-sets`, {params});
  }

  getById(id: string): Observable<ISet> {
    return this.http.get<ISet>(`${environment.apiUrl}/question-sets/${id}`);
  }

  create(set: ISet): Observable<ISet> {
    return this.http.post<ISet>(
      `${environment.apiUrl}/question-sets`, set
    );
  }

  update(set: ISet): Observable<ISet> {
    return this.http.patch<ISet>(
      `${environment.apiUrl}/question-sets`, set
    );
  }

  deleteById(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${environment.apiUrl}/question-sets/${id}`);
  }
}
