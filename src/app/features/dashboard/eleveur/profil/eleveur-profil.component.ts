// ============================================================
// Fichier : src/app/features/dashboard/eleveur/profil/eleveur-profil.component.ts
// ============================================================
import { Component, signal, OnInit } from '@angular/core';
import { CommonModule }   from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient }     from '@angular/common/http';
import { RouterModule }   from '@angular/router';
import { AuthService }    from '../../../../core/services/auth.service';
import { RatingStarsComponent } from '../../../../shared/components/rating-stars/rating-stars.component';
import { environment }    from '../../../../environments/environment';

interface ProfileData {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  ville: string | null;
  adresse: string | null;
  avatar: string | null;
  eleveur_profile: {
    nom_poulailler: string;
    description:    string | null;
    localisation:   string | null;
    is_certified:   boolean;
    note_moyenne:   number | null;
    nombre_avis:    number | null;
    photos:         string[];
  } | null;
  abonnement: {
    plan:        string;
    statut:      string;
    date_fin:    string;
    stock_limit: number;
  } | null;
}

interface Avis {
  id:          number;
  note:        number;
  commentaire: string;
  reply:       string | null;
  created_at:  string;
  auteur: { name: string; avatar: string | null } | null;
  commande: { id: number } | null;
}

@Component({
  selector:   'app-eleveur-profil',
  standalone: true,
  imports:    [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, RatingStarsComponent],
  template: `
<div class="space-y-6 animate-fade-in max-w-3xl">

  <div>
    <h1 class="font-display text-2xl font-extrabold text-neutral-900">Mon profil</h1>
    <p class="text-neutral-500 text-sm mt-0.5">Gérez vos informations et consultez vos avis</p>
  </div>

  @if (loading()) {
    <div class="flex justify-center py-12">
      <svg class="animate-spin w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
    </div>
  } @else {

  <!-- Avatar + identité -->
  <div class="bg-white rounded-2xl border border-neutral-100 shadow-card p-6">
    <div class="flex items-center gap-5">
      <div class="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shrink-0 shadow-md">
        <span class="text-3xl font-extrabold text-white">{{ initiale }}</span>
      </div>
      <div>
        <h2 class="font-display font-bold text-neutral-900 text-xl">{{ profileData()?.name }}</h2>
        <p class="text-sm text-neutral-500">{{ profileData()?.email }}</p>
        <div class="flex items-center gap-2 mt-2">
          <span class="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
            🌾 Éleveur
          </span>
          @if (profileData()?.eleveur_profile?.is_certified) {
            <span class="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              ✅ Certifié
            </span>
          }
        </div>
      </div>
    </div>
  </div>

  <!-- Abonnement actif -->
  @if (profileData()?.abonnement) {
    <div class="bg-white rounded-2xl border border-neutral-100 shadow-card p-6">
      <h3 class="font-display font-bold text-neutral-900 mb-4">🎫 Mon abonnement</h3>
      <div class="flex items-center justify-between flex-wrap gap-4">
        <div class="flex items-center gap-3">
          <span class="text-2xl">
            {{ profileData()!.abonnement!.plan === 'premium' ? '⭐' : profileData()!.abonnement!.plan === 'pro' ? '🔵' : '⚪' }}
          </span>
          <div>
            <p class="font-semibold text-neutral-900 capitalize">Plan {{ profileData()!.abonnement!.plan }}</p>
            <p class="text-xs text-neutral-500">
              Expire le {{ formatDate(profileData()!.abonnement!.date_fin) }}
              · {{ !profileData()!.abonnement!.stock_limit ? 'Stocks illimités' : profileData()!.abonnement!.stock_limit + ' stocks max' }}
            </p>
          </div>
        </div>
        <span [class]="profileData()!.abonnement!.statut === 'actif'
          ? 'bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full'
          : 'bg-red-100 text-red-700 text-xs font-semibold px-3 py-1 rounded-full'">
          {{ profileData()!.abonnement!.statut === 'actif' ? '✅ Actif' : '❌ Expiré' }}
        </span>
      </div>
    </div>
  }

  <!-- Informations personnelles -->
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
          <input type="tel" formControlName="phone"
                 class="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-100 transition-all"/>
        </div>
      </div>
      <div class="grid sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wide">Ville</label>
          <input type="text" formControlName="ville" placeholder="ex: Dakar"
                 class="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-100 transition-all"/>
        </div>
        <div>
          <label class="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wide">Adresse</label>
          <input type="text" formControlName="adresse"
                 class="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-100 transition-all"/>
        </div>
      </div>
    </div>
  </div>

  <!-- Infos poulailler -->
  <div class="bg-white rounded-2xl border border-neutral-100 shadow-card p-6" [formGroup]="poulaillerForm">
    <h3 class="font-display font-bold text-neutral-900 mb-5">🐔 Mon poulailler</h3>
    <div class="space-y-4">
      <div>
        <label class="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wide">Nom du poulailler *</label>
        <input type="text" formControlName="nom_poulailler"
               class="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-100 transition-all"/>
      </div>
      <div>
        <label class="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wide">Localisation</label>
        <input type="text" formControlName="localisation" placeholder="ex: Thiès, Sénégal"
               class="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-100 transition-all"/>
      </div>
      <div>
        <label class="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wide">Description</label>
        <textarea formControlName="description" rows="3" placeholder="Décrivez votre exploitation..."
                  class="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-100 transition-all resize-none"></textarea>
      </div>
    </div>
  </div>

  <!-- Erreur / Bouton sauvegarde -->
  @if (erreur()) {
    <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{{ erreur() }}</div>
  }
  <div class="flex justify-end">
    <button (click)="save()" [disabled]="saving()"
            class="inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-800 disabled:opacity-50 transition-all shadow-md text-sm">
      @if (saving()) {
        <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        Sauvegarde…
      } @else {
        💾 Enregistrer les modifications
      }
    </button>
  </div>

  <!-- Avis reçus -->
  <div class="bg-white rounded-2xl border border-neutral-100 shadow-card p-6">
    <div class="flex items-center justify-between mb-5">
      <h3 class="font-display font-bold text-neutral-900">
        ⭐ Avis reçus
        <span class="text-sm font-normal text-neutral-400 ml-1">({{ avis().length }})</span>
      </h3>
      @if (profileData()?.eleveur_profile?.note_moyenne) {
        <div class="flex items-center gap-2">
          <app-rating-stars [rating]="profileData()!.eleveur_profile!.note_moyenne!" [showValue]="true" size="sm" />
        </div>
      }
    </div>

    @if (loadingAvis()) {
      <p class="text-sm text-neutral-400 text-center py-6">Chargement…</p>
    } @else if (avis().length === 0) {
      <div class="text-center py-8 text-neutral-400">
        <p class="text-3xl mb-2">⭐</p>
        <p class="text-sm">Aucun avis reçu pour le moment</p>
      </div>
    } @else {
      <div class="space-y-4">
        @for (a of avis(); track a.id) {
          <div class="border border-neutral-100 rounded-xl p-4">
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
                  <span class="text-sm font-bold text-primary">{{ a.auteur?.name?.charAt(0)?.toUpperCase() ?? '?' }}</span>
                </div>
                <div>
                  <p class="text-sm font-semibold text-neutral-900">{{ a.auteur?.name ?? 'Anonyme' }}</p>
                  <p class="text-xs text-neutral-400">{{ formatDate(a.created_at) }}</p>
                </div>
              </div>
              <app-rating-stars [rating]="a.note" [showValue]="false" size="sm" />
            </div>
            <p class="text-sm text-neutral-600 mt-3 leading-relaxed">{{ a.commentaire }}</p>
            @if (a.reply) {
              <div class="mt-3 bg-primary-50 rounded-lg px-4 py-3 border-l-4 border-primary">
                <p class="text-xs font-semibold text-primary mb-1">Votre réponse</p>
                <p class="text-sm text-neutral-700">{{ a.reply }}</p>
              </div>
            } @else {
              <button (click)="ouvrirReponse(a)" class="mt-2 text-xs text-primary hover:underline font-medium">
                Répondre →
              </button>
            }
          </div>
        }
      </div>
    }
  </div>

  <!-- Modal réponse avis -->
  @if (avisEnReponse()) {
    <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" (click)="fermerReponse()">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" (click)="$event.stopPropagation()">
        <h3 class="font-display font-bold text-neutral-900 mb-4">Répondre à l'avis</h3>
        <p class="text-sm text-neutral-600 mb-4 bg-neutral-50 rounded-xl px-4 py-3 italic">
          "{{ avisEnReponse()!.commentaire }}"
        </p>
        <textarea [(ngModel)]="reponseTexte" rows="4" placeholder="Votre réponse (min. 10 caractères)..."
                  class="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary resize-none mb-4">
        </textarea>
        @if (erreurReponse()) {
          <p class="text-red-500 text-xs mb-3">{{ erreurReponse() }}</p>
        }
        <div class="flex gap-3">
          <button (click)="fermerReponse()" class="flex-1 py-2.5 border border-neutral-200 rounded-xl text-sm font-semibold text-neutral-600 hover:bg-neutral-50">
            Annuler
          </button>
          <button (click)="submitReponse()" [disabled]="savingReponse()"
                  class="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-800 disabled:opacity-50">
            {{ savingReponse() ? 'Envoi…' : 'Publier' }}
          </button>
        </div>
      </div>
    </div>
  }

  } <!-- end else loading -->

  <!-- Toast -->
  @if (toast()) {
    <div class="fixed bottom-6 right-6 z-50 bg-green-600 text-white font-semibold px-5 py-3 rounded-2xl shadow-xl animate-fade-in flex items-center gap-2">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
      </svg>
      Profil mis à jour
    </div>
  }

</div>
`,
})
export class EleveurProfilComponent implements OnInit {
  form:          FormGroup;
  poulaillerForm: FormGroup;
  profileData  = signal<ProfileData | null>(null);
  avis         = signal<Avis[]>([]);
  loading      = signal(true);
  loadingAvis  = signal(true);
  saving       = signal(false);
  toast        = signal(false);
  erreur       = signal<string | null>(null);

  // Réponse avis
  avisEnReponse  = signal<Avis | null>(null);
  reponseTexte   = '';
  savingReponse  = signal(false);
  erreurReponse  = signal<string | null>(null);

  get initiale(): string {
    return (this.profileData()?.name ?? this.auth.user()?.name ?? 'E')[0].toUpperCase();
  }

  constructor(
    private fb:   FormBuilder,
    private http: HttpClient,
    public  auth: AuthService,
  ) {
    this.form = this.fb.group({
      name:    ['', Validators.required],
      phone:   [''],
      ville:   [''],
      adresse: [''],
    });
    this.poulaillerForm = this.fb.group({
      nom_poulailler: ['', Validators.required],
      localisation:   [''],
      description:    [''],
    });
  }

  ngOnInit(): void {
    this.http.get<any>(`${environment.apiUrl}/eleveur/profile`).subscribe({
      next: (res) => {
        const d = res.data;
        this.profileData.set(d);
        // Pré-remplir formulaire infos perso
        this.form.patchValue({
          name:    d.name    ?? '',
          phone:   d.phone   ?? '',
          ville:   d.ville   ?? '',
          adresse: d.adresse ?? '',
        });
        // Pré-remplir formulaire poulailler
        const p = d.eleveur_profile;
        if (p) {
          this.poulaillerForm.patchValue({
            nom_poulailler: p.nom_poulailler ?? '',
            localisation:   p.localisation   ?? '',
            description:    p.description    ?? '',
          });
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    // Charger les avis reçus
    this.http.get<any>(`${environment.apiUrl}/eleveur/avis`).subscribe({
      next: (res) => {
        this.avis.set(res.data ?? []);
        this.loadingAvis.set(false);
      },
      error: () => this.loadingAvis.set(false),
    });
  }

  save(): void {
    if (this.saving() || this.form.invalid) return;
    this.saving.set(true);
    this.erreur.set(null);

    const payload = {
      ...this.form.value,
      ...this.poulaillerForm.value,
    };

    this.http.put<any>(`${environment.apiUrl}/eleveur/profile`, payload).subscribe({
      next: (res) => {
        this.saving.set(false);
        this.profileData.set(res.data);
        // Mettre à jour AuthService
        const u = this.auth.user();
        if (u) this.auth.setUser({ ...u, name: res.data.name });
        this.toast.set(true);
        setTimeout(() => this.toast.set(false), 3000);
      },
      error: (err) => {
        this.saving.set(false);
        const errors = err.error?.errors;
        if (errors) {
          const first = Object.values(errors)[0] as string[];
          this.erreur.set(first?.[0] ?? 'Erreur de validation.');
        } else {
          this.erreur.set(err.error?.message ?? 'Erreur lors de la sauvegarde.');
        }
      },
    });
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('fr-SN', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  ouvrirReponse(a: Avis): void {
    this.avisEnReponse.set(a);
    this.reponseTexte = '';
    this.erreurReponse.set(null);
  }

  fermerReponse(): void {
    this.avisEnReponse.set(null);
  }

  submitReponse(): void {
    if (this.savingReponse()) return;
    if (this.reponseTexte.trim().length < 10) {
      this.erreurReponse.set('La réponse doit contenir au moins 10 caractères.');
      return;
    }
    this.savingReponse.set(true);
    this.http.put<any>(`${environment.apiUrl}/eleveur/avis/${this.avisEnReponse()!.id}/reply`, { reply: this.reponseTexte }).subscribe({
      next: () => {
        this.avis.update(list => list.map(a =>
          a.id === this.avisEnReponse()!.id ? { ...a, reply: this.reponseTexte } : a
        ));
        this.savingReponse.set(false);
        this.fermerReponse();
      },
      error: (err) => {
        this.erreurReponse.set(err.error?.message ?? 'Erreur.');
        this.savingReponse.set(false);
      },
    });
  }
}