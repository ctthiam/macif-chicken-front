// ============================================================
// Fichier : src/app/features/dashboard/admin/finances/admin-finances.component.ts
// ============================================================
import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient }   from '@angular/common/http';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { KpiCardComponent }        from '../../../../shared/components/kpi-card/kpi-card.component';
import { environment }  from '../../../../environments/environment';

interface FinancesData {
  kpis: {
    revenus_total:       number;
    revenus_mois:        number;
    commissions_total:   number;
    abonnements_total:   number;
    variation_revenus:   number;
  };
  transactions: {
    id: number; type: string; montant: number; commission: number;
    created_at: string; eleveur: { name: string };
  }[];
  repartition_abonnements: { plan: string; count: number; revenus: number }[];
}

@Component({
  selector:    'app-admin-finances',
  standalone:  true,
  imports:     [CommonModule, KpiCardComponent, LoadingSpinnerComponent],
  template: `
<div class="space-y-6 animate-fade-in">
  <div>
    <h1 class="font-display text-2xl font-extrabold text-neutral-900">Finances</h1>
    <p class="text-neutral-500 text-sm mt-0.5">Revenus et transactions de la plateforme</p>
  </div>

  @if (loading()) { <app-loading-spinner [fullPage]="true" /> }
  @else if (data()) {

    <!-- KPIs finances -->
    <div class="grid grid-cols-2 xl:grid-cols-4 gap-4">
      @for (k of kpiCards; track k.title) {
        <app-kpi-card [title]="k.title" [value]="k.value" [icon]="k.icon" [color]="k.color"
                      [unit]="k.unit ?? ''" [trend]="k.trend ?? ''" [trendUp]="k.trendUp ?? true" />
      }
    </div>

    <!-- Répartition abonnements + Dernières transactions -->
    <div class="grid lg:grid-cols-2 gap-6">

      <!-- Abonnements -->
      <div class="bg-white rounded-2xl shadow-card border border-neutral-100 p-6">
        <h2 class="font-display font-bold text-neutral-900 mb-4">Répartition abonnements</h2>
        @if (!data()!.repartition_abonnements?.length) {
          <p class="text-sm text-neutral-400 text-center py-8">Aucune donnée</p>
        } @else {
          <div class="space-y-3">
            @for (plan of data()!.repartition_abonnements; track plan.plan) {
              <div class="flex items-center gap-4">
                <div class="w-24 shrink-0">
                  <span class="text-xs font-semibold uppercase" [class]="getPlanClass(plan.plan)">{{ plan.plan }}</span>
                </div>
                <div class="flex-1">
                  <div class="flex justify-between text-xs text-neutral-500 mb-1">
                    <span>{{ plan.count }} éleveurs</span>
                    <span class="font-semibold text-neutral-800">{{ formatMontant(plan.revenus) }}</span>
                  </div>
                  <div class="bg-neutral-100 rounded-full h-2">
                    <div class="h-2 rounded-full transition-all" [class]="getPlanBarClass(plan.plan)"
                         [style.width.%]="getBarPct(plan.revenus)"></div>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- Dernières transactions -->
      <div class="bg-white rounded-2xl shadow-card border border-neutral-100 overflow-hidden">
        <div class="px-6 py-4 border-b border-neutral-100">
          <h2 class="font-display font-bold text-neutral-900">Dernières transactions</h2>
        </div>
        @if (!data()!.transactions?.length) {
          <div class="py-12 text-center text-sm text-neutral-400">Aucune transaction</div>
        } @else {
          <div class="divide-y divide-neutral-50">
            @for (t of data()!.transactions.slice(0, 8); track t.id) {
              <div class="flex items-center justify-between px-6 py-3 hover:bg-neutral-50 transition-colors">
                <div>
                  <p class="text-sm font-semibold text-neutral-900">{{ t.eleveur.name }}</p>
                  <p class="text-xs text-neutral-400">{{ getTypeLabel(t.type) }} · {{ formatDate(t.created_at) }}</p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-bold text-primary">{{ formatMontant(t.montant) }}</p>
                  <p class="text-xs text-neutral-400">Commission : {{ formatMontant(t.commission) }}</p>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  }
</div>
  `,
})
export class AdminFinancesComponent implements OnInit {
  data    = signal<FinancesData | null>(null);
  loading = signal(true);

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any>(`${environment.apiUrl}/admin/finances`).subscribe({
      next: (res) => { this.data.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  get kpiCards() {
    const k = this.data()?.kpis;
    if (!k) return [];
    return [
      { title: 'Revenus total',    value: new Intl.NumberFormat('fr-SN').format(k.revenus_total),     unit: 'FCFA', icon: '💰', color: 'green'  as const },
      { title: 'Revenus ce mois',  value: new Intl.NumberFormat('fr-SN').format(k.revenus_mois),      unit: 'FCFA', icon: '📈', color: 'blue'   as const, trend: k.variation_revenus > 0 ? `+${k.variation_revenus}%` : `${k.variation_revenus}%`, trendUp: k.variation_revenus >= 0 },
      { title: 'Commissions',      value: new Intl.NumberFormat('fr-SN').format(k.commissions_total), unit: 'FCFA', icon: '⚙️', color: 'orange' as const },
      { title: 'Abonnements',      value: new Intl.NumberFormat('fr-SN').format(k.abonnements_total), unit: 'FCFA', icon: '🎫', color: 'purple' as const },
    ];
  }

  getBarPct(revenus: number): number {
    const max = Math.max(...(this.data()?.repartition_abonnements?.map(p => p.revenus) ?? [1]));
    return max ? (revenus / max) * 100 : 0;
  }

  getPlanClass(plan: string): string {
    return { starter: 'text-neutral-600', pro: 'text-blue-600', premium: 'text-yellow-600' }[plan] ?? 'text-neutral-500';
  }

  getPlanBarClass(plan: string): string {
    return { starter: 'bg-neutral-400', pro: 'bg-blue-500', premium: 'bg-yellow-400' }[plan] ?? 'bg-neutral-300';
  }

  getTypeLabel(type: string): string {
    return { commande: 'Commande', abonnement: 'Abonnement', commission: 'Commission' }[type] ?? type;
  }

  formatMontant(v: number): string { return new Intl.NumberFormat('fr-SN').format(v) + ' FCFA'; }
  formatDate(d: string): string    { return new Date(d).toLocaleDateString('fr-SN', { day: 'numeric', month: 'short' }); }
}