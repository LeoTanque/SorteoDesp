import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './componentes/dashboard/dashboard.component';
import { AuthGuardLogin } from './guard/auth-guard-login.guard';
import { authGuard } from './guard/auth.guard';
import { ListaComponent } from './componentes/lista/lista.component';
import { RegisterComponent } from './componentes/register/register.component';
import { SorteoComponent } from './componentes/sorteo/sorteo.component';

export const routes: Routes = [
  {path:'',component:LoginComponent, canActivate: [AuthGuardLogin]},
  {path:'', redirectTo:'', pathMatch:'full'},
  {path:'dashboard', component:DashboardComponent, canActivate: [authGuard] },
  {path:'lista', component:ListaComponent},
  {path:'register', component:RegisterComponent},
  {path:'sorteo', component:SorteoComponent},
  { path: '**', redirectTo: '' }
];
