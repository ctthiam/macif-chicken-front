// ============================================================
// Fichier : src/app/features/public/home/home.component.ts
// ============================================================
import { Component, signal, OnInit }           from '@angular/core';
import { CommonModule }                         from '@angular/common';
import { RouterModule, Router }                 from '@angular/router';
import { FormsModule }                          from '@angular/forms';
import { HttpClient }                           from '@angular/common/http';
import { StockCardComponent, Stock }            from '../../../shared/components/stock-card/stock-card.component';
import { LoadingSpinnerComponent }              from '../../../shared/components/loading-spinner/loading-spinner.component';
import { environment }                          from '../../../environments/environment';

interface Stats {
  total_eleveurs:  number;
  total_stocks:    number;
  total_commandes: number;
  villes:          number;
}

@Component({
  selector:    'app-home',
  standalone:  true,
  imports:     [CommonModule, RouterModule, FormsModule, StockCardComponent, LoadingSpinnerComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  searchQuery  = signal('');
  stocks       = signal<Stock[]>([]);
  stats        = signal<Stats>({ total_eleveurs: 0, total_stocks: 0, total_commandes: 0, villes: 0 });
  loading      = signal(true);
  searchInput  = '';

  readonly categories = [
    { label: 'Poulets',   emoji: '🐔', query: 'poulet' },
    { label: 'Pintades',  emoji: '🦃', query: 'pintade' },
    { label: 'Canards',   emoji: '🦆', query: 'canard' },
    { label: 'Dindes',    emoji: '🦚', query: 'dinde' },
    { label: 'Lapins',    emoji: '🐇', query: 'lapin' },
    { label: 'Bio',       emoji: '🌿', query: 'bio' },
  ];

  readonly temoignages = [
    {
      nom:    'Fatou Diallo',
      role:   'Restauratrice, Dakar',
      texte:  'Je commande mes poulets directement chez des éleveurs certifiés. La qualité est incomparable avec le marché.',
      note:   5,
      avatar: 'F',
    },
    {
      nom:    'Mamadou Sow',
      role:   'Éleveur, Thiès',
      texte:  'Grâce à MACIF CHICKEN, j\'ai triplé mes ventes en 6 mois. La plateforme est simple et les paiements sont sécurisés.',
      note:   5,
      avatar: 'M',
    },
    {
      nom:    'Aïssatou Ndiaye',
      role:   'Acheteur, Saint-Louis',
      texte:  'Livraison rapide, volailles fraîches. Je ne commande plus qu\'ici pour mes événements familiaux.',
      note:   5,
      avatar: 'A',
    },
  ];

  readonly steps = [
    {
      num:       1,
      emoji:     '🔍',
      title:     'Recherchez',
      desc:      'Parcourez les annonces d\'éleveurs certifiés près de chez vous. Filtrez par espèce, prix et localisation.',
      bgClass:   'bg-primary-100',
      badgeClass:'bg-primary',
    },
    {
      num:       2,
      emoji:     '🛒',
      title:     'Commandez',
      desc:      'Choisissez la quantité, renseignez votre adresse de livraison et payez en toute sécurité via PayTech.',
      bgClass:   'bg-accent/10',
      badgeClass:'bg-accent',
    },
    {
      num:       3,
      emoji:     '🚚',
      title:     'Recevez',
      desc:      'L\'éleveur prépare votre commande et vous la livre à domicile. Qualité garantie ou remboursé.',
      bgClass:   'bg-green-100',
      badgeClass:'bg-green-600',
    },
  ];

  constructor(
    private http:   HttpClient,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadStocksVedette();
    this.loadStats();
  }

  loadStocksVedette(): void {
    this.http.get<any>(`${environment.apiUrl}/stocks?per_page=6&statut=disponible`).subscribe({
      next: (res) => {
        this.stocks.set(res.data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  loadStats(): void {
    this.http.get<any>(`${environment.apiUrl}/stats/public`).subscribe({
      next: (res) => this.stats.set(res.data ?? this.stats()),
      error: () => {},
    });
  }

  onSearch(): void {
    if (this.searchInput.trim()) {
      this.router.navigate(['/recherche'], {
        queryParams: { q: this.searchInput.trim() },
      });
    }
  }

  onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') this.onSearch();
  }

  onCategorie(query: string): void {
    this.router.navigate(['/recherche'], { queryParams: { q: query } });
  }

  onCommander(stock: Stock): void {
    this.router.navigate(['/stocks', stock.id]);
  }

  get animatedStats() {
    return [
      { value: this.stats().total_eleveurs,  label: 'Éleveurs certifiés', icon: '🌾' },
      { value: this.stats().total_stocks,    label: 'Annonces actives',   icon: '📦' },
      { value: this.stats().total_commandes, label: 'Commandes livrées',  icon: '✅' },
      { value: this.stats().villes,          label: 'Villes couvertes',   icon: '📍' },
    ];
  }
}