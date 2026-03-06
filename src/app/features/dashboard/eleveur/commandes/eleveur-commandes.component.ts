// ============================================================
// Fichier : src/app/features/dashboard/eleveur/commandes/eleveur-commandes.component.ts
// ============================================================
import { Component, signal, OnInit } from '@angular/core';
import { CommonModule }   from '@angular/common';
import { RouterModule }   from '@angular/router';
import { FormsModule }    from '@angular/forms';
import { HttpClient }     from '@angular/common/http';
import { BadgeStatusComponent }    from '../../../../shared/components/badge-status/badge-status.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { environment }    from '../../../../environments/environment';

interface Commande {
  id:          number;
  reference:   string;
  statut:      string;
  quantite:    number;
  montant:     number;
  created_at:  string;
  acheteur:    { name: string; phone: string };
  stock:       { titre: string; id: number };
  adresse_livraison: string;
}

@Component({
  selector:    'app-eleveur-commandes',
  standalone:  true,
  imports:     [CommonModule, RouterModule, FormsModule, BadgeStatusComponent, LoadingSpinnerComponent],
  template: `
<div class="space-y-6 animate-fade-in">

  <!-- Header -->
  <div>
    <h1 class="font-display text-2xl font-extrabold text-neutral-900">Commandes reçues</h1>
    <p class="text-neutral-500 text-sm mt-0.5">{{ total() }} commande{{ total() > 1 ? 's' : '' }} au total</p>
  </div>

  <!-- Filtres statuts -->
  <div class="flex flex-wrap gap-2">
    @for (f of statutFiltres; track f.value) {
      <button
        (click)="filtreStatut.set(f.value); load()"
        class="px-3.5 py-2 text-xs font-semibold rounded-xl border-2 transition-all"
        [class]="filtreStatut() === f.value
          ? 'bg-primary text-white border-primary'
          : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'"
      >{{ f.label }}</button>
    }
  </div>

  @if (loading()) {
    <app-loading-spinner [fullPage]="true" />
  } @else if (commandes().length === 0) {
    <div class="bg-white rounded-2xl border border-neutral-100 p-20 text-center">
      <span class="text-6xl">🛒</span>
      <p class="text-neutral-500 font-medium mt-4">Aucune commande</p>
    </div>
  } @else {
    <div class="space-y-3">
      @for (cmd of commandes(); track cmd.id) {
        <div class="bg-white rounded-2xl border border-neutral-100 shadow-card p-5 hover:shadow-card-hover transition-all">
          <div class="flex flex-col sm:flex-row sm:items-center gap-4">

            <!-- Infos commande -->
            <div class="flex-1 space-y-2">
              <div class="flex items-center gap-3 flex-wrap">
                <span class="font-mono text-xs bg-neutral-100 px-2 py-1 rounded-lg text-neutral-700 font-semibold">
                  #{{ cmd.reference ?? cmd.id }}
                </span>
                <app-badge-status [status]="cmd.statut" type="commande" />
                <span class="text-xs text-neutral-400">{{ formatDate(cmd.created_at) }}</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
                  <span class="text-xs font-bold text-primary">{{ cmd.acheteur.name.charAt(0).toUpperCase() }}</span>
                </div>
                <div>
                  <p class="text-sm font-semibold text-neutral-900">{{ cmd.acheteur.name }}</p>
                  <p class="text-xs text-neutral-500">{{ cmd.acheteur.phone }}</p>
                </div>
              </div>
              <p class="text-xs text-neutral-600">
                <span class="font-medium">{{ cmd.stock.titre }}</span>
                · {{ cmd.quantite }} unité{{ cmd.quantite > 1 ? 's' : '' }}
              </p>
              @if (cmd.adresse_livraison) {
                <p class="text-xs text-neutral-500 flex items-center gap-1">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  </svg>
                  {{ cmd.adresse_livraison }}
                </p>
              }
            </div>

            <!-- Montant + Actions -->
            <div class="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2 shrink-0">
              <span class="text-lg font-extrabold text-primary">{{ formatMontant(cmd.montant) }}</span>

              <!-- Boutons selon statut -->
              <div class="flex gap-2">
                @if (cmd.statut === 'confirmee') {
                  <button (click)="changerStatut(cmd, 'en_preparation')"
                          class="text-xs font-semibold bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg hover:bg-orange-200 transition-colors">
                    Préparer
                  </button>
                }
                @if (cmd.statut === 'en_preparation') {
                  <button (click)="changerStatut(cmd, 'en_livraison')"
                          class="text-xs font-semibold bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg hover:bg-purple-200 transition-colors">
                    Livrer
                  </button>
                }
                @if (cmd.statut === 'en_livraison') {
                  <button (click)="changerStatut(cmd, 'livree')"
                          class="text-xs font-semibold bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200 transition-colors">
                    Confirmer livraison
                  </button>
                }
                @if (cmd.statut === 'confirmee') {
                  <button (click)="changerStatut(cmd, 'annulee')"
                          class="text-xs font-semibold bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
                    Annuler
                  </button>
                }
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  }
</div>
  `,
})
export class EleveurCommandesComponent implements OnInit {
  commandes    = signal<Commande[]>([]);
  total        = signal(0);
  loading      = signal(true);
  filtreStatut = signal('');

  readonly statutFiltres = [
    { value: '',              label: 'Toutes' },
    { value: 'confirmee',     label: 'Confirmées' },
    { value: 'en_preparation',label: 'En préparation' },
    { value: 'en_livraison',  label: 'En livraison' },
    { value: 'livree',        label: 'Livrées' },
    { value: 'annulee',       label: 'Annulées' },
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    let url = `${environment.apiUrl}/eleveur/commandes?per_page=20`;
    if (this.filtreStatut()) url += `&statut=${this.filtreStatut()}`;

    this.http.get<any>(url).subscribe({
      next: (res) => {
        this.commandes.set(res.data ?? []);
        this.total.set(res.meta?.total ?? res.data?.length ?? 0);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  changerStatut(cmd: Commande, statut: string): void {
    this.http.put(`${environment.apiUrl}/commandes/${cmd.id}/statut`, { statut }).subscribe({
      next: () => this.commandes.update(list => list.map(c => c.id === cmd.id ? { ...c, statut } : c)),
      error: () => {},
    });
  }

  formatMontant(v: number): string {
    return new Intl.NumberFormat('fr-SN').format(v) + ' FCFA';
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('fr-SN', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}