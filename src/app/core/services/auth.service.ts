// ============================================================
// Fichier : src/app/core/services/auth.service.ts
// ============================================================
import { Injectable, signal, computed } from '@angular/core';
import { HttpClient }                    from '@angular/common/http';
import { Router }                        from '@angular/router';
import { Observable, tap }               from 'rxjs';
import { environment }                   from '../../environments/environment';

export interface User {
  id:             number;
  name:           string;
  email:          string;
  phone:          string;
  role:           'admin' | 'eleveur' | 'acheteur';
  is_active:      boolean;
  is_verified:    boolean;
  is_certified?:  boolean;
  adresse_defaut?: string;
  avatar?:        string;
}

export interface LoginPayload {
  email:    string;
  password: string;
}

export interface RegisterPayload {
  name:                  string;
  email:                 string;
  phone:                 string;
  password:              string;
  password_confirmation: string;
  role:                  'eleveur' | 'acheteur';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = environment.apiUrl;

  // ── State réactif ─────────────────────────────────────────
  private _user   = signal<User | null>(this._loadUser());
  private _token  = signal<string | null>(localStorage.getItem('token'));

  readonly user       = this._user.asReadonly();
  readonly token      = this._token.asReadonly();
  readonly isLoggedIn = computed(() => !!this._token());
  readonly isAdmin    = computed(() => this._user()?.role === 'admin');
  readonly isEleveur  = computed(() => this._user()?.role === 'eleveur');
  readonly isAcheteur = computed(() => this._user()?.role === 'acheteur');

  constructor(
    private http:   HttpClient,
    private router: Router
  ) {}

  // ── Login ─────────────────────────────────────────────────
  login(payload: LoginPayload): Observable<any> {
    return this.http.post(`${this.api}/auth/login`, payload).pipe(
      tap((res: any) => {
        this._setSession(res.data.token, res.data.user);
      })
    );
  }

  // ── Register ──────────────────────────────────────────────
  register(payload: RegisterPayload): Observable<any> {
    return this.http.post(`${this.api}/auth/register`, payload).pipe(
      tap((res: any) => {
        this._setSession(res.data.token, res.data.user);
      })
    );
  }

  // ── Logout ────────────────────────────────────────────────
  logout(): void {
    this.http.post(`${this.api}/auth/logout`, {}).subscribe();
    this._clearSession();
    this.router.navigate(['/auth/login']);
  }

  // ── Reset password request ────────────────────────────────
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.api}/auth/forgot-password`, { email });
  }

  // ── Reset password confirm ────────────────────────────────
  resetPassword(payload: { token: string; email: string; password: string; password_confirmation: string }): Observable<any> {
    return this.http.post(`${this.api}/auth/reset-password`, payload);
  }

  // ── Helpers ───────────────────────────────────────────────
  private _setSession(token: string, user: User): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this._token.set(token);
    this._user.set(user);
  }

  private _clearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this._token.set(null);
    this._user.set(null);
  }

  private _loadUser(): User | null {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }

  redirectAfterLogin(): void {
    const role = this._user()?.role;
    if (role === 'admin')    this.router.navigate(['/admin/dashboard']);
    else if (role === 'eleveur')  this.router.navigate(['/eleveur/dashboard']);
    else                          this.router.navigate(['/acheteur/dashboard']);
  }
}