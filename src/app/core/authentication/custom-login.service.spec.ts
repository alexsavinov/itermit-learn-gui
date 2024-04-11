import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { environment } from '@env/environment';
import { Token, User } from '@core';
import { CustomLoginService } from './custom-login.service';


describe('CustomLoginService', () => {
  let service: CustomLoginService;
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CustomLoginService],
    });

    service = TestBed.inject(CustomLoginService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login', () => {
    const mockResponse: Token = {
      access_token: 'eyJhbGc234JIUzUxMiJ9.eyJqdGkiOiIyIiwic3ViIjoic3BlbGw0NzdAZ21haWwuY29tIiwicm9sZXMiOlsiUk9MRV9BRE1JTiJdLCJpYXQiOjE3MDcxNDEwODMsImV4cCI6MTcwNzE0NzA4M30.ctvf_DohXJDAMyd1uSenHR9Tx4VugK_Ps2JiHfWbsqxqMmEuMuWEnhkUiz6Cwt190L2uwMpuOcd-bOgoVJtrXA',
      refresh_token: 'f22229ae-e4e0-42fe-8134-02438931127b',
      id: 2,
      username: 'user1@mail.com',
      roles: ['ROLE_ADMIN'],
    };

    service.login('user1@mail.com', 'pass', true)
      .subscribe(data => {
        expect(data).toEqual(mockResponse);
      });

    httpMock
      .expectOne(environment.apiUrl + '/auth/login')
      .flush(mockResponse);
  });

  it('should get error when login', () => {
    const mockError = {
      path: 'http://127.0.0.1:8080/login',
      message: 'Access Denied',
      timestamp: 1707141442784,
      status: 403,
      statusText: '',
    };

    service.login('user1@mail.com', 'pass', true)
      .subscribe({
        next: data => undefined,
        error: err => expect(err).toBeTruthy(),
      });

    httpMock
      .expectOne(environment.apiUrl + '/auth/login')
      .flush(null, mockError);
  });

  it('should register', () => {
    const mockResponse: User = {
      id: 2,
      username: 'user1@mail.com',
      createdDate: '2024-01-10T14:35:33.760Z',
      lastUpdateDate: '2024-01-15T16:13:09.811364Z',
      roles: [
        'ROLE_ADMIN',
      ],
      profile: {
        name: 'Alex',
        surname: 'FF',
        gender: 'MALE',
        city: '',
        address: '',
        company: '',
        mobile: '2222222222',
        tele: '',
        website: '',
        date: '',
        avatar: 'a875c79d2d11d29f7bc8987c86a5c500.png',
      },
    };

    service.register('user1@mail.com', 'pass')
      .subscribe(data => {
        expect(data).toEqual(mockResponse);
      });

    httpMock
      .expectOne(environment.apiUrl + '/auth/register')
      .flush(mockResponse);
  });


  it('should get error when register', () => {
    const mockError = {
      errorMessage: 'Requested resource already exists (username = user22@user.com)',
      errorCode: 40903,
      status: 409,
      statusText: '',
    };

    service.register('user1@mail.com', 'pass')
      .subscribe({
        next: data => undefined,
        error: err => expect(err).toBeTruthy(),
      });

    httpMock
      .expectOne(environment.apiUrl + '/auth/register')
      .flush(null, mockError);
  });

  it('should refresh', () => {
    const mockResponse = {
      access_token: 'ey11bGciOiJIUzUxMiJ9.eyJqdGkiOiIyIiwic3ViIjoic3BlbGw0NzdAZ21haWwuY29tIiwicm9sZXMiOlsiUk9MRV9BRE1JTiJdLCJpYXQiOjE3MDcxNDE0MTYsImV4cCI6MTcwNzE0NzQxNn0.yrTl9t8j5whJMXHDQOpVwW0rWLGZOaXeLYRKLRwzbgGiAB3EXDWLgSEFVm4Q0fnd-k9UBt73DuaKNr8szEi06g',
      refresh_token: '0ff27ce2-22d4-4bf6-96b0-efc80a6e3c8f',
    };

    service.refresh({refreshToken: '0ff27ce2-22d4-4bf6-96b0-efc80a6e3c8f'})
      .subscribe(data => {
        expect(data).toEqual(mockResponse);
      });

    httpMock
      .expectOne(environment.apiUrl + '/auth/refreshtoken')
      .flush(mockResponse);
  });

  it('should logout', () => {
    service.logout().subscribe(data => undefined);

    httpMock
      .expectOne(environment.apiUrl + '/auth/logout')
      .flush(null);
  });

  it('should change password', () => {
    service.changePassword(2, 'new pass')
      .subscribe(data => undefined);

    httpMock
      .expectOne(environment.apiUrl + '/auth/password')
      .flush(null);
  });


  it('should change avatar', () => {
    const mockResponse = {
      avatar: 'de46dd50f165c6514e2ef4b5d477bc19.png'
    };

    service.changeAvatar('2', 'avatar.jpg')
      .subscribe(data => {
        expect(data).toEqual(mockResponse);
      });

    httpMock
      .expectOne(environment.apiUrl + '/auth/avatar')
      .flush(mockResponse);
  });

  it('should get current user info', () => {
    const mockResponse: User = {
      id: 2,
      username: 'user1@mail.com',
      createdDate: '2024-01-10T14:35:33.760Z',
      lastUpdateDate: '2024-01-15T16:13:09.811364Z',
      roles: [
        'ROLE_ADMIN',
      ],
      profile: {
        name: 'Alex',
        surname: 'FF',
        gender: 'MALE',
        city: '',
        address: '',
        company: '',
        mobile: '2222222222',
        tele: '',
        website: '',
        date: '',
        avatar: 'a875c79d2d11d29f7bc8987c86a5c500.png',
      },
    };

    service.me()
      .subscribe(data => {
        expect(data).toEqual(mockResponse);
      });

    httpMock
      .expectOne(environment.apiUrl + '/auth/me')
      .flush(mockResponse);
  });

  it('should get menu data', () => {
    const mockResponse = of({menu: []})

    spyOn(Date, 'now').and.callFake(function () {
      return 1707143408705;
    });

    service.menu()
      .subscribe(data => {
        expect(data).toBeUndefined();
      });

    httpMock
      .expectOne('assets/data/menu.json')
      .flush(mockResponse);
  });
});
