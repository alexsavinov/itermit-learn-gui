import { Component, OnInit, ViewEncapsulation, Input, HostBinding } from '@angular/core';
import { Router } from '@angular/router';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';

import { MenuService } from '@core/bootstrap/menu.service';


@Component({
  selector: 'page-header',
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PageHeaderComponent implements OnInit {
  @HostBinding('class') class = 'page-header';

  @Input() title = '';
  @Input() subtitle = '';
  @Input() nav: string[] = [];

  @Input()
  get hideBreadcrumb() {
    return this._hideBreadCrumb;
  }

  set hideBreadcrumb(value: boolean) {
    this._hideBreadCrumb = coerceBooleanProperty(value);
  }

  private _hideBreadCrumb = false;

  constructor(private router: Router, private menu: MenuService) {
  }

  ngOnInit() {
    this.nav = Array.isArray(this.nav) ? this.nav : [];

    if (this.nav.length === 0) {
      this.genBreadcrumb();
    }

    this.title = this.title || this.nav[this.nav.length - 1];
  }

  genBreadcrumb() {
    const routes = this.router.url.slice(1).split('/').slice(1); // added slice(1)
    this.nav = this.menu.getLevel(routes);
    this.nav.unshift('admin');
  }

  static ngAcceptInputType_hideBreadcrumb: BooleanInput;
}
