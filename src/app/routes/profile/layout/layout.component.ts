import { Component, OnInit } from '@angular/core';

import { AuthService, User } from '@core/authentication';
import { environment } from '@env/environment';


@Component({
  selector: 'app-profile-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class ProfileLayoutComponent implements OnInit {
  user!: User;
  avatar!: string | undefined;

  constructor(private auth: AuthService) {
  }

  ngOnInit(): void {
    this.auth.user().subscribe(user => {
      this.user = user;
      this.avatar = environment.staticUrl + environment.avatarImages + user.profile?.avatar;
    });
  }

  protected readonly environment = environment;
}
