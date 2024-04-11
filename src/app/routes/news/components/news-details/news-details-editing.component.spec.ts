import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

import { TranslateHttpLoaderFactory } from '../../../../app.module';
import { ValidationMessagePipe } from '@shared/pipes';
import { NewsService } from '../../services';
import { NewsDetailsComponent } from './news-details.component';


describe('NewsDetailsComponent', () => {
  let component: NewsDetailsComponent;
  let fixture: ComponentFixture<NewsDetailsComponent>;
  let newsServiceSpy: jasmine.SpyObj<NewsService>;
  let toastrServiceSpy: jasmine.SpyObj<ToastrService>;

  beforeEach(() => {
    newsServiceSpy = jasmine.createSpyObj(
      'NewsService',
      ['saveImage', 'update', 'getById'],
    );
    newsServiceSpy.saveImage.and.returnValue(of({ location: 'url1' }));
    newsServiceSpy.update.and.returnValue(of({ id: 22, title: 'test' }));
    newsServiceSpy.getById.and.returnValue(of({ id: 22, title: 'test' }));

    toastrServiceSpy = jasmine.createSpyObj<ToastrService>(
      'ToasterService',
      ['info'],
    );

    TestBed.configureTestingModule({
      declarations: [NewsDetailsComponent, ValidationMessagePipe],
      imports: [
        HttpClientTestingModule,
        MatDialogModule,
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
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({ creating: false }),
            params: of({ id: 22 }),
          },
        },
        { provide: NewsService, useValue: newsServiceSpy },
        { provide: ToastrService, useValue: toastrServiceSpy },
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA,
      ],
    });
    fixture = TestBed.createComponent(NewsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create in editing mode', () => {
    expect(component).toBeTruthy();
    expect(component.creating).toBeFalse();
  });

  it('should edit article with logo', () => {
    newsServiceSpy.saveImage('').subscribe((data) => {
      expect(data.location).toEqual('url1');
    });

    newsServiceSpy.update({ id: 22, title: 'test' }).subscribe({
      next: () => {
        expect(component.article.id).toEqual(22);
        expect(component.article.title).toEqual('test');
      },
    });

    component.logoRawFile = 'test';
    component.save();

    expect(toastrServiceSpy.info).toHaveBeenCalledWith('Article id 22 updated!');
  });

  it('should throw error when edit article', () => {
    newsServiceSpy.update.and.returnValue(throwError(() => of(new Error('error!'))));

    newsServiceSpy.update({ id: 22, title: 'test' }).subscribe({
      next: () => undefined,
      error: err => expect(err).toBeTruthy(),
    });

    component.save();
  });
});
