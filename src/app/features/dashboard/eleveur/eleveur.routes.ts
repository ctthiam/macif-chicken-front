// ============================================================
// Fichier : src/app/features/dashboard/eleveur/eleveur.routes.ts
// Routes du dashboard éleveur — à importer dans app.routes.ts
// ============================================================
import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from '../dashboard-layout/dashboard-layout.component';
import { eleveurGuard }             from '../../../core/guards/auth.guard';

export const ELEVEUR_ROUTES: Routes = [
  {
    path: 'eleveur',
    component: DashboardLayoutComponent,
    canActivate: [eleveurGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/eleveur-dashboard.component').then(m => m.EleveurDashboardComponent),
      },
      {
        path: 'stocks',
        loadComponent: () => import('./stocks/eleveur-stocks.component').then(m => m.EleveurStocksComponent),
      },
      {
        path: 'commandes',
        loadComponent: () => import('./commandes/eleveur-commandes.component').then(m => m.EleveurCommandesComponent),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];