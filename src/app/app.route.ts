import { Routes } from '@angular/router';
import { AppLayout } from './layouts/app-layout';
import { AuthLayout } from './layouts/auth/auth-layout';
import { LoginPage } from './pages/login/login-page';

import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        component: LoginPage,
        data: { title: 'Iniciar sesión' },
      },
    ],
  },
  {
    path: '',
    component: AppLayout,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: '/vendedores',
        pathMatch: 'full',
      },
      {
        path: 'vendedores',
        loadComponent: () =>
          import('./pages/vendedores/home/vendedores-home').then(m => m.VendedoresHome),
      }
    ],
  },
  {
    path: '**',
    redirectTo: '/auth/login',
  },
];
