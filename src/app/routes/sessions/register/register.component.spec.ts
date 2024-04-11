import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

import { AuthService } from '@core';
import { TranslateHttpLoaderFactory } from '../../../app.module';
import { RegisterComponent } from './register.component';
import { ValidationMessagePipe } from '@shared/pipes';


describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj(
      'AuthService',
      ['register'],
    );
    authServiceSpy.register.and.returnValue(of({ id: 3, username: 'new user' }));

    TestBed.configureTestingModule({
      declarations: [
        RegisterComponent,
        ValidationMessagePipe],
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
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.username).toBeTruthy();
    expect(component.password).toBeTruthy();
    expect(component.confirmPassword).toBeTruthy();
    expect(component.readAndAgree).toBeTruthy();
  });

  it('should register', () => {
    const navigateSpy = spyOn(router, 'navigateByUrl');

    authServiceSpy.register('user', 'pass').subscribe({
      next: data => {
        expect(data.id).toEqual(3);
        expect(data.username).toEqual('new user');
      },
    });

    component.register();

    expect(navigateSpy).toHaveBeenCalledWith('/auth/login');
  });

  it('should get error when register', () => {
    authServiceSpy.register.and
      .returnValue(throwError(() => of(new Error('error!'))));

    authServiceSpy.register('user', 'pass').subscribe({
      next: () => undefined,
      error: err => expect(err).toBeTruthy(),
    });

    component.register();
  });
});
