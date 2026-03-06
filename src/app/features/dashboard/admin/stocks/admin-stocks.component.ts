// ============================================================
// Fichier : src/app/features/dashboard/admin/stocks/admin-stocks.component.ts
// ============================================================
import { Component, signal, OnInit } from '@angular/core';
import { CommonModule }   from '@angular/common';
import { RouterModule }   from '@angular/router';
import { FormsModule }    from '@angular/forms';
import { HttpClient }     from '@angular/common/http';
import { BadgeStatusComponent }    from '../../../../shared/components/badge-status/badge-status.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { environment }    from '../../../../environments/environment';

interface Stock {
  id:          number;
  titre:       string;
  statut:      string;
  prix_par_kg: number;
  created_at:  string;
  photos:      string[];
  eleveur:     { id: number; name: string; is_certified: boolean };
}

@Component({
  selector:    'app-admin-stocks',
  standalone:  true,
  imports:     [CommonModule, RouterModule, FormsModule, BadgeStatusComponent, LoadingSpinnerComponent],
  template: `
<div class="space-y-6 animate-fade-in">
  <div>
    <h1 class="font-display text-2xl font-extrabold text-neutral-900">Annonces</h1>
    <p class="text-neutral-500 text-sm mt-0.5">{{ total() }} annonce{{ total() > 1 ? 's' : '' }} sur la plateforme</p>
  </div>

  <div class="flex flex-col sm:flex-row gap-3">
    <div class="relative flex-1 max-w-sm">
      <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
      <input type="text" [(ngModel)]="search" (ngModelChange)="onSearch()"
             placeholder="Titre, éleveur…"
             class="w-full pl-9 pr-4 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-100 transition-all"/>
    </div>
    <div class="flex gap-2">
      @for (f of statutFiltres; track f.value) {
        <button (click)="filtreStatut.set(f.value); load()"
                class="px-3.5 py-2 text-xs font-semibold rounded-xl border-2 transition-all"
                [class]="filtreStatut() === f.value ? 'bg-primary text-white border-primary' : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'">
          {{ f.label }}
        </button>
      }
    </div>
  </div>

  @if (loading()) {
    <app-loading-spinner [fullPage]="true" />
  } @else {
    <div class="bg-white rounded-2xl shadow-card border border-neutral-100 overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-neutral-50 border-b border-neutral-100">
            <th class="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Annonce</th>
            <th class="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide hidden sm:table-cell">Éleveur</th>
            <th class="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Prix</th>
            <th class="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Statut</th>
            <th class="text-right px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-50">
          @for (s of stocks(); track s.id) {
            <tr class="hover:bg-neutral-50 transition-colors">
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-primary-50 overflow-hidden shrink-0 flex items-center justify-center">
                    @if (s.photos?.length) {
                      <img [src]="s.photos[0]" class="w-full h-full object-cover"/>
                    } @else {
                      <span class="text-lg">🐔</span>
                    }
                  </div>
                  <div>
                    <p class="font-semibold text-neutral-900 text-sm">{{ s.titre }}</p>
                    <p class="text-xs text-neutral-400">{{ formatDate(s.created_at) }}</p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-3.5 hidden sm:table-cell">
                <div class="flex items-center gap-1.5">
                  <span class="text-sm text-neutral-700">{{ s.eleveur.name }}</span>
                  @if (s.eleveur.is_certified) {
                    <svg class="w-3.5 h-3.5 text-green-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                  }
                </div>
              </td>
              <td class="px-5 py-3.5 font-semibold text-neutral-900">{{ s.prix_par_kg | number:'1.0-0' }} FCFA/kg</td>
              <td class="px-5 py-3.5"><app-badge-status [status]="s.statut" type="stock" /></td>
              <td class="px-5 py-3.5">
                <div class="flex items-center justify-end gap-2">
                  <a [routerLink]="['/stocks', s.id]" target="_blank"
                     class="text-xs font-semibold border border-neutral-200 text-neutral-600 px-2.5 py-1.5 rounded-lg hover:border-primary hover:text-primary transition-all">
                    Voir
                  </a>
                  <button (click)="supprimerStock(s)"
                          class="text-xs font-semibold bg-red-50 text-red-600 px-2.5 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
                    Supprimer
                  </button>
                </div>
              </td>
            </tr>
          }
        </tbody>
      </table>
      @if (stocks().length === 0) {
        <div class="py-16 text-center text-neutral-400 text-sm">Aucune annonce trouvée</div>
      }
    </div>
  }
</div>
  `,
})
export class AdminStocksComponent implements OnInit {
  stocks       = signal<Stock[]>([]);
  total        = signal(0);
  loading      = signal(true);
  filtreStatut = signal('');
  search       = '';
  private searchTimer: any;

  readonly statutFiltres = [
    { value: '',           label: 'Tous' },
    { value: 'disponible', label: '✅ Disponibles' },
    { value: 'masque',     label: '👁 Masqués' },
    { value: 'epuise',     label: '❌ Épuisés' },
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.load(); }

  onSearch(): void {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.load(), 400);
  }

  load(): void {
    this.loading.set(true);
    let url = `${environment.apiUrl}/admin/stocks?per_page=30`;
    if (this.filtreStatut()) url += `&statut=${this.filtreStatut()}`;
    if (this.search)         url += `&search=${encodeURIComponent(this.search)}`;
    this.http.get<any>(url).subscribe({
      next: (res) => { this.stocks.set(res.data ?? []); this.total.set(res.meta?.total ?? 0); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  supprimerStock(s: Stock): void {
    if (!confirm(`Supprimer "${s.titre}" ?`)) return;
    this.http.delete(`${environment.apiUrl}/admin/stocks/${s.id}`).subscribe({
      next: () => this.stocks.update(list => list.filter(x => x.id !== s.id)),
      error: () => {},
    });
  }

  formatDate(d: string): string { return new Date(d).toLocaleDateString('fr-SN', { day: 'numeric', month: 'short' }); }
}