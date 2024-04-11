import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { UserPanelComponent } from './user-panel.component';
import { AuthService } from '@core';
import { TranslateHttpLoaderFactory } from '../../app.module';


describe('UserPanelComponent', () => {
  let component: UserPanelComponent;
  let fixture: ComponentFixture<UserPanelComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj(
      'AuthService',
      ['user', 'logout'],
    );
    authServiceSpy.user.and.returnValue(of({
      id: 1, username: 'user1', profile: { avatar: 'image.png' },
    }));
    authServiceSpy.logout.and.returnValue(of(true));

    TestBed.configureTestingModule({
      declarations: [UserPanelComponent],
      imports: [
        HttpClientTestingModule,
        RouterModule.forRoot([]),
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
    fixture = TestBed.createComponent(UserPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get user data from authService', () => {
    authServiceSpy.user().subscribe({
      next: data => {
        expect(component.user.id).toEqual(1);
        expect(component.user.username).toEqual('user1');
        expect(component.user.profile?.avatar).toEqual('image.png');
      },
    });
  });

  it('should logout', () => {
    const navigateSpy = spyOn(router, 'navigateByUrl');

    authServiceSpy.logout().subscribe({
      next: data => {
        expect(data).toBeTrue();
      },
    });

    component.logout();

    expect(navigateSpy).toHaveBeenCalledWith('/auth/login');
  });

});
