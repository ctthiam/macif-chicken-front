// ============================================================
// Fichier : src/app/features/public/eleveurs/eleveurs.component.ts
// ============================================================
import { Component, signal, OnInit } from '@angular/core';
import { CommonModule }  from '@angular/common';
import { RouterModule }  from '@angular/router';
import { FormsModule }   from '@angular/forms';
import { HttpClient }    from '@angular/common/http';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { environment }   from '../../../environments/environment';

interface EleveurPublic {
  id:             number;
  name:           string;
  nom_poulailler: string;
  localisation:   string;
  note_moyenne:   number;
  nombre_avis:    number;
  is_certified:   boolean;
  stocks_count:   number;
}

@Component({
  selector:   'app-eleveurs',
  standalone: true,
  imports:    [CommonModule, RouterModule, FormsModule, LoadingSpinnerComponent],
  template: `
<div class="min-h-screen bg-neutral-50">

  <!-- Hero -->
  <section class="bg-white border-b border-neutral-100 py-12 px-4">
    <div class="max-w-5xl mx-auto text-center">
      <h1 class="font-display text-3xl sm:text-4xl font-extrabold text-neutral-900 mb-3">
        Nos éleveurs partenaires
      </h1>
      <p class="text-neutral-500 text-lg max-w-xl mx-auto">
        Des producteurs sénégalais vérifiés, engagés pour la qualité.
      </p>
    </div>
  </section>

  <!-- Recherche + filtres -->
  <div class="max-w-5xl mx-auto px-4 py-8">
    <div class="flex flex-col sm:flex-row gap-3 mb-8">
      <input type="text" [(ngModel)]="search" (ngModelChange)="filterEleveurs()"
             placeholder="Rechercher un éleveur, un poulailler…"
             class="flex-1 text-sm border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-100 transition-all bg-white shadow-sm"/>
      <label class="flex items-center gap-2 bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm cursor-pointer shadow-sm hover:border-primary transition-all">
        <input type="checkbox" [(ngModel)]="seulementCertifies" (change)="filterEleveurs()" class="accent-primary"/>
        <span class="font-semibold text-neutral-700">✅ Certifiés uniquement</span>
      </label>
    </div>

    @if (loading()) {
      <app-loading-spinner [fullPage]="true" />
    } @else if (filtered().length === 0) {
      <div class="text-center py-24">
        <span class="text-6xl">🐔</span>
        <h3 class="font-display font-bold text-neutral-900 text-xl mt-4 mb-2">Aucun éleveur trouvé</h3>
        <p class="text-neutral-500 text-sm">Modifiez vos critères de recherche.</p>
      </div>
    } @else {
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        @for (e of filtered(); track e.id) {
          <a [routerLink]="['/eleveurs', e.id]"
             class="bg-white rounded-2xl border border-neutral-100 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all overflow-hidden group">
            <!-- Avatar coloré -->
            <div class="h-28 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center relative">
              <span class="text-5xl font-extrabold text-primary-700 opacity-70">
                {{ e.nom_poulailler[0].toUpperCase() }}
              </span>
              @if (e.is_certified) {
                <span class="absolute top-3 right-3 bg-white text-green-700 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                  ✅ Certifié
                </span>
              }
            </div>
            <div class="p-5">
              <h3 class="font-display font-bold text-neutral-900 text-base group-hover:text-primary transition-colors">
                {{ e.nom_poulailler }}
              </h3>
              <p class="text-sm text-neutral-500 mt-0.5">{{ e.name }}</p>
              @if (e.localisation) {
                <p class="flex items-center gap-1 text-xs text-neutral-400 mt-2">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  {{ e.localisation }}
                </p>
              }
              <div class="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100">
                <!-- Note -->
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <span class="text-sm font-bold text-neutral-800">
                    {{ e.note_moyenne > 0 ? e.note_moyenne.toFixed(1) : '—' }}
                  </span>
                  <span class="text-xs text-neutral-400">({{ e.nombre_avis }})</span>
                </div>
                <!-- Stocks -->
                <span class="text-xs text-neutral-500 font-medium">
                  {{ e.stocks_count }} stock{{ e.stocks_count > 1 ? 's' : '' }}
                </span>
              </div>
            </div>
          </a>
        }
      </div>
    }
  </div>

</div>
`,
})
export class EleveursComponent implements OnInit {
  eleveurs  = signal<EleveurPublic[]>([]);
  filtered  = signal<EleveurPublic[]>([]);
  loading   = signal(true);
  search    = '';
  seulementCertifies = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any>(`${environment.apiUrl}/eleveurs`).subscribe({
      next: (res) => {
        const data = res.data ?? res;
        this.eleveurs.set(data);
        this.filtered.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  filterEleveurs(): void {
    let result = this.eleveurs();
    if (this.search.trim()) {
      const q = this.search.toLowerCase();
      result = result.filter(e =>
        e.nom_poulailler.toLowerCase().includes(q) ||
        e.name.toLowerCase().includes(q) ||
        (e.localisation ?? '').toLowerCase().includes(q)
      );
    }
    if (this.seulementCertifies) {
      result = result.filter(e => e.is_certified);
    }
    this.filtered.set(result);
  }
}