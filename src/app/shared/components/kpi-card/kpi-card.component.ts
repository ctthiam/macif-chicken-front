// ============================================================
// Fichier : src/app/shared/components/kpi-card/kpi-card.component.ts
// Usage   : <app-kpi-card title="Commandes" value="124" icon="shopping-cart"
//                         color="blue" trend="+12%" trendUp="true" />
// ============================================================
import { Component, Input } from '@angular/core';
import { CommonModule }     from '@angular/common';

type KpiColor = 'green' | 'orange' | 'blue' | 'purple' | 'red' | 'yellow';

@Component({
  selector:   'app-kpi-card',
  standalone: true,
  imports:    [CommonModule],
  template: `
    <div class="bg-white rounded-xl shadow-card border border-neutral-100 p-6 flex items-start gap-4 transition-all duration-200 hover:shadow-card-hover">

      <!-- Icône -->
      <div [class]="iconBgClass" class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
        <span [class]="iconColorClass" class="text-xl">{{ icon }}</span>
      </div>

      <!-- Contenu -->
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-neutral-500 truncate">{{ title }}</p>
        <div class="flex items-end gap-2 mt-1">
          <p class="text-2xl font-bold text-neutral-900 leading-none">{{ value }}</p>
          @if (unit) {
            <span class="text-sm text-neutral-500 mb-0.5">{{ unit }}</span>
          }
        </div>

        <!-- Tendance -->
        @if (trend) {
          <div class="flex items-center gap-1 mt-2">
            <span [class]="trendClasses" class="inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full">
              @if (trendUp) {
                <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M7 17l9.2-9.2M17 17V7H7"/>
                </svg>
              } @else {
                <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17 7l-9.2 9.2M7 7v10h10"/>
                </svg>
              }
              {{ trend }}
            </span>
            @if (trendLabel) {
              <span class="text-xs text-neutral-400">{{ trendLabel }}</span>
            }
          </div>
        }

        <!-- Sous-texte -->
        @if (subtitle) {
          <p class="text-xs text-neutral-400 mt-1">{{ subtitle }}</p>
        }
      </div>
    </div>
  `,
})
export class KpiCardComponent {
  @Input() title!:      string;
  @Input() value!:      string | number;
  @Input() icon:        string = '📊';
  @Input() color:       KpiColor = 'green';
  @Input() unit:        string = '';
  @Input() trend:       string = '';
  @Input() trendUp:     boolean = true;
  @Input() trendLabel:  string = 'vs mois dernier';
  @Input() subtitle:    string = '';
  @Input() loading:     boolean = false;

  private readonly bgMap: Record<KpiColor, string> = {
    green:  'bg-green-100',
    orange: 'bg-orange-100',
    blue:   'bg-blue-100',
    purple: 'bg-purple-100',
    red:    'bg-red-100',
    yellow: 'bg-yellow-100',
  };

  private readonly colorMap: Record<KpiColor, string> = {
    green:  'text-green-700',
    orange: 'text-orange-700',
    blue:   'text-blue-700',
    purple: 'text-purple-700',
    red:    'text-red-700',
    yellow: 'text-yellow-700',
  };

  get iconBgClass():    string { return this.bgMap[this.color]; }
  get iconColorClass(): string { return this.colorMap[this.color]; }

  get trendClasses(): string {
    return this.trendUp
      ? 'bg-green-100 text-green-700'
      : 'bg-red-100 text-red-700';
  }
}