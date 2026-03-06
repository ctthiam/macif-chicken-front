// ============================================================
// Fichier : src/app/features/dashboard/acheteur/favoris/acheteur-favoris.component.ts
// ============================================================
import { Component, signal, OnInit } from '@angular/core';
import { CommonModule }   from '@angular/common';
import { RouterModule }   from '@angular/router';
import { HttpClient }     from '@angular/common/http';
import { StockCardComponent, Stock } from '../../../../shared/components/stock-card/stock-card.component';
import { LoadingSpinnerComponent }   from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { environment }    from '../../../../environments/environment';

@Component({
  selector:    'app-acheteur-favoris',
  standalone:  true,
  imports:     [CommonModule, RouterModule, StockCardComponent, LoadingSpinnerComponent],
  template: `
<div class="space-y-6 animate-fade-in">
  <div>
    <h1 class="font-display text-2xl font-extrabold text-neutral-900">Mes favoris</h1>
    <p class="text-neutral-500 text-sm mt-0.5">{{ stocks().length }} annonce{{ stocks().length > 1 ? 's' : '' }} sauvegardée{{ stocks().length > 1 ? 's' : '' }}</p>
  </div>

  @if (loading()) {
    <app-loading-spinner [fullPage]="true" />
  } @else if (stocks().length === 0) {
    <div class="bg-white rounded-2xl border border-neutral-100 p-20 text-center">
      <span class="text-6xl">❤️</span>
      <h3 class="font-display font-bold text-neutral-900 text-xl mt-4 mb-2">Aucun favori</h3>
      <p class="text-neutral-500 text-sm mb-6">Parcourez les annonces et ajoutez vos favoris.</p>
      <a routerLink="/recherche"
         class="inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-800 transition-all">
        Explorer les annonces
      </a>
    </div>
  } @else {
    <div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
      @for (stock of stocks(); track stock.id) {
        <div class="relative group">
          <app-stock-card [stock]="stock" (commanderClick)="onCommander($event)" />
          <button
            (click)="retirerFavori(stock.id)"
            class="absolute top-3 left-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md hover:bg-red-600"
            title="Retirer des favoris"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>
      }
    </div>
  }
</div>
  `,
})
export class AcheteurFavorisComponent implements OnInit {
  stocks  = signal<Stock[]>([]);
  loading = signal(true);

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.http.get<any>(`${environment.apiUrl}/acheteur/favoris`).subscribe({
      next:  (res) => { this.stocks.set(res.data ?? []); this.loading.set(false); },
      error: ()    => this.loading.set(false),
    });
  }

  retirerFavori(stockId: number): void {
    this.http.delete(`${environment.apiUrl}/favoris/${stockId}`).subscribe({
      next: () => this.stocks.update(list => list.filter(s => s.id !== stockId)),
      error: () => {},
    });
  }

  onCommander(stock: Stock): void {
    window.open(`/stocks/${stock.id}`, '_blank');
  }
}