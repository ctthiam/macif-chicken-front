// ============================================================
// Fichier : src/app/features/dashboard/acheteur/dashboard/acheteur-dashboard.component.ts
// ============================================================
import { Component, signal, OnInit } from '@angular/core';
import { CommonModule }   from '@angular/common';
import { RouterModule }   from '@angular/router';
import { HttpClient }     from '@angular/common/http';
import { KpiCardComponent }        from '../../../../shared/components/kpi-card/kpi-card.component';
import { BadgeStatusComponent }    from '../../../../shared/components/badge-status/badge-status.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { AuthService }    from '../../../../core/services/auth.service';
import { environment }    from '../../../../environments/environment';

interface DashboardData {
  commandes: {
    total:      number;
    par_statut: Record<string, number>;
    dernieres:  {
      id:              number;
      statut_commande: string;
      montant_total:   number;
      quantite:        number;
      stock_titre:     string | null;
      eleveur_nom:     string | null;
      created_at:      string;
    }[];
  };
  depenses: {
    mois_en_cours: number;
    annee:         number;
    mois:          number;
    annee_label:   number;
  };
  favoris: {
    total:   number;
    eleveurs: {
      eleveur_id:     number;
      nom:            string | null;
      nom_poulailler: string | null;
      localisation:   string | null;
      note_moyenne:   number | null;
      is_certified:   boolean;
    }[];
  };
}

@Component({
  selector:    'app-acheteur-dashboard',
  standalone:  true,
  imports:     [CommonModule, RouterModule, KpiCardComponent, BadgeStatusComponent, LoadingSpinnerComponent],
  templateUrl: './acheteur-dashboard.component.html',
})
export class AcheteurDashboardComponent implements OnInit {
  data    = signal<DashboardData | null>(null);
  loading = signal(true);

  constructor(
    private http: HttpClient,
    public  auth: AuthService,
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.http.get<any>(`${environment.apiUrl}/acheteur/dashboard`).subscribe({
      next:  (res) => { this.data.set(res.data); this.loading.set(false); },
      error: ()    => this.loading.set(false),
    });
  }

  formatMontant(v: number): string {
    return new Intl.NumberFormat('fr-SN').format(v) + ' FCFA';
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('fr-SN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  get kpiCards() {
    const d = this.data();
    if (!d) return [];
    const enCours = (d.commandes.par_statut['confirmee'] ?? 0)
                  + (d.commandes.par_statut['en_preparation'] ?? 0)
                  + (d.commandes.par_statut['en_livraison'] ?? 0);
    return [
      { title: 'Total commandes',  value: d.commandes.total,                                                         icon: '🛒', color: 'green'  as const, route: '/acheteur/commandes' },
      { title: 'En cours',         value: enCours,                                                                   icon: '🚚', color: 'orange' as const, route: '/acheteur/commandes' },
      { title: 'Dépenses du mois', value: new Intl.NumberFormat('fr-SN').format(d.depenses.mois_en_cours), unit: 'FCFA', icon: '💰', color: 'blue'   as const },
      { title: 'Éleveurs favoris', value: d.favoris.total,                                                           icon: '❤️', color: 'red'    as const, route: '/acheteur/favoris' },
    ];
  }

  getStatutLabel(statut: string): string {
    const map: Record<string, string> = {
      confirmee:      '✅ Confirmée',
      en_preparation: '⏳ En préparation',
      en_livraison:   '🚚 En livraison',
      livree:         '📦 Livrée',
      annulee:        '❌ Annulée',
    };
    return map[statut] ?? statut;
  }
}