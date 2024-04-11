import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { debounceTime, tap } from 'rxjs/operators';

import { SettingsService } from '@core';
import { AuthService, User } from '@core/authentication';
import {environment} from "@env/environment";


@Component({
  selector: 'app-user',
  template: `
    <button *ngIf="!user.id" matTooltip="Login" routerLink="/auth/login" mat-mini-fab color="primary">
      <mat-icon>person</mat-icon>
    </button>

    <button id="current-user-button" *ngIf="user.id" matTooltip="{{user.username}}"
            class="r-full" mat-button [matMenuTriggerFor]="menu">
      <img matButtonIcon class="avatar r-full"
           [src]="environment.staticUrl + environment.avatarImages + user.profile?.avatar | safeUrl"
           width="24" alt="avatar"/>
      <span id="current-user" class="m-x-8">
        {{ user.username }}
      </span>
    </button>

    <mat-menu #menu="matMenu">
      <button id="profile-overview-button" routerLink="/profile/overview" mat-menu-item>
        <mat-icon>account_circle</mat-icon>
        <span>{{ 'profile' | translate }}</span>
      </button>
      <button id="profile-edit-button" routerLink="/profile/settings" mat-menu-item>
        <mat-icon>edit</mat-icon>
        <span>{{ 'edit_profile' | translate }}</span>
      </button>
      <button id="restore-defaults-button" mat-menu-item (click)="restore()">
        <mat-icon>restore</mat-icon>
        <span>{{ 'restore_defaults' | translate }}</span>
      </button>
      <button id="logout-button" mat-menu-item (click)="logout()">
        <mat-icon>exit_to_app</mat-icon>
        <span>{{ 'logout' | translate }}</span>
      </button>
    </mat-menu>
  `,
  styles: [
    `
      .avatar {
        width: 24px;
        height: 24px;
      }
    `,
  ],
})
export class UserComponent implements OnInit {
  user!: User;

  constructor(
    private router: Router,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
    private settings: SettingsService) {
  }

  ngOnInit(): void {
    this.auth
      .user()
      .pipe(
        tap(user => {
          this.user = user;
          if (user.username && !user.avatar) user.avatar = './assets/images/avatar-default.jpg';
        }),
        debounceTime(10)
      )
      .subscribe(() => this.cdr.detectChanges());
  }

  logout() {
    this.auth.logout().subscribe(() => {
      this.router.navigateByUrl('/');
    });
  }

  restore() {
    this.settings.reset();
    window.location.reload();
  }

  protected readonly environment = environment;
}
