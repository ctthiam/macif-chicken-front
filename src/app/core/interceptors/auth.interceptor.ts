// ============================================================
// Fichier : src/app/core/interceptors/auth.interceptor.ts
// ============================================================
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject }                               from '@angular/core';
import { catchError, throwError }               from 'rxjs';
import { Router }                               from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token  = localStorage.getItem('token');

  // ⚠️ Ne jamais forcer Content-Type sur les requêtes FormData.
  // Le navigateur doit générer le boundary multipart automatiquement.
  // Forcer 'application/json' casse le parsing Laravel côté serveur.
  const isFormData = req.body instanceof FormData;

  let headers = req.headers.set('Accept', 'application/json');

  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  // Content-Type uniquement pour les requêtes JSON (pas FormData)
  if (!isFormData) {
    headers = headers.set('Content-Type', 'application/json');
  }

  const authReq = req.clone({ headers });

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.navigate(['/auth/login']);
      }
      return throwError(() => err);
    })
  );
};