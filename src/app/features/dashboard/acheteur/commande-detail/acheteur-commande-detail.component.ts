// ============================================================
// Fichier : src/app/features/dashboard/acheteur/commande-detail/acheteur-commande-detail.component.ts
// Route   : GET /api/acheteur/commandes/:id  (CMD-11)
// Actions : confirmer-livraison (CMD-06) · annuler (CMD-04)
// ============================================================
import { Component, signal, OnInit }   from '@angular/core';
import { CommonModule }                from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { HttpClient }                  from '@angular/common/http';
import { environment }                 from '../../../../environments/environment';

interface CommandeDetail {
  id:                       number;
  statut_commande:          string;
  statut_paiement:          string;
  quantite:                 number;
  poids_total:              number;
  montant_total:            number;
  commission_plateforme:    number;
  montant_eleveur:          number;
  mode_paiement:            string;
  adresse_livraison:        string | null;
  date_livraison_souhaitee: string | null;
  note_livraison:           string | null;
  escrow_libere_at:         string | null;
  created_at:               string;
  stock: {
    id:             number;
    titre:          string;
    mode_vente:     string;
    prix_par_kg:    number;
    poids_moyen_kg: number;
    photos:         string[];
  };
  eleveur: {
    id:     number;
    name:   string;
    avatar: string | null;
    phone:  string | null;
    ville:  string | null;
  };
}

@Component({
  selector:   'app-acheteur-commande-detail',
  standalone: true,
  imports:    [CommonModule, RouterModule],
  template: `
<div class="space-y-6 animate-fade-in max-w-3xl">

  <!-- Retour -->
  <div class="flex items-center gap-3">
    <button (click)="router.navigate(['/acheteur/commandes'])"
            class="p-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-all">
      <svg class="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
      </svg>
    </button>
    <div>
      <h1 class="font-display text-2xl font-extrabold text-neutral-900">Détail de la commande</h1>
      @if (cmd()) {
        <p class="text-neutral-400 text-sm">#{{ cmd()!.id }} · {{ formatDate(cmd()!.created_at) }}</p>
      }
    </div>
  </div>

  <!-- Loading -->
  @if (loading()) {
    <div class="flex items-center justify-center py-24">
      <svg class="animate-spin w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
    </div>
  }

  @if (!loading() && cmd(); as c) {

    <!-- Statuts -->
    <div class="bg-white rounded-2xl border border-neutral-100 shadow-card p-6">
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex-1 min-w-0">
          <p class="text-xs text-neutral-400 uppercase tracking-wide font-semibold mb-1">Statut commande</p>
          <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                [class]="statutCommandeClass(c.statut_commande)">
            {{ statutCommandeLabel(c.statut_commande) }}
          </span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs text-neutral-400 uppercase tracking-wide font-semibold mb-1">Statut paiement</p>
          <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                [class]="statutPaiementClass(c.statut_paiement)">
            {{ statutPaiementLabel(c.statut_paiement) }}
          </span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs text-neutral-400 uppercase tracking-wide font-semibold mb-1">Mode paiement</p>
          <p class="font-semibold text-neutral-800 text-sm capitalize">
            {{ c.mode_paiement.replace('_', ' ') }}
          </p>
        </div>
      </div>

      <!-- Timeline statut -->
      <div class="mt-6 pt-5 border-t border-neutral-100">
        <div class="flex items-center gap-0">
          @for (step of steps; track step.key) {
            <div class="flex-1 flex flex-col items-center">
              <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                   [class]="isStepDone(c.statut_commande, step.key)
                     ? 'bg-primary text-white'
                     : isStepCurrent(c.statut_commande, step.key)
                       ? 'bg-primary-100 text-primary border-2 border-primary'
                       : 'bg-neutral-100 text-neutral-400'">
                {{ isStepDone(c.statut_commande, step.key) ? '✓' : ($index + 1) }}
              </div>
              <p class="text-xs mt-1.5 text-center font-medium"
                 [class]="isStepCurrent(c.statut_commande, step.key) ? 'text-primary' : 'text-neutral-400'">
                {{ step.label }}
              </p>
            </div>
            @if (!$last) {
              <div class="flex-1 h-0.5 mb-4"
                   [class]="($index < steps.length - 1 && isStepDone(c.statut_commande, steps[$index + 1].key)) ? 'bg-primary' : 'bg-neutral-200'">
              </div>
            }
          }
        </div>
      </div>
    </div>

    <!-- Produit commandé -->
    <div class="bg-white rounded-2xl border border-neutral-100 shadow-card p-6">
      <h2 class="font-display font-bold text-neutral-900 mb-4">Produit commandé</h2>
      <div class="flex gap-4">
        <!-- Photo -->
        <div class="w-20 h-20 rounded-xl overflow-hidden bg-neutral-100 shrink-0">
          @if (c.stock.photos?.length) {
            <img [src]="c.stock.photos[0]" [alt]="c.stock.titre" class="w-full h-full object-cover"/>
          } @else {
            <div class="w-full h-full flex items-center justify-center text-2xl">🐔</div>
          }
        </div>
        <!-- Infos -->
        <div class="flex-1 min-w-0">
          <h3 class="font-bold text-neutral-900">{{ c.stock.titre }}</h3>
          <p class="text-sm text-neutral-500 mt-0.5 capitalize">
            Mode : {{ c.stock.mode_vente.replace('_', ' ') }} ·
            {{ c.stock.prix_par_kg.toLocaleString() }} FCFA/kg ·
            ~{{ c.stock.poids_moyen_kg }} kg/unité
          </p>
          <div class="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div class="bg-neutral-50 rounded-xl p-3">
              <p class="text-xs text-neutral-400">Quantité</p>
              <p class="font-bold text-neutral-900 mt-0.5">{{ c.quantite }} unité{{ c.quantite > 1 ? 's' : '' }}</p>
            </div>
            <div class="bg-neutral-50 rounded-xl p-3">
              <p class="text-xs text-neutral-400">Poids total</p>
              <p class="font-bold text-neutral-900 mt-0.5">{{ c.poids_total }} kg</p>
            </div>
            <div class="bg-primary-50 rounded-xl p-3">
              <p class="text-xs text-primary-600">Montant total</p>
              <p class="font-extrabold text-primary mt-0.5">{{ formatMontant(c.montant_total) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Éleveur -->
    <div class="bg-white rounded-2xl border border-neutral-100 shadow-card p-6">
      <h2 class="font-display font-bold text-neutral-900 mb-4">Éleveur</h2>
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-xl font-bold text-primary-700 shrink-0">
          @if (c.eleveur.avatar) {
            <img [src]="c.eleveur.avatar" class="w-full h-full rounded-full object-cover"/>
          } @else {
            {{ c.eleveur.name[0].toUpperCase() }}
          }
        </div>
        <div>
          <p class="font-bold text-neutral-900">{{ c.eleveur.name }}</p>
          @if (c.eleveur.ville) {
            <p class="text-sm text-neutral-500">{{ c.eleveur.ville }}</p>
          }
          @if (c.eleveur.phone) {
            <a [href]="'tel:' + c.eleveur.phone"
               class="text-sm text-primary font-semibold hover:underline mt-0.5 inline-block">
              {{ c.eleveur.phone }}
            </a>
          }
        </div>
        <a [routerLink]="['/eleveurs', c.eleveur.id]"
           class="ml-auto text-xs font-semibold text-neutral-500 hover:text-primary transition-colors">
          Voir profil →
        </a>
      </div>
    </div>

    <!-- Livraison -->
    <div class="bg-white rounded-2xl border border-neutral-100 shadow-card p-6">
      <h2 class="font-display font-bold text-neutral-900 mb-4">Informations de livraison</h2>
      <div class="space-y-3 text-sm">
        @if (c.adresse_livraison) {
          <div class="flex gap-3">
            <svg class="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <div>
              <p class="text-neutral-400 text-xs">Adresse</p>
              <p class="font-medium text-neutral-800">{{ c.adresse_livraison }}</p>
            </div>
          </div>
        }
        @if (c.date_livraison_souhaitee) {
          <div class="flex gap-3">
            <svg class="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <div>
              <p class="text-neutral-400 text-xs">Date souhaitée</p>
              <p class="font-medium text-neutral-800">{{ formatDate(c.date_livraison_souhaitee) }}</p>
            </div>
          </div>
        }
        @if (c.note_livraison) {
          <div class="flex gap-3">
            <svg class="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
            </svg>
            <div>
              <p class="text-neutral-400 text-xs">Note</p>
              <p class="font-medium text-neutral-800">{{ c.note_livraison }}</p>
            </div>
          </div>
        }
        @if (!c.adresse_livraison && !c.date_livraison_souhaitee) {
          <p class="text-neutral-400 italic">Aucune info de livraison renseignée.</p>
        }
      </div>
    </div>

    <!-- Récap financier -->
    <div class="bg-white rounded-2xl border border-neutral-100 shadow-card p-6">
      <h2 class="font-display font-bold text-neutral-900 mb-4">Récapitulatif financier</h2>
      <div class="space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-neutral-500">Sous-total</span>
          <span class="font-semibold text-neutral-800">{{ formatMontant(c.montant_total) }}</span>
        </div>
        <div class="flex justify-between text-xs">
          <span class="text-neutral-400">Commission plateforme (7%)</span>
          <span class="text-neutral-400">{{ formatMontant(c.commission_plateforme) }}</span>
        </div>
        <div class="flex justify-between text-xs">
          <span class="text-neutral-400">Part éleveur (93%)</span>
          <span class="text-neutral-400">{{ formatMontant(c.montant_eleveur) }}</span>
        </div>
        <div class="border-t border-neutral-100 pt-2 mt-2 flex justify-between font-extrabold text-base">
          <span>Total payé</span>
          <span class="text-primary">{{ formatMontant(c.montant_total) }}</span>
        </div>
        @if (c.escrow_libere_at) {
          <p class="text-xs text-green-600 font-medium mt-2">
            ✅ Fonds libérés à l'éleveur le {{ formatDate(c.escrow_libere_at) }}
          </p>
        }
      </div>
    </div>

    <!-- Actions -->
    @if (c.statut_commande === 'confirmee' || c.statut_commande === 'livree') {
      <div class="bg-white rounded-2xl border border-neutral-100 shadow-card p-6 flex flex-wrap gap-3">

        @if (c.statut_commande === 'livree' && c.statut_paiement === 'paye') {
          <button (click)="confirmerLivraison()" [disabled]="actionLoading()"
                  class="flex-1 bg-primary text-white font-bold py-3 px-5 rounded-xl hover:bg-primary-800 disabled:opacity-50 transition-all shadow-md text-sm">
            @if (actionLoading()) { Confirmation… } @else { ✅ Confirmer la réception }
          </button>
        }

        @if (c.statut_commande === 'confirmee') {
          <button (click)="annuler()" [disabled]="actionLoading()"
                  class="flex-1 border border-red-200 text-red-600 font-bold py-3 px-5 rounded-xl hover:bg-red-50 disabled:opacity-50 transition-all text-sm">
            @if (actionLoading()) { Annulation… } @else { ✕ Annuler la commande }
          </button>
        }
      </div>
    }

    <!-- Toast -->
    @if (toast()) {
      <div class="fixed bottom-6 right-6 bg-neutral-900 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl z-50 animate-fade-in">
        {{ toast() }}
      </div>
    }

  }

  @if (!loading() && !cmd()) {
    <div class="text-center py-24">
      <span class="text-5xl">📦</span>
      <h3 class="font-display font-bold text-neutral-900 text-xl mt-4 mb-2">Commande introuvable</h3>
      <p class="text-neutral-500 text-sm mb-5">Cette commande n'existe pas ou vous n'y avez pas accès.</p>
      <a routerLink="/acheteur/commandes" class="text-sm font-bold text-primary hover:underline">
        ← Retour à mes commandes
      </a>
    </div>
  }

</div>
`,
})
export class AcheteurCommandeDetailComponent implements OnInit {
  cmd         = signal<CommandeDetail | null>(null);
  loading     = signal(true);
  actionLoading = signal(false);
  toast       = signal<string | null>(null);

  readonly steps = [
    { key: 'confirmee',      label: 'Confirmée'    },
    { key: 'en_preparation', label: 'Préparation'  },
    { key: 'en_livraison',   label: 'En livraison' },
    { key: 'livree',         label: 'Livrée'       },
  ];

  private readonly stepOrder = ['confirmee', 'en_preparation', 'en_livraison', 'livree'];

  constructor(
    private route:  ActivatedRoute,
    public  router: Router,
    private http:   HttpClient,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.loading.set(false); return; }

    this.http.get<any>(`${environment.apiUrl}/acheteur/commandes/${id}`).subscribe({
      next:  (res) => { this.cmd.set(res.data ?? res); this.loading.set(false); },
      error: ()    => { this.loading.set(false); },
    });
  }

  confirmerLivraison(): void {
    const c = this.cmd();
    if (!c || this.actionLoading()) return;
    if (!confirm('Confirmez-vous avoir reçu votre commande ? Les fonds seront libérés à l\'éleveur.')) return;
    this.actionLoading.set(true);
    this.http.post<any>(`${environment.apiUrl}/acheteur/commandes/${c.id}/confirmer-livraison`, {}).subscribe({
      next: (res) => {
        this.cmd.set(res.data);
        this.actionLoading.set(false);
        this.showToast('✅ Réception confirmée. Fonds libérés à l\'éleveur.');
      },
      error: (err) => {
        this.actionLoading.set(false);
        this.showToast(err.error?.message ?? 'Erreur lors de la confirmation.');
      },
    });
  }

  annuler(): void {
    const c = this.cmd();
    if (!c || this.actionLoading()) return;
    if (!confirm('Annuler cette commande ? Cette action est irréversible.')) return;
    this.actionLoading.set(true);
    this.http.delete<any>(`${environment.apiUrl}/acheteur/commandes/${c.id}`).subscribe({
      next: (res) => {
        this.cmd.set(res.data);
        this.actionLoading.set(false);
        this.showToast('Commande annulée.');
      },
      error: (err) => {
        this.actionLoading.set(false);
        this.showToast(err.error?.message ?? 'Erreur lors de l\'annulation.');
      },
    });
  }

  // ── Helpers ──────────────────────────────────────────────
  formatMontant(n: number): string {
    return new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n);
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('fr-SN', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  isStepDone(statut: string, key: string): boolean {
    if (statut === 'annulee') return false;
    return this.stepOrder.indexOf(statut) > this.stepOrder.indexOf(key);
  }

  isStepCurrent(statut: string, key: string): boolean {
    return statut === key;
  }

  statutCommandeClass(s: string): string {
    const map: Record<string, string> = {
      confirmee:      'bg-blue-100 text-blue-700',
      en_preparation: 'bg-amber-100 text-amber-700',
      en_livraison:   'bg-purple-100 text-purple-700',
      livree:         'bg-green-100 text-green-700',
      annulee:        'bg-red-100 text-red-700',
      litige:         'bg-orange-100 text-orange-700',
    };
    return map[s] ?? 'bg-neutral-100 text-neutral-600';
  }

  statutCommandeLabel(s: string): string {
    const map: Record<string, string> = {
      confirmee:      '🔵 Confirmée',
      en_preparation: '🟡 En préparation',
      en_livraison:   '🟣 En livraison',
      livree:         '🟢 Livrée',
      annulee:        '🔴 Annulée',
      litige:         '🟠 Litige',
    };
    return map[s] ?? s;
  }

  statutPaiementClass(s: string): string {
    const map: Record<string, string> = {
      en_attente: 'bg-amber-100 text-amber-700',
      paye:       'bg-blue-100 text-blue-700',
      libere:     'bg-green-100 text-green-700',
      rembourse:  'bg-neutral-100 text-neutral-600',
    };
    return map[s] ?? 'bg-neutral-100 text-neutral-600';
  }

  statutPaiementLabel(s: string): string {
    const map: Record<string, string> = {
      en_attente: '⏳ En attente',
      paye:       '💳 Payé',
      libere:     '✅ Libéré',
      rembourse:  '↩️ Remboursé',
    };
    return map[s] ?? s;
  }

  private showToast(msg: string): void {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(null), 3500);
  }
}