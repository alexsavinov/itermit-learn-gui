import { Inject, Injectable, Optional } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { TokenService } from '@core/authentication';
import { BASE_URL } from './base-url-interceptor';
import { environment } from '@env/environment';


@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private hasHttpScheme = (url: string) => new RegExp('^http(s)?://', 'i').test(url);

  constructor(
    private tokenService: TokenService,
    private router: Router,
    @Optional() @Inject(BASE_URL) private baseUrl?: string
  ) {
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const handler = () => {
      if (request.url.includes('/auth/logout')) {
        this.router.navigateByUrl('/auth/login').then();

      }
      if (this.router.url.includes('/auth/login')) {
        this.router.navigateByUrl('/admin/dashboard').then();
      }

    };

    if (this.tokenService.valid() && this.shouldAppendToken(request.url)) {
      return next
        .handle(
          request.clone({
            headers: request.headers.append('Authorization', this.tokenService.getBearerToken()),
            withCredentials: true,
          })
        )
        .pipe(
          catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
              this.tokenService.clear();
            }
            return throwError(() => error);
          }),
          tap(() => handler())
        );
    }

    return next.handle(request).pipe(tap(() => handler()));
  }

  private shouldAppendToken(url: string) {
    return !this.hasHttpScheme(url) || this.includeBaseUrl(url) || this.includeApiUrl(url);
  }

  private includeBaseUrl(url: string) {
    if (!this.baseUrl) {
      return false;
    }

    const baseUrl = this.baseUrl.replace(/\/$/, '');

    return new RegExp(`^${baseUrl}`, 'i').test(url);
  }

  private includeApiUrl(url: string) {
    return new RegExp(`^${environment.apiUrl}`, 'i').test(url);
  }
}
