import { TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { TranslateHttpLoaderFactory } from '../../app.module';
import { PaginatorI18nService } from '@shared';


describe('PaginatorI18nService', () => {
  let service: PaginatorI18nService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: TranslateHttpLoaderFactory,
            deps: [HttpClient],
          },
        }),
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA,
      ],
    });
    service = TestBed.inject(PaginatorI18nService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get PaginatorIntl', () => {
    const paginatorIntl = service.getPaginatorIntl();
    expect(paginatorIntl.firstPageLabel).toEqual('paginator.first_page_label');
  });

});
