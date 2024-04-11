import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '@core';
import { matchValidator } from '@shared/utils/validators';


@Component({
  selector: 'change-password',
  styles: [],
  templateUrl: 'change-password.component.html',
})
export class ChangePasswordComponent {
  isSubmitting = false;

  passwordForm = this.fb.nonNullable.group(
    {
      password: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
      ],
      ],
      confirmPassword: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
      ],
      ],
    },
    {
      validators: [matchValidator('password', 'confirmPassword'),
      ],
    });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  get password() {
    return this.passwordForm.get('password')!;
  }

  get confirmPassword() {
    return this.passwordForm.get('confirmPassword')!;
  }

  submit() {
    this.isSubmitting = true;

    this.auth
      .changePassword(this.data.id, this.password.value)
      .subscribe({
        next: () => {
        },
        error: (errorRes: HttpErrorResponse) => {
        },
      });

    this.isSubmitting = false;
  }

}
