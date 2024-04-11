import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';
import { IArticle, IPageableArticle } from '../interfaces';


@Injectable({
  providedIn: 'root',
})
export class NewsService {
  constructor(protected http: HttpClient) {
  }

  getAll(parameters: any): Observable<IPageableArticle> {
    const params = new HttpParams().appendAll(parameters);
    return this.http.get<any>(`${environment.apiUrl}/articles`, {params});
  }

  getById(id: string): Observable<IArticle> {
    return this.http.get<IArticle>(`${environment.apiUrl}/articles/${id}`);
  }

  create(article: IArticle): Observable<IArticle> {
    return this.http.post<IArticle>(
      `${environment.apiUrl}/articles`,
      {...article, authorId: article.author?.id},
    );
  }

  update(article: IArticle): Observable<IArticle> {
    return this.http.patch<IArticle>(
      `${environment.apiUrl}/articles`,
      {...article, authorId: article.author?.id},
    );
  }

  deleteById(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${environment.apiUrl}/articles/${id}`);
  }

  saveImage(image: any): Observable<any> {
    const formData = new FormData();
    formData.append('file', image);

    return this.http.post<any>(environment.apiUrl + '/articles/saveImage', formData);
  }
}
