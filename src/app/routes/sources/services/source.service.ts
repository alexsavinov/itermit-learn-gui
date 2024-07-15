import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';
import { IPageableSource, ISource } from "../interfaces";


@Injectable({
  providedIn: 'root',
})
export class SourceService {
  constructor(protected http: HttpClient) {
  }

  getAll(parameters: any): Observable<IPageableSource> {
    const params = new HttpParams().appendAll(parameters);
    return this.http.get<any>(`${environment.apiUrl}/sources`, {params});
  }

  getById(id: string): Observable<ISource> {
    return this.http.get<ISource>(`${environment.apiUrl}/sources/${id}`);
  }

  create(source: ISource): Observable<ISource> {
    return this.http.post<ISource>(`${environment.apiUrl}/sources`, source);
  }

  update(source: ISource): Observable<ISource> {
    return this.http.patch<ISource>(`${environment.apiUrl}/sources`, source);
  }

  deleteById(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${environment.apiUrl}/sources/${id}`);
  }
}
