// ============================================================
// Fichier : src/app/app.routes.ts
// Routes complètes — MACIF CHICKEN Frontend
// ============================================================
import { Routes }                 from '@angular/router';
import { PublicLayoutComponent }  from './features/public/public-layout/public-layout.component';
import { DashboardLayoutComponent } from './features/dashboard/dashboard-layout/dashboard-layout.component';

// Guards
import { authGuard, eleveurGuard, acheteurGuard, adminGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [

  // ── Pages publiques (avec Navbar + Footer) ─────────────────
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'accueil',
        pathMatch: 'full',
      },
      {
        path: 'accueil',
        loadComponent: () => import('./features/public/home/home.component')
          .then(m => m.HomeComponent),
        title: 'MACIF CHICKEN — Marketplace avicole',
      },
      {
        path: 'recherche',
        loadComponent: () => import('./features/public/search/search.component')
          .then(m => m.SearchComponent),
        title: 'Rechercher des volailles — MACIF CHICKEN',
      },
      {
        path: 'stocks/:id',
        loadComponent: () => import('./features/public/stock-detail/stock-detail.component')
          .then(m => m.StockDetailComponent),
        title: 'Détail du stock — MACIF CHICKEN',
      },
      {
        path: 'eleveurs/:id',
        loadComponent: () => import('./features/public/eleveur-profile/eleveur-profile.component')
          .then(m => m.EleveurProfileComponent),
        title: 'Profil éleveur — MACIF CHICKEN',
      },
    ],
  },

  // ── Tunnel commande (sans footer/navbar pour focus) ─────────
  {
    path: 'commander',
    canActivate: [authGuard],
    loadComponent: () => import('./features/public/commande-tunnel/commande-tunnel.component')
      .then(m => m.CommandeTunnelComponent),
    title: 'Passer une commande — MACIF CHICKEN',
  },

  // ── Auth (sans layout public) ────────────────────────────────
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/auth/login/login.component')
          .then(m => m.LoginComponent),
        title: 'Connexion — MACIF CHICKEN',
      },
      {
        path: 'register',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/auth/register/register.component')
          .then(m => m.RegisterComponent),
        title: 'Inscription — MACIF CHICKEN',
      },
      {
        path: 'reset-password',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/auth/reset-password/reset-password.component')
          .then(m => m.ResetPasswordComponent),
        title: 'Mot de passe oublié — MACIF CHICKEN',
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },

  // ── Dashboard ÉLEVEUR ────────────────────────────────────────
  {
    path: 'eleveur',
    component: DashboardLayoutComponent,
    canActivate: [eleveurGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/eleveur/dashboard/eleveur-dashboard.component')
          .then(m => m.EleveurDashboardComponent),
        title: 'Tableau de bord — Éleveur',
      },
      {
        path: 'stocks',
        loadComponent: () => import('./features/dashboard/eleveur/stocks/eleveur-stocks.component')
          .then(m => m.EleveurStocksComponent),
        title: 'Mes stocks — Éleveur',
      },
      {
        path: 'commandes',
        loadComponent: () => import('./features/dashboard/eleveur/commandes/eleveur-commandes.component')
          .then(m => m.EleveurCommandesComponent),
        title: 'Commandes reçues — Éleveur',
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },

  // ── Dashboard ACHETEUR ───────────────────────────────────────
  {
    path: 'acheteur',
    component: DashboardLayoutComponent,
    canActivate: [acheteurGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/acheteur/dashboard/acheteur-dashboard.component')
          .then(m => m.AcheteurDashboardComponent),
        title: 'Tableau de bord — Acheteur',
      },
      {
        path: 'commandes',
        loadComponent: () => import('./features/dashboard/acheteur/commandes/acheteur-commandes.component')
          .then(m => m.AcheteurCommandesComponent),
        title: 'Mes commandes — Acheteur',
      },
      {
        path: 'favoris',
        loadComponent: () => import('./features/dashboard/acheteur/favoris/acheteur-favoris.component')
          .then(m => m.AcheteurFavorisComponent),
        title: 'Mes favoris — Acheteur',
      },
      {
        path: 'profil',
        loadComponent: () => import('./features/dashboard/acheteur/profil/acheteur-profil.component')
          .then(m => m.AcheteurProfilComponent),
        title: 'Mon profil — Acheteur',
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },

  // ── Dashboard ADMIN ──────────────────────────────────────────
  {
    path: 'admin',
    component: DashboardLayoutComponent,
    canActivate: [adminGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/admin/dashboard/admin-dashboard.component')
          .then(m => m.AdminDashboardComponent),
        title: 'Vue d\'ensemble — Admin',
      },
      {
        path: 'utilisateurs',
        loadComponent: () => import('./features/dashboard/admin/utilisateurs/admin-utilisateurs.component')
          .then(m => m.AdminUtilisateursComponent),
        title: 'Utilisateurs — Admin',
      },
      {
        path: 'litiges',
        loadComponent: () => import('./features/dashboard/admin/litiges/admin-litiges.component')
          .then(m => m.AdminLitigesComponent),
        title: 'Litiges — Admin',
      },
      {
        path: 'stocks',
        loadComponent: () => import('./features/dashboard/admin/stocks/admin-stocks.component')
          .then(m => m.AdminStocksComponent),
        title: 'Annonces — Admin',
      },
      {
        path: 'commandes',
        loadComponent: () => import('./features/dashboard/admin/commandes/admin-commandes.component')
          .then(m => m.AdminCommandesComponent),
        title: 'Commandes — Admin',
      },
      {
        path: 'finances',
        loadComponent: () => import('./features/dashboard/admin/finances/admin-finances.component')
          .then(m => m.AdminFinancesComponent),
        title: 'Finances — Admin',
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },

  // ── 404 Fallback ─────────────────────────────────────────────
  {
    path: '**',
    redirectTo: 'accueil',
  },
];