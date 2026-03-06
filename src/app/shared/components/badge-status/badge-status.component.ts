// ============================================================
// Fichier : src/app/shared/components/badge-status/badge-status.component.ts
// Usage   : <app-badge-status status="livree" />
//           <app-badge-status status="disponible" type="stock" />
// ============================================================
import { Component, Input } from '@angular/core';
import { CommonModule }     from '@angular/common';

export type CommandeStatus = 'confirmee' | 'en_preparation' | 'en_livraison' | 'livree' | 'annulee' | 'litige';
export type StockStatus    = 'disponible' | 'reserve' | 'epuise' | 'expire' | 'masque';
export type PaiementStatus = 'en_attente' | 'paye' | 'libere' | 'rembourse';
export type BadgeType      = 'commande' | 'stock' | 'paiement' | 'role' | 'abonnement';

interface BadgeConfig {
  label:   string;
  classes: string;
}

@Component({
  selector:   'app-badge-status',
  standalone: true,
  imports:    [CommonModule],
  template: `
    <span [class]="badgeClasses">
      @if (showDot) {
        <span class="w-1.5 h-1.5 rounded-full mr-1.5 inline-block" [class]="dotClass"></span>
      }
      {{ config.label }}
    </span>
  `,
})
export class BadgeStatusComponent {
  @Input() status!: string;
  @Input() type: BadgeType = 'commande';
  @Input() showDot = false;

  private readonly commandeMap: Record<string, BadgeConfig> = {
    confirmee:      { label: 'Confirmée',      classes: 'bg-blue-100 text-blue-800' },
    en_preparation: { label: 'En préparation', classes: 'bg-orange-100 text-orange-800' },
    en_livraison:   { label: 'En livraison',   classes: 'bg-purple-100 text-purple-800' },
    livree:         { label: 'Livrée',         classes: 'bg-green-100 text-green-800' },
    annulee:        { label: 'Annulée',        classes: 'bg-red-100 text-red-800' },
    litige:         { label: 'Litige',         classes: 'bg-red-200 text-red-900' },
  };

  private readonly stockMap: Record<string, BadgeConfig> = {
    disponible: { label: 'Disponible', classes: 'bg-green-100 text-green-800' },
    reserve:    { label: 'Réservé',    classes: 'bg-yellow-100 text-yellow-800' },
    epuise:     { label: 'Épuisé',     classes: 'bg-gray-100 text-gray-600' },
    expire:     { label: 'Expiré',     classes: 'bg-red-100 text-red-700' },
    masque:     { label: 'Masqué',     classes: 'bg-gray-200 text-gray-500' },
  };

  private readonly paiementMap: Record<string, BadgeConfig> = {
    en_attente: { label: 'En attente', classes: 'bg-yellow-100 text-yellow-800' },
    paye:       { label: 'Payé',       classes: 'bg-green-100 text-green-800' },
    libere:     { label: 'Libéré',     classes: 'bg-blue-100 text-blue-800' },
    rembourse:  { label: 'Remboursé',  classes: 'bg-purple-100 text-purple-800' },
  };

  private readonly roleMap: Record<string, BadgeConfig> = {
    admin:    { label: 'Admin',    classes: 'bg-red-100 text-red-800' },
    eleveur:  { label: 'Éleveur',  classes: 'bg-green-100 text-green-800' },
    acheteur: { label: 'Acheteur', classes: 'bg-blue-100 text-blue-800' },
  };

  private readonly abonnementMap: Record<string, BadgeConfig> = {
    starter:  { label: 'Starter',  classes: 'bg-gray-100 text-gray-700' },
    pro:      { label: 'Pro',      classes: 'bg-blue-100 text-blue-800' },
    premium:  { label: 'Premium',  classes: 'bg-yellow-100 text-yellow-800' },
    actif:    { label: 'Actif',    classes: 'bg-green-100 text-green-800' },
    expire:   { label: 'Expiré',   classes: 'bg-red-100 text-red-700' },
  };

  get config(): BadgeConfig {
    const map = this.type === 'stock'      ? this.stockMap
              : this.type === 'paiement'   ? this.paiementMap
              : this.type === 'role'       ? this.roleMap
              : this.type === 'abonnement' ? this.abonnementMap
              : this.commandeMap;

    return map[this.status] ?? { label: this.status, classes: 'bg-gray-100 text-gray-700' };
  }

  get badgeClasses(): string {
    return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${this.config.classes}`;
  }

  get dotClass(): string {
    return this.config.classes.replace('bg-', 'bg-').split(' ')[0].replace('100', '500').replace('200', '600');
  }
}