import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';

import { TranslateHttpLoaderFactory } from '../../../../app.module';
import { AuthService } from '@core';
import { ValidationMessagePipe } from '@shared/pipes';
import { ChangePasswordComponent } from './change-password.component';


describe('ChangePasswordComponent', () => {
  let component: ChangePasswordComponent;
  let fixture: ComponentFixture<ChangePasswordComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj(
      'AuthService',
      ['changePassword'],
    );
    authServiceSpy.changePassword.and.returnValue(of('password'));

    TestBed.configureTestingModule({
      declarations: [
        ChangePasswordComponent,
        ValidationMessagePipe
      ],
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: TranslateHttpLoaderFactory,
            deps: [HttpClient],
          },
        })
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MAT_DIALOG_DATA, useValue: { id: 1 } },
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA,
      ],
    });
    fixture = TestBed.createComponent(ChangePasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should submit password', () => {
    authServiceSpy.changePassword(1, 'password').subscribe({
      next: data => {
        expect(data).toEqual('password');
      },
    });

    component.submit();
  });

  it('should throw error when submit avatar', () => {
    authServiceSpy.changePassword.and.returnValue(throwError(() => of(new Error('error!'))));

    authServiceSpy.changePassword(1, 'password').subscribe({
      next: () => undefined,
      error: err => expect(err).toBeTruthy(),
    });

    component.submit();
  });
});
