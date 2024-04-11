import { MediaMatcher } from '@angular/cdk/layout';
import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { LocalStorageService } from '@shared';
import { AppSettings, AppTheme, defaults } from '../settings';


@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private key = 'learn-itermit-settings';
  private readonly notify$ = new BehaviorSubject<Partial<AppSettings>>({});

  get notify() {
    return this.notify$.asObservable();
  }

  private htmlElement!: HTMLHtmlElement;

  options: AppSettings;

  themeColor: Exclude<AppTheme, 'auto'> = 'light';

  constructor(private store: LocalStorageService,
              private mediaMatcher: MediaMatcher,
              @Inject(DOCUMENT) private document: Document) {
    const storedOptions = this.store.get(this.key);
    this.options = Object.assign(defaults, storedOptions);
    this.themeColor = this.getThemeColor();
    this.htmlElement = this.document.querySelector('html')!;
  }

  reset() {
    this.store.remove(this.key);
  }

  getThemeColor() {
    // Check whether the browser support `prefers-color-scheme`
    if (
      this.options.theme === 'auto' &&
      this.mediaMatcher.matchMedia('(prefers-color-scheme)').media !== 'not all'
    ) {
      const isSystemDark = this.mediaMatcher.matchMedia('(prefers-color-scheme: dark)').matches;
      // Set theme to dark if `prefers-color-scheme` is dark. Otherwise, set it to light.
      return isSystemDark ? 'dark' : 'light';
    } else {
      return this.options.theme as Exclude<AppTheme, 'auto'>;
    }
  }

  setOptions(options: AppSettings) {
    this.options = Object.assign(defaults, options);
    this.store.set(this.key, this.options);
    this.notify$.next(this.options);
  }

  setLanguage(lang: string) {
    this.options.language = lang;
    this.store.set(this.key, this.options);
    this.notify$.next(this.options);
  }

  setTheme() {
    this.themeColor = this.getThemeColor();

    if (this.themeColor === 'dark') {
      this.htmlElement.classList.add('theme-dark');
    } else {
      this.htmlElement.classList.remove('theme-dark');
    }
    this.notify$.next(this.options);
  }

  setThemeValue(theme: Exclude<AppTheme, 'auto'>) {
    this.options.theme = theme;
    this.store.set(this.key, this.options);
    this.notify$.next(this.options);
  }

  toggleTheme() {
    this.themeColor = this.getThemeColor();

    if (this.themeColor === 'dark') {
      this.setThemeValue('light');
    } else {
      this.setThemeValue('dark');
    }

    this.setTheme();
  }
}
