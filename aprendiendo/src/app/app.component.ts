import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./componentes/navbar/navbar.component";
import { CommonModule } from '@angular/common';
import { ThemeToggleComponent } from "./componentes/theme-toggle/theme-toggle.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CommonModule, ThemeToggleComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'aprendiendo';
  shouldShowToolbar: boolean = true;

  constructor(private router: Router) {
    this.router.events.subscribe(event => {

      if (event instanceof NavigationEnd) {

        const currentUrl = this.router.url;
        // Oculta el navbar si la ruta es exactamente '/' o empieza con '/admin'
        this.shouldShowToolbar = !(currentUrl === '/' || currentUrl.startsWith('/codigos') || currentUrl.startsWith('/datos-rifa') || currentUrl.startsWith('/external-raffle'));
        //this.shouldShowToolbar = !['/'].includes(this.router.url);
      }
    });
  }

}
