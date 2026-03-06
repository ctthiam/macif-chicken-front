# 🐔 MACIF CHICKEN — Frontend Angular

## Stack technique
- **Angular 17** (standalone components, signals, control flow @if/@for)
- **TailwindCSS 3.4** (charte vert #1B5E20, orange #FF6F00)
- **Angular Material 17** (thème custom)
- **Chart.js + ng2-charts** (graphiques dashboards)
- **Polices** : Plus Jakarta Sans (display) + Inter (body)

## Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer le serveur de dev (proxy vers Laravel :8000)
npm start
# → http://localhost:4200

# 3. Build production
npm run build:prod
```

## Structure du projet

```
src/
├── app/
│   ├── core/
│   │   ├── services/
│   │   │   └── auth.service.ts        ← AuthService (signals)
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts    ← Bearer token auto
│   │   └── guards/
│   │       └── auth.guard.ts          ← authGuard, adminGuard, eleveurGuard, guestGuard
│   ├── features/
│   │   ├── auth/
│   │   │   ├── login/                 ← DES-14 ✓
│   │   │   ├── register/              ← DES-14 ✓
│   │   │   └── reset-password/        ← DES-14 ✓
│   │   ├── public/                    ← DES-03/05/06/07/08/09
│   │   └── dashboard/                 ← DES-04/10/11/12
│   ├── shared/                        ← DES-02 (composants partagés)
│   ├── environments/
│   │   └── environment.ts             ← apiUrl: http://localhost:8000/api
│   ├── app.config.ts
│   └── app.routes.ts
├── styles/
│   ├── styles.scss                    ← Tailwind + variables CSS + composants
│   └── material-theme.scss            ← Angular Material thème custom
├── tailwind.config.js                 ← Palette MACIF CHICKEN complète
└── proxy.conf.json                    ← Proxy dev → Laravel
```

## Charte graphique (DES-01)

| Élément | Valeur |
|---------|--------|
| Vert principal | `#1B5E20` (`primary-900`) |
| Vert medium | `#2E7D32` (`primary-800`) |
| Orange accent | `#FF6F00` (`accent-800`) |
| Police display | Plus Jakarta Sans (700, 800) |
| Police body | Inter (400, 500, 600) |
| Border radius | card: 12px, badge: 20px, button: 8px |

## Routes

| Route | Composant | Guard |
|-------|-----------|-------|
| `/auth/login` | LoginComponent | guestGuard |
| `/auth/register` | RegisterComponent | guestGuard |
| `/auth/reset-password` | ResetPasswordComponent | guestGuard |
| `/accueil` | HomeComponent | — |
| `/recherche` | SearchComponent | — |
| `/stocks/:id` | StockDetailComponent | — |
| `/eleveurs/:id` | EleveurProfileComponent | — |
| `/acheteur/dashboard` | AcheteurDashboardComponent | authGuard |
| `/eleveur/dashboard` | EleveurDashboardComponent | authGuard + eleveurGuard |
| `/admin/dashboard` | AdminDashboardComponent | authGuard + adminGuard |

## Prochains sprints Angular

- **DES-02** : Shared module (StockCard, RatingStars, BadgeStatus, etc.)
- **DES-03** : PublicLayoutComponent (Navbar + Footer)
- **DES-04** : DashboardLayoutComponent (Sidebar + Topbar)
- **DES-05/06/07/08** : Pages publiques
- **DES-09** : Tunnel commande (Angular Stepper)
- **DES-10/11/12** : Dashboards éleveur/acheteur/admin
- **DES-13** : Responsive mobile (déjà inclus via Tailwind breakpoints)