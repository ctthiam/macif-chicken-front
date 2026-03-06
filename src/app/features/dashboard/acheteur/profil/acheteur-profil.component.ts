// ============================================================
// Fichier : src/app/features/dashboard/acheteur/profil/acheteur-profil.component.ts
// ============================================================
import { Component, signal, OnInit } from '@angular/core';
import { CommonModule }   from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient }     from '@angular/common/http';
import { AuthService }    from '../../../../core/services/auth.service';
import { environment }    from '../../../../environments/environment';

@Component({
  selector:    'app-acheteur-profil',
  standalone:  true,
  imports:     [CommonModule, ReactiveFormsModule],
  template: `
<div class="space-y-6 animate-fade-in max-w-2xl">

  <div>
    <h1 class="font-display text-2xl font-extrabold text-neutral-900">Mon profil</h1>
    <p class="text-neutral-500 text-sm mt-0.5">Gérez vos informations personnelles</p>
  </div>

  <!-- Avatar + nom -->
  <div class="bg-white rounded-2xl border border-neutral-100 shadow-card p-6">
    <div class="flex items-center gap-5">
      <div class="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shrink-0 shadow-md">
        <span class="text-3xl font-extrabold text-white">{{ initiale }}</span>
      </div>
      <div>
        <h2 class="font-display font-bold text-neutral-900 text-xl">{{ auth.user()?.name }}</h2>
        <p class="text-sm text-neutral-500">{{ auth.user()?.email }}</p>
        <span class="inline-flex items-center gap-1.5 mt-2 bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
          🛒 Acheteur
        </span>
      </div>
    </div>
  </div>

  <!-- Formulaire infos -->
  <div class="bg-white rounded-2xl border border-neutral-100 shadow-card p-6" [formGroup]="form">
    <h3 class="font-display font-bold text-neutral-900 mb-5">Informations personnelles</h3>

    <div class="space-y-4">
      <div class="grid sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wide">Nom complet *</label>
          <input type="text" formControlName="name"
                 class="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-100 transition-all"
                 [class.border-red-400]="form.get('name')?.invalid && form.get('name')?.touched"/>
        </div>
        <div>
          <label class="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wide">Téléphone</label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">+221</span>
            <input type="tel" formControlName="phone"
                   class="w-full text-sm border border-neutral-200 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-100 transition-all"/>
          </div>
        </div>
      </div>

      <div>
        <label class="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wide">Email</label>
        <input type="email" formControlName="email"
               class="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-100 transition-all bg-neutral-50 cursor-not-allowed"
               [readonly]="true"/>
        <p class="text-xs text-neutral-400 mt-1">L'email ne peut pas être modifié.</p>
      </div>

      <div>
        <label class="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wide">Adresse par défaut</label>
        <input type="text" formControlName="adresse_defaut"
               placeholder="Votre adresse habituelle de livraison"
               class="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-100 transition-all"/>
      </div>
    </div>

    @if (success()) {
      <div class="flex items-center gap-2 mt-4 p-3 bg-green-50 border border-green-200 rounded-xl animate-fade-in">
        <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        <p class="text-sm font-semibold text-green-700">Profil mis à jour avec succès !</p>
      </div>
    }
    @if (error()) {
      <p class="text-xs text-red-600 mt-3">{{ error() }}</p>
    }

    <div class="flex justify-end mt-6">
      <button (click)="sauvegarder()" [disabled]="saving()"
              class="flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-800 transition-all shadow-md disabled:opacity-60 text-sm">
        @if (saving()) {
          <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          Enregistrement…
        } @else {
          Sauvegarder les modifications
        }
      </button>
    </div>
  </div>

  <!-- Changement mot de passe -->
  <div class="bg-white rounded-2xl border border-neutral-100 shadow-card p-6" [formGroup]="pwForm">
    <h3 class="font-display font-bold text-neutral-900 mb-5">Changer le mot de passe</h3>
    <div class="space-y-4">
      <div>
        <label class="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wide">Mot de passe actuel</label>
        <input type="password" formControlName="current_password"
               class="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-100 transition-all"/>
      </div>
      <div class="grid sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wide">Nouveau mot de passe</label>
          <input type="password" formControlName="password"
                 class="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-100 transition-all"/>
        </div>
        <div>
          <label class="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wide">Confirmer</label>
          <input type="password" formControlName="password_confirmation"
                 class="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-100 transition-all"/>
        </div>
      </div>
    </div>
    <div class="flex justify-end mt-5">
      <button (click)="changerMotDePasse()" [disabled]="pwSaving()"
              class="text-sm font-semibold border-2 border-primary text-primary px-6 py-2.5 rounded-xl hover:bg-primary hover:text-white transition-all disabled:opacity-60">
        @if (pwSaving()) { Enregistrement… } @else { Modifier le mot de passe }
      </button>
    </div>
  </div>

</div>
  `,
})
export class AcheteurProfilComponent implements OnInit {
  form!:   FormGroup;
  pwForm!: FormGroup;
  saving   = signal(false);
  pwSaving = signal(false);
  success  = signal(false);
  error    = signal('');

  constructor(
    private fb:   FormBuilder,
    private http: HttpClient,
    public  auth: AuthService,
  ) {}

  get initiale(): string {
    return (this.auth.user()?.name ?? 'A').charAt(0).toUpperCase();
  }

  ngOnInit(): void {
    const u = this.auth.user();
    this.form = this.fb.group({
      name:           [u?.name ?? '',  Validators.required],
      phone:          [u?.phone ?? ''],
      email:          [{ value: u?.email ?? '', disabled: true }],
      adresse_defaut: [u?.adresse_defaut ?? ''],
    });

    this.pwForm = this.fb.group({
      current_password:      ['', Validators.required],
      password:              ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', Validators.required],
    });
  }

  sauvegarder(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true); this.error.set(''); this.success.set(false);
    this.http.put(`${environment.apiUrl}/profile`, this.form.getRawValue()).subscribe({
      next:  () => { this.saving.set(false); this.success.set(true); setTimeout(() => this.success.set(false), 3000); },
      error: (e) => { this.saving.set(false); this.error.set(e.error?.message ?? 'Erreur.'); },
    });
  }

  changerMotDePasse(): void {
    if (this.pwForm.invalid) return;
    this.pwSaving.set(true);
    this.http.put(`${environment.apiUrl}/profile/password`, this.pwForm.value).subscribe({
      next:  () => { this.pwSaving.set(false); this.pwForm.reset(); },
      error: () => this.pwSaving.set(false),
    });
  }
}