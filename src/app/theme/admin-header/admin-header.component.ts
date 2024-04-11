import {
  Component,
  EventEmitter,
  HostBinding,
  Input, OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import screenfull from 'screenfull';

import { SettingsService } from '@core';


@Component({
  selector: 'app-admin-header',
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AdminHeaderComponent implements OnInit {
  @HostBinding('class') class = 'custom-header';

  @Input() showToggle = true;
  @Input() showBranding = false;

  @Output() toggleSidenav = new EventEmitter<void>();
  @Output() toggleSidenavNotice = new EventEmitter<void>();

  dark = false;

  constructor(private settings: SettingsService) {
  }

  ngOnInit(): void {
    this.dark = (this.settings.getThemeColor() === 'dark');
  }

  toggleFullscreen() {
    if (screenfull.isEnabled) {
      screenfull.toggle();
    }
  }

  toggleTheme() {
    this.dark = !this.dark;
    this.settings.toggleTheme();
  }
}
