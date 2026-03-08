// ============================================================
// Fichier : src/app/features/dashboard/acheteur/favoris/acheteur-favoris.component.ts
// ============================================================
import { Component, signal, OnInit } from '@angular/core';
import { CommonModule }   from '@angular/common';
import { RouterModule }   from '@angular/router';
import { HttpClient }     from '@angular/common/http';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { environment }    from '../../../../environments/environment';

interface EleveurFavori {
  eleveur_id:     number;
  nom:            string | null;
  nom_poulailler: string | null;
  localisation:   string | null;
  note_moyenne:   number | null;
  is_certified:   boolean;
}

@Component({
  selector:    'app-acheteur-favoris',
  standalone:  true,
  imports:     [CommonModule, RouterModule, LoadingSpinnerComponent],
  template: `
<div class="space-y-6 animate-fade-in">
  <div>
    <h1 class="font-display text-2xl font-extrabold text-neutral-900">Mes favoris</h1>
    <p class="text-neutral-500 text-sm mt-0.5">
      {{ favoris().length }} éleveur{{ favoris().length > 1 ? 's' : '' }} sauvegardé{{ favoris().length > 1 ? 's' : '' }}
    </p>
  </div>

  @if (loading()) {
    <app-loading-spinner [fullPage]="true" />
  } @else if (favoris().length === 0) {
    <div class="bg-white rounded-2xl border border-neutral-100 p-20 text-center">
      <span class="text-6xl">❤️</span>
      <h3 class="font-display font-bold text-neutral-900 text-xl mt-4 mb-2">Aucun favori</h3>
      <p class="text-neutral-500 text-sm mb-6">Parcourez les annonces et ajoutez vos éleveurs favoris.</p>
      <a routerLink="/recherche"
         class="inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-800 transition-all">
        Explorer les annonces
      </a>
    </div>
  } @else {
    <div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
      @for (fav of favoris(); track fav.eleveur_id) {
        <div class="bg-white rounded-2xl border border-neutral-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-3 min-h-[160px]">

          <!-- Avatar + nom -->
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
              <span class="text-xl">🧑‍🌾</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-neutral-900 truncate">
                {{ fav.nom_poulailler ?? fav.nom ?? '—' }}
              </p>
              @if (fav.localisation) {
                <p class="text-xs text-neutral-500 flex items-center gap-1">
                  <span>📍</span> {{ fav.localisation }}
                </p>
              }
            </div>
            @if (fav.is_certified) {
              <span class="text-green-600 text-lg shrink-0" title="Éleveur certifié MACIF">✅</span>
            }
          </div>

          <!-- Note -->
          @if (fav.note_moyenne) {
            <div class="flex items-center gap-1.5">
              <span class="text-amber-400 text-sm">★</span>
              <span class="text-sm font-semibold text-neutral-800">{{ fav.note_moyenne | number:'1.1-1' }}</span>
              <span class="text-xs text-neutral-400">/ 5</span>
            </div>
          }

          <!-- Actions -->
          <div class="flex gap-2 pt-1">
            <a [routerLink]="['/eleveurs', fav.eleveur_id]"
               class="flex-1 text-center text-sm font-semibold text-primary border border-primary rounded-lg py-2 hover:bg-primary-50 transition-colors">
              Voir les annonces
            </a>
            <button
              (click)="retirerFavori(fav.eleveur_id)"
              class="w-9 h-9 flex items-center justify-center border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
              title="Retirer des favoris"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
              </svg>
            </button>
          </div>

        </div>
      }
    </div>
  }
</div>
  `,
})
export class AcheteurFavorisComponent implements OnInit {
  favoris = signal<EleveurFavori[]>([]);
  loading = signal(true);

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.http.get<any>(`${environment.apiUrl}/acheteur/favoris`).subscribe({
      next:  (res) => { this.favoris.set(res.data ?? []); this.loading.set(false); },
      error: ()    => this.loading.set(false),
    });
  }

  retirerFavori(eleveurId: number): void {
    this.http.delete(`${environment.apiUrl}/acheteur/favoris/${eleveurId}`).subscribe({
      next:  () => this.favoris.update(list => list.filter(f => f.eleveur_id !== eleveurId)),
      error: () => {},
    });
  }
}