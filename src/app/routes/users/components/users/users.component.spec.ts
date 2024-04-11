import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

import { TranslateHttpLoaderFactory } from '../../../../app.module';
import { environment } from '@env/environment';
import { UsersComponent } from './users.component';
import { IPageableUsers, UsersService } from '../../services';


describe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;
  let router: Router;
  let usersServiceSpy: jasmine.SpyObj<UsersService>;
  let toastrServiceSpy: jasmine.SpyObj<ToastrService>;

  beforeEach(() => {
    usersServiceSpy = jasmine.createSpyObj(
      'UsersService',
      ['getAll', 'deleteById'],
    );
    const mockResponse: IPageableUsers = {
      _embedded: { users: [{ username: 'user1' }, { username: 'user2' }] },
      items: [],
      page: { size: 1, totalElements: 2, totalPages: 1, number: 0 },
    };
    usersServiceSpy.getAll.and.returnValue(of(mockResponse));
    usersServiceSpy.deleteById.and.returnValue(of(true));

    toastrServiceSpy = jasmine.createSpyObj<ToastrService>(
      'ToasterService',
      ['warning'],
    );

    TestBed.configureTestingModule({
      declarations: [UsersComponent],
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
        { provide: UsersService, useValue: usersServiceSpy },
        { provide: ToastrService, useValue: toastrServiceSpy },
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA,
      ],
    });
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();

    // avatar
    const cellAvatar = component.columns
      .find(c => c.field === 'profile.avatar');
    const expectedAvatarUrl = '<img src="'
      + environment.staticUrl + environment.avatarImages + 'test.png" width=35 alt="">';
    expect(cellAvatar?.formatter?.call(
      null, { profile: { avatar: 'test.png' } }, cellAvatar),
    ).toEqual(expectedAvatarUrl);

    // createdDate
    const cellCreated = component.columns
      .find(c => c.field === 'createdDate');
    expect(cellCreated?.formatter?.call(
      null, { createdDate: '2000-01-02T03:04:05' }, cellCreated),
    ).toEqual('2000-01-02 03:04');

    // lastUpdateDate
    const cellUpdated = component.columns
      .find(c => c.field === 'lastUpdateDate');
    expect(cellUpdated?.formatter?.call(
      null, { lastUpdateDate: '2000-05-06T03:04:05' }, cellUpdated),
    ).toEqual('2000-05-06 03:04');

    const cellOperation = component.columns
      .find(c => c.field === 'operation');
  });

  it('should get list of users', () => {
    usersServiceSpy.getAll({})
      .subscribe(data => {
          expect(component.list.length).toEqual(2);
          expect(data._embedded?.users.length).toEqual(2);
          expect(data._embedded?.users[1].username).toEqual( 'user2');
          expect(data.page.size).toEqual( 1);
          expect(data.page.totalElements).toEqual( 2);
          expect(data.page.totalPages).toEqual( 1);
          expect(data.page.number).toEqual( 0);
        },
      );
  });

  it('should get next page of users', () => {
    component.getNextPage({pageIndex: 10, pageSize: 20, length: 1});

    expect(component.query.page).toEqual(10);
    expect(component.query.size).toEqual(20);
  });

  it('should search users', () => {
    component.search();

    expect(component.query.page).toEqual(0);
    expect(component.list.length).toEqual(2);
  });

  it('should get sorted list of users', () => {
    component.changeSort({ active: 'id', direction: 'asc' });
  });

  it('should reset params and get list of users', () => {
    component.reset();

    expect(component.query.page).toEqual(0);
    expect(component.query.size).toEqual(10);
    expect(component.query.search).toEqual('');
    expect(component.query.sort).toEqual('');
    expect(component.list.length).toEqual(2);
  });

  it('should search with key pressing', () => {
    component.onKeyUp();

    component.subject.subscribe((data) => expect(data).toEqual(undefined));
  });

  it('should navigate route to edit', () => {
    const navigateSpy = spyOn(router, 'navigate');

    component.edit({ id: '1' });

    expect(navigateSpy).toHaveBeenCalledWith(['1'], { relativeTo: component.activatedRoute });
  });

  it('should delete user', () => {
    component.delete({ id: '1' });

    usersServiceSpy.deleteById(1)
      .subscribe((data) => {
          expect(data).toBeTrue();
          expect(toastrServiceSpy.warning).toHaveBeenCalledWith('You have deleted user with id 1!');
        },
      );
  });

});
