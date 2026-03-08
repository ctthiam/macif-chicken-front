// ============================================================
// Fichier : src/app/features/dashboard/eleveur/commande-detail/eleveur-commande-detail.component.ts
// Route   : GET  /api/eleveur/commandes/:id  (lecture via index + filtre)
// Actions : PUT  /api/eleveur/commandes/:id  { action }
// ============================================================
import { Component, signal, OnInit }              from '@angular/core';
import { CommonModule }                            from '@angular/common';
import { RouterModule, ActivatedRoute, Router }    from '@angular/router';
import { HttpClient }                              from '@angular/common/http';
import { environment }                             from '../../../../environments/environment';

interface CommandeDetail {
  id:               number;
  reference:        string | null;
  statut_commande:  string;
  statut_paiement:  string;
  quantite:         number;
  poids_total:      number;
  montant_total:    number;
  montant_eleveur:  number;
  commission_plateforme: number;
  mode_paiement:    string;
  adresse_livraison: string | null;
  date_livraison_souhaitee: string | null;
  note_livraison:   string | null;
  created_at:       string;
  stock: {
    id:             number;
    titre:          string;
    prix_par_kg:    number;
    poids_moyen_kg: number;
    photos:         string[];
  };
  acheteur: {
    id:     number;
    name:   string;
    avatar: string | null;
    phone:  string | null;
    ville:  string | null;
  };
}

@Component({
  selector:   'app-eleveur-commande-detail',
  standalone: true,
  imports:    [CommonModule, RouterModule],
  template: `
<div class="space-y-6 animate-fade-in max-w-3xl">

  <!-- Retour -->
  <div class="flex items-center gap-3">
    <button (click)="router.navigate(['/eleveur/commandes'])"
            class="p-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-all">
      <svg class="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
      </svg>
    </button>
    <div>
      <h1 class="font-display text-2xl font-extrabold text-neutral-900">Détail de la commande</h1>
      @if (cmd()) {
        <p class="text-neutral-400 text-sm">#{{ cmd()!.reference ?? cmd()!.id }} · {{ formatDate(cmd()!.created_at) }}</p>
      }
    </div>
  </div>

  @if (loading()) {
    <div class="flex items-center justify-center py-24">
      <svg class="animate-spin w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
    </div>
  }

  @if (!loading() && cmd(); as c) {

    <!-- Statuts + Actions principales -->
    <div class="bg-white rounded-2xl border border-neutral-100 shadow-card p-6">
      <div class="flex flex-wrap items-center gap-4 mb-5">
        <div class="flex-1">
          <p class="text-xs text-neutral-400 uppercase tracking-wide font-semibold mb-1">Statut commande</p>
          <span class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold"
                [class]="statutClass(c.statut_commande)">
            {{ statutLabel(c.statut_commande) }}
          </span>
        </div>
        <div class="flex-1">
          <p class="text-xs text-neutral-400 uppercase tracking-wide font-semibold mb-1">Paiement</p>
          <span class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold"
                [class]="paiementClass(c.statut_paiement)">
            {{ paiementLabel(c.statut_paiement) }}
          </span>
        </div>
        <div class="flex-1">
          <p class="text-xs text-neutral-400 uppercase tracking-wide font-semibold mb-1">Mode</p>
          <p class="font-semibold text-sm text-neutral-800 capitalize">{{ c.mode_paiement.replace('_',' ') }}</p>
        </div>
      </div>

      <!-- Timeline -->
      <div class="flex items-center gap-0 pt-4 border-t border-neutral-100">
        @for (step of steps; track step.key) {
          <div class="flex-1 flex flex-col items-center">
            <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                 [class]="stepClass(c.statut_commande, step.key)">
              {{ isDone(c.statut_commande, step.key) ? '✓' : ($index + 1) }}
            </div>
            <p class="text-xs mt-1.5 text-center font-medium"
               [class]="isCurrent(c.statut_commande, step.key) ? 'text-primary' : 'text-neutral-400'">
              {{ step.label }}
            </p>
          </div>
          @if (!$last) {
            <div class="flex-1 h-0.5 mb-4"
                 [class]="($index < steps.length - 1 && isDone(c.statut_commande, steps[$index + 1].key)) ? 'bg-primary' : 'bg-neutral-200'">
            </div>
          }
        }
      </div>

      <!-- Boutons d'action éleveur -->
      <div class="mt-5 pt-4 border-t border-neutral-100 flex flex-wrap gap-3">
        @if (c.statut_commande === 'confirmee') {
          <button (click)="changerStatut(c, 'confirmer')" [disabled]="actionLoading()"
                  class="flex-1 bg-amber-500 text-white font-bold py-3 px-5 rounded-xl hover:bg-amber-600 disabled:opacity-50 transition-all text-sm shadow-md">
            @if (actionLoading()) { En cours… } @else { 🍳 Démarrer la préparation }
          </button>
        }
        @if (c.statut_commande === 'en_preparation') {
          <button (click)="changerStatut(c, 'en_livraison')" [disabled]="actionLoading()"
                  class="flex-1 bg-purple-600 text-white font-bold py-3 px-5 rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-all text-sm shadow-md">
            @if (actionLoading()) { En cours… } @else { 🚚 Passer en livraison }
          </button>
        }
        @if (c.statut_commande === 'en_livraison') {
          <button (click)="changerStatut(c, 'livree')" [disabled]="actionLoading()"
                  class="flex-1 bg-green-600 text-white font-bold py-3 px-5 rounded-xl hover:bg-green-700 disabled:opacity-50 transition-all text-sm shadow-md">
            @if (actionLoading()) { En cours… } @else { ✅ Marquer comme livrée }
          </button>
        }
        @if (c.statut_commande === 'livree') {
          <div class="flex-1 bg-green-50 border border-green-200 text-green-700 text-sm font-semibold py-3 px-5 rounded-xl text-center">
            ✅ Livrée — en attente de confirmation acheteur
          </div>
        }
        @if (!['confirmee','en_preparation','en_livraison','livree'].includes(c.statut_commande)) {
          <div class="flex-1 bg-neutral-50 border border-neutral-200 text-neutral-500 text-sm py-3 px-5 rounded-xl text-center">
            Aucune action disponible pour ce statut
          </div>
        }
      </div>
    </div>

    <!-- Produit -->
    <div class="bg-white rounded-2xl border border-neutral-100 shadow-card p-6">
      <h2 class="font-display font-bold text-neutral-900 mb-4">Produit commandé</h2>
      <div class="flex gap-4">
        <div class="w-20 h-20 rounded-xl overflow-hidden bg-neutral-100 shrink-0">
          @if (c.stock.photos?.length) {
            <img [src]="c.stock.photos[0]" [alt]="c.stock.titre" class="w-full h-full object-cover"/>
          } @else {
            <div class="w-full h-full flex items-center justify-center text-2xl">🐔</div>
          }
        </div>
        <div class="flex-1">
          <h3 class="font-bold text-neutral-900">{{ c.stock.titre }}</h3>
          <p class="text-sm text-neutral-500 mt-0.5">
            {{ c.stock.prix_par_kg?.toLocaleString() }} FCFA/kg · ~{{ c.stock.poids_moyen_kg }} kg/unité
          </p>
          <div class="mt-3 grid grid-cols-3 gap-3">
            <div class="bg-neutral-50 rounded-xl p-3">
              <p class="text-xs text-neutral-400">Quantité</p>
              <p class="font-bold text-neutral-900">{{ c.quantite }} unité{{ c.quantite > 1 ? 's' : '' }}</p>
            </div>
            <div class="bg-neutral-50 rounded-xl p-3">
              <p class="text-xs text-neutral-400">Poids total</p>
              <p class="font-bold text-neutral-900">{{ c.poids_total }} kg</p>
            </div>
            <div class="bg-primary-50 rounded-xl p-3">
              <p class="text-xs text-primary-600">Votre part (93%)</p>
              <p class="font-extrabold text-primary">{{ formatMontant(c.montant_eleveur) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Acheteur -->
    <div class="bg-white rounded-2xl border border-neutral-100 shadow-card p-6">
      <h2 class="font-display font-bold text-neutral-900 mb-4">Acheteur</h2>
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-xl font-bold text-primary-700 shrink-0">
          {{ c.acheteur.name[0].toUpperCase() }}
        </div>
        <div>
          <p class="font-bold text-neutral-900">{{ c.acheteur.name }}</p>
          @if (c.acheteur.ville) {
            <p class="text-sm text-neutral-500">{{ c.acheteur.ville }}</p>
          }
          @if (c.acheteur.phone) {
            <a [href]="'tel:' + c.acheteur.phone"
               class="text-sm text-primary font-semibold hover:underline mt-0.5 inline-block">
              {{ c.acheteur.phone }}
            </a>
          }
        </div>
      </div>
    </div>

    <!-- Livraison -->
    @if (c.adresse_livraison || c.date_livraison_souhaitee || c.note_livraison) {
      <div class="bg-white rounded-2xl border border-neutral-100 shadow-card p-6">
        <h2 class="font-display font-bold text-neutral-900 mb-4">Livraison</h2>
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
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
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
                <p class="text-neutral-400 text-xs">Note acheteur</p>
                <p class="font-medium text-neutral-800">{{ c.note_livraison }}</p>
              </div>
            </div>
          }
        </div>
      </div>
    }

    <!-- Récap financier -->
    <div class="bg-white rounded-2xl border border-neutral-100 shadow-card p-6">
      <h2 class="font-display font-bold text-neutral-900 mb-4">Récapitulatif financier</h2>
      <div class="space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-neutral-500">Montant total commande</span>
          <span class="font-semibold">{{ formatMontant(c.montant_total) }}</span>
        </div>
        <div class="flex justify-between text-xs text-neutral-400">
          <span>Commission plateforme (7%)</span>
          <span>- {{ formatMontant(c.commission_plateforme) }}</span>
        </div>
        <div class="border-t border-neutral-100 pt-2 mt-2 flex justify-between font-extrabold text-base">
          <span>Vous recevrez (93%)</span>
          <span class="text-primary">{{ formatMontant(c.montant_eleveur) }}</span>
        </div>
      </div>
    </div>
  }

  @if (!loading() && !cmd()) {
    <div class="text-center py-24">
      <span class="text-5xl">📦</span>
      <p class="text-neutral-500 mt-4">Commande introuvable.</p>
      <a routerLink="/eleveur/commandes" class="text-sm font-bold text-primary hover:underline mt-3 inline-block">
        ← Retour aux commandes
      </a>
    </div>
  }

  <!-- Toast -->
  @if (toast()) {
    <div class="fixed bottom-6 right-6 bg-neutral-900 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl z-50 animate-fade-in">
      {{ toast() }}
    </div>
  }

</div>
`,
})
export class EleveurCommandeDetailComponent implements OnInit {
  cmd          = signal<CommandeDetail | null>(null);
  loading      = signal(true);
  actionLoading = signal(false);
  toast        = signal<string | null>(null);

  readonly steps = [
    { key: 'confirmee',      label: 'Confirmée'   },
    { key: 'en_preparation', label: 'Préparation' },
    { key: 'en_livraison',   label: 'Livraison'   },
    { key: 'livree',         label: 'Livrée'      },
  ];
  private readonly stepOrder = ['confirmee', 'en_preparation', 'en_livraison', 'livree'];

  // Map statut cible → action backend
  private readonly actionMap: Record<string, string> = {
    'confirmer':    'confirmer',
    'en_livraison': 'en_livraison',
    'livree':       'livree',
  };

  constructor(
    private route:  ActivatedRoute,
    public  router: Router,
    private http:   HttpClient,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.loading.set(false); return; }

    // Le backend éleveur n'a pas de GET /commandes/:id individuel,
    // on fetch la liste et on filtre. Ou on utilise le endpoint shared.
    this.http.get<any>(`${environment.apiUrl}/eleveur/commandes?per_page=100`).subscribe({
      next: (res) => {
        const list: CommandeDetail[] = res.data ?? [];
        const found = list.find(c => c.id === Number(id)) ?? null;
        this.cmd.set(found);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  changerStatut(cmd: CommandeDetail, action: string): void {
    if (this.actionLoading()) return;
    this.actionLoading.set(true);

    this.http.put<any>(`${environment.apiUrl}/eleveur/commandes/${cmd.id}`, { action }).subscribe({
      next: (res) => {
        this.actionLoading.set(false);
        if (res.data) this.cmd.set({ ...cmd, statut_commande: res.data.statut_commande });
        this.showToast('✅ ' + (res.message ?? 'Statut mis à jour.'));
      },
      error: (err) => {
        this.actionLoading.set(false);
        this.showToast(err.error?.message ?? 'Erreur lors du changement de statut.');
      },
    });
  }

  // ── Helpers timeline ─────────────────────────────────────
  isDone(statut: string, key: string): boolean {
    if (statut === 'annulee') return false;
    return this.stepOrder.indexOf(statut) > this.stepOrder.indexOf(key);
  }
  isCurrent(statut: string, key: string): boolean { return statut === key; }
  stepClass(statut: string, key: string): string {
    if (this.isDone(statut, key))    return 'bg-primary text-white';
    if (this.isCurrent(statut, key)) return 'bg-primary-100 text-primary border-2 border-primary';
    return 'bg-neutral-100 text-neutral-400';
  }

  // ── Helpers badges ────────────────────────────────────────
  statutClass(s: string): string {
    const m: Record<string, string> = {
      confirmee: 'bg-blue-100 text-blue-700', en_preparation: 'bg-amber-100 text-amber-700',
      en_livraison: 'bg-purple-100 text-purple-700', livree: 'bg-green-100 text-green-700',
      annulee: 'bg-red-100 text-red-700', litige: 'bg-orange-100 text-orange-700',
    };
    return m[s] ?? 'bg-neutral-100 text-neutral-600';
  }
  statutLabel(s: string): string {
    const m: Record<string, string> = {
      confirmee: '🔵 Confirmée', en_preparation: '🟡 En préparation',
      en_livraison: '🟣 En livraison', livree: '🟢 Livrée',
      annulee: '🔴 Annulée', litige: '🟠 Litige',
    };
    return m[s] ?? s;
  }
  paiementClass(s: string): string {
    const m: Record<string, string> = {
      en_attente: 'bg-amber-100 text-amber-700', paye: 'bg-blue-100 text-blue-700',
      libere: 'bg-green-100 text-green-700', rembourse: 'bg-neutral-100 text-neutral-600',
    };
    return m[s] ?? 'bg-neutral-100 text-neutral-600';
  }
  paiementLabel(s: string): string {
    const m: Record<string, string> = {
      en_attente: '⏳ En attente', paye: '💳 Payé', libere: '✅ Libéré', rembourse: '↩️ Remboursé',
    };
    return m[s] ?? s;
  }

  formatMontant(n: number): string {
    return new Intl.NumberFormat('fr-SN').format(n) + ' FCFA';
  }
  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('fr-SN', { day: '2-digit', month: 'long', year: 'numeric' });
  }
  private showToast(msg: string): void {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(null), 3500);
  }
}