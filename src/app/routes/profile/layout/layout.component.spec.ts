import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { AuthService } from '@core';
import { SafeUrlPipe } from '@shared/pipes/safe-url.pipe';
import { environment } from '@env/environment';
import { ProfileLayoutComponent } from './layout.component';


describe('LayoutComponent', () => {
  let component: ProfileLayoutComponent;
  let fixture: ComponentFixture<ProfileLayoutComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['user']);
    authServiceSpy.user.and.returnValue(of({
      id: 1, username: 'user1', profile: { avatar: 'image.png' },
    }));

    TestBed.configureTestingModule({
      declarations: [ProfileLayoutComponent, SafeUrlPipe],
      providers: [{ provide: AuthService, useValue: authServiceSpy }],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA,
      ],
    });
    fixture = TestBed.createComponent(ProfileLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get user data from authService ', () => {
    authServiceSpy.user().subscribe({
      next: data => {
        expect(component.user.id).toEqual(1);
        expect(component.user.username).toEqual('user1');
        expect(component.user.profile?.avatar).toEqual('image.png');
        expect(component.avatar).toEqual(environment.staticUrl + environment.avatarImages + 'image.png');
      },
    });
  });
});
