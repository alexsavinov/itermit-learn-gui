import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

import { NewsShowComponent } from './news-show.component';
import { NewsService } from '../../services';


describe('NewsShowComponent', () => {
  let component: NewsShowComponent;
  let fixture: ComponentFixture<NewsShowComponent>;
  let newsServiceSpy: jasmine.SpyObj<NewsService>;
  let domSanitizer: DomSanitizer;

  beforeEach(() => {
    newsServiceSpy = jasmine.createSpyObj(
      'NewsService',
      ['getById'],
    );
    newsServiceSpy.getById.and.returnValue(of({
      id: 22,
      title: 'test',
      content: 'some text',
    }));

    TestBed.configureTestingModule({
      declarations: [NewsShowComponent],
      imports: [
        HttpClientTestingModule,
        RouterModule.forRoot([]),
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { params: of({ id: 22 }) },
        },
        { provide: NewsService, useValue: newsServiceSpy },
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA,
      ],
    });
    fixture = TestBed.createComponent(NewsShowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    domSanitizer = TestBed.inject(DomSanitizer);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get article data', () => {
    newsServiceSpy.getById('22').subscribe({
      next: data => {
        expect(component.article.id).toEqual(22);
        expect(component.article.title).toEqual('test');
        expect(component.article.content).toEqual('some text');
        expect(component.content).toEqual(domSanitizer.bypassSecurityTrustHtml('some text'));
      },
    });
  });
});
