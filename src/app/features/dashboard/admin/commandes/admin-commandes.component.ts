// ============================================================
// Fichier : src/app/features/dashboard/admin/commandes/admin-commandes.component.ts
// ============================================================
import { Component, signal, OnInit } from '@angular/core';
import { CommonModule }   from '@angular/common';
import { RouterModule }   from '@angular/router';
import { FormsModule }    from '@angular/forms';
import { HttpClient }     from '@angular/common/http';
import { BadgeStatusComponent }    from '../../../../shared/components/badge-status/badge-status.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { environment }    from '../../../../environments/environment';

interface Commande {
  id:               number;
  reference:        string | null;
  statut_commande:  string;
  montant_total:    number;
  created_at:       string;
  acheteur:         { name: string };
  eleveur:          { name: string };
  stock:            { titre: string };
}

@Component({
  selector:    'app-admin-commandes',
  standalone:  true,
  imports:     [CommonModule, RouterModule, FormsModule, BadgeStatusComponent, LoadingSpinnerComponent],
  template: `
<div class="space-y-6 animate-fade-in">
  <div>
    <h1 class="font-display text-2xl font-extrabold text-neutral-900">Toutes les commandes</h1>
    <p class="text-neutral-500 text-sm mt-0.5">{{ total() }} commande{{ total() > 1 ? 's' : '' }}</p>
  </div>

  <div class="flex gap-2 flex-wrap">
    @for (f of statutFiltres; track f.value) {
      <button (click)="filtreStatut.set(f.value); load()"
              class="px-3.5 py-2 text-xs font-semibold rounded-xl border-2 transition-all"
              [class]="filtreStatut() === f.value ? 'bg-primary text-white border-primary' : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'">
        {{ f.label }}
      </button>
    }
  </div>

  @if (loading()) { <app-loading-spinner [fullPage]="true" /> }
  @else {
    <div class="bg-white rounded-2xl shadow-card border border-neutral-100 overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-neutral-50 border-b border-neutral-100">
            <th class="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Référence</th>
            <th class="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide hidden md:table-cell">Produit</th>
            <th class="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide hidden sm:table-cell">Acheteur</th>
            <th class="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide hidden lg:table-cell">Éleveur</th>
            <th class="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Montant</th>
            <th class="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Statut</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-50">
          @for (c of commandes(); track c.id) {
            <tr class="hover:bg-neutral-50 transition-colors">
              <td class="px-5 py-3.5">
                <div>
                  <span class="font-mono text-xs bg-neutral-100 px-2 py-1 rounded-lg text-neutral-700">#{{ c.reference ?? c.id }}</span>
                  <p class="text-xs text-neutral-400 mt-1">{{ formatDate(c.created_at) }}</p>
                </div>
              </td>
              <td class="px-5 py-3.5 text-xs text-neutral-600 hidden md:table-cell max-w-32"><p class="truncate">{{ c.stock.titre }}</p></td>
              <td class="px-5 py-3.5 text-sm text-neutral-700 hidden sm:table-cell">{{ c.acheteur.name }}</td>
              <td class="px-5 py-3.5 text-sm text-neutral-700 hidden lg:table-cell">{{ c.eleveur.name }}</td>
              <td class="px-5 py-3.5 font-semibold text-neutral-900">{{ formatMontant(c.montant_total) }}</td>
              <td class="px-5 py-3.5"><app-badge-status [status]="c.statut_commande" type="commande" /></td>
            </tr>
          }
        </tbody>
      </table>
      @if (commandes().length === 0) { <div class="py-16 text-center text-sm text-neutral-400">Aucune commande</div> }
    </div>
  }
</div>
  `,
})
export class AdminCommandesComponent implements OnInit {
  commandes    = signal<Commande[]>([]);
  total        = signal(0);
  loading      = signal(true);
  filtreStatut = signal('');

  readonly statutFiltres = [
    { value: '', label: 'Toutes' },
    { value: 'confirmee', label: 'Confirmées' },
    { value: 'en_preparation', label: 'Préparation' },
    { value: 'en_livraison', label: 'Livraison' },
    { value: 'livree', label: 'Livrées' },
    { value: 'annulee', label: 'Annulées' },
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    let url = `${environment.apiUrl}/admin/commandes?per_page=30`;
    if (this.filtreStatut()) url += `&statut=${this.filtreStatut()}`;
    this.http.get<any>(url).subscribe({
      next: (res) => { this.commandes.set(res.data ?? []); this.total.set(res.meta?.total ?? 0); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  formatMontant(v: number): string { return new Intl.NumberFormat('fr-SN').format(v) + ' FCFA'; }
  formatDate(d: string): string    { return new Date(d).toLocaleDateString('fr-SN', { day: 'numeric', month: 'short' }); }
}