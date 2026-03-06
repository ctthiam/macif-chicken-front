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
  kpis: {
    total_commandes:   number;
    commandes_en_cours:number;
    total_depense:     number;
    eleveurs_favoris:  number;
  };
  commandes_recentes: {
    id:         number;
    reference:  string;
    statut:     string;
    montant:    number;
    created_at: string;
    stock:      { titre: string; photos: string[] };
    eleveur:    { name: string; localisation: string };
  }[];
  stocks_favoris: {
    id:       number;
    titre:    string;
    prix_par_kg: number;
    statut:   string;
    photos:   string[];
    eleveur:  { name: string };
  }[];
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
    const k = this.data()?.kpis;
    if (!k) return [];
    return [
      { title: 'Total commandes',    value: k.total_commandes,    icon: '🛒', color: 'green'  as const, route: '/acheteur/commandes' },
      { title: 'En cours',           value: k.commandes_en_cours, icon: '🚚', color: 'orange' as const, route: '/acheteur/commandes' },
      { title: 'Total dépensé',      value: new Intl.NumberFormat('fr-SN').format(k.total_depense), unit: 'FCFA', icon: '💰', color: 'blue' as const },
      { title: 'Éleveurs favoris',   value: k.eleveurs_favoris,   icon: '❤️', color: 'red'    as const, route: '/acheteur/favoris' },
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