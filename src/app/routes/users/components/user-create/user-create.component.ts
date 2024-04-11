import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { User } from '@core';
import { IProfile } from '@shared';
import { matchValidator, phoneNumberValidator, urlValidator } from '@shared/utils/validators';
import { UsersService } from '../../services';


@Component({
  selector: 'app-user-create',
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.scss'],
})
export class UserCreateComponent {
  reactiveForm = this.fb.nonNullable.group({
      username: ['', [Validators.required, Validators.email]],
      name: ['', [Validators.required]],
      surname: [''],
      gender: [''],
      city: [''],
      address: [''],
      company: [''],
      mobile: ['', [phoneNumberValidator('mobile')]],
      tele: ['', [phoneNumberValidator('tele')]],
      website: ['', [urlValidator('website')]],
      date: [''],
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

  isSubmitting = false;

  get username() {
    return this.reactiveForm.get('username')!;
  }

  get name() {
    return this.reactiveForm.get('name')!;
  }

  get surname() {
    return this.reactiveForm.get('surname')!;
  }

  get gender() {
    return this.reactiveForm.get('gender')!;
  }

  get city() {
    return this.reactiveForm.get('city')!;
  }

  get address() {
    return this.reactiveForm.get('address')!;
  }

  get company() {
    return this.reactiveForm.get('company')!;
  }

  get mobile() {
    return this.reactiveForm.get('mobile')!;
  }

  get tele() {
    return this.reactiveForm.get('tele')!;
  }

  get website() {
    return this.reactiveForm.get('website')!;
  }

  get date() {
    return this.reactiveForm.get('date')!;
  }

  get password() {
    return this.reactiveForm.get('password')!;
  }

  get confirmPassword() {
    return this.reactiveForm.get('confirmPassword')!;
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    public activatedRoute: ActivatedRoute,
    private usersService: UsersService,
    private toastrService: ToastrService) {
  }

  save() {
    this.isSubmitting = true;

    const profile: IProfile = {
      name: this.name.value,
      surname: this.surname.value,
      address: this.address.value,
      city: this.city.value,
      company: this.company.value,
      date: this.date.value,
      mobile: this.mobile.value,
      tele: this.tele.value,
      website: this.website.value,
    };

    if (this.gender.value) {
      profile.gender = this.gender.value;
    }

    const userCreate: User = {
      username: this.username.value,
      password: this.password.value,
      profile,
    };

    this.usersService.create(userCreate).subscribe({
      next: (value: User) => {
        this.toastrService.success(`User ${ value.username } created!`);
        this.router.navigate(['../'], { relativeTo: this.activatedRoute });
      },
      error: e => {
        console.log(e);
      },
    });

    // this.isSubmitting = false;
  }
}
