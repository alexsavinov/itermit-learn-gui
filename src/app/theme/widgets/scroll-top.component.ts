import { Component, HostListener, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';


@Component({
  selector: 'app-scroll-top',
  template: `
    <div class="scroll-to-top" [ngClass]="{'show-scrollTop': windowScrolled}">
      <button (click)="scrollToTop()">
        <mat-icon>keyboard_arrow_up</mat-icon>
      </button>
    </div>
  `,
  styles: [
    `
      .scroll-to-top {
        position: fixed;
        bottom: 15px;
        right: 15px;
        opacity: 0;
        transition: all .2s ease-in-out;
      }

      .show-scrollTop {
        opacity: 1;
        transition: all .2s ease-in-out;
      }
    `,
  ],
})
export class ScrollTopComponent {
  windowScrolled = false;

  constructor(@Inject(DOCUMENT) private document: Document) {
  }

  @HostListener('document:mousewheel', ['$event'])
  onDocumentMousewheelEvent(event: any) {
    if (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop > 100) {
      this.windowScrolled = true;
    } else if (this.windowScrolled && window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop < 10) {
      this.windowScrolled = false;
    }
  }

  scrollToTop() {
    const currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
    if (currentScroll > 0) {
      const element = document.querySelector('#top');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        this.windowScrolled = false;
      }
    }
  }
}
