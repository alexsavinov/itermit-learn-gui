import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService, User } from '@core';


@Component({
  selector: 'change-avatar',
  styles: [],
  templateUrl: 'change-avatar.component.html',
})
export class ChangeAvatarComponent implements OnInit {
  avatarForm = this.fb.nonNullable.group(
    {
      avatar: '',
    });

  isSubmitting = false;
  user!: User;
  errorFileSize = '';
  errorExtension = '';
  errorResolution = '';

  avatarFile!: string;
  avatarRawFile: any;
  expectedSizeKB = 100;
  expectedHeight = 600;
  expectedWidth = 600;

  get avatar() {
    return this.avatarForm.get('avatar')!;
  }

  constructor(private fb: FormBuilder,
              private auth: AuthService,
              @Inject(MAT_DIALOG_DATA) public data: any,
              public dialogRef: MatDialogRef<ChangeAvatarComponent>) {
  }

  ngOnInit(): void {
    this.auth.user().subscribe(user => {
      this.user = user;
    });
  }


  submit() {
    this.isSubmitting = true;

    this.auth
      .changeAvatar(this.data.id, this.avatarFile)
      .subscribe({
        next: ({ avatar }: any) => {
          this.dialogRef.close(avatar)
        },
        error: (errorRes: HttpErrorResponse) => {
          console.log(errorRes);
        },
      });

    this.isSubmitting = false;
  }

  getFile(e: any) {
    this.errorExtension = '';
    this.errorFileSize = '';
    this.errorResolution = '';

    this.setFormIsValid(true);

    if (!e.target.files || !e.target.files.length) {
      return;
    }

    const [file] = e.target.files;

    /* Size validation */
    const actualSizeKB = Math.round(file.size / 1024);
    if (actualSizeKB > this.expectedSizeKB) {
      this.errorFileSize = `File size is ${ actualSizeKB } KB (max ${ this.expectedSizeKB } KB).`;
      this.setFormIsValid(false);
    }

    /* Extension validation */
    const name = file.name.split('.').pop();
    if (name != 'png' && name != 'jpeg') {
      this.errorExtension = 'Use .png or .jpeg format.';
      this.setFormIsValid(false);
    }

    if (!this.avatarForm.invalid) {
      this.avatarFile = file;

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        /* Resolution validation */
        const img = new Image();
        img.src = '' + reader.result;
        if (img.width > this.expectedWidth || img.height > this.expectedHeight) {
          this.errorResolution = `Image resolution ${ img.width }x${ img.height } (max ${ this.expectedWidth }x${ this.expectedHeight }).`;
          this.setFormIsValid(false);
        } else {
          this.avatarRawFile = reader.result;
        }
      };
    }
  }

  setFormIsValid(valid: boolean) {
    const errors = valid ? null : { incorrect: true };
    this.avatarForm.controls.avatar.setErrors(errors);
  }
}
