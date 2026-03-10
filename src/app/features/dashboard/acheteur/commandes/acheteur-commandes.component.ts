// ============================================================
// Fichier : src/app/features/dashboard/acheteur/commandes/acheteur-commandes.component.ts
// ============================================================
import { Component, signal, OnInit } from '@angular/core';
import { CommonModule }   from '@angular/common';
import { RouterModule }   from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient }     from '@angular/common/http';
import { BadgeStatusComponent }    from '../../../../shared/components/badge-status/badge-status.component';
import { RatingStarsComponent }    from '../../../../shared/components/rating-stars/rating-stars.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { environment }    from '../../../../environments/environment';

interface Commande {
  id:          number;
  reference:   string;
  statut_commande: string;
  quantite:    number;
  montant_total:   number;
  created_at:  string;
  avis_donne:  boolean;
  stock:       { id: number; titre: string; photos: string[] };
  eleveur:     { id: number; name: string; localisation: string };
  adresse_livraison: string;
  litige?:          { id: number; statut: string; raison: string } | null;
  statut_paiement:  string;
  mode_paiement?:   string | null;
}

@Component({
  selector:    'app-acheteur-commandes',
  standalone:  true,
  imports:     [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, BadgeStatusComponent, RatingStarsComponent, LoadingSpinnerComponent],
  template: `
<div class="space-y-6 animate-fade-in">

  <!-- Header -->
  <div>
    <h1 class="font-display text-2xl font-extrabold text-neutral-900">Mes commandes</h1>
    <p class="text-neutral-500 text-sm mt-0.5">{{ total() }} commande{{ total() > 1 ? 's' : '' }} au total</p>
  </div>

  <!-- Erreur paiement -->
  @if (paiementErreur()) {
    <div class="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700">
      <svg class="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
      </svg>
      {{ paiementErreur() }}
      <button (click)="paiementErreur.set('')" class="ml-auto text-red-500 hover:text-red-700">✕</button>
    </div>
  }

  <!-- Filtres -->
  <div class="flex flex-wrap gap-2">
    @for (f of statutFiltres; track f.value) {
      <button
        (click)="filtreStatut.set(f.value); load()"
        class="px-4 py-2 text-xs font-semibold rounded-xl border-2 transition-all"
        [class]="filtreStatut() === f.value
          ? 'bg-primary text-white border-primary'
          : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'"
      >{{ f.label }}</button>
    }
  </div>

  @if (loading()) {
    <app-loading-spinner [fullPage]="true" />
  } @else if (commandes().length === 0) {
    <div class="bg-white rounded-2xl border border-neutral-100 p-20 text-center">
      <span class="text-6xl">🛒</span>
      <p class="text-neutral-500 font-medium mt-4">Aucune commande</p>
      <a routerLink="/recherche" class="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
        Parcourir les annonces →
      </a>
    </div>
  } @else {
    <div class="space-y-4">
      @for (cmd of commandes(); track cmd.id) {
        <div class="bg-white rounded-2xl border border-neutral-100 shadow-card overflow-hidden">

          <!-- Header commande -->
          <div class="flex items-center justify-between px-5 py-3.5 bg-neutral-50 border-b border-neutral-100">
            <div class="flex items-center gap-3 flex-wrap">
              <span class="font-mono text-xs bg-white border border-neutral-200 px-2 py-1 rounded-lg text-neutral-700 font-semibold">
                #{{ cmd.reference ?? cmd.id }}
              </span>
              <app-badge-status [status]="cmd.statut_commande" type="commande" />
            </div>
            <span class="text-xs text-neutral-400">{{ formatDate(cmd.created_at) }}</span>
          </div>

          <div class="p-5">
            <div class="flex gap-4 items-start">

              <!-- Image -->
              <div class="w-16 h-16 rounded-xl bg-primary-50 overflow-hidden shrink-0 flex items-center justify-center">
                @if (cmd.stock.photos?.length) {
                  <img [src]="cmd.stock.photos[0]" [alt]="cmd.stock.titre" class="w-full h-full object-cover"/>
                } @else {
                  <span class="text-2xl">🐔</span>
                }
              </div>

              <!-- Infos -->
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-neutral-900 text-sm">{{ cmd.stock.titre }}</p>
                <p class="text-xs text-neutral-500 mt-0.5">
                  Éleveur : <span class="font-medium">{{ cmd.eleveur.name }}</span> · {{ cmd.eleveur.localisation }}
                </p>
                <p class="text-xs text-neutral-500 mt-0.5">{{ cmd.quantite }} unité{{ cmd.quantite > 1 ? 's' : '' }}</p>
                @if (cmd.adresse_livraison) {
                  <p class="text-xs text-neutral-400 mt-1 flex items-center gap-1">
                    <svg class="w-3 h-3 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    </svg>
                    {{ cmd.adresse_livraison }}
                  </p>
                }
              </div>

              <!-- Montant -->
              <div class="text-right shrink-0">
                <p class="text-lg font-extrabold text-primary">{{ formatMontant(cmd.montant_total) }}</p>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-wrap gap-2 mt-4 pt-4 border-t border-neutral-100">

              <!-- Voir stock -->
              <a [routerLink]="['/stocks', cmd.stock.id]"
                 class="text-xs font-semibold border border-neutral-200 text-neutral-600 px-3 py-2 rounded-lg hover:border-primary hover:text-primary transition-all">
                Voir l'annonce
              </a>

              <!-- Payer : visible si confirmée ET pas encore payée -->
              @if (cmd.statut_commande === 'confirmee' && cmd.statut_paiement === 'en_attente') {
                <button (click)="payer(cmd)"
                        [disabled]="paiementEnCours() === cmd.id"
                        class="text-xs font-semibold bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-800 transition-all flex items-center gap-1.5 disabled:opacity-60">
                  @if (paiementEnCours() === cmd.id) {
                    <svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Redirection…
                  } @else {
                    💳 Payer {{ formatMontant(cmd.montant_total) }}
                  }
                </button>
              }

              <!-- Badge "Payé" si déjà payé -->
              @if (cmd.statut_paiement === 'paye' || cmd.statut_paiement === 'libere') {
                <span class="text-xs font-semibold flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg">
                  <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  Payé
                </span>
              }

              <!-- Annuler si confirmée -->
              @if (cmd.statut_commande === 'confirmee') {
                <button (click)="annuler(cmd)"
                        class="text-xs font-semibold bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-all">
                  Annuler la commande
                </button>
              }

              <!-- Confirmer la réception — libère les fonds escrow vers l'éleveur -->
              @if (cmd.statut_commande === 'en_livraison' && cmd.statut_paiement === 'paye') {
                <button (click)="confirmerReception(cmd)"
                        [disabled]="confirmationEnCours() === cmd.id"
                        class="text-xs font-semibold bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all flex items-center gap-1.5 disabled:opacity-60">
                  @if (confirmationEnCours() === cmd.id) {
                    <svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Confirmation…
                  } @else {
                    ✅ Confirmer la réception
                  }
                </button>
              }

              <!-- Donner un avis si livrée et pas encore d'avis -->
              @if (cmd.statut_commande === 'livree' && !cmd.avis_donne) {
                <button (click)="ouvrirAvis(cmd)"
                        class="text-xs font-semibold bg-accent text-white px-3 py-2 rounded-lg hover:bg-accent-700 transition-all">
                  ⭐ Laisser un avis
                </button>
              }

              @if (cmd.avis_donne) {
                <span class="text-xs text-green-600 font-medium flex items-center gap-1 px-3 py-2 bg-green-50 rounded-lg">
                  <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                  Avis donné
                </span>
              }

              <!-- Litige : bouton si en_livraison ou livree, badge si déjà en litige -->
              @if (['en_livraison', 'livree'].includes(cmd.statut_commande) && !cmd.litige) {
                <button (click)="ouvrirLitige(cmd)"
                        class="text-xs font-semibold bg-red-50 text-red-600 border border-red-200 px-3 py-2 rounded-lg hover:bg-red-100 transition-all ml-auto">
                  ⚖️ Ouvrir un litige
                </button>
              }
              @if (cmd.statut_commande === 'litige' || cmd.litige) {
                <span class="text-xs font-semibold flex items-center gap-1.5 px-3 py-2 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg ml-auto">
                  ⚖️ Litige {{ cmd.litige?.statut ?? 'ouvert' }}
                </span>
              }
            </div>
          </div>

          <!-- Timeline statut -->
          @if (['confirmee','en_preparation','en_livraison','livree'].includes(cmd.statut_commande)) {
            <div class="px-5 pb-5">
              <div class="flex items-center gap-1">
                @for (s of timeline; track s.statut) {
                  <div class="flex-1 flex flex-col items-center gap-1">
                    <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all"
                         [class]="isStepDone(cmd.statut_commande, s.statut)
                           ? 'bg-primary text-white'
                           : cmd.statut_commande === s.statut
                             ? 'bg-primary-100 border-2 border-primary text-primary'
                             : 'bg-neutral-100 text-neutral-400'"
                    >
                      @if (isStepDone(cmd.statut_commande, s.statut)) {
                        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                        </svg>
                      } @else {
                        {{ s.num }}
                      }
                    </div>
                    <p class="text-xs text-center leading-tight"
                       [class]="cmd.statut_commande === s.statut ? 'text-primary font-semibold' : 'text-neutral-400'">
                      {{ s.label }}
                    </p>
                  </div>
                  @if (!$last) {
                    <div class="flex-1 h-0.5 mb-4 transition-all"
                         [class]="isStepDone(cmd.statut_commande, s.statut) ? 'bg-primary' : 'bg-neutral-200'">
                    </div>
                  }
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  }

  <!-- Modal litige -->
  @if (litigeModal()) {
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-xl">⚖️</div>
          <div>
            <h3 class="font-display font-bold text-neutral-900">Ouvrir un litige</h3>
            <p class="text-xs text-neutral-500">Commande #{{ litigeModal()!.reference ?? litigeModal()!.id }}</p>
          </div>
        </div>

        <div class="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4 text-xs text-orange-700">
          ⚠️ Un litige suspend la libération des fonds jusqu'à résolution par notre équipe.
        </div>

        <div class="mb-5">
          <label class="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wide">
            Raison du litige *
          </label>
          <textarea
            [value]="litigeRaison()"
            (input)="litigeRaison.set($any($event.target).value)"
            rows="5"
            placeholder="Décrivez précisément le problème rencontré (produit non conforme, non livré, qualité insuffisante…)"
            class="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 resize-none transition-all"
          ></textarea>
          <p class="text-xs text-neutral-400 mt-1">{{ litigeRaison().length }} / 1000 caractères (min. 10)</p>
        </div>

        @if (litigeError()) {
          <div class="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl mb-4 text-xs text-red-700">
            {{ litigeError() }}
          </div>
        }

        <div class="flex gap-3">
          <button (click)="litigeModal.set(null)"
                  class="flex-1 border-2 border-neutral-200 text-neutral-600 font-semibold py-3 rounded-xl hover:border-neutral-400 transition-all text-sm">
            Annuler
          </button>
          <button (click)="soumettreLitige()"
                  [disabled]="litigeSubmitting() || litigeRaison().length < 10"
                  class="flex-1 bg-red-600 text-white font-semibold py-3 rounded-xl hover:bg-red-700 transition-all text-sm disabled:opacity-60">
            @if (litigeSubmitting()) { Envoi… } @else { Confirmer le litige }
          </button>
        </div>
      </div>
    </div>
  }

  <!-- Modal avis -->
  @if (avisModal()) {
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" [formGroup]="avisForm">
        <h3 class="font-display font-bold text-neutral-900 text-lg mb-1">Laisser un avis</h3>
        <p class="text-sm text-neutral-500 mb-5">Pour <span class="font-semibold">{{ avisModal()!.stock.titre }}</span></p>

        <!-- Étoiles interactives -->
        <div class="mb-5">
          <label class="block text-xs font-semibold text-neutral-700 mb-2 uppercase tracking-wide">Note *</label>
          <app-rating-stars
            [rating]="avisForm.value.note ?? 0"
            [interactive]="true"
            size="lg"
            [showValue]="true"
            (ratingChange)="avisForm.patchValue({ note: $event })"
          />
        </div>

        <!-- Commentaire -->
        <div class="mb-5">
          <label class="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wide">Commentaire</label>
          <textarea
            formControlName="commentaire"
            rows="4"
            placeholder="Partagez votre expérience…"
            class="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-100 resize-none"
          ></textarea>
        </div>

        @if (avisError()) {
          <p class="text-xs text-red-600 mb-3">{{ avisError() }}</p>
        }

        <div class="flex gap-3">
          <button (click)="avisModal.set(null)"
                  class="flex-1 border-2 border-neutral-200 text-neutral-600 font-semibold py-3 rounded-xl hover:border-neutral-400 transition-all text-sm">
            Annuler
          </button>
          <button (click)="soumettrAvis()"
                  [disabled]="avisSubmitting() || avisForm.value.note === 0"
                  class="flex-1 bg-accent text-white font-semibold py-3 rounded-xl hover:bg-accent-700 transition-all text-sm disabled:opacity-60">
            @if (avisSubmitting()) { Envoi… } @else { Publier l'avis }
          </button>
        </div>
      </div>
    </div>
  }
</div>
  `,
})
export class AcheteurCommandesComponent implements OnInit {
  commandes    = signal<Commande[]>([]);
  total        = signal(0);
  loading      = signal(true);
  filtreStatut = signal('');
  avisModal    = signal<Commande | null>(null);
  avisError    = signal('');
  avisSubmitting = signal(false);
  avisForm!:   FormGroup;

  // Paiement
  paiementEnCours = signal<number | null>(null);

  // Confirmation réception
  confirmationEnCours = signal<number | null>(null);  // id de la commande en cours de paiement
  paiementErreur  = signal('');

  // Litige
  litigeModal   = signal<Commande | null>(null);
  litigeRaison  = signal('');
  litigeError   = signal('');
  litigeSubmitting = signal(false);

  readonly timeline = [
    { statut: 'confirmee',      label: 'Confirmée',  num: '1', order: 1 },
    { statut: 'en_preparation', label: 'Préparation',num: '2', order: 2 },
    { statut: 'en_livraison',   label: 'Livraison',  num: '3', order: 3 },
    { statut: 'livree',         label: 'Livrée',     num: '4', order: 4 },
  ];

  readonly statutFiltres = [
    { value: '',               label: 'Toutes' },
    { value: 'confirmee',      label: '✅ Confirmées' },
    { value: 'en_preparation', label: '⏳ En préparation' },
    { value: 'en_livraison',   label: '🚚 En livraison' },
    { value: 'livree',         label: '📦 Livrées' },
    { value: 'annulee',        label: '❌ Annulées' },
    { value: 'litige',         label: '⚖️ Litiges' },
  ];

  constructor(private http: HttpClient, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.avisForm = this.fb.group({
      note:        [0, [Validators.required, Validators.min(1)]],
      commentaire: [''],
    });
    this.load();
  }

  load(): void {
    this.loading.set(true);
    let url = `${environment.apiUrl}/acheteur/commandes?per_page=20`;
    if (this.filtreStatut()) url += `&statut=${this.filtreStatut()}`;
    this.http.get<any>(url).subscribe({
      next: (res) => {
        this.commandes.set(res.data ?? []);
        this.total.set(res.meta?.total ?? 0);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  annuler(cmd: Commande): void {
    if (!confirm('Annuler cette commande ?')) return;
    this.http.delete(`${environment.apiUrl}/acheteur/commandes/${cmd.id}`).subscribe({
      next: () => this.commandes.update(list => list.map(c => c.id === cmd.id ? { ...c, statut: 'annulee' } : c)),
      error: () => {},
    });
  }

  ouvrirAvis(cmd: Commande): void {
    this.avisModal.set(cmd);
    this.avisForm.reset({ note: 0, commentaire: '' });
    this.avisError.set('');
  }

  soumettrAvis(): void {
    if (this.avisForm.value.note < 1) { this.avisError.set('Veuillez donner une note.'); return; }
    const cmd = this.avisModal();
    if (!cmd) return;
    this.avisSubmitting.set(true);
    this.http.post(`${environment.apiUrl}/avis`, {
      commande_id:  cmd.id,
      note:         this.avisForm.value.note,
      commentaire:  this.avisForm.value.commentaire,
    }).subscribe({
      next: () => {
        this.avisSubmitting.set(false);
        this.avisModal.set(null);
        this.commandes.update(list => list.map(c => c.id === cmd.id ? { ...c, avis_donne: true } : c));
      },
      error: (err) => {
        this.avisSubmitting.set(false);
        this.avisError.set(err.error?.message ?? 'Erreur lors de l\'envoi.');
      },
    });
  }

  isStepDone(current: string, step: string): boolean {
    const order = (s: string) => this.timeline.find(t => t.statut === s)?.order ?? 0; // statut = step key
    return order(current) > order(step);
  }

  confirmerReception(cmd: Commande): void {
    if (!confirm('Confirmez-vous avoir bien reçu cette commande ? Les fonds seront libérés vers l\'éleveur.')) return;
    this.confirmationEnCours.set(cmd.id);

    this.http.post<any>(`${environment.apiUrl}/acheteur/commandes/${cmd.id}/confirmer-livraison`, {})
      .subscribe({
        next: () => {
          this.confirmationEnCours.set(null);
          this.commandes.update(list =>
            list.map(c => c.id === cmd.id
              ? { ...c, statut_commande: 'livree', statut_paiement: 'libere' }
              : c
            )
          );
        },
        error: (err) => {
          this.confirmationEnCours.set(null);
          this.paiementErreur.set(err.error?.message ?? 'Erreur lors de la confirmation.');
        },
      });
  }

  payer(cmd: Commande): void {
    this.paiementEnCours.set(cmd.id);
    this.paiementErreur.set('');

    this.http.post<any>(`${environment.apiUrl}/paiements/initier`, {
      commande_id: cmd.id,
    }).subscribe({
      next: (res) => {
        this.paiementEnCours.set(null);
        if (res.payment_url) {
          // Ouvrir la page de paiement NabooPay dans un nouvel onglet
          window.open(res.payment_url, '_blank');
        } else {
          this.paiementErreur.set('Impossible de récupérer l\'URL de paiement.');
        }
      },
      error: (err) => {
        this.paiementEnCours.set(null);
        this.paiementErreur.set(
          err.error?.message ?? 'Erreur lors de l\'initialisation du paiement. Réessayez.'
        );
      },
    });
  }

  ouvrirLitige(cmd: Commande): void {
    this.litigeModal.set(cmd);
    this.litigeRaison.set('');
    this.litigeError.set('');
  }

  soumettreLitige(): void {
    const raison = this.litigeRaison().trim();
    if (raison.length < 10) { this.litigeError.set('La raison doit faire au moins 10 caractères.'); return; }
    const cmd = this.litigeModal();
    if (!cmd) return;
    this.litigeSubmitting.set(true);
    this.http.post<any>(`${environment.apiUrl}/acheteur/commandes/${cmd.id}/litige`, { raison }).subscribe({
      next: (res) => {
        this.litigeSubmitting.set(false);
        this.litigeModal.set(null);
        // Mettre à jour la commande localement
        this.commandes.update(list => list.map(c =>
          c.id === cmd.id
            ? { ...c, statut_commande: 'litige', litige: res.data }
            : c
        ));
      },
      error: (err) => {
        this.litigeSubmitting.set(false);
        this.litigeError.set(err.error?.message ?? 'Erreur lors de l\'ouverture du litige.');
      },
    });
  }

  formatMontant(v: number): string { return new Intl.NumberFormat('fr-SN').format(v) + ' FCFA'; }
  formatDate(d: string): string    { return new Date(d).toLocaleDateString('fr-SN', { day: 'numeric', month: 'short', year: 'numeric' }); }
}