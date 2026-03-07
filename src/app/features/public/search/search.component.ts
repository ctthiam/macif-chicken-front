// ============================================================
// Fichier : src/app/features/public/search/search.component.ts
// ============================================================
import { Component, signal, OnInit, computed } from '@angular/core';
import { CommonModule }                         from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule }                          from '@angular/forms';
import { HttpClient, HttpParams }               from '@angular/common/http';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { StockCardComponent, Stock }            from '../../../shared/components/stock-card/stock-card.component';
import { LoadingSpinnerComponent }              from '../../../shared/components/loading-spinner/loading-spinner.component';
import { environment }                          from '../../../environments/environment';

interface Meta {
  current_page: number;
  last_page:    number;
  total:        number;
  per_page:     number;
}

interface Filters {
  q:           string;
  ville:       string;
  mode_vente:  string;
  min_prix:    string;
  max_prix:    string;
  certifie:    boolean;
  sort:        string;
}

@Component({
  selector:    'app-search',
  standalone:  true,
  imports:     [CommonModule, RouterModule, FormsModule, StockCardComponent, LoadingSpinnerComponent],
  templateUrl: './search.component.html',
})
export class SearchComponent implements OnInit {
  stocks    = signal<Stock[]>([]);
  meta      = signal<Meta>({ current_page: 1, last_page: 1, total: 0, per_page: 12 });
  loading   = signal(true);
  filtersOpen = signal(false); // mobile

  filters: Filters = {
    q:          '',
    ville:      '',
    mode_vente: '',
    min_prix:   '',
    max_prix:   '',
    certifie:   false,
    sort:       'created_at_desc',
  };

  private search$ = new Subject<void>();

  readonly villes = [
    'Dakar', 'Thiès', 'Saint-Louis', 'Ziguinchor',
    'Kaolack', 'Touba', 'Mbour', 'Diourbel', 'Tambacounda',
  ];

  readonly sortOptions = [
    { value: 'created_at_desc', label: 'Plus récents' },
    { value: 'prix_asc',        label: 'Prix croissant' },
    { value: 'prix_desc',       label: 'Prix décroissant' },
    { value: 'note_desc',       label: 'Mieux notés' },
    { value: 'quantite_desc',   label: 'Stock disponible' },
  ];

  readonly modeVentes = [
    { value: '',         label: 'Tous modes' },
    { value: 'vivant',   label: '🐔 Vivant' },
    { value: 'abattu',   label: '🥩 Abattu' },
    { value: 'les_deux', label: '🐔🥩 Les deux' },
  ];

  get currentPage()  { return this.meta().current_page; }
  get totalPages()   { return this.meta().last_page; }
  get totalResults() { return this.meta().total; }

  get pages(): number[] {
    const total = this.totalPages;
    const cur   = this.currentPage;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (cur <= 4)   return [1, 2, 3, 4, 5, -1, total];
    if (cur >= total - 3) return [1, -1, total-4, total-3, total-2, total-1, total];
    return [1, -1, cur-1, cur, cur+1, -1, total];
  }

  constructor(
    private http:  HttpClient,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // Écouter les query params (depuis hero home)
    this.route.queryParams.subscribe(params => {
      if (params['q']) this.filters.q = params['q'];
      this.loadStocks(1);
    });

    // Debounce recherche texte
    this.search$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
    ).subscribe(() => this.loadStocks(1));
  }

  loadStocks(page = 1): void {
    this.loading.set(true);

    let params = new HttpParams()
      .set('page',     page)
      .set('per_page', 12)
      .set('statut',   'disponible');

    if (this.filters.q)          params = params.set('q',     this.filters.q);
    if (this.filters.ville)      params = params.set('ville',      this.filters.ville);
    if (this.filters.mode_vente) params = params.set('mode_vente', this.filters.mode_vente);
    if (this.filters.min_prix)   params = params.set('prix_min',   this.filters.min_prix);
    if (this.filters.max_prix)   params = params.set('prix_max',   this.filters.max_prix);
    if (this.filters.certifie)   params = params.set('certifie',   '1');
    if (this.filters.sort) {
      const [field, dir] = this.filters.sort.split('_').reduce((acc, part, i, arr) => {
        if (part === 'asc' || part === 'desc') { acc[1] = part; }
        else { acc[0] = acc[0] ? acc[0] + '_' + part : part; }
        return acc;
      }, ['', ''] as [string, string]);
      params = params.set('sort_by', field).set('sort_dir', dir || 'desc');
    }

    this.http.get<any>(`${environment.apiUrl}/stocks`, { params }).subscribe({
      next: (res) => {
        this.stocks.set(res.data ?? []);
        this.meta.set(res.meta ?? this.meta());
        this.loading.set(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: () => this.loading.set(false),
    });
  }

  onSearchInput(): void  { this.search$.next(); }
  onFilterChange(): void { this.loadStocks(1); }
  onPageChange(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.loadStocks(p);
  }

  resetFilters(): void {
    this.filters = { q: '', ville: '', mode_vente: '', min_prix: '', max_prix: '', certifie: false, sort: 'created_at_desc' };
    this.loadStocks(1);
  }

  onCommander(stock: Stock): void {
    this.router.navigate(['/stocks', stock.id]);
  }

  get hasActiveFilters(): boolean {
    return !!(this.filters.ville || this.filters.mode_vente || this.filters.min_prix || this.filters.max_prix || this.filters.certifie);
  }
}