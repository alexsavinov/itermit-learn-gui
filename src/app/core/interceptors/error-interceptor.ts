import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { LoginService, TokenService } from '@core/authentication';


export enum STATUS {
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500
}

export enum ERROR_CODE {
  REFRESH_TOKEN_EXPIRED = 10001,
  REFRESH_TOKEN_NOT_FOUND = 10002,
  BAD_CREDENTIALS = 10402,
  USERNAME_NOT_FOUND = 10403,
  USERNAME_ALREADY_EXISTS = 40903
}

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private errorPages = [STATUS.FORBIDDEN, STATUS.NOT_FOUND, STATUS.INTERNAL_SERVER_ERROR];

  private getMessage = (error: HttpErrorResponse) => {
    if (error.error?.message) {
      return error.error.message;
    }
    if (error.error?.msg) {
      return error.error.msg;
    }
    if (error.error?.errorMessage) {
      return error.error.errorMessage;
    }
    return `${error.status} ${error.statusText}`;
  };

  constructor(
    private router: Router,
    private toast: ToastrService,
    private tokenService: TokenService,
    private loginService: LoginService) {
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next
      .handle(request)
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error, request, next)));
  }

  isRefreshing = false;

  private handleError(error: HttpErrorResponse, request: HttpRequest<any>, next: HttpHandler) {
    const {errorCode, errorMessage} = error.error;

    if (this.errorPages.includes(error.status)) {
      this.router.navigateByUrl(`/${error.status}`, {
        skipLocationChange: true,
      });
    } else {
      this.toast.error(this.getMessage(error));

      if (errorCode === ERROR_CODE.REFRESH_TOKEN_EXPIRED
        || errorCode === ERROR_CODE.REFRESH_TOKEN_NOT_FOUND) {
        this.router.navigateByUrl('/auth/login');
      } else if (errorCode === ERROR_CODE.USERNAME_NOT_FOUND
        || errorCode === ERROR_CODE.BAD_CREDENTIALS
        || errorCode === ERROR_CODE.USERNAME_ALREADY_EXISTS) {
      } else if (error.status === STATUS.UNAUTHORIZED) {
        return this.handleAccessError(request, next);
      } else {
        console.error('FIXME: ERROR in error-interceptor', error);
      }
    }

    return throwError(() => error);
  }

  handleAccessError(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;

      const refreshToken = this.tokenService.getRefreshToken();
      if (refreshToken == null) {
        this.isRefreshing = false;
        this.tokenService.set(undefined);
        this.router.navigateByUrl('/auth/login');
      } else {
        console.log('-- handleAccessError -- 401 - token expired? refreshToken', refreshToken);
        this.loginService.refresh({refreshToken}).subscribe(data => {
            this.tokenService.set(data);
            return next.handle(
              request.clone({
                headers: request.headers.append('Authorization', data.access_token),
                withCredentials: true,
              }),
            );
          },
          (error) => {
            this.isRefreshing = false;
            const {errorCode, errorMessage} = error.error;
            // this.tokenService.clear();

            if (errorCode === ERROR_CODE.REFRESH_TOKEN_EXPIRED
              || errorCode === ERROR_CODE.REFRESH_TOKEN_NOT_FOUND) {
              this.isRefreshing = false;
              this.tokenService.set(undefined);
              this.router.navigateByUrl('/auth/login');
              return;
            }
            this.toast.error(this.getMessage(error));
            return throwError(() => new Error(`${error}`));
          });
      }

      this.isRefreshing = false;
    }
    return of(undefined);
  }
}
