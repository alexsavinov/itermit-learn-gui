import {
  Component,
  EventEmitter,
  HostBinding,
  Input, OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import screenfull from 'screenfull';
import { NgxPermissionsService, NgxRolesService } from 'ngx-permissions';

import { AuthService, SettingsService, TokenService, User } from '@core';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent implements OnInit {
  @HostBinding('class') class = 'main-header';

  @Input() showToggle = true;
  @Input() showBranding = true;

  @Output() toggleSidenav = new EventEmitter<void>();
  @Output() toggleSidenavNotice = new EventEmitter<void>();

  user!: User;
  dark = false;

  toggleFullscreen() {
    if (screenfull.isEnabled) {
      screenfull.toggle();
    }
  }

  constructor(
    private permissionsSrv: NgxPermissionsService,
    private rolesService: NgxRolesService,
    private auth: AuthService,
    private tokenService: TokenService,
    private settings: SettingsService) {
  }

  ngOnInit(): void {
    this.dark = (this.settings.getThemeColor() === 'dark');
  }

  unAuthorized() {
  }

  authorized() {
  }

  toggleTheme() {
    this.dark = !this.dark;
    this.settings.toggleTheme();
  }

}
