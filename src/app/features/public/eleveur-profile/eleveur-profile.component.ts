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
  reply:       string | null;
  created_at:  string;
  auteur:      { name: string; avatar: string | null } | null;
}

interface EleveurProfil {
  id:          number;
  name:        string;
  avatar:      string | null;
  ville:       string | null;
  created_at:  string;
  stocks:      Stock[];
  avis:        Avis[];
  stats: {
    total_stocks:    number;
    total_avis:      number;
    note_moyenne?:   number | null;
    nombre_avis?:    number | null;
    is_certified?:   boolean;
    localisation?:   string | null;
    nom_poulailler?: string | null;
    total_commandes?: number;
  };
  eleveur_profile?: {
    nom_poulailler?: string | null;
    description?:    string | null;
    localisation?:   string | null;
    is_certified?:   boolean;
    note_moyenne?:   number | null;
    nombre_avis?:    number | null;
    photos?:         string[];
  } | null;
  // champs optionnels présents si eleveurProfile existe
  bio?:          string | null;
  localisation?: string | null;
  phone?:        string | null;
  is_certified?: boolean;
  note_moyenne?: number;
  nombre_avis?:  number;
  abonnement?:   string | null;
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
    this.http.get<any>(`${environment.apiUrl}/eleveurs/${id}/public`).subscribe({
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
    const avis = (this.eleveur()?.avis ?? []) as Avis[];
    return [5, 4, 3, 2, 1].map(n => {
      const count = avis.filter(a => a.note === n).length;
      return { note: n, count, pct: avis.length ? (count / avis.length) * 100 : 0 };
    });
  }

  get quickStats() {
    const e = this.eleveur();
    const noteMoy = e?.stats?.note_moyenne ?? e?.eleveur_profile?.note_moyenne ?? e?.note_moyenne;
    return [
      { value: e?.stats?.total_stocks ?? 0,  label: 'Annonces' },
      { value: e?.stats?.total_commandes ?? 0, label: 'Commandes' },
      { value: e?.stats?.total_avis ?? 0,    label: 'Avis' },
      { value: noteMoy ? Number(noteMoy).toFixed(1) : '—', label: 'Note moy.' },
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