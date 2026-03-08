// ============================================================
// Fichier : src/app/features/dashboard/admin/parametres/admin-parametres.component.ts
// ============================================================
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector:   'app-admin-parametres',
  standalone: true,
  imports:    [CommonModule],
  template: `
<div class="space-y-6 animate-fade-in">
  <div>
    <h1 class="font-display text-2xl font-extrabold text-neutral-900">Paramètres</h1>
    <p class="text-neutral-500 text-sm mt-0.5">Configuration de la plateforme MACIF CHICKEN.</p>
  </div>

  <div class="bg-white rounded-2xl border border-neutral-100 shadow-sm p-8 text-center">
    <span class="text-5xl">⚙️</span>
    <h3 class="font-display font-bold text-neutral-900 text-xl mt-4 mb-2">Paramètres système</h3>
    <p class="text-neutral-500 text-sm">Cette section sera disponible dans une prochaine version.</p>
  </div>
</div>
  `,
})
export class AdminParametresComponent {}