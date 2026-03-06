// ============================================================
// Fichier : src/app/features/dashboard/acheteur/acheteur.routes.ts
// ============================================================
import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from '../dashboard-layout/dashboard-layout.component';
import { acheteurGuard }            from '../../../core/guards/auth.guard';

export const ACHETEUR_ROUTES: Routes = [
  {
    path: 'acheteur',
    component: DashboardLayoutComponent,
    canActivate: [acheteurGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/acheteur-dashboard.component').then(m => m.AcheteurDashboardComponent),
      },
      {
        path: 'commandes',
        loadComponent: () => import('./commandes/acheteur-commandes.component').then(m => m.AcheteurCommandesComponent),
      },
      {
        path: 'favoris',
        loadComponent: () => import('./favoris/acheteur-favoris.component').then(m => m.AcheteurFavorisComponent),
      },
      {
        path: 'profil',
        loadComponent: () => import('./profil/acheteur-profil.component').then(m => m.AcheteurProfilComponent),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];