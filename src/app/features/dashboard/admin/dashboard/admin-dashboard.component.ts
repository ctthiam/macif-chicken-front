// ============================================================
// Fichier : src/app/features/dashboard/admin/dashboard/admin-dashboard.component.ts
// ============================================================
import { Component, signal, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule }   from '@angular/common';
import { RouterModule }   from '@angular/router';
import { HttpClient }     from '@angular/common/http';
import { KpiCardComponent }        from '../../../../shared/components/kpi-card/kpi-card.component';
import { BadgeStatusComponent }    from '../../../../shared/components/badge-status/badge-status.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { environment }    from '../../../../environments/environment';

interface AdminStats {
  kpis: {
    total_utilisateurs:  number;
    total_eleveurs:      number;
    total_acheteurs:     number;
    stocks_actifs:       number;
    commandes_total:     number;
    commandes_en_cours:  number;
    revenus_plateforme:  number;
    litiges_ouverts:     number;
    variation_utilisateurs: number;
    variation_revenus:      number;
  };
  graphique: { mois: string; utilisateurs: number; commandes: number; revenus: number }[];
  derniers_utilisateurs: {
    id: number; name: string; email: string; role: string;
    is_certified: boolean; created_at: string;
  }[];
  derniers_litiges: {
    id: number; motif: string; statut: string; created_at: string;
    acheteur: { name: string }; eleveur: { name: string };
  }[];
  activite_recente: {
    type: string; message: string; created_at: string; icon: string;
  }[];
}

@Component({
  selector:    'app-admin-dashboard',
  standalone:  true,
  imports:     [CommonModule, RouterModule, KpiCardComponent, BadgeStatusComponent, LoadingSpinnerComponent],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  stats   = signal<AdminStats | null>(null);
  loading = signal(true);
  chartMetric = signal<'revenus' | 'commandes' | 'utilisateurs'>('revenus');

  readonly metrics = [
    { key: 'revenus'       as const, label: 'Revenus' },
    { key: 'commandes'     as const, label: 'Commandes' },
    { key: 'utilisateurs'  as const, label: 'Utilisateurs' },
  ];

  readonly quickActions = [
    { label: 'Utilisateurs', sublabel: 'Gérer les comptes',    route: '/admin/utilisateurs', icon: '👥', iconBg: 'bg-blue-500',   classes: 'bg-blue-50 border-blue-100 hover:border-blue-400',     textClass: 'text-blue-700' },
    { label: 'Certifications',sublabel: 'Valider les éleveurs', route: '/admin/utilisateurs', icon: '✅', iconBg: 'bg-green-500',  classes: 'bg-green-50 border-green-100 hover:border-green-400',   textClass: 'text-green-700' },
    { label: 'Litiges',       sublabel: 'Résoudre les conflits',route: '/admin/litiges',      icon: '⚖️', iconBg: 'bg-red-500',    classes: 'bg-red-50 border-red-100 hover:border-red-400',         textClass: 'text-red-700' },
    { label: 'Finances',      sublabel: 'Rapports & revenus',   route: '/admin/finances',     icon: '💰', iconBg: 'bg-yellow-500', classes: 'bg-yellow-50 border-yellow-100 hover:border-yellow-400',textClass: 'text-yellow-700' },
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void    { this.loadStats(); }
  ngAfterViewInit(): void { /* chart rendered after data */ }

  loadStats(): void {
    this.loading.set(true);
    this.http.get<any>(`${environment.apiUrl}/admin/dashboard`).subscribe({
      next: (res) => {
        this.stats.set(res.data);
        this.loading.set(false);
        setTimeout(() => this.renderChart(), 100);
      },
      error: () => this.loading.set(false),
    });
  }

  renderChart(): void {
    const canvas = this.chartCanvas?.nativeElement;
    if (!canvas || !this.stats()?.graphique) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data   = this.stats()!.graphique;
    const metric = this.chartMetric();
    const values = data.map(d => d[metric] as number);
    const labels = data.map(d => d.mois);
    const max    = Math.max(...values, 1);

    const W = canvas.offsetWidth, H = canvas.offsetHeight;
    canvas.width = W; canvas.height = H;

    const padL = 70, padR = 20, padT = 20, padB = 40;
    const cW = W - padL - padR, cH = H - padT - padB;
    const cols = labels.length, colW = cW / cols;

    ctx.clearRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = '#F3F4F6'; ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padT + (cH / 4) * i;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W - padR, y); ctx.stroke();
      const val = max - (max / 4) * i;
      ctx.fillStyle = '#9CA3AF'; ctx.font = '10px Inter,sans-serif'; ctx.textAlign = 'right';
      ctx.fillText(
        metric === 'revenus' ? Math.round(val / 1000) + 'k' : Math.round(val).toString(),
        padL - 8, y + 4
      );
    }

    // Barres avec couleur selon métrique
    const colors: Record<string, [string, string]> = {
      revenus:       ['#2E7D32', '#1B5E20'],
      commandes:     ['#FF8F00', '#FF6F00'],
      utilisateurs:  ['#1565C0', '#0D47A1'],
    };
    const [c1, c2] = colors[metric];

    values.forEach((v, i) => {
      const x  = padL + i * colW + colW * 0.15;
      const bW = colW * 0.7;
      const bH = (v / max) * cH;
      const y  = padT + cH - bH;

      const grad = ctx.createLinearGradient(0, y, 0, y + bH);
      grad.addColorStop(0, c1); grad.addColorStop(1, c2);
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.roundRect(x, y, bW, bH, [4, 4, 0, 0]); ctx.fill();

      ctx.fillStyle = '#6B7280'; ctx.font = '10px Inter,sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(labels[i], padL + i * colW + colW / 2, H - 10);
    });
  }

  switchMetric(m: 'revenus' | 'commandes' | 'utilisateurs'): void {
    this.chartMetric.set(m);
    setTimeout(() => this.renderChart(), 50);
  }

  formatMontant(v: number): string {
    return new Intl.NumberFormat('fr-SN').format(v) + ' FCFA';
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('fr-SN', { day: 'numeric', month: 'short' });
  }

  formatRelative(d: string): string {
    const diff = Date.now() - new Date(d).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return 'À l\'instant';
    if (h < 24) return `Il y a ${h}h`;
    return `Il y a ${Math.floor(h / 24)}j`;
  }

  get kpiCards() {
    const k = this.stats()?.kpis;
    if (!k) return [];
    return [
      { title: 'Utilisateurs',     value: k.total_utilisateurs,  icon: '👥', color: 'blue'   as const, route: '/admin/utilisateurs', trend: k.variation_utilisateurs > 0 ? `+${k.variation_utilisateurs}` : `${k.variation_utilisateurs}`, trendUp: k.variation_utilisateurs >= 0 },
      { title: 'Stocks actifs',    value: k.stocks_actifs,       icon: '📦', color: 'green'  as const, route: '/admin/stocks' },
      { title: 'Commandes totales',value: k.commandes_total,     icon: '🛒', color: 'orange' as const, route: '/admin/commandes' },
      { title: 'Litiges ouverts',  value: k.litiges_ouverts,     icon: '⚠️', color: 'red'    as const, route: '/admin/litiges' },
      { title: 'Revenus plateforme',value: new Intl.NumberFormat('fr-SN').format(k.revenus_plateforme), unit: 'FCFA', icon: '💰', color: 'purple' as const, trend: k.variation_revenus > 0 ? `+${k.variation_revenus}%` : `${k.variation_revenus}%`, trendUp: k.variation_revenus >= 0 },
      { title: 'En cours',         value: k.commandes_en_cours,  icon: '🚚', color: 'yellow' as const, route: '/admin/commandes' },
    ];
  }

  getRoleClass(role: string): string {
    const map: Record<string, string> = {
      admin:   'bg-red-100 text-red-700',
      eleveur: 'bg-green-100 text-green-700',
      acheteur:'bg-blue-100 text-blue-700',
    };
    return map[role] ?? 'bg-neutral-100 text-neutral-700';
  }

  getLitigeClass(statut: string): string {
    const map: Record<string, string> = {
      ouvert:    'bg-red-100 text-red-700',
      en_cours:  'bg-orange-100 text-orange-700',
      resolu:    'bg-green-100 text-green-700',
    };
    return map[statut] ?? 'bg-neutral-100 text-neutral-600';
  }
}