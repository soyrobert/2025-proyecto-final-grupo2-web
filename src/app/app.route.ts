import { Routes } from '@angular/router';

import { AuthLayout } from './layouts/auth/auth-layout';
import { LoginPage } from './pages/login/login-page';

import { VendedoresLayout } from './layouts/vendedores/vendedores-layout';
import { VendedoresHome } from './pages/vendedores/home/vendedores-home';
import { PlanesVenta } from './pages/vendedores/planes-venta/planes-venta';

import { LogisticaLayout } from './layouts/logistica/logistica-layout';
import { LogisticaHome } from './pages/logistica/home/logistica-home';
import { PlanificacionRutas } from './pages/logistica/rutas/planificacion-rutas';

import { ProveedoresLayout } from './layouts/proveedores/proveedores-layout';
import { ProveedoresHome } from './pages/proveedores/home/proveedores-home';
import { ImportarProveedores } from './pages/proveedores/importar-proveedores/importar-proveedores';
import { ImportarProductos } from './pages/proveedores/importar-productos/importar-productos';

import { RoleGuard } from './core/guards/role.guard';
import { SignupVendedores } from './pages/signup/signup-page';

export const routes: Routes = [
  {
    path: 'auth',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        component: LoginPage,
      },
    ],
  },
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
  {
    path: 'vendedores',
    component: VendedoresLayout,
    canActivate: [RoleGuard],
    data: { expectedRole: 'director-ventas' },
    children: [
      {
        path: '',
        component: VendedoresHome,
      },
      {
        path: 'crear',
        component: SignupVendedores,
      },
      {
        path: 'planes-venta',
        component: PlanesVenta,
      },
    ],
  },
  {
    path: 'logistica',
    component: LogisticaLayout,
    canActivate: [RoleGuard],
    data: { expectedRole: 'encargado-logistica' },
    children: [
      {
        path: '',
        component: LogisticaHome,
      },
      {
        path: 'rutas',
        component: PlanificacionRutas,
      },
    ],
  },
  {
    path: 'proveedores',
    component: ProveedoresLayout,
    canActivate: [RoleGuard],
    data: { expectedRole: 'director-compras' },
    children: [
      {
        path: '',
        component: ProveedoresHome,
      },
      {
        path: 'importar-proveedores',
        component: ImportarProveedores,
      },
      {
        path: 'importar-productos',
        component: ImportarProductos,
      },
    ],
  },
];
