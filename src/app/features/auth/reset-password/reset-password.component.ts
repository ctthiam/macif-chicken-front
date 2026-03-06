// ============================================================
// Fichier : src/app/features/auth/reset-password/reset-password.component.ts
// ============================================================
import { Component, signal }            from '@angular/core';
import { CommonModule }                 from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule }                 from '@angular/router';
import { AuthService }                  from '../../../core/services/auth.service';

@Component({
  selector:    'app-reset-password',
  standalone:  true,
  imports:     [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
<div class="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex items-center justify-center p-4">

  <div class="absolute inset-0 overflow-hidden pointer-events-none">
    <div class="absolute top-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl"></div>
    <div class="absolute inset-0 opacity-[0.03]"
         style="background-image: linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px); background-size: 40px 40px;"></div>
  </div>

  <div class="relative w-full max-w-md animate-slide-up">

    <!-- Logo -->
    <div class="text-center mb-8">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-white/15 rounded-2xl backdrop-blur-sm mb-4 ring-1 ring-white/20">
        <span class="text-3xl">🐔</span>
      </div>
      <h1 class="text-2xl font-display font-bold text-white">MACIF CHICKEN</h1>
    </div>

    <div class="bg-white rounded-2xl shadow-2xl overflow-hidden">

      <!-- Succès -->
      @if (sent()) {
        <div class="p-8 text-center animate-fade-in">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </div>
          <h2 class="text-xl font-display font-bold text-neutral-900 mb-2">Email envoyé !</h2>
          <p class="text-neutral-500 text-sm mb-6">
            Un lien de réinitialisation a été envoyé à <strong>{{ form.value.email }}</strong>.
            Vérifiez votre boîte mail (et les spams).
          </p>
          <a routerLink="/auth/login" class="btn-primary w-full">
            Retour à la connexion
          </a>
        </div>
      } @else {
        <div class="px-8 pt-8 pb-4">
          <div class="flex items-center gap-3 mb-2">
            <a routerLink="/auth/login" class="text-neutral-400 hover:text-neutral-600 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
            </a>
            <h2 class="text-xl font-display font-bold text-neutral-900">Mot de passe oublié</h2>
          </div>
          <p class="text-sm text-neutral-500 ml-8">Entrez votre email et nous vous enverrons un lien de réinitialisation.</p>
        </div>

        @if (error()) {
          <div class="mx-8 mb-2 flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl animate-fade-in">
            <svg class="w-4 h-4 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd"/>
            </svg>
            <p class="text-sm text-red-700">{{ error() }}</p>
          </div>
        }

        <form [formGroup]="form" (ngSubmit)="submit()" class="px-8 pb-8 space-y-5 mt-4" novalidate>
          <div>
            <label class="input-label" for="reset-email">Adresse email</label>
            <div class="relative">
              <div class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
              <input id="reset-email" type="email" formControlName="email"
                     placeholder="vous@exemple.com" class="input pl-10"
                     [class.input-error]="emailCtrl.invalid && emailCtrl.touched"/>
            </div>
            @if (emailCtrl.invalid && emailCtrl.touched) {
              <p class="input-error-msg">Adresse email invalide.</p>
            }
          </div>

          <button type="submit" class="btn-primary w-full h-11 text-base" [disabled]="loading()">
            @if (loading()) {
              <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Envoi en cours…
            } @else {
              Envoyer le lien de réinitialisation
            }
          </button>

          <p class="text-center text-sm text-neutral-500">
            Vous souvenez du mot de passe ?
            <a routerLink="/auth/login" class="text-primary font-semibold hover:text-primary-700 transition-colors">Se connecter</a>
          </p>
        </form>
      }
    </div>

    <p class="text-center text-primary-300 text-xs mt-6">
      © 2026 MACIF CHICKEN — Marketplace avicole du Sénégal
    </p>
  </div>
</div>
  `,
})
export class ResetPasswordComponent {
  form: FormGroup;
  loading = signal(false);
  error   = signal('');
  sent    = signal(false);

  constructor(
    private fb:   FormBuilder,
    private auth: AuthService,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  get emailCtrl() { return this.form.get('email')!; }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set('');

    this.auth.forgotPassword(this.form.value.email).subscribe({
      next: () => { this.loading.set(false); this.sent.set(true); },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Erreur. Vérifiez l\'adresse email.');
      },
    });
  }
}