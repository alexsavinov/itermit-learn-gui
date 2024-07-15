import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';
import { IPageableCategory, ICategory } from "../interfaces";


@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  constructor(protected http: HttpClient) {
  }

  getAll(parameters: any): Observable<IPageableCategory> {
    const params = new HttpParams().appendAll(parameters);
    return this.http.get<any>(`${environment.apiUrl}/categories`, {params});
  }

  getById(id: string): Observable<ICategory> {
    return this.http.get<ICategory>(`${environment.apiUrl}/categories/${id}`);
  }

  create(category: ICategory): Observable<ICategory> {
    return this.http.post<ICategory>(
      `${environment.apiUrl}/categories`, category
    );
  }

  update(category: ICategory): Observable<ICategory> {
    return this.http.patch<ICategory>(
      `${environment.apiUrl}/categories`, category
    );
  }

  deleteById(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${environment.apiUrl}/categories/${id}`);
  }
}
