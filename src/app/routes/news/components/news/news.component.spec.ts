import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router, RouterModule } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';

import { TranslateHttpLoaderFactory } from '../../../../app.module';
import { environment } from '@env/environment';
import { NewsComponent } from './news.component';
import { NewsService } from '../../services';


describe('NewsComponent', () => {
  let component: NewsComponent;
  let fixture: ComponentFixture<NewsComponent>;
  let router: Router;
  let newsServiceSpy: jasmine.SpyObj<NewsService>;
  let toastrService: jasmine.SpyObj<ToastrService>;

  beforeEach(() => {
    newsServiceSpy = jasmine.createSpyObj(
      'NewsService',
      ['getAll', 'deleteById'],
    );
    const mockResponse = {
      _embedded: {articles: [{title: 'title1'}, {title: 'title2'}]},
      items: [],
      page: {size: 1, totalElements: 2, totalPages: 1, number: 0},
    };
    newsServiceSpy.getAll.and.returnValue(of(mockResponse));
    newsServiceSpy.deleteById.and.returnValue(of(true));

    toastrService = jasmine.createSpyObj<ToastrService>(
      'ToasterService',
      ['warning']
    );

    TestBed.configureTestingModule({
      declarations: [NewsComponent],
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
        {provide: NewsService, useValue: newsServiceSpy},
        {provide: ToastrService, useValue: toastrService},
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA,
      ],
    });
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(NewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();

    // logo
    const cellLogo = component.columns
      .find(c => c.field === 'logo');
    const expectedLogoUrl = '<img src="'
      + environment.staticUrl + environment.newsImages + 'test.png" width=35 alt="">';
    expect(cellLogo?.formatter?.call(
      null, {logo: 'test.png'}, cellLogo),
    ).toEqual(expectedLogoUrl);

    // publishDate
    const cellPublishDate = component.columns
      .find(c => c.field === 'publishDate');
    expect(cellPublishDate?.formatter?.call(
      null, {publishDate: '2001-02-04T02:01:05'}, cellPublishDate),
    ).toEqual('2001-02-04 02:01');

    // createdDate
    const cellCreated = component.columns
      .find(c => c.field === 'createdDate');
    expect(cellCreated?.formatter?.call(
      null, {createdDate: '2000-01-02T03:04:05'}, cellCreated),
    ).toEqual('2000-01-02 03:04');

    // lastUpdateDate
    const cellUpdated = component.columns
      .find(c => c.field === 'lastUpdateDate');
    expect(cellUpdated?.formatter?.call(
      null, {lastUpdateDate: '2000-05-06T03:04:05'}, cellUpdated),
    )
  });

  it('should get list of articles', () => {
    newsServiceSpy.getAll('')
      .subscribe((data) => {
          expect(data._embedded?.articles.length).toEqual(2);
          expect(data._embedded?.articles[1].title).toEqual('title2');
          expect(data.page.size).toEqual(1);
          expect(data.page.totalElements).toEqual(2);
          expect(data.page.totalPages).toEqual(1);
          expect(data.page.number).toEqual(0);
          expect(component.list.length).toEqual(2);
        },
      );
  });

  it('should getNextPage', () => {
    component.getNextPage({pageIndex: 10, pageSize: 20, length: 1});

    expect(component.query.page).toEqual(10);
    expect(component.query.size).toEqual(20);
  });

  it('should search', () => {
    component.search();

    expect(component.query.page).toEqual(0);
    expect(component.list.length).toEqual(2);
  });

  it('should changeSort', () => {
    component.changeSort({active: 'title', direction: 'desc'});

    expect(component.query.sort).toEqual('title,desc');
    expect(component.list.length).toEqual(2);
  });

  it('should reset', () => {
    component.reset();

    expect(component.query.page).toEqual(0);
    expect(component.query.size).toEqual(10);
    expect(component.query.search).toEqual('');
  });

  it('should onKeyUp for search', () => {
    component.onKeyUp();

    component.subject.subscribe((data) => expect(data).toEqual(undefined));
  });

  it('should navigate route to edit', () => {
    const navigateSpy = spyOn(router, 'navigate');

    component.edit({id: '1'});

    expect(navigateSpy).toHaveBeenCalledWith(['1'], {relativeTo: component.activatedRoute});
  });

  it('should delete article', () => {
    component.delete({id: 1});

    newsServiceSpy.deleteById(1)
      .subscribe((data) => {
          expect(data).toBeTrue();
          expect(toastrService.warning).toHaveBeenCalledWith('You have deleted article with id 1!');
        },
      );
  });
});
