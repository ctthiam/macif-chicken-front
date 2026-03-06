// ============================================================
// Fichier : src/app/shared/components/stock-card/stock-card.component.ts
// Usage   : <app-stock-card [stock]="stock" (commanderClick)="onCommander($event)" />
// ============================================================
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { RouterModule }      from '@angular/router';
import { BadgeStatusComponent } from '../badge-status/badge-status.component';
import { RatingStarsComponent } from '../rating-stars/rating-stars.component';

export interface Stock {
  id:                   number;
  titre:                string;
  description:          string;
  quantite_disponible:  number;
  poids_moyen_kg:       number;
  prix_par_kg:          number;
  prix_par_unite:       number;
  mode_vente:           'vivant' | 'abattu' | 'les_deux';
  statut:               string;
  photos:               string[];
  date_disponibilite:   string;
  eleveur?: {
    id:           number;
    name:         string;
    is_certified: boolean;
    note_moyenne: number;
    nombre_avis:  number;
    localisation: string;
  };
}

@Component({
  selector:   'app-stock-card',
  standalone: true,
  imports:    [CommonModule, RouterModule, BadgeStatusComponent, RatingStarsComponent],
  template: `
    <div
      class="bg-white rounded-xl border border-neutral-100 overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer group"
      style="box-shadow: 0 2px 8px rgba(0,0,0,0.08);"
      (click)="navigateToDetail()"
    >
      <!-- Image -->
      <div class="relative h-48 bg-neutral-100 overflow-hidden">
        @if (stock.photos && stock.photos.length) {
          <img
            [src]="stock.photos[0]"
            [alt]="stock.titre"
            class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        } @else {
          <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
            <span class="text-5xl">🐔</span>
          </div>
        }

        <!-- Badge statut (coin sup droit) -->
        <div class="absolute top-3 right-3">
          <app-badge-status [status]="stock.statut" type="stock" />
        </div>

        <!-- Badge certifié (coin sup gauche) -->
        @if (stock.eleveur?.is_certified) {
          <div class="absolute top-3 left-3">
            <span class="inline-flex items-center gap-1 bg-white/95 backdrop-blur-sm text-green-700 text-xs font-semibold px-2 py-1 rounded-full shadow-sm">
              <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              Certifié
            </span>
          </div>
        }

        <!-- Mode vente -->
        <div class="absolute bottom-3 left-3">
          <span class="bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-full">
            {{ modeVenteLabel }}
          </span>
        </div>
      </div>

      <!-- Contenu -->
      <div class="p-4">

        <!-- Titre + localisation -->
        <div class="mb-2">
          <h3 class="font-display font-semibold text-neutral-900 text-base leading-tight line-clamp-1 group-hover:text-primary transition-colors">
            {{ stock.titre }}
          </h3>
          @if (stock.eleveur?.localisation) {
            <p class="text-xs text-neutral-500 mt-0.5 flex items-center gap-1">
              <svg class="w-3 h-3 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              {{ stock.eleveur?.localisation }}
            </p>
          }
        </div>

        <!-- Note éleveur -->
        @if (stock.eleveur && stock.eleveur.note_moyenne > 0) {
          <div class="mb-3">
            <app-rating-stars
              [rating]="stock.eleveur.note_moyenne"
              [count]="stock.eleveur.nombre_avis"
              size="sm"
            />
          </div>
        }

        <!-- Quantité dispo -->
        <div class="flex items-center gap-1.5 mb-3">
          <div class="w-1.5 h-1.5 rounded-full bg-green-500"></div>
          <span class="text-xs text-neutral-600 font-medium">
            {{ stock.quantite_disponible }} unités disponibles
          </span>
        </div>

        <!-- Séparateur -->
        <div class="border-t border-neutral-100 pt-3 flex items-center justify-between gap-2">

          <!-- Prix -->
          <div>
            <p class="text-lg font-bold text-primary leading-none">
              {{ stock.prix_par_kg | number:'1.0-0' }}
              <span class="text-sm font-normal text-neutral-500"> FCFA/kg</span>
            </p>
            @if (stock.prix_par_unite) {
              <p class="text-xs text-neutral-400">
                ou {{ stock.prix_par_unite | number:'1.0-0' }} FCFA/unité
              </p>
            }
          </div>

          <!-- Bouton Commander -->
          @if (stock.statut === 'disponible') {
            <button
              type="button"
              (click)="$event.stopPropagation(); onCommander()"
              class="shrink-0 bg-primary text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-primary-800 active:bg-primary-900 transition-colors"
            >
              Commander
            </button>
          }

        </div>
      </div>
    </div>
  `,
})
export class StockCardComponent {
  @Input() stock!: Stock;
  @Output() commanderClick = new EventEmitter<Stock>();

  get modeVenteLabel(): string {
    const map: Record<string, string> = {
      vivant:   '🐔 Vivant',
      abattu:   '🥩 Abattu',
      les_deux: '🐔 Vivant & Abattu',
    };
    return map[this.stock.mode_vente] ?? this.stock.mode_vente;
  }

  navigateToDetail(): void {
    // Navigation gérée via routerLink ou programmatiquement
  }

  onCommander(): void {
    this.commanderClick.emit(this.stock);
  }
}