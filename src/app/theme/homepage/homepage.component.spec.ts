import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { of } from 'rxjs';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { TranslateHttpLoaderFactory } from '../../app.module';
import { HttpClient } from '@angular/common/http';
import { NewsService } from '../../routes/news/services';
import { HomepageComponent } from './homepage.component';


describe('HomepageComponent', () => {
  let component: HomepageComponent;
  let fixture: ComponentFixture<HomepageComponent>;
  let newsServiceSpy: jasmine.SpyObj<NewsService>;

  beforeEach(() => {
    newsServiceSpy = jasmine.createSpyObj(
      'NewsService',
      ['getAll', 'deleteById'],
    );
    const mockResponse = {
      _embedded: { articles: [{ title: 'title01' }, { title: 'title02' }] },
      items: [],
      page: { size: 1, totalElements: 2, totalPages: 1, number: 0 },
    };
    newsServiceSpy.getAll.and.returnValue(of(mockResponse));

    TestBed.configureTestingModule({
      declarations: [HomepageComponent],
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
        { provide: NewsService, useValue: newsServiceSpy },
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA,
      ],
    });
    fixture = TestBed.createComponent(HomepageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get list of news', () => {
    newsServiceSpy.getAll('')
      .subscribe((data) => {
          expect(component.news.length).toEqual(2);
          expect(data._embedded?.articles[1].title).toEqual('title02');
          expect(data.page.size).toEqual(1);
          expect(data.page.totalElements).toEqual(2);
          expect(data.page.totalPages).toEqual(1);
          expect(data.page.number).toEqual(0);
        },
      );
  });


  it('should showMore', () => {
    component.showMore();

    expect(component.query.page).toEqual(1);
    expect(component.query.size).toEqual(2);
  });
});
