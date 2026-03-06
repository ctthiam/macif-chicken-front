// ============================================================
// Fichier : src/app/shared/index.ts
// Barrel file — importer depuis ce fichier unique
//
// Usage :
//   import { StockCardComponent, BadgeStatusComponent } from '../shared';
// ============================================================

// Composants
export { StockCardComponent }     from './components/stock-card/stock-card.component';
export { RatingStarsComponent }   from './components/rating-stars/rating-stars.component';
export { BadgeStatusComponent }   from './components/badge-status/badge-status.component';
export { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
export { KpiCardComponent }       from './components/kpi-card/kpi-card.component';

// Types
export type { Stock }             from './components/stock-card/stock-card.component';
export type { BadgeType, CommandeStatus, StockStatus, PaiementStatus } from './components/badge-status/badge-status.component';

// Pipes
export { FcfaPipe }               from './pipes/shared.pipes';
export { RelativeTimePipe }       from './pipes/shared.pipes';
export { TruncatePipe }           from './pipes/shared.pipes';