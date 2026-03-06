// ============================================================
// Fichier : src/app/core/guards/auth.guard.ts
// ============================================================
import { inject }        from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { Router }        from '@angular/router';
import { AuthService }   from '../services/auth.service';

// ── Guard : utilisateur connecté ─────────────────────────────
export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) return true;

  router.navigate(['/auth/login']);
  return false;
};

// ── Guard : admin seulement ───────────────────────────────────
export const adminGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn() && auth.isAdmin()) return true;

  router.navigate([auth.isLoggedIn() ? '/' : '/auth/login']);
  return false;
};

// ── Guard : éleveur seulement ─────────────────────────────────
export const eleveurGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn() && auth.isEleveur()) return true;

  router.navigate([auth.isLoggedIn() ? '/' : '/auth/login']);
  return false;
};

// ── Guard : acheteur seulement ────────────────────────────────
export const acheteurGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn() && auth.isAcheteur()) return true;

  router.navigate([auth.isLoggedIn() ? '/' : '/auth/login']);
  return false;
};

// ── Guard : non connecté seulement (pages auth) ───────────────
export const guestGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) return true;

  auth.redirectAfterLogin();
  return false;
};