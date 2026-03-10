// ============================================================
// Fichier : src/app/features/dashboard/eleveur/dashboard/eleveur-dashboard.component.ts
// ============================================================
import { Component, signal, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule }   from '@angular/common';
import { RouterModule }   from '@angular/router';
import { HttpClient }     from '@angular/common/http';
import { KpiCardComponent }    from '../../../../shared/components/kpi-card/kpi-card.component';
import { BadgeStatusComponent } from '../../../../shared/components/badge-status/badge-status.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { environment }    from '../../../../environments/environment';

interface DashboardData {
  kpis: {
    stocks_actifs:      number;
    commandes_en_cours: number;
    revenus_mois:       number;
    note_moyenne:       number;
    variation_revenus:  number;
    variation_commandes:number;
  };
  commandes_recentes: {
    id:               number;
    reference:        string | null;
    statut_commande:  string;
    quantite:         number;
    montant_total:    number;
    created_at:       string;
    acheteur:         { name: string };
    stock:            { titre: string };
  }[];
  graphique_mensuel: { mois: string; revenus: number; commandes: number }[];
  stocks_populaires: { id: number; titre: string; vues: number; commandes: number; statut: string; photo?: string | null }[];
}

@Component({
  selector:    'app-eleveur-dashboard',
  standalone:  true,
  imports:     [CommonModule, RouterModule, KpiCardComponent, BadgeStatusComponent, LoadingSpinnerComponent],
  templateUrl: './eleveur-dashboard.component.html',
})
export class EleveurDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  data    = signal<DashboardData | null>(null);
  loading = signal(true);
  chartPeriod = signal<'6m' | '12m'>('6m');

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngAfterViewInit(): void {
    // Le graphique sera rendu après chargement des données
  }

  loadDashboard(): void {
    this.loading.set(true);
    this.http.get<any>(`${environment.apiUrl}/eleveur/dashboard`).subscribe({
      next: (res) => {
        this.data.set(res.data);
        this.loading.set(false);
        setTimeout(() => this.renderChart(), 100);
      },
      error: () => this.loading.set(false),
    });
  }

  renderChart(): void {
    const canvas = this.chartCanvas?.nativeElement;
    if (!canvas || !this.data()?.graphique_mensuel) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const graphData = this.data()!.graphique_mensuel;
    const labels    = graphData.map(d => d.mois);
    const revenus   = graphData.map(d => d.revenus);
    const max       = Math.max(...revenus, 1);

    // Lire la taille du conteneur PARENT avant de redimensionner le canvas
    // (évite l'effet "snowball" où canvas.offsetWidth grandit à chaque rendu)
    const container = canvas.parentElement;
    const W = container ? container.clientWidth : 400;
    const H = container ? container.clientHeight : 208;
    canvas.width  = W;
    canvas.height = H;

    const padL = 60, padR = 20, padT = 20, padB = 40;
    const chartW = W - padL - padR;
    const chartH = H - padT - padB;
    const cols   = labels.length;
    const colW   = chartW / cols;

    ctx.clearRect(0, 0, W, H);

    // Grille horizontale
    ctx.strokeStyle = '#F3F4F6';
    ctx.lineWidth   = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padT + (chartH / 4) * i;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W - padR, y); ctx.stroke();
      ctx.fillStyle   = '#9CA3AF';
      ctx.font        = '11px Inter, sans-serif';
      ctx.textAlign   = 'right';
      ctx.fillText(
        Math.round(max - (max / 4) * i).toLocaleString('fr-SN'),
        padL - 8, y + 4
      );
    }

    // Barres
    revenus.forEach((v, i) => {
      const x   = padL + i * colW + colW * 0.15;
      const bW  = colW * 0.7;
      const bH  = (v / max) * chartH;
      const y   = padT + chartH - bH;

      // Gradient vert
      const grad = ctx.createLinearGradient(0, y, 0, y + bH);
      grad.addColorStop(0, '#2E7D32');
      grad.addColorStop(1, '#1B5E20');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, bW, bH, [6, 6, 0, 0]);
      ctx.fill();

      // Label mois
      ctx.fillStyle = '#6B7280';
      ctx.font      = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(labels[i], padL + i * colW + colW / 2, H - 8);
    });
  }

  formatMontant(v: number): string {
    return new Intl.NumberFormat('fr-SN').format(v) + ' FCFA';
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('fr-SN', { day: 'numeric', month: 'short' });
  }

  get kpiCards() {
    const k = this.data()?.kpis;
    if (!k) return [];
    return [
      {
        title:      'Stocks actifs',
        value:      k.stocks_actifs,
        icon:       '📦',
        color:      'green' as const,
        route:      '/eleveur/stocks',
      },
      {
        title:      'Commandes en cours',
        value:      k.commandes_en_cours,
        icon:       '🛒',
        color:      'orange' as const,
        route:      '/eleveur/commandes',
        trend:      k.variation_commandes > 0 ? `+${k.variation_commandes}` : `${k.variation_commandes}`,
        trendUp:    k.variation_commandes >= 0,
      },
      {
        title:      'Revenus du mois',
        value:      new Intl.NumberFormat('fr-SN').format(k.revenus_mois),
        unit:       'FCFA',
        icon:       '💰',
        color:      'blue' as const,
        trend:      k.variation_revenus > 0 ? `+${k.variation_revenus}%` : `${k.variation_revenus}%`,
        trendUp:    k.variation_revenus >= 0,
      },
      {
        title:      'Note moyenne',
        value:      k.note_moyenne?.toFixed(1) ?? '—',
        icon:       '⭐',
        color:      'yellow' as const,
        route:      '/eleveur/avis',
      },
    ];
  }
}