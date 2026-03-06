// ============================================================
// Fichier : src/app/shared/components/rating-stars/rating-stars.component.ts
// Usage   : <app-rating-stars [rating]="4.5" [count]="23" />
//           <app-rating-stars [rating]="3" [interactive]="true" (ratingChange)="onRate($event)" />
// ============================================================
import { Component, Input, Output, EventEmitter, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector:   'app-rating-stars',
  standalone: true,
  imports:    [CommonModule],
  template: `
    <div class="flex items-center gap-1.5">
      <!-- Étoiles -->
      <div class="flex items-center gap-0.5">
        @for (star of stars; track star) {
          <button
            type="button"
            [disabled]="!interactive"
            (click)="interactive && setRating(star)"
            (mouseenter)="interactive && setHover(star)"
            (mouseleave)="interactive && setHover(0)"
            [class]="starClass(star)"
            [attr.aria-label]="'Note ' + star + ' sur 5'"
          >
            <svg [class]="starSize" viewBox="0 0 20 20" [attr.fill]="getStarFill(star)">
              @if (isHalfStar(star)) {
                <!-- Demi étoile -->
                <defs>
                  <linearGradient [id]="'half-' + star">
                    <stop offset="50%" stop-color="#FFB300"/>
                    <stop offset="50%" stop-color="#E0E0E0"/>
                  </linearGradient>
                </defs>
                <path [attr.fill]="'url(#half-' + star + ')'"
                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              } @else {
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              }
            </svg>
          </button>
        }
      </div>

      <!-- Valeur numérique -->
      @if (showValue && rating > 0) {
        <span class="font-semibold text-neutral-800" [class]="valueSize">
          {{ rating | number:'1.1-1' }}
        </span>
      }

      <!-- Nombre d'avis -->
      @if (count !== null && count !== undefined) {
        <span class="text-neutral-500" [class]="countSize">
          ({{ count }})
        </span>
      }
    </div>
  `,
})
export class RatingStarsComponent {
  @Input() rating:      number  = 0;
  @Input() count:       number | null = null;
  @Input() size:        'sm' | 'md' | 'lg' = 'md';
  @Input() interactive: boolean = false;
  @Input() showValue:   boolean = true;
  @Output() ratingChange = new EventEmitter<number>();

  hoveredRating = 0;
  stars = [1, 2, 3, 4, 5];

  get starSize(): string {
    return this.size === 'sm' ? 'w-3.5 h-3.5' : this.size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
  }

  get valueSize(): string {
    return this.size === 'sm' ? 'text-xs' : this.size === 'lg' ? 'text-lg' : 'text-sm';
  }

  get countSize(): string {
    return this.size === 'sm' ? 'text-xs' : 'text-sm';
  }

  getStarFill(star: number): string {
    const ref = this.hoveredRating || this.rating;
    if (star <= Math.floor(ref)) return '#FFB300';
    if (this.isHalfStar(star))   return '#FFB300';
    return '#E0E0E0';
  }

  isHalfStar(star: number): boolean {
    const ref = this.hoveredRating || this.rating;
    return !this.hoveredRating && star === Math.ceil(ref) && ref % 1 >= 0.25 && ref % 1 < 0.75;
  }

  starClass(star: number): string {
    return this.interactive
      ? 'transition-transform hover:scale-110 cursor-pointer focus:outline-none'
      : 'cursor-default';
  }

  setRating(star: number): void {
    this.ratingChange.emit(star);
  }

  setHover(star: number): void {
    this.hoveredRating = star;
  }
}