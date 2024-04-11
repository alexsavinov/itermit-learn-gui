import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { of } from 'rxjs';

import { Menu } from '@core';
import { Token, User } from './interface';


@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor(protected http: HttpClient) {
  }

  login(username: string, password: string, rememberMe = false) {
    return this.http.post<Token>('/auth/login', {username, password, rememberMe});
  }

  register(username: string, password: string) {
    return this.http.post<User>('/auth/register', {username, password});
  }

  refresh(params: Record<string, any>) {
    return this.http.post<Token>('/auth/refresh', params);
  }

  logout() {
    return this.http.post<any>('/auth/logout', {});
  }

  me() {
    return this.http.get<User>('/me');
  }

  menu() {
    return this.http.get<{ menu: Menu[] }>('/me/menu').pipe(map(res => res.menu));
  }

  changeAvatar(id: string, password: string) {
    return of('')
  }

  changePassword(id: number, password: string) {
    return of('')
  }
}
