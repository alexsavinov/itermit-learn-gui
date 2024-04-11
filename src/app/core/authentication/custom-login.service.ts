import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { LoginService, Menu, Token, User } from '@core';
import { environment } from '@env/environment';


@Injectable()
export class CustomLoginService extends LoginService {
  constructor(http: HttpClient) {
    super(http);
  }

  login(username: string, password: string, rememberMe = false) {
    return this.http.post<Token>(
      environment.apiUrl + '/auth/login',
      {username, password, rememberMe},
    );
  }

  register(username: string, password: string) {
    return this.http.post<User>(
      environment.apiUrl + '/auth/register',
      {username, password},
    );
  }

  refresh(params: Record<string, any>) {
    return this.http.post<any>(environment.apiUrl + '/auth/refreshtoken', params);
  }

  logout() {
    return this.http.post<any>(environment.apiUrl + '/auth/logout', {});
  }

  changePassword(id: number, password: string) {
    return this.http.patch<string>(environment.apiUrl + '/auth/password', {id, password});
  }

  changeAvatar(id: string, avatar: any): Observable<any> {
    const formData = new FormData();
    formData.append('id', id);
    formData.append('avatar', avatar);

    return this.http.post<string>(environment.apiUrl + '/auth/avatar', formData);
  }

  me() {
    return this.http.get<User>(environment.apiUrl + '/auth/me');
  }

  menu() {
    return this.http
      // .get<{ menu: Menu[] }>('assets/data/menu.json?_t=' + Date.now())
      .get<{ menu: Menu[] }>('assets/data/menu.json')
      .pipe(map(res => res.menu));
  }
}
