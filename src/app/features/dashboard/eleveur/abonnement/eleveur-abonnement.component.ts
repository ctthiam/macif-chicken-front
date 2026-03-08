// ============================================================
// Fichier : src/app/features/dashboard/eleveur/abonnement/eleveur-abonnement.component.ts
// ============================================================
import { Component, signal, OnInit } from '@angular/core';
import { CommonModule }   from '@angular/common';
import { HttpClient }     from '@angular/common/http';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { environment }    from '../../../../environments/environment';

interface PlanInfo {
  nom:           string;
  prix:          number;
  stocks_max:    number;
  features:      string[];
  couleur:       string;
  highlight:     boolean;
}

interface AbonnementActif {
  plan:         string;
  date_debut:   string;
  date_fin:     string;
  stocks_utilises: number;
  stocks_max:   number;
  is_active:    boolean;
  est_actif?:   boolean;
}

@Component({
  selector:   'app-eleveur-abonnement',
  standalone: true,
  imports:    [CommonModule, LoadingSpinnerComponent],
  template: `
<div class="space-y-6 animate-fade-in">

  <div>
    <h1 class="font-display text-2xl font-extrabold text-neutral-900">Mon abonnement</h1>
    <p class="text-neutral-500 text-sm mt-0.5">Gérez votre plan et vos limites de publication</p>
  </div>

  @if (loading()) {
    <app-loading-spinner [fullPage]="true" />
  } @else {

    <!-- Plan actuel -->
    @if (abonnement()) {
      <div class="bg-white rounded-2xl border border-neutral-100 shadow-card p-6">
        <h2 class="font-display font-bold text-neutral-900 mb-4">Plan actuel</h2>
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-md"
                 [class]="planBadgeClass(abonnement()!.plan)">
              {{ planEmoji(abonnement()!.plan) }}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-display font-extrabold text-xl text-neutral-900 capitalize">
                  {{ abonnement()!.plan }}
                </span>
                @if ((abonnement()!.is_active ?? abonnement()!.est_actif)) {
                  <span class="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">Actif</span>
                } @else {
                  <span class="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full">Expiré</span>
                }
              </div>
              <p class="text-sm text-neutral-500 mt-0.5">
                Valable jusqu'au <strong>{{ formatDate(abonnement()!.date_fin) }}</strong>
              </p>
            </div>
          </div>
          <!-- Barre d'utilisation stocks -->
          <div class="min-w-[200px]">
            <div class="flex justify-between text-xs font-semibold text-neutral-600 mb-1.5">
              <span>Stocks publiés</span>
              <span>{{ abonnement()!.stocks_utilises }} / {{ abonnement()!.stocks_max >= 9999 ? '∞' : abonnement()!.stocks_max }}</span>
            </div>
            <div class="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all duration-500"
                   [class]="barreClass()"
                   [style.width.%]="pourcentageStocks()"></div>
            </div>
            <p class="text-xs text-neutral-400 mt-1">
              {{ abonnement()!.stocks_max >= 9999 ? 'Illimité' : (abonnement()!.stocks_max - abonnement()!.stocks_utilises) + ' emplacement(s) restant(s)' }}
            </p>
          </div>
        </div>
      </div>
    }

    <!-- Méthode de paiement -->
    <div class="bg-white rounded-2xl border border-neutral-100 shadow-card p-6">
      <h2 class="font-display font-bold text-neutral-900 mb-4">Méthode de paiement</h2>
      <div class="flex flex-wrap gap-3">
        @for (m of methodes; track m.value) {
          <button (click)="methodePaiement = m.value"
                  class="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all"
                  [class]="methodePaiement === m.value
                    ? 'border-primary bg-primary-50 text-primary'
                    : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'">
            <span>{{ m.emoji }}</span> {{ m.label }}
          </button>
        }
      </div>
    </div>

    <!-- Plans disponibles -->
    <div>
      <h2 class="font-display font-bold text-neutral-900 mb-4">Changer de plan</h2>
      <div class="grid sm:grid-cols-3 gap-5">
        @for (plan of plans; track plan.nom) {
          <div class="relative bg-white rounded-2xl border-2 shadow-card transition-all duration-200"
               [class]="plan.highlight ? 'border-primary shadow-lg scale-[1.02]' : 'border-neutral-100 hover:border-neutral-200'">

            @if (plan.highlight) {
              <div class="absolute -top-3 left-1/2 -translate-x-1/2">
                <span class="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow">⭐ Populaire</span>
              </div>
            }

            <div class="p-6">
              <h3 class="font-display font-extrabold text-lg text-neutral-900 capitalize mb-1">{{ plan.nom }}</h3>
              <div class="flex items-baseline gap-1 mb-4">
                <span class="text-3xl font-extrabold" [class]="plan.highlight ? 'text-primary' : 'text-neutral-900'">
                  {{ plan.prix === 0 ? 'Gratuit' : plan.prix.toLocaleString() + ' FCFA' }}
                </span>
                @if (plan.prix > 0) {
                  <span class="text-neutral-400 text-sm">/mois</span>
                }
              </div>

              <ul class="space-y-2 mb-6">
                @for (f of plan.features; track f) {
                  <li class="flex items-start gap-2 text-sm text-neutral-700">
                    <svg class="w-4 h-4 text-green-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                    {{ f }}
                  </li>
                }
              </ul>

              <button
                (click)="souscrire(plan.nom)"
                [disabled]="abonnement()?.plan === plan.nom || subscribing() === plan.nom"
                class="w-full py-3 rounded-xl text-sm font-bold transition-all"
                [class]="abonnement()?.plan === plan.nom
                  ? 'bg-green-50 text-green-700 border-2 border-green-200 cursor-default'
                  : plan.highlight
                    ? 'bg-primary text-white hover:bg-primary-800 shadow-md'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'">
                @if (subscribing() === plan.nom) {
                  <svg class="animate-spin w-4 h-4 mx-auto" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                } @else if (abonnement()?.plan === plan.nom) {
                  ✓ Plan actuel
                } @else {
                  {{ plan.prix === 0 ? 'Sélectionner' : 'Souscrire' }}
                }
              </button>
            </div>
          </div>
        }
      </div>
    </div>

    <!-- Toast -->
    @if (toast()) {
      <div class="fixed bottom-6 right-6 z-50 bg-primary text-white font-semibold px-5 py-3 rounded-2xl shadow-xl animate-fade-in">
        {{ toast() }}
      </div>
    }
  }
</div>
`,
})
export class EleveurAbonnementComponent implements OnInit {
  abonnement = signal<AbonnementActif | null>(null);
  loading    = signal(true);
  subscribing = signal<string | null>(null);
  toast       = signal<string | null>(null);
  methodePaiement = 'wave'; // wave | orange_money | free_money

  readonly methodes = [
    { value: 'wave',         label: 'Wave',         emoji: '🌊' },
    { value: 'orange_money', label: 'Orange Money',  emoji: '🟠' },
    { value: 'free_money',   label: 'Free Money',    emoji: '🟢' },
  ];

  readonly plans: PlanInfo[] = [
    {
      nom:        'starter',
      prix:       0,
      stocks_max: 3,
      features:   ['3 stocks publiés', 'Accès aux commandes', 'Support email'],
      couleur:    'neutral',
      highlight:  false,
    },
    {
      nom:        'pro',
      prix:       15000,
      stocks_max: 10,
      features:   ['10 stocks publiés', 'Photos HD', 'Badge Éleveur Pro', 'Support prioritaire'],
      couleur:    'primary',
      highlight:  true,
    },
    {
      nom:        'premium',
      prix:       30000,
      stocks_max: 999,
      features:   ['Stocks illimités', 'Mise en avant dans la recherche', 'Badge Premium', 'Support dédié'],
      couleur:    'accent',
      highlight:  false,
    },
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any>(`${environment.apiUrl}/eleveur/abonnement`).subscribe({
      next: (res) => {
        const d = res.data;
        const stocksActifs = res.stocks_actifs ?? 0;
        if (d) {
          const stocksMax = d.stock_limit ?? null; // null = illimité
          this.abonnement.set({
            ...d,
            is_active:      d.statut === 'actif',
            stocks_utilises: stocksActifs,
            stocks_max:      stocksMax ?? 9999, // 9999 = illimité côté affichage
          });
        } else {
          this.abonnement.set(null);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  souscrire(plan: string): void {
    this.subscribing.set(plan);
    // Route backend : POST /api/eleveur/abonnement/souscrire
    // Requiert : plan + methode_paiement (wave | orange_money | free_money)
    this.http.post<any>(`${environment.apiUrl}/eleveur/abonnement/souscrire`, {
      plan,
      methode_paiement: this.methodePaiement,
    }).subscribe({
      next: (res) => {
        this.subscribing.set(null);
        if (res.payment_url) {
          window.location.href = res.payment_url;
        } else {
          this.showToast('Abonnement initié — procédez au paiement.');
        }
      },
      error: (err) => {
        this.subscribing.set(null);
        const msg = err.error?.message ?? 'Erreur lors de la souscription.';
        this.showToast(msg);
      },
    });
  }

  pourcentageStocks(): number {
    const a = this.abonnement();
    if (!a || a.stocks_max === 0 || a.stocks_max >= 9999) return (a?.stocks_utilises ?? 0) > 0 ? 10 : 0;
    return Math.min(100, Math.round((a.stocks_utilises / a.stocks_max) * 100));
  }

  barreClass(): string {
    const p = this.pourcentageStocks();
    if (p >= 90) return 'bg-red-500';
    if (p >= 70) return 'bg-amber-500';
    return 'bg-primary';
  }

  planBadgeClass(plan: string): string {
    return {
      starter: 'bg-neutral-100',
      pro:     'bg-primary-100',
      premium: 'bg-accent-100',
    }[plan] ?? 'bg-neutral-100';
  }

  planEmoji(plan: string): string {
    return { starter: '🐣', pro: '🐔', premium: '🏆' }[plan] ?? '📦';
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  private showToast(msg: string): void {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(null), 3000);
  }
}