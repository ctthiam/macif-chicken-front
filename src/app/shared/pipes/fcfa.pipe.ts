// ============================================================
// Fichier : src/app/shared/pipes/fcfa.pipe.ts
// Usage   : {{ 15000 | fcfa }}  →  "15 000 FCFA"
// ============================================================
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'fcfa', standalone: true })
export class FcfaPipe implements PipeTransform {
  transform(value: number | null | undefined, showCurrency = true): string {
    if (value === null || value === undefined) return '—';
    const formatted = new Intl.NumberFormat('fr-SN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
    return showCurrency ? `${formatted} FCFA` : formatted;
  }
}