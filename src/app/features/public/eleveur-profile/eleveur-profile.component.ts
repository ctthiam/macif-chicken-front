// ============================================================
// Fichier : src/app/features/public/eleveur-profile/eleveur-profile.component.ts
// ============================================================
import { Component, signal, OnInit }           from '@angular/core';
import { CommonModule }                         from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { HttpClient }                           from '@angular/common/http';
import { RatingStarsComponent }                 from '../../../shared/components/rating-stars/rating-stars.component';
import { BadgeStatusComponent }                 from '../../../shared/components/badge-status/badge-status.component';
import { StockCardComponent, Stock }            from '../../../shared/components/stock-card/stock-card.component';
import { LoadingSpinnerComponent }              from '../../../shared/components/loading-spinner/loading-spinner.component';
import { environment }                          from '../../../environments/environment';

interface Avis {
  id:          number;
  note:        number;
  commentaire: string;
  created_at:  string;
  acheteur:    { name: string };
}

interface EleveurProfil {
  id:              number;
  name:            string;
  bio:             string;
  localisation:    string;
  phone:           string;
  is_certified:    boolean;
  note_moyenne:    number;
  nombre_avis:     number;
  total_stocks:    number;
  total_commandes: number;
  membre_depuis:   string;
  abonnement:      string;
  stocks:          Stock[];
  avis:            Avis[];
}

@Component({
  selector:    'app-eleveur-profile',
  standalone:  true,
  imports:     [CommonModule, RouterModule, RatingStarsComponent, BadgeStatusComponent, StockCardComponent, LoadingSpinnerComponent],
  templateUrl: './eleveur-profile.component.html',
})
export class EleveurProfileComponent implements OnInit {
  eleveur  = signal<EleveurProfil | null>(null);
  loading  = signal(true);
  activeTab = signal<'stocks' | 'avis'>('stocks');

  constructor(
    private http:   HttpClient,
    private route:  ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(p => this.loadProfil(p['id']));
  }

  loadProfil(id: string): void {
    this.loading.set(true);
    this.http.get<any>(`${environment.apiUrl}/eleveurs/${id}/profil`).subscribe({
      next:  (res) => { this.eleveur.set(res.data); this.loading.set(false); },
      error: ()    => { this.loading.set(false); this.router.navigate(['/recherche']); },
    });
  }

  onCommander(stock: Stock): void {
    this.router.navigate(['/stocks', stock.id]);
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('fr-SN', { month: 'long', year: 'numeric' });
  }

  get notesDistrib(): { note: number; count: number; pct: number }[] {
    const avis = this.eleveur()?.avis ?? [];
    return [5, 4, 3, 2, 1].map(n => {
      const count = avis.filter(a => a.note === n).length;
      return { note: n, count, pct: avis.length ? (count / avis.length) * 100 : 0 };
    });
  }

  get quickStats() {
    const e = this.eleveur();
    return [
      { value: e?.total_stocks    ?? 0, label: 'Annonces' },
      { value: e?.total_commandes ?? 0, label: 'Commandes' },
      { value: e?.nombre_avis     ?? 0, label: 'Avis' },
      { value: e?.note_moyenne    ? (e.note_moyenne).toFixed(1) : '—', label: 'Note moy.' },
    ];
  }

  get abonnementLabel(): { label: string; classes: string } {
    const map: Record<string, { label: string; classes: string }> = {
      starter: { label: 'Starter',  classes: 'bg-gray-100 text-gray-700' },
      pro:     { label: 'Pro',      classes: 'bg-blue-100 text-blue-800' },
      premium: { label: 'Premium ⭐', classes: 'bg-yellow-100 text-yellow-800' },
    };
    return map[this.eleveur()?.abonnement ?? ''] ?? map['starter'];
  }
}