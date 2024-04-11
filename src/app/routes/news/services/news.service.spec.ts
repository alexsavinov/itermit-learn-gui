import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';

import { environment } from '@env/environment';
import { NewsService } from './news.service';
import { IArticle, IPageableArticle } from '../interfaces';


describe('NewsService', () => {
  let service: NewsService;
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [NewsService],
    });
    service = TestBed.inject(NewsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all news', () => {
    const mockResponse: IPageableArticle = {
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
      .expectOne(environment.apiUrl + '/articles?page=10&sort=name,desc&size=3&search=test')
      .flush(mockResponse);
  });


  it('should get user by id', () => {
    const mockResponse: IArticle = {
      id: 11,
      title: 'News 1'
    };

    service.getById('11').subscribe(data => {
      expect(data).toEqual(mockResponse);
    });

    httpMock
      .expectOne(environment.apiUrl + '/articles/11')
      .flush(mockResponse);
  });

  it('should create', () => {
    const mockResponse: IArticle = {
      id: 11,
      title: 'News 1'
    };

    const parameters: IArticle = {
      title: 'News 1'
    };

    service.create(parameters).subscribe(data => {
      expect(data).toEqual(mockResponse);
    });

    httpMock
      .expectOne(environment.apiUrl + '/articles')
      .flush(mockResponse);
  });

  it('should update user by id', () => {
    const mockResponse: IArticle = {
      id: 11,
      title: 'News 1'
    };

    const parameters: IArticle = {
      id: 11,
      title: 'News 1'
    };

    service.update(parameters).subscribe(data => {
      expect(data).toEqual(mockResponse);
    });

    httpMock
      .expectOne(environment.apiUrl + '/articles')
      .flush(mockResponse);
  });

  it('should delete user by id', () => {
    service.deleteById(11).subscribe(data => {
      expect(data).toEqual(true);
    });

    httpMock
      .expectOne(environment.apiUrl + '/articles/11')
      .flush(true);
  });


  it('should save image', () => {
    const mockResponse = {
      location: 'test.jpg'
    };

    service.saveImage('test blob data').subscribe(data => {
      expect(data).toEqual(mockResponse);
    });

    httpMock
      .expectOne(environment.apiUrl + '/articles/saveImage')
      .flush(mockResponse);
  });
});
