// ============================================================
// src/app/features/dashboard/shared/notifications/notifications.component.ts
// Page Notifications — commune aux 3 rôles
// API : GET /notifications  |  PUT /notifications/{id}/lu  |  PUT /notifications/tout-lire
// ============================================================
import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule }  from '@angular/common';
import { HttpClient }    from '@angular/common/http';
import { environment }   from '../../environments/environment';

interface Notif {
  id:         number;
  titre:      string;
  message:    string;
  type:       string;
  is_read:    boolean;
  created_at: string;
}

interface Meta {
  current_page: number;
  last_page:    number;
  total:        number;
  non_lues:     number;
}

@Component({
  selector:   'app-notifications',
  standalone: true,
  imports:    [CommonModule],
  template: `
<div class="space-y-6 animate-fade-in max-w-2xl">

  <!-- En-tête -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="font-display text-2xl font-extrabold text-neutral-900">Notifications</h1>
      <p class="text-neutral-500 text-sm mt-0.5">
        @if (meta()) { {{ meta()!.total }} notification(s) — {{ meta()!.non_lues }} non lue(s) }
      </p>
    </div>
    @if (meta() && meta()!.non_lues > 0) {
      <button
        (click)="toutLire()"
        class="text-sm font-semibold text-primary hover:text-primary-800 transition-colors"
      >
        Tout marquer comme lu
      </button>
    }
  </div>

  <!-- Filtres -->
  <div class="flex gap-2 flex-wrap">
    @for (f of filtres; track f.value) {
      <button
        (click)="setFiltre(f.value)"
        class="px-4 py-1.5 rounded-full text-sm font-semibold border-2 transition-all"
        [class]="filtre() === f.value
          ? 'bg-primary border-primary text-white'
          : 'border-neutral-200 text-neutral-600 hover:border-neutral-300 bg-white'"
      >
        {{ f.label }}
      </button>
    }
  </div>

  <!-- Loading -->
  @if (loading()) {
    <div class="space-y-3">
      @for (i of [1,2,3,4,5]; track i) {
        <div class="bg-white rounded-2xl border border-neutral-100 p-4 animate-pulse">
          <div class="flex gap-3">
            <div class="w-10 h-10 bg-neutral-100 rounded-full shrink-0"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-neutral-100 rounded w-2/3"></div>
              <div class="h-3 bg-neutral-100 rounded w-full"></div>
            </div>
          </div>
        </div>
      }
    </div>
  }

  <!-- Liste -->
  @if (!loading()) {
    @if (notifications().length === 0) {
      <div class="bg-white rounded-2xl border border-neutral-100 p-12 text-center">
        <p class="text-4xl mb-3">🔔</p>
        <p class="font-semibold text-neutral-700">Aucune notification</p>
        <p class="text-sm text-neutral-400 mt-1">Vous êtes à jour !</p>
      </div>
    } @else {
      <div class="space-y-2">
        @for (notif of notifications(); track notif.id) {
          <div
            (click)="marquerLu(notif)"
            class="bg-white rounded-2xl border transition-all cursor-pointer hover:shadow-sm"
            [class]="notif.is_read
              ? 'border-neutral-100'
              : 'border-primary/30 bg-primary-50/30'"
          >
            <div class="p-4 flex gap-3 items-start">
              <!-- Icône type -->
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                [class]="iconBg[notif.type] ?? 'bg-neutral-100'"
              >
                {{ typeIcon[notif.type] ?? '🔔' }}
              </div>

              <!-- Contenu -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <p class="text-sm font-semibold text-neutral-900" [class.font-bold]="!notif.is_read">
                    {{ notif.titre }}
                  </p>
                  <div class="flex items-center gap-2 shrink-0">
                    @if (!notif.is_read) {
                      <span class="w-2 h-2 rounded-full bg-primary shrink-0"></span>
                    }
                    <span class="text-xs text-neutral-400">{{ formatDate(notif.created_at) }}</span>
                  </div>
                </div>
                <p class="text-sm text-neutral-600 mt-0.5 leading-relaxed">{{ notif.message }}</p>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Pagination -->
      @if (meta() && meta()!.last_page > 1) {
        <div class="flex items-center justify-center gap-2 pt-2">
          <button
            (click)="loadPage(page() - 1)"
            [disabled]="page() === 1"
            class="px-4 py-2 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700 disabled:opacity-40 hover:bg-neutral-50 transition-colors"
          >
            ← Précédent
          </button>
          <span class="text-sm text-neutral-500 px-2">
            Page {{ page() }} / {{ meta()!.last_page }}
          </span>
          <button
            (click)="loadPage(page() + 1)"
            [disabled]="page() === meta()!.last_page"
            class="px-4 py-2 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700 disabled:opacity-40 hover:bg-neutral-50 transition-colors"
          >
            Suivant →
          </button>
        </div>
      }
    }
  }

</div>
  `,
})
export class NotificationsComponent implements OnInit {

  private http = inject(HttpClient);

  notifications = signal<Notif[]>([]);
  meta          = signal<Meta | null>(null);
  loading       = signal(true);
  filtre        = signal('');
  page          = signal(1);

  readonly filtres = [
    { value: '',           label: 'Toutes' },
    { value: 'commande',   label: '📦 Commandes' },
    { value: 'paiement',   label: '💰 Paiements' },
    { value: 'litige',     label: '⚠️ Litiges' },
    { value: 'avis',       label: '⭐ Avis' },
    { value: 'systeme',    label: '🔧 Système' },
  ];

  readonly typeIcon: Record<string, string> = {
    commande:  '📦',
    paiement:  '💰',
    litige:    '⚠️',
    avis:      '⭐',
    systeme:   '🔧',
    abonnement:'🎫',
  };

  readonly iconBg: Record<string, string> = {
    commande:  'bg-blue-100',
    paiement:  'bg-green-100',
    litige:    'bg-red-100',
    avis:      'bg-yellow-100',
    systeme:   'bg-neutral-100',
    abonnement:'bg-purple-100',
  };

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    const params: Record<string, string> = { page: String(this.page()) };
    if (this.filtre()) params['type'] = this.filtre();

    const query = new URLSearchParams(params).toString();
    this.http.get<any>(`${environment.apiUrl}/notifications?${query}`).subscribe({
      next: (res) => {
        this.notifications.set(res.data ?? []);
        this.meta.set(res.meta ?? null);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  setFiltre(val: string): void {
    this.filtre.set(val);
    this.page.set(1);
    this.load();
  }

  loadPage(p: number): void {
    this.page.set(p);
    this.load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  marquerLu(notif: Notif): void {
    if (notif.is_read) return;
    this.http.put(`${environment.apiUrl}/notifications/${notif.id}/lu`, {}).subscribe({
      next: () => {
        this.notifications.update(list =>
          list.map(n => n.id === notif.id ? { ...n, is_read: true } : n)
        );
        if (this.meta()) {
          this.meta.update(m => m ? { ...m, non_lues: Math.max(0, m.non_lues - 1) } : m);
        }
      },
    });
  }

  toutLire(): void {
    this.http.put(`${environment.apiUrl}/notifications/tout-lire`, {}).subscribe({
      next: () => {
        this.notifications.update(list => list.map(n => ({ ...n, is_read: true })));
        if (this.meta()) this.meta.update(m => m ? { ...m, non_lues: 0 } : m);
      },
    });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now  = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60)   return 'À l\'instant';
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400)return `Il y a ${Math.floor(diff / 3600)} h`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }
}