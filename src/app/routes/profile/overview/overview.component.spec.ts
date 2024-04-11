import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { AuthService } from '@core';
import { ProfileOverviewComponent } from './overview.component';


describe('ProfileOverviewComponent', () => {
  let component: ProfileOverviewComponent;
  let fixture: ComponentFixture<ProfileOverviewComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['user']);
    authServiceSpy.user.and.returnValue(of({
      id: 1, username: 'user1', profile: { avatar: 'image.png' },
    }));

    TestBed.configureTestingModule({
      declarations: [ProfileOverviewComponent],
      providers: [{ provide: AuthService, useValue: authServiceSpy }],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA,
      ],
    });
    fixture = TestBed.createComponent(ProfileOverviewComponent);
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
      },
    });

  });
});
