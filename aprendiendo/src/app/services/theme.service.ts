import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkThemeClass = 'lara-dark-blue';
  private lightThemeClass = 'lara-light-blue';

  constructor() { }

  enableDarkTheme() {
    this.updateTheme(this.darkThemeClass);
  }

  enableLightTheme() {
    this.updateTheme(this.lightThemeClass);
  }

  isDarkTheme(): boolean {
    return document.body.classList.contains(this.darkThemeClass);
  }

  private updateTheme(themeClass: string) {
    const body = document.body;
    const otherThemeClass =
      themeClass === this.darkThemeClass ? this.lightThemeClass : this.darkThemeClass;
    body.classList.remove(otherThemeClass);
    body.classList.add(themeClass);
  }
}
