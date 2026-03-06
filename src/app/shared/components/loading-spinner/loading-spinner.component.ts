// ============================================================
// Fichier : src/app/shared/components/loading-spinner/loading-spinner.component.ts
// Usage   : <app-loading-spinner />
//           <app-loading-spinner size="lg" color="white" text="Chargement..." />
//           <app-loading-spinner [overlay]="true" />
// ============================================================
import { Component, Input } from '@angular/core';
import { CommonModule }     from '@angular/common';

@Component({
  selector:   'app-loading-spinner',
  standalone: true,
  imports:    [CommonModule],
  template: `
    <!-- Overlay plein écran -->
    @if (overlay) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <ng-container *ngTemplateOutlet="spinner" />
      </div>
    } @else if (fullPage) {
      <!-- Pleine page (dans un conteneur) -->
      <div class="flex flex-col items-center justify-center py-20">
        <ng-container *ngTemplateOutlet="spinner" />
      </div>
    } @else {
      <!-- Inline -->
      <ng-container *ngTemplateOutlet="spinner" />
    }

    <ng-template #spinner>
      <div class="flex flex-col items-center gap-3">
        <!-- Cercle animé -->
        <div [class]="spinnerClasses" role="status" [attr.aria-label]="text || 'Chargement'">
          <svg [class]="svgClasses" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
            </path>
          </svg>
        </div>
        <!-- Texte optionnel -->
        @if (text) {
          <p [class]="textClasses">{{ text }}</p>
        }
      </div>
    </ng-template>
  `,
})
export class LoadingSpinnerComponent {
  @Input() size:     'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() color:    'primary' | 'white' | 'gray'      = 'primary';
  @Input() text:     string  = '';
  @Input() overlay:  boolean = false;
  @Input() fullPage: boolean = false;

  get spinnerClasses(): string {
    return 'animate-spin';
  }

  get svgClasses(): string {
    const sizes = {
      xs: 'w-4 h-4', sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12', xl: 'w-16 h-16',
    };
    const colors = {
      primary: 'text-primary',
      white:   'text-white',
      gray:    'text-neutral-400',
    };
    return `${sizes[this.size]} ${colors[this.color]}`;
  }

  get textClasses(): string {
    const colors = {
      primary: 'text-neutral-600',
      white:   'text-white',
      gray:    'text-neutral-400',
    };
    return `text-sm font-medium ${colors[this.color]}`;
  }
}