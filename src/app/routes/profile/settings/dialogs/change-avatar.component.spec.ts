import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';

import { AuthService } from '@core';
import { ChangeAvatarComponent } from './change-avatar.component';


describe('ChangeAvatarComponent', () => {
  let component: ChangeAvatarComponent;
  let fixture: ComponentFixture<ChangeAvatarComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  const dialogMock = {
    close: () => {
    },
  };

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj(
      'AuthService',
      ['user', 'changeAvatar'],
    );
    authServiceSpy.user.and.returnValue(of({
      id: 1, username: 'user1', profile: { avatar: 'image.png' },
    }));
    authServiceSpy.changeAvatar.and.returnValue(of('image2.png'));

    TestBed.configureTestingModule({
      declarations: [ChangeAvatarComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { id: 1 } },
        { provide: MatDialogRef, useValue: dialogMock },
        { provide: AuthService, useValue: authServiceSpy }
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA,
      ],
    });
    fixture = TestBed.createComponent(ChangeAvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get user data from authService', () => {
    authServiceSpy.user().subscribe({
      next: data => {
        expect(component.user.id).toEqual(1);
        expect(component.user.username).toEqual('user1');
        expect(component.user.profile?.avatar).toEqual('image.png');
      },
    });
  });

  it('should submit avatar file and get new image name', () => {
    authServiceSpy.changeAvatar(1, 'avatarFile').subscribe({
      next: data => {
        expect(data).toEqual('image2.png');
      },
    });
    const spyClose = spyOn(component.dialogRef, 'close').and.callThrough();

    component.submit();

    expect(spyClose).toHaveBeenCalled();
  });

  it('should throw error when submit avatar', () => {
    authServiceSpy.changeAvatar.and.returnValue(throwError(() => of(new Error('error!'))));

    authServiceSpy.changeAvatar(1, 'avatarFile').subscribe({
      next: data => undefined,
      error: err => expect(err).toBeTruthy(),
    });

    component.submit();
  });

  it('should set avatarRawFile with no errors', () => {
    const blob = new Blob(['']);
    const file = new File([blob], 'filename.png');

    component.getFile({ target: { files: [file] } });

    expect(component.errorResolution).toEqual('');
    expect(component.errorExtension).toEqual('');
  });

  it('should stop while set avatarRawFile when no files provided', () => {
    component.getFile({ target: { files: [] } });

    expect(component.avatarRawFile).toBeUndefined();
  });

  it('should get errorExtension while setting avatarRawFile', () => {
    const blob = new Blob(['']);
    const file = new File([blob], 'filename.jpg');

    component.getFile({ target: { files: [file] } });

    expect(component.errorExtension).toEqual('Use .png or .jpeg format.');
  });

  it('should get errorFileSize while setting avatarRawFile', () => {
    const blob = new Blob(['']);
    const file = new File([blob], 'filename.jpeg');

    component.expectedSizeKB = -10;

    component.getFile({ target: { files: [file] } });

    expect(component.errorFileSize).toEqual('File size is 0 KB (max -10 KB).');
  });

  it('should get errorResolution while setting avatarRawFile', () => {
    const blob = new Blob(['data:image/gif;base64,R0lGODlhDwAPAKECAAAAzMzM/////wAAACwAAAAADwAPAAACIISPeQHsrZ5ModrLlN48CXF8m2iQ3YmmKqVlRtW4MLwWACH+H09wdGltaXplZCBieSBVbGVhZCBTbWFydFNhdmVyIQAAOw==']);
    const file = new File([blob], 'filename.jpeg');

    component.expectedSizeKB = 10;
    component.expectedWidth = -10;
    component.expectedHeight = -10;

    component.getFile({ target: { files: [file] } });
  });
});
