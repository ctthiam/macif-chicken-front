// ============================================================
// Fichier : src/app/shared/pipes/relative-time.pipe.ts
// Usage   : {{ commande.created_at | relativeTime }}  →  "il y a 3 heures"
// ============================================================
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'relativeTime', standalone: true })
export class RelativeTimePipe implements PipeTransform {
  transform(value: string | Date | null): string {
    if (!value) return '—';

    const date  = new Date(value);
    const now   = new Date();
    const diffS = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffS < 60)         return 'À l\'instant';
    if (diffS < 3600)       return `Il y a ${Math.floor(diffS / 60)} min`;
    if (diffS < 86400)      return `Il y a ${Math.floor(diffS / 3600)} h`;
    if (diffS < 604800)     return `Il y a ${Math.floor(diffS / 86400)} j`;
    if (diffS < 2592000)    return `Il y a ${Math.floor(diffS / 604800)} sem.`;

    return date.toLocaleDateString('fr-SN', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}