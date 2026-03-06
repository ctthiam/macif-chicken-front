// ============================================================
// Fichier : src/app/shared/pipes/truncate.pipe.ts
// Usage   : {{ longText | truncate:80 }}
// ============================================================
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'truncate', standalone: true })
export class TruncatePipe implements PipeTransform {
  transform(value: string | null, limit = 100, trail = '…'): string {
    if (!value) return '';
    return value.length > limit ? value.slice(0, limit).trimEnd() + trail : value;
  }
}