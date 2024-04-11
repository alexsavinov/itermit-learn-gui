import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { AuthService, ERROR_CODE } from '@core';
import { TranslateHttpLoaderFactory } from '../../../app.module';
import { LoginComponent } from './login.component';
import { ValidationMessagePipe } from "@shared/pipes/validation-message.pipe";


describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj(
      'AuthService',
      ['login'],
    );
    authServiceSpy.login.and.returnValue(of(true));

    TestBed.configureTestingModule({
      declarations: [LoginComponent, ValidationMessagePipe],
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: TranslateHttpLoaderFactory,
            deps: [HttpClient],
          },
        }),
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA,
      ],
    });

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.rememberMe).toBeTruthy();
  });

  it('should login', () => {
    const navigateSpy = spyOn(router, 'navigateByUrl');

    authServiceSpy.login('user', 'pass', true).subscribe({
      next: data => {
        expect(data).toBeTrue();
      },
    });

    component.login();

    expect(navigateSpy).toHaveBeenCalledWith('/');
  });

  it('should throw error BAD_CREDENTIALS when login', () => {
    const error = {
      status: 401,
      message: 'You are not logged in',
      error: { errorCode: ERROR_CODE.BAD_CREDENTIALS }
    } as HttpErrorResponse;

    authServiceSpy.login.and.returnValue(throwError(error));

    authServiceSpy.login('user', 'pass', true).subscribe({
      next: () => undefined,
      error: err => {
        expect(err).toBeTruthy();
        expect(err.error.errorCode).toEqual(ERROR_CODE.BAD_CREDENTIALS);
      },
    });

    component.login();
  });

  it('should throw error USERNAME_NOT_FOUND when login', () => {
    const error = {
      status: 401,
      message: 'You are not logged in',
      error: { errorCode: ERROR_CODE.USERNAME_NOT_FOUND }
    } as HttpErrorResponse;

    authServiceSpy.login.and.returnValue(throwError(error));

    authServiceSpy.login('user', 'pass', true).subscribe({
      next: () => undefined,
      error: err => {
        expect(err).toBeTruthy();
        expect(err.error.errorCode).toEqual(ERROR_CODE.USERNAME_NOT_FOUND);
      },
    });

    component.login();
  });
});
