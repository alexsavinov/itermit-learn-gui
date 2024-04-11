import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService, User } from '@core/authentication';
import { environment } from '@env/environment';


@Component({
  selector: 'app-user-panel',
  template: `
    <div class="custom-user-panel">
      <img class="custom-user-panel-avatar" [src]="avatar" alt="avatar" width="64" />
      <h4 class="custom-user-panel-name">{{ user.username }}</h4>
      <h5 class="custom-user-panel-email">{{ user.email }}</h5>
      <div class="custom-user-panel-icons">
        <button id="profile-overview-button"
                mat-icon-button
                routerLink="/profile/overview"
                matTooltip="{{ 'profile' | translate }}">
          <mat-icon class="icon-18">account_circle</mat-icon>
        </button>
        <button id="profile-settings-button"
                mat-icon-button
                routerLink="/profile/settings"
                matTooltip="{{ 'edit_profile' | translate }}">
          <mat-icon class="icon-18">edit</mat-icon>
        </button>
        <button id="profile-logout-button"
                mat-icon-button
                (click)="logout()"
                matTooltip="{{ 'logout' | translate }}">
          <mat-icon class="icon-18">exit_to_app</mat-icon>
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./user-panel.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class UserPanelComponent implements OnInit {
  user!: User;
  avatar!: string | undefined;

  constructor(
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.auth.user().subscribe(user => {
      this.user = user;
      this.avatar = environment.staticUrl + environment.avatarImages + user.profile?.avatar;
    });
  }

  logout() {
    this.auth.logout().subscribe(() => {
      this.router.navigateByUrl('/auth/login');
    });
  }
}
