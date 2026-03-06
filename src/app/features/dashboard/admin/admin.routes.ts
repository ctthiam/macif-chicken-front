// ============================================================
// Fichier : src/app/features/dashboard/admin/admin.routes.ts
// ============================================================
import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from '../dashboard-layout/dashboard-layout.component';
import { adminGuard }               from '../../../core/guards/auth.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'admin',
    component: DashboardLayoutComponent,
    canActivate: [adminGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
      },
      {
        path: 'utilisateurs',
        loadComponent: () => import('./utilisateurs/admin-utilisateurs.component').then(m => m.AdminUtilisateursComponent),
      },
      {
        path: 'litiges',
        loadComponent: () => import('./litiges/admin-litiges.component').then(m => m.AdminLitigesComponent),
      },
      {
        path: 'stocks',
        loadComponent: () => import('./stocks/admin-stocks.component').then(m => m.AdminStocksComponent),
      },
      {
        path: 'commandes',
        loadComponent: () => import('./commandes/admin-commandes.component').then(m => m.AdminCommandesComponent),
      },
      {
        path: 'finances',
        loadComponent: () => import('./finances/admin-finances.component').then(m => m.AdminFinancesComponent),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];