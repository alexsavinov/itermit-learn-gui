import { Component, Input, OnInit } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { AuthService, User } from '@core';
import { IProfile } from '@shared';
import { MatSnackBar } from '@angular/material/snack-bar';
import { openSnackBar } from '@shared/utils/helpers';
import { UsersService } from '../../users/services';
import { ChangeAvatarComponent, ChangePasswordComponent } from './dialogs';


@Component({
  selector: 'app-profile-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class ProfileSettingsComponent implements OnInit {
  reactiveForm = this.fb.nonNullable.group({
    username: [''],
    name: ['', [Validators.required]],
    surname: [''],
    gender: [''],
    city: [''],
    address: [''],
    company: [''],
    mobile: [''],
    tele: [''],
    website: [''],
    date: [''],
    avatar: [''],
  });

  @Input()
  user!: User;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private usersService: UsersService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
    this.auth.user().subscribe(user => {
      this.user = user;
      this.reactiveForm.patchValue({
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
    });
  }

  save() {
    this.isSubmitting = true;

    const profile: IProfile = {
      address: this.reactiveForm.get('address')!.value,
      city: this.reactiveForm.get('city')!.value,
      company: this.reactiveForm.get('company')!.value,
      date: this.reactiveForm.get('date')!.value || '',
      gender: this.reactiveForm.get('gender')!.value,
      mobile: this.reactiveForm.get('mobile')!.value || '',
      name: this.reactiveForm.get('name')!.value,
      surname: this.reactiveForm.get('surname')!.value,
      tele: this.reactiveForm.get('tele')!.value || '',
      website: this.reactiveForm.get('website')!.value,
    };

    const userUpdate: User = { ...this.user, profile };

    this.usersService.update(userUpdate).subscribe({
      next: (value: User) => {
        this.user.profile = value.profile;
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
        openSnackBar(this.snackBar, 'Password successfully changed!');
      }
    });
  }

  openAvatarDialog() {
    const config = { data: { id: this.user.id, avatar: this.user.profile?.avatar } };
    const dialogRef = this.dialog.open(ChangeAvatarComponent, config);
    dialogRef.afterClosed().subscribe(res => {
      if (res && this.user.profile) {
        this.user.profile.avatar = res;
        openSnackBar(this.snackBar, 'Avatar successfully changed!');
      }
    });
  }
}

