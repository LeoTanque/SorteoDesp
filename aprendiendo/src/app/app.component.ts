import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./componentes/navbar/navbar.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CommonModule],
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
        this.shouldShowToolbar = !(currentUrl === '/' || currentUrl.startsWith('/codigos') || currentUrl.startsWith('/datos-rifa'));
        //this.shouldShowToolbar = !['/'].includes(this.router.url);
      }
    });
  }

}
