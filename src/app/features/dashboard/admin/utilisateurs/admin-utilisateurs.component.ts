// ============================================================
// Fichier : src/app/features/dashboard/admin/utilisateurs/admin-utilisateurs.component.ts
// ============================================================
import { Component, signal, OnInit } from '@angular/core';
import { CommonModule }   from '@angular/common';
import { RouterModule }   from '@angular/router';
import { FormsModule }    from '@angular/forms';
import { HttpClient }     from '@angular/common/http';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { environment }    from '../../../../environments/environment';

interface Utilisateur {
  id:           number;
  name:         string;
  email:        string;
  role:         string;
  is_certified: boolean;
  is_active:    boolean;
  created_at:   string;
  total_stocks?: number;
  total_commandes?: number;
}

@Component({
  selector:    'app-admin-utilisateurs',
  standalone:  true,
  imports:     [CommonModule, RouterModule, FormsModule, LoadingSpinnerComponent],
  template: `
<div class="space-y-6 animate-fade-in">

  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <h1 class="font-display text-2xl font-extrabold text-neutral-900">Utilisateurs</h1>
      <p class="text-neutral-500 text-sm mt-0.5">{{ total() }} compte{{ total() > 1 ? 's' : '' }} enregistré{{ total() > 1 ? 's' : '' }}</p>
    </div>
  </div>

  <!-- Filtres + recherche -->
  <div class="flex flex-col sm:flex-row gap-3">
    <div class="relative flex-1 max-w-sm">
      <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
      <input type="text" [(ngModel)]="search" (ngModelChange)="onSearch()"
             placeholder="Nom, email…"
             class="w-full pl-9 pr-4 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-100 transition-all"/>
    </div>
    <div class="flex gap-2 flex-wrap">
      @for (f of roleFiltres; track f.value) {
        <button (click)="filtreRole.set(f.value); load()"
                class="px-3.5 py-2 text-xs font-semibold rounded-xl border-2 transition-all"
                [class]="filtreRole() === f.value ? 'bg-primary text-white border-primary' : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'">
          {{ f.label }}
        </button>
      }
    </div>
  </div>

  @if (loading()) {
    <app-loading-spinner [fullPage]="true" />
  } @else {
    <div class="bg-white rounded-2xl shadow-card border border-neutral-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-neutral-50 border-b border-neutral-100">
              <th class="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Utilisateur</th>
              <th class="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Rôle</th>
              <th class="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide hidden md:table-cell">Activité</th>
              <th class="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide hidden lg:table-cell">Inscrit le</th>
              <th class="text-left px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Statut</th>
              <th class="text-right px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-50">
            @for (u of utilisateurs(); track u.id) {
              <tr class="hover:bg-neutral-50 transition-colors">
                <!-- Utilisateur -->
                <td class="px-5 py-3.5">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold text-white"
                         [class]="u.role === 'eleveur' ? 'bg-primary' : u.role === 'acheteur' ? 'bg-blue-500' : 'bg-red-500'">
                      {{ u.name.charAt(0).toUpperCase() }}
                    </div>
                    <div class="min-w-0">
                      <div class="flex items-center gap-1.5">
                        <p class="font-semibold text-neutral-900 truncate text-sm">{{ u.name }}</p>
                        @if (u.is_certified) {
                          <svg class="w-3.5 h-3.5 text-green-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                          </svg>
                        }
                      </div>
                      <p class="text-xs text-neutral-400 truncate">{{ u.email }}</p>
                    </div>
                  </div>
                </td>
                <!-- Rôle -->
                <td class="px-5 py-3.5">
                  <span class="text-xs font-semibold px-2.5 py-1 rounded-full"
                        [class]="getRoleClass(u.role)">{{ u.role }}</span>
                </td>
                <!-- Activité -->
                <td class="px-5 py-3.5 hidden md:table-cell">
                  @if (u.role === 'eleveur') {
                    <p class="text-xs text-neutral-600">{{ u.total_stocks ?? 0 }} stocks</p>
                  } @else if (u.role === 'acheteur') {
                    <p class="text-xs text-neutral-600">{{ u.total_commandes ?? 0 }} commandes</p>
                  } @else {
                    <p class="text-xs text-neutral-400">—</p>
                  }
                </td>
                <!-- Date -->
                <td class="px-5 py-3.5 text-xs text-neutral-500 hidden lg:table-cell">
                  {{ formatDate(u.created_at) }}
                </td>
                <!-- Statut -->
                <td class="px-5 py-3.5">
                  <span class="text-xs font-semibold px-2.5 py-1 rounded-full"
                        [class]="u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                    {{ u.is_active ? 'Actif' : 'Suspendu' }}
                  </span>
                </td>
                <!-- Actions -->
                <td class="px-5 py-3.5">
                  <div class="flex items-center justify-end gap-2">
                    @if (u.role === 'eleveur' && !u.is_certified) {
                      <button (click)="certifier(u)"
                              class="text-xs font-semibold bg-green-50 text-green-700 px-2.5 py-1.5 rounded-lg hover:bg-green-100 transition-colors whitespace-nowrap">
                        ✅ Certifier
                      </button>
                    }
                    <button (click)="toggleSuspension(u)"
                            class="text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                            [class]="u.is_active
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'bg-green-50 text-green-700 hover:bg-green-100'">
                      {{ u.is_active ? 'Suspendre' : 'Réactiver' }}
                    </button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      @if (utilisateurs().length === 0) {
        <div class="py-16 text-center text-neutral-400">
          <p class="text-sm">Aucun utilisateur trouvé</p>
        </div>
      }
    </div>
  }
</div>
  `,
})
export class AdminUtilisateursComponent implements OnInit {
  utilisateurs = signal<Utilisateur[]>([]);
  total        = signal(0);
  loading      = signal(true);
  filtreRole   = signal('');
  search       = '';
  private searchTimer: any;

  readonly roleFiltres = [
    { value: '',        label: 'Tous' },
    { value: 'eleveur', label: '🌾 Éleveurs' },
    { value: 'acheteur',label: '🛒 Acheteurs' },
    { value: 'admin',   label: '⚙️ Admins' },
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.load(); }

  onSearch(): void {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.load(), 400);
  }

  load(): void {
    this.loading.set(true);
    let url = `${environment.apiUrl}/admin/users?per_page=30`;
    if (this.filtreRole()) url += `&role=${this.filtreRole()}`;
    if (this.search)       url += `&search=${encodeURIComponent(this.search)}`;

    this.http.get<any>(url).subscribe({
      next: (res) => {
        this.utilisateurs.set(res.data ?? []);
        this.total.set(res.meta?.total ?? 0);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  certifier(u: Utilisateur): void {
    this.http.put(`${environment.apiUrl}/admin/users/${u.id}/certifier`, {}).subscribe({
      next: () => this.utilisateurs.update(list => list.map(x => x.id === u.id ? { ...x, is_certified: true } : x)),
      error: () => {},
    });
  }

  toggleSuspension(u: Utilisateur): void {
    this.http.put(`${environment.apiUrl}/admin/users/${u.id}/toggle-status`, {}).subscribe({
      next: () => this.utilisateurs.update(list => list.map(x => x.id === u.id ? { ...x, is_active: !u.is_active } : x)),
      error: () => {},
    });
  }

  getRoleClass(role: string): string {
    return { admin: 'bg-red-100 text-red-700', eleveur: 'bg-green-100 text-green-700', acheteur: 'bg-blue-100 text-blue-700' }[role] ?? 'bg-neutral-100 text-neutral-600';
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('fr-SN', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}