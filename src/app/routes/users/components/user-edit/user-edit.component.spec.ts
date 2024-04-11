import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';

import { TranslateHttpLoaderFactory } from '../../../../app.module';
import { ValidationMessagePipe } from '@shared/pipes';
import { UsersService } from '../../services';
import { ChangeAvatarComponent, ChangePasswordComponent } from '../../../profile/settings/dialogs';
import { UserEditComponent } from './user-edit.component';


describe('UserEditComponent', () => {
  let component: UserEditComponent;
  let fixture: ComponentFixture<UserEditComponent>;
  let usersServiceSpy: jasmine.SpyObj<UsersService>;
  let toastrServiceSpy: jasmine.SpyObj<ToastrService>;

  beforeEach(() => {
    usersServiceSpy = jasmine.createSpyObj(
      'UsersService',
      ['update', 'getById'],
    );
    usersServiceSpy.update.and.returnValue(of({ id: 22, username: 'test' }));
    usersServiceSpy.getById.and.returnValue(of({
        id: 22, username: 'test', profile: { avatar: 'avatar.jpg' }
      })
    );

    toastrServiceSpy = jasmine.createSpyObj<ToastrService>(
      'ToasterService',
      ['info'],
    );

    TestBed.configureTestingModule({
      declarations: [
        UserEditComponent,
        ValidationMessagePipe,
      ],
      imports: [
        HttpClientTestingModule,
        MatDialogModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: TranslateHttpLoaderFactory,
            deps: [HttpClient],
          },
        }),
      ],
      providers: [
        { provide: ActivatedRoute, useValue: { params: of({ id: 123 }) } },
        { provide: UsersService, useValue: usersServiceSpy },
        { provide: ToastrService, useValue: toastrServiceSpy },
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA,
      ],
    });
    fixture = TestBed.createComponent(UserEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.username).toBeTruthy();
    expect(component.avatar).toBeTruthy();
  });

  it('should send user data and receive updated user', () => {
    usersServiceSpy.update({ id: 22, username: 'test' }).subscribe({
      next: () => {
        expect(component.user.id).toEqual(22);
        expect(component.user.username).toEqual('test');
      },
    });

    component.save();

    expect(toastrServiceSpy.info).toHaveBeenCalledWith('User test updated!');
  });

  it('should send new user data and get error', () => {
    usersServiceSpy.update.and.returnValue(throwError(() => of(new Error('error!'))));

    usersServiceSpy.update({ id: 22, username: 'test' }).subscribe({
      next: () => undefined,
      error: err => expect(err).toBeTruthy(),
    });

    component.save();
  });

  it('should open password dialog', () => {
    const openDialogSpy = spyOn(component.dialog, 'open')
      .and
      .returnValue({
        afterClosed: () => of(true),
      } as MatDialogRef<typeof component>);

    component.openPasswordDialog();

    const fakeDialogConfig = { data: { id: 22 } };
    expect(openDialogSpy).toHaveBeenCalledWith(ChangePasswordComponent, fakeDialogConfig);
    expect(toastrServiceSpy.info).toHaveBeenCalledWith('Password successfully changed!');
  });

  it('should open avatar dialog', () => {
    const openDialogSpy = spyOn(component.dialog, 'open')
      .and
      .returnValue({
        afterClosed: () => of(true),
      } as MatDialogRef<typeof component>);

    component.openAvatarDialog();

    const fakeDialogConfig = { data: { id: 22, avatar: 'avatar.jpg' } };
    expect(openDialogSpy).toHaveBeenCalledWith(ChangeAvatarComponent, fakeDialogConfig);
    expect(toastrServiceSpy.info).toHaveBeenCalledWith('Avatar successfully changed!');
  });
});
