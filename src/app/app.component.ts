import { Component, OnInit, AfterViewInit } from '@angular/core';

import { PreloaderService, SettingsService } from '@core';


@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'learn-itermit';

  constructor(private preloader: PreloaderService, private settings: SettingsService) {}

  ngOnInit() {
    this.settings.setTheme();
  }

  ngAfterViewInit() {
    this.preloader.hide();
  }
}
