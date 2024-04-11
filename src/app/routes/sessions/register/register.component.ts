import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { matchValidator } from '@shared/utils/validators';
import { Router } from '@angular/router';
import { AuthService } from '@core';
import { HttpErrorResponse } from '@angular/common/http';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  isSubmitting = false;

  registerForm = this.fb.nonNullable.group(
    {
      username: ['', [Validators.required, Validators.email]],
      readAndAgree: [false, [Validators.requiredTrue]],
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
    private router: Router,
    private auth: AuthService) {
  }

  get username() {
    return this.registerForm.get('username')!;
  }

  get password() {
    return this.registerForm.get('password')!;
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword')!;
  }

  get readAndAgree() {
    return this.registerForm.get('readAndAgree')!;
  }

  register() {
    this.isSubmitting = true;

    this.auth
      .register(this.username.value, this.password.value)
      .subscribe({
        next: (data) => {
          this.router.navigateByUrl('/auth/login');
        },
        error: (errorRes: HttpErrorResponse) => {
          console.log(errorRes);
          this.isSubmitting = false;
        },
      });
  }
}
