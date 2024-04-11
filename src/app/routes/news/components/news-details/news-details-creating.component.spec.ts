import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';

import { TranslateHttpLoaderFactory } from '../../../../app.module';
import { ValidationMessagePipe } from '@shared/pipes';
import { NewsService } from '../../services';
import { NewsDetailsComponent } from './news-details.component';


describe('NewsDetailsComponent', () => {
  let component: NewsDetailsComponent;
  let newsServiceSpy: jasmine.SpyObj<NewsService>;
  let fixture: ComponentFixture<NewsDetailsComponent>;
  let toastrServiceSpy: jasmine.SpyObj<ToastrService>;

  beforeEach(() => {
    newsServiceSpy = jasmine.createSpyObj(
      'NewsService',
      ['saveImage', 'create'],
    );
    newsServiceSpy.saveImage.and.returnValue(of({ location: 'url1' }));
    newsServiceSpy.create.and.returnValue(of({ id: 1, title: 'title1' }));

    toastrServiceSpy = jasmine.createSpyObj<ToastrService>(
      'ToasterService',
      ['success'],
    );

    TestBed.configureTestingModule({
      declarations: [
        NewsDetailsComponent,
        ValidationMessagePipe
      ],
      imports: [
        BrowserAnimationsModule,
        HttpClientTestingModule,
        MatDialogModule,
        ToastrModule.forRoot(),
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
          useValue: { data: of({ creating: true }) },
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

  it('should create in creating mode', () => {
    expect(component).toBeTruthy();
    expect(component.creating).toBeTrue();
    expect(component.description).toBeTruthy();
    expect(component.content).toBeTruthy();
    expect(component.author).toBeTruthy();
  });

  it('should create article with logo', () => {
    newsServiceSpy.saveImage('').subscribe((data) => {
      expect(data.location).toEqual('url1');
    });

    newsServiceSpy.create({ title: 'test' }).subscribe({
      next: data => {
        expect(data.id).toEqual(1);
        expect(data.title).toEqual('title1');
      },
    });

    component.logoRawFile = 'test';
    component.save();

    expect(component.article.id).toEqual(1);
    expect(component.article.title).toEqual('title1');

    expect(toastrServiceSpy.success).toHaveBeenCalledWith('Article created!');
  });

  it('should save article with empty image', () => {
    newsServiceSpy.saveImage('').subscribe((data) => {
      expect(data.location).toEqual('url1');
    });
    component.save();
  });

  it('should throw error when save article', () => {
    newsServiceSpy.create.and.returnValue(throwError(() => of(new Error('error!'))));

    newsServiceSpy.create({ title: 'test' }).subscribe({
      next: () => undefined,
      error: err => expect(err).toBeTruthy(),
    });

    component.save();
  });

  it('should change visibility of article to true', () => {
    component.changeVisible();

    expect(component.article.visible).toBeTrue();
  });

  it('should update image', () => {
    const blob = new Blob(['']);
    component.updateImage({target: {files: [<File>blob]}, });

    expect(component.logoRawFile).toContain('blob:');
    expect(component.logoFile).toEqual(blob);
    expect(component.logo.dirty).toBeTrue();
  });

  it('should not update image if no files', () => {
    component.updateImage({target: {files: []}, });

    expect(component.logoRawFile).toBeUndefined();
    expect(component.logoFile).toBeUndefined();
    expect(component.logo.dirty).toBeFalse();
  });


  it('should clear logo', () => {
    component.article.logo = 'test';
    component.logoFile = 'test';
    component.logoRawFile = 'test';

    component.clearLogo();

    expect(component.article.logo).toBeUndefined();
    expect(component.logoRawFile).toBeUndefined();
    expect(component.logoFile).toBeUndefined();
    expect(component.logo.dirty).toBeTrue();
  });
});
