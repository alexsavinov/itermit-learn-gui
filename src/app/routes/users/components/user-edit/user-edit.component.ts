import { ActivatedRoute } from '@angular/router';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

import { environment } from '@env/environment';
import { User } from '@core';
import { IProfile } from '@shared';
import { phoneNumberValidator, urlValidator } from '@shared/utils/validators';
import { UsersService } from '../../services';
import { ChangeAvatarComponent, ChangePasswordComponent } from '../../../profile/settings/dialogs';


@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss'],
})
export class UserEditComponent implements OnInit {
  reactiveForm = this.fb.nonNullable.group({
    username: [''],
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
  });

  @Input()
  user!: User;
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

  get avatar() {
    return environment.staticUrl + environment.avatarImages + this.user.profile?.avatar;
  }

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    public dialog: MatDialog,
    public toastrService: ToastrService,
    private activatedRoute: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(({ id }) =>
      this.usersService.getById(id).subscribe(user => {
        this.user = user;
        this.reactiveForm.patchValue({
          username: user.username,
          name: this.user.profile?.name,
          surname: this.user.profile?.surname,
          gender: this.user.profile?.gender,
          address: this.user.profile?.address,
          city: this.user.profile?.city,
          company: this.user.profile?.company,
          mobile: this.user.profile?.mobile,
          tele: this.user.profile?.tele,
          website: this.user.profile?.website,
          date: this.user.profile?.date,
        });
      }),
    );
  }

  save() {

    const profile: IProfile = {
      name: this.name.value,
      surname: this.surname.value,
      gender: this.gender.value,
      address: this.address.value,
      city: this.city.value,
      company: this.company.value,
      date: this.date.value,
      mobile: this.mobile.value,
      tele: this.tele.value,
      website: this.website.value,
    };

    const userUpdate: User = { ...this.user, profile };

    this.usersService.update(userUpdate).subscribe({
      next: (value: User) => {
        this.user.profile = value.profile;
        this.reactiveForm.markAsPristine();
        this.toastrService.info(`User ${ value.username } updated!`);
      },
      error: e => {
        console.log(e);
      },
    });

    this.isSubmitting = false;
  }

  openPasswordDialog() {
    const config = { data: { id: this.user.id } };
    const dialogRef = this.dialog.open(ChangePasswordComponent, config);
    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.toastrService.info('Password successfully changed!');
      }
    });
  }

  openAvatarDialog() {
    const config = {
      data: {
        id: this.user.id,
        avatar: this.user.profile?.avatar,
      },
    };
    const dialogRef = this.dialog.open(ChangeAvatarComponent, config);
    dialogRef.afterClosed().subscribe(res => {
      if (this.user.profile) {
        this.user.profile.avatar = res;
        this.toastrService.info('Avatar successfully changed!');
      }
    });
  }
}
