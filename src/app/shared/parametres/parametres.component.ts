// ============================================================
// Fichier : src/app/features/dashboard/shared/parametres/parametres.component.ts
// Page Paramètres — commune aux 3 rôles (eleveur, acheteur, admin)
// ============================================================
import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule }   from '@angular/forms';
import { HttpClient }    from '@angular/common/http';
import { AuthService }   from '../../core/services/auth.service';
import { environment }   from '../../environments/environment';

@Component({
  selector:   'app-parametres',
  standalone: true,
  imports:    [CommonModule, FormsModule],
  template: `
<div class="space-y-6 animate-fade-in max-w-2xl">

  <div>
    <h1 class="font-display text-2xl font-extrabold text-neutral-900">Paramètres</h1>
    <p class="text-neutral-500 text-sm mt-0.5">Gérez votre compte et vos préférences.</p>
  </div>

  <!-- ── Changer le mot de passe ─────────────────────────────── -->
  <div class="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-neutral-100">
      <h2 class="font-semibold text-neutral-900 flex items-center gap-2">
        <span>🔐</span> Mot de passe
      </h2>
    </div>
    <div class="px-6 py-5 space-y-4">

      @if (pwSuccess()) {
        <div class="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <span class="text-green-600 text-lg">✅</span>
          <p class="text-sm font-semibold text-green-700">Mot de passe modifié avec succès !</p>
        </div>
      }
      @if (pwError()) {
        <div class="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <span class="text-red-500 text-lg">⚠️</span>
          <p class="text-sm font-semibold text-red-600">{{ pwError() }}</p>
        </div>
      }

      <div>
        <label class="block text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">
          Mot de passe actuel
        </label>
        <input
          [(ngModel)]="pwForm.current"
          type="password"
          placeholder="••••••••"
          class="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </div>

      <div>
        <label class="block text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">
          Nouveau mot de passe <span class="text-neutral-400 normal-case font-normal">(min. 8 caractères)</span>
        </label>
        <input
          [(ngModel)]="pwForm.new"
          type="password"
          placeholder="••••••••"
          class="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </div>

      <div>
        <label class="block text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">
          Confirmer le nouveau mot de passe
        </label>
        <input
          [(ngModel)]="pwForm.confirm"
          type="password"
          placeholder="••••••••"
          class="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </div>

      <button
        (click)="changePassword()"
        [disabled]="pwLoading()"
        class="bg-primary hover:bg-primary-800 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all disabled:opacity-60 flex items-center gap-2"
      >
        @if (pwLoading()) {
          <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          Enregistrement…
        } @else {
          Changer le mot de passe
        }
      </button>
    </div>
  </div>

  <!-- ── Notifications ───────────────────────────────────────── -->
  <div class="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-neutral-100">
      <h2 class="font-semibold text-neutral-900 flex items-center gap-2">
        <span>🔔</span> Notifications
      </h2>
    </div>
    <div class="px-6 py-5 space-y-4">
      @for (pref of notifPrefs; track pref.key) {
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-neutral-800">{{ pref.label }}</p>
            <p class="text-xs text-neutral-400">{{ pref.description }}</p>
          </div>
          <button
            (click)="toggleNotif(pref.key)"
            class="relative w-11 h-6 rounded-full transition-colors"
            [class]="prefs()[pref.key] ? 'bg-primary' : 'bg-neutral-200'"
          >
            <span
              class="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
              [class]="prefs()[pref.key] ? 'translate-x-5' : 'translate-x-0.5'"
            ></span>
          </button>
        </div>
      }
    </div>
  </div>

  <!-- ── Langue ──────────────────────────────────────────────── -->
  <div class="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-neutral-100">
      <h2 class="font-semibold text-neutral-900 flex items-center gap-2">
        <span>🌍</span> Langue de l'interface
      </h2>
    </div>
    <div class="px-6 py-5">
      <div class="flex gap-3">
        @for (lang of langues; track lang.code) {
          <button
            (click)="setLangue(lang.code)"
            class="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all"
            [class]="prefs()['langue'] === lang.code
              ? 'border-primary bg-primary-50 text-primary'
              : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'"
          >
            {{ lang.flag }} {{ lang.label }}
          </button>
        }
      </div>
      <p class="text-xs text-neutral-400 mt-3">
        La traduction complète sera disponible dans une prochaine version.
      </p>
    </div>
  </div>

  <!-- ── Zone danger ─────────────────────────────────────────── -->
  <div class="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-red-100">
      <h2 class="font-semibold text-red-600 flex items-center gap-2">
        <span>⚠️</span> Zone de danger
      </h2>
    </div>
    <div class="px-6 py-5 space-y-3">
      <p class="text-sm text-neutral-600">
        La suppression de votre compte est définitive. Toutes vos données seront effacées.
      </p>
      <button
        (click)="confirmDelete()"
        class="border-2 border-red-200 text-red-600 hover:bg-red-50 font-semibold px-5 py-2.5 rounded-xl text-sm transition-all"
      >
        Supprimer mon compte
      </button>
    </div>
  </div>

</div>

<!-- Modal confirmation suppression -->
@if (showDeleteModal()) {
  <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4">
      <h3 class="font-display font-bold text-neutral-900 text-lg">Confirmer la suppression</h3>
      <p class="text-sm text-neutral-600">
        Cette action est irréversible. Tapez <strong>SUPPRIMER</strong> pour confirmer.
      </p>
      <input
        [(ngModel)]="deleteConfirmText"
        type="text"
        placeholder="SUPPRIMER"
        class="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
      />
      <div class="flex gap-3 pt-1">
        <button (click)="showDeleteModal.set(false)"
          class="flex-1 border border-neutral-200 text-neutral-700 font-semibold py-2.5 rounded-xl text-sm hover:bg-neutral-50 transition-colors">
          Annuler
        </button>
        <button
          (click)="deleteAccount()"
          [disabled]="deleteConfirmText !== 'SUPPRIMER'"
          class="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-all disabled:opacity-40">
          Supprimer
        </button>
      </div>
    </div>
  </div>
}
  `,
})
export class ParametresComponent implements OnInit {

  // ── Mot de passe ───────────────────────────────────────────
  pwForm    = { current: '', new: '', confirm: '' };
  pwLoading = signal(false);
  pwError   = signal('');
  pwSuccess = signal(false);

  // ── Préférences (stockées en localStorage) ─────────────────
  prefs = signal<Record<string, any>>({
    notif_commandes:  true,
    notif_messages:   true,
    notif_promos:     false,
    langue:           'fr',
  });

  readonly notifPrefs = [
    { key: 'notif_commandes', label: 'Commandes',     description: 'Mises à jour de vos commandes en cours' },
    { key: 'notif_messages',  label: 'Messages',      description: 'Nouveaux messages et réponses aux avis' },
    { key: 'notif_promos',    label: 'Promotions',    description: 'Offres spéciales et nouveautés MACIF' },
  ];

  readonly langues = [
    { code: 'fr', flag: '🇫🇷', label: 'Français' },
    { code: 'wo', flag: '🇸🇳', label: 'Wolof' },
    { code: 'en', flag: '🇬🇧', label: 'English' },
  ];

  // ── Suppression compte ─────────────────────────────────────
  showDeleteModal  = signal(false);
  deleteConfirmText = '';

  private http = inject(HttpClient);
  readonly auth: AuthService = inject(AuthService);

  ngOnInit(): void {
    // Charger les préférences sauvegardées
    try {
      const saved = localStorage.getItem('macif_prefs');
      if (saved) this.prefs.set({ ...this.prefs(), ...JSON.parse(saved) });
    } catch {}
  }

  // ── Changer le mot de passe ───────────────────────────────
  changePassword(): void {
    this.pwError.set('');
    this.pwSuccess.set(false);

    if (!this.pwForm.current || !this.pwForm.new || !this.pwForm.confirm) {
      this.pwError.set('Veuillez remplir tous les champs.'); return;
    }
    if (this.pwForm.new.length < 8) {
      this.pwError.set('Le nouveau mot de passe doit contenir au moins 8 caractères.'); return;
    }
    if (this.pwForm.new !== this.pwForm.confirm) {
      this.pwError.set('Les mots de passe ne correspondent pas.'); return;
    }

    this.pwLoading.set(true);
    this.http.put(`${environment.apiUrl}/auth/change-password`, {
      current_password:           this.pwForm.current,
      new_password:               this.pwForm.new,
      new_password_confirmation:  this.pwForm.confirm,
    }).subscribe({
      next: () => {
        this.pwLoading.set(false);
        this.pwSuccess.set(true);
        this.pwForm = { current: '', new: '', confirm: '' };
        setTimeout(() => this.pwSuccess.set(false), 4000);
      },
      error: (err) => {
        this.pwLoading.set(false);
        this.pwError.set(err.error?.message ?? 'Erreur lors du changement de mot de passe.');
      },
    });
  }

  // ── Toggle notification pref ──────────────────────────────
  toggleNotif(key: string): void {
    const updated = { ...this.prefs(), [key]: !this.prefs()[key] };
    this.prefs.set(updated);
    this.savePrefs();
  }

  // ── Changer langue ────────────────────────────────────────
  setLangue(code: string): void {
    const updated = { ...this.prefs(), langue: code };
    this.prefs.set(updated);
    this.savePrefs();
  }

  private savePrefs(): void {
    try { localStorage.setItem('macif_prefs', JSON.stringify(this.prefs())); } catch {}
  }

  // ── Suppression compte ────────────────────────────────────
  confirmDelete(): void {
    this.deleteConfirmText = '';
    this.showDeleteModal.set(true);
  }

  deleteAccount(): void {
    if (this.deleteConfirmText !== 'SUPPRIMER') return;
    this.http.delete(`${environment.apiUrl}/auth/account`).subscribe({
      next:  () => this.auth.logout(),
      error: () => this.auth.logout(), // logout même en cas d'erreur
    });
  }
}