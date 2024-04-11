import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';
import { User } from '@core';


export interface IPageableUsers {
  _embedded?: {
    users: User[];
  };
  items: any[];
  page: {
    size: number,
    totalElements: number,
    totalPages: number,
    number: number
  };
}

@Injectable({
  providedIn: 'root',
})
export class UsersService {

  constructor(protected http: HttpClient) {
  }

  getAll(parameters: any): Observable<IPageableUsers> {
    const params = new HttpParams().appendAll(parameters);
    return this.http.get<any>(`${environment.apiUrl}/users`, { params });
  }

  getById(id: string): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/users/${id}`);
  }

  create(user: User): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/users`, user);
  }

  update(user: User): Observable<User> {
    return this.http.patch<User>(`${environment.apiUrl}/users`, user);
  }

  deleteById(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${environment.apiUrl}/users/${id}`);
  }
}
