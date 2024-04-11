import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { environment } from '@env/environment';
import { IPageableUsers, UsersService } from './users.service';
import { HttpClient } from '@angular/common/http';
import { User } from '@core';


describe('UsersService', () => {
  let service: UsersService;
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UsersService]
    });
    service = TestBed.inject(UsersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all users', () => {
    const mockResponse: IPageableUsers = {
      items: [],
      page: { size: 1, totalPages: 1, totalElements: 1, number: 1 },
    };

    const parameters = {
      page: '10',
      sort: 'name,desc',
      size: 3,
      search: 'test'
    };

    service.getAll(parameters).subscribe(data => {
      expect(data).toEqual(mockResponse);
    });

    httpMock
      .expectOne(environment.apiUrl + '/users?page=10&sort=name,desc&size=3&search=test')
      .flush(mockResponse);
  });

  it('should get user by id', () => {
    const mockResponse: User = {
      id: 11,
    };

    service.getById('11').subscribe(data => {
      expect(data).toEqual(mockResponse);
    });

    httpMock
      .expectOne(environment.apiUrl + '/users/11')
      .flush(mockResponse);
  });

  it('should create user', () => {
    const mockResponse: User = {
      id: 11,
      name: 'User1'
    };

    const parameters: User = {
      name: 'User1'
    };

    service.create(parameters).subscribe(data => {
      expect(data).toEqual(mockResponse);
    });

    httpMock
      .expectOne(environment.apiUrl + '/users')
      .flush(mockResponse);
  });

  it('should update user by id', () => {
    const mockResponse: User = {
      id: 11,
      name: 'User1'
    };

    const parameters: User = {
      id: 11,
      name: 'User1'
    };

    service.update(parameters).subscribe(data => {
      expect(data).toEqual(mockResponse);
    });

    httpMock
      .expectOne(environment.apiUrl + '/users')
      .flush(mockResponse);
  });

  it('should delete user by id', () => {
    service.deleteById(11).subscribe(data => {
      expect(data).toEqual(true);
    });

    httpMock
      .expectOne(environment.apiUrl + '/users/11')
      .flush(true);
  });
});
