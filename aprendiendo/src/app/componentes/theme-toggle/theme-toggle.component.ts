import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './theme-toggle.component.html',
  styleUrl: './theme-toggle.component.scss'

})
export class ThemeToggleComponent implements OnInit{
  isDarkMode = false;
  constructor(public themeService: ThemeService) {}

  ngOnInit(): void {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      this.isDarkMode = true;
      document.body.classList.add('dark-mode');
    }
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }

}
