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

type KpiColor = 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'yellow';

interface AdminStats {
  // Champs réels retournés par GET /api/admin/dashboard
  users: {
    total:         number;
    eleveurs:      number;
    acheteurs:     number;
    nouveaux_jour: number;
  };
  commandes: {
    aujourd_hui: number;
    ce_mois:     number;
    par_statut:  Record<string, number>;
  };
  revenus: {
    commission_mois:  number;
    commission_total: number;
    volume_mois:      number;
  };
  litiges: {
    ouverts: number;
    total:   number;
  };
  derniers_utilisateurs: {
    id: number; name: string; email: string; role: string;
    is_verified: boolean; created_at: string;
  }[];
  derniers_litiges: {
    id: number; motif: string; statut: string; created_at: string;
    acheteur: { name: string } | null; eleveur: { name: string } | null;
  }[];
  evolution_mensuelle: {
    mois: string; revenus: number; commandes: number; utilisateurs: number;
  }[];
  activite_recente: {
    id: number; statut_commande: string; montant_total: number;
    created_at: string; acheteur: { name: string } | null; stock: { titre: string } | null;
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
        // Retry jusqu'à ce que le canvas soit visible (max 10 tentatives × 150ms)
        let attempts = 0;
        const tryRender = () => {
          const canvas = this.chartCanvas?.nativeElement;
          if (canvas && canvas.offsetWidth > 0) {
            this.renderChart();
          } else if (attempts++ < 10) {
            setTimeout(tryRender, 150);
          }
        };
        setTimeout(tryRender, 150);
      },
      error: () => this.loading.set(false),
    });
  }

  renderChart(): void {
    const canvas = this.chartCanvas?.nativeElement;
    if (!canvas || !this.stats()) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.offsetWidth || canvas.parentElement?.offsetWidth || 600;
    const H = canvas.offsetHeight || 208;
    canvas.width = W; canvas.height = H;

    const data: any[] = this.stats()!.evolution_mensuelle ?? [];
    const metric = this.chartMetric();
    const values = data.map(d => +(d[metric] ?? 0));
    const labels = data.map(d => d.mois);
    const max    = Math.max(...values, 1);

    // Si aucune donnée — afficher message
    if (!data.length) {
      ctx.fillStyle = '#9CA3AF';
      ctx.font = '13px Inter,sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Aucune donnée disponible', W / 2, H / 2);
      return;
    }

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

  get kpiCards(): { title: string; value: string | number; icon: string; color: KpiColor; route?: string; unit?: string; trend?: string; trendUp?: boolean }[] {
    const s = this.stats();
    if (!s) return [];
    const enCours = (s.commandes.par_statut['confirmee'] ?? 0)
                  + (s.commandes.par_statut['en_preparation'] ?? 0)
                  + (s.commandes.par_statut['en_livraison'] ?? 0);
    return [
      { title: 'Utilisateurs',          value: s.users.total,          icon: '👥', color: 'blue'   as KpiColor, route: '/admin/utilisateurs' },
      { title: "Nouveaux aujourd'hui",   value: s.users.nouveaux_jour,  icon: '🆕', color: 'green'  as KpiColor, route: '/admin/utilisateurs' },
      { title: 'Commandes du mois',     value: s.commandes.ce_mois,    icon: '🛒', color: 'orange' as KpiColor, route: '/admin/commandes' },
      { title: 'Litiges ouverts',       value: s.litiges.ouverts,      icon: '⚠️', color: 'red'    as KpiColor, route: '/admin/litiges' },
      { title: 'Revenus du mois',       value: new Intl.NumberFormat('fr-SN').format(s.revenus.commission_mois), unit: 'FCFA', icon: '💰', color: 'purple' as KpiColor },
      { title: 'Commandes en cours',    value: enCours,                icon: '🚚', color: 'yellow' as KpiColor, route: '/admin/commandes' },
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