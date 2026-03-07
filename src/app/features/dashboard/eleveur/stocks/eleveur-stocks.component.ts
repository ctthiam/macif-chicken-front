// ============================================================
// Fichier : src/app/features/dashboard/eleveur/stocks/eleveur-stocks.component.ts
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
  id:                  number;
  titre:               string;
  statut:              string;
  quantite_disponible: number;
  prix_par_kg:         number;
  mode_vente:          string;
  vues:                number;
  commandes_count:     number;
  created_at:          string;
  photos:              string[];
}

@Component({
  selector:    'app-eleveur-stocks',
  standalone:  true,
  imports:     [CommonModule, RouterModule, FormsModule, BadgeStatusComponent, LoadingSpinnerComponent],
  template: `
<div class="space-y-6 animate-fade-in">

  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <h1 class="font-display text-2xl font-extrabold text-neutral-900">Mes stocks</h1>
      <p class="text-neutral-500 text-sm mt-0.5">{{ total() }} annonce{{ total() > 1 ? 's' : '' }} publiée{{ total() > 1 ? 's' : '' }}</p>
    </div>
    <a routerLink="/eleveur/stocks/nouveau"
       class="inline-flex items-center gap-2 bg-primary text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-800 shadow-md transition-all text-sm">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
      </svg>
      Nouveau stock
    </a>
  </div>

  <!-- Filtres -->
  <div class="flex flex-wrap gap-3">
    @for (f of statutFiltres; track f.value) {
      <button
        (click)="filtreStatut.set(f.value); loadStocks()"
        class="px-4 py-2 text-sm font-semibold rounded-xl border-2 transition-all"
        [class]="filtreStatut() === f.value
          ? 'bg-primary text-white border-primary'
          : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'"
      >
        {{ f.label }}
      </button>
    }
  </div>

  @if (loading()) {
    <app-loading-spinner [fullPage]="true" />
  } @else if (stocks().length === 0) {
    <div class="bg-white rounded-2xl border border-neutral-100 p-20 text-center">
      <span class="text-6xl">📦</span>
      <h3 class="font-display font-bold text-neutral-900 text-xl mt-4 mb-2">Aucun stock</h3>
      <p class="text-neutral-500 text-sm mb-6">Publiez votre premier stock pour commencer à vendre.</p>
      <a routerLink="/eleveur/stocks/nouveau"
         class="inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-800 transition-all">
        Publier un stock
      </a>
    </div>
  } @else {
    <div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
      @for (stock of stocks(); track stock.id) {
        <div class="bg-white rounded-2xl border border-neutral-100 shadow-card overflow-hidden hover:shadow-card-hover hover:-translate-y-0.5 transition-all group">

          <!-- Image -->
          <div class="relative h-40 bg-primary-50 overflow-hidden">
            @if (stock.photos?.length) {
              <img [src]="stock.photos[0]" [alt]="stock.titre" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
            } @else {
              <div class="w-full h-full flex items-center justify-center">
                <span class="text-5xl">🐔</span>
              </div>
            }
            <div class="absolute top-3 right-3">
              <app-badge-status [status]="stock.statut" type="stock" />
            </div>
          </div>

          <!-- Contenu -->
          <div class="p-4">
            <h3 class="font-semibold text-neutral-900 text-sm mb-1 line-clamp-1">{{ stock.titre }}</h3>
            <div class="flex items-center gap-3 text-xs text-neutral-500 mb-3">
              <span>{{ stock.quantite_disponible }} dispo</span>
              <span class="text-neutral-300">·</span>
              <span>{{ stock.prix_par_kg | number:'1.0-0' }} FCFA/kg</span>
            </div>

            <!-- Stats -->
            <div class="flex gap-3 text-xs text-neutral-500 mb-4 bg-neutral-50 rounded-lg p-2.5">
              <div class="flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                {{ stock.vues }} vues
              </div>
              <div class="flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                </svg>
                {{ stock.commandes_count }} commandes
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-2">
              <a [routerLink]="['/stocks', stock.id]" target="_blank"
                 class="flex-1 text-center text-xs font-semibold border border-neutral-200 text-neutral-600 py-2 rounded-lg hover:border-primary hover:text-primary transition-all">
                Voir
              </a>
              <a [routerLink]="['modifier', stock.id]"
                 class="flex-1 text-center text-xs font-semibold bg-primary-50 text-primary py-2 rounded-lg hover:bg-primary hover:text-white transition-all">
                Modifier
              </a>
              <button (click)="toggleStatut(stock)"
                      class="flex-1 text-center text-xs font-semibold py-2 rounded-lg transition-all"
                      [class]="stock.statut === 'disponible'
                        ? 'bg-neutral-100 text-neutral-600 hover:bg-red-50 hover:text-red-600'
                        : 'bg-green-50 text-green-700 hover:bg-green-100'">
                {{ stock.statut === 'disponible' ? 'Masquer' : 'Activer' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  }
</div>
  `,
})
export class EleveurStocksComponent implements OnInit {
  stocks       = signal<Stock[]>([]);
  total        = signal(0);
  loading      = signal(true);
  filtreStatut = signal('');

  readonly statutFiltres = [
    { value: '',           label: 'Tous' },
    { value: 'disponible', label: '✅ Disponibles' },
    { value: 'reserve',    label: '🔒 Réservés' },
    { value: 'epuise',     label: '❌ Épuisés' },
    { value: 'masque',     label: '👁 Masqués' },
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.loadStocks(); }

  loadStocks(): void {
    this.loading.set(true);
    let url = `${environment.apiUrl}/eleveur/stocks?per_page=20`;
    if (this.filtreStatut()) url += `&statut=${this.filtreStatut()}`;

    this.http.get<any>(url).subscribe({
      next: (res) => {
        this.stocks.set(res.data ?? []);
        this.total.set(res.meta?.total ?? res.data?.length ?? 0);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  toggleStatut(stock: Stock): void {
    const newStatut = stock.statut === 'disponible' ? 'masque' : 'disponible';
    this.http.put(`${environment.apiUrl}/eleveur/stocks/${stock.id}`, { statut: newStatut }).subscribe({
      next: () => this.stocks.update(list => list.map(s => s.id === stock.id ? { ...s, statut: newStatut } : s)),
      error: () => {},
    });
  }
}