import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';


@Injectable({
  providedIn: 'root'
})
export class AuthGuardLogin implements CanActivate {

  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) {}

  canActivate(): boolean {
    // Verificar si el usuario está autenticado
    if (this.authService.isUserLoggedIn()) {
      // Si el usuario está autenticado, redirigirlo a una página específica
      this.router.navigate(['/dashboard']);
      return false;
    } else {
      // Si el usuario no está autenticado, permitir el acceso a la página de login
      return true;
    }
  }
}
