import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { TranslateHttpLoaderFactory } from '../../../../app.module';
import { ValidationMessagePipe } from '@shared/pipes';
import { UsersService } from '../../services';
import { UserCreateComponent } from './user-create.component';


describe('UserCreateComponent', () => {
  let component: UserCreateComponent;
  let fixture: ComponentFixture<UserCreateComponent>;
  let router: Router;
  let usersServiceSpy: jasmine.SpyObj<UsersService>;
  let toastrServiceSpy: jasmine.SpyObj<ToastrService>;

  beforeEach(() => {
    usersServiceSpy = jasmine.createSpyObj(
      'UsersService',
      ['create'],
    );
    usersServiceSpy.create.and.returnValue(of({ id: 22, username: 'test' }));
    toastrServiceSpy = jasmine.createSpyObj<ToastrService>(
      'ToasterService',
      ['success'],
    );

    TestBed.configureTestingModule({
      declarations: [UserCreateComponent, ValidationMessagePipe],
      imports: [
        HttpClientTestingModule,
        RouterModule.forRoot([]),
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: TranslateHttpLoaderFactory,
            deps: [HttpClient],
          },
        })
      ],
      providers: [
        { provide: UsersService, useValue: usersServiceSpy },
        { provide: ToastrService, useValue: toastrServiceSpy },
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA,
      ],
    });
    fixture = TestBed.createComponent(UserCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should send new user data and receive created user', () => {
    component.reactiveForm.patchValue({ gender: 'MALE' });

    usersServiceSpy.create({ id: 22, username: 'test' }).subscribe({
      next: data => {
        expect(data.id).toEqual(22);
        expect(data.username).toEqual('test');
      },
    });

    const navigateSpy = spyOn(router, 'navigate');

    component.save();

    expect(component.gender.value).toEqual('MALE');
    expect(navigateSpy).toHaveBeenCalledWith(['../'], { relativeTo: component.activatedRoute });
    expect(toastrServiceSpy.success).toHaveBeenCalledWith('User test created!');
  });

  it('should send new user data and get error', () => {
    usersServiceSpy.create.and.returnValue(throwError(() => of(new Error('error!'))));

    usersServiceSpy.create({ id: 22, username: 'test' }).subscribe({
      next: () => undefined,
      error: err => expect(err).toBeTruthy(),
    });

    component.save();
  });
});
