// ============================================================
// Fichier : src/app/features/public/tarifs/tarifs.component.ts
// ============================================================
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule }  from '@angular/router';

@Component({
  selector:   'app-tarifs',
  standalone: true,
  imports:    [CommonModule, RouterModule],
  template: `
<div class="min-h-screen bg-neutral-50">

  <!-- Hero -->
  <section class="bg-white border-b border-neutral-100 py-14 px-4 text-center">
    <h1 class="font-display text-3xl sm:text-4xl font-extrabold text-neutral-900 mb-3">
      Tarifs simples et transparents
    </h1>
    <p class="text-neutral-500 text-lg max-w-xl mx-auto">
      Choisissez le plan adapté à votre activité d'élevage. Sans engagement, résiliable à tout moment.
    </p>
  </section>

  <!-- Plans -->
  <section class="max-w-5xl mx-auto px-4 py-14">
    <div class="grid sm:grid-cols-3 gap-6 items-stretch">

      @for (plan of plans; track plan.nom) {
        <div class="relative bg-white rounded-3xl border-2 shadow-card flex flex-col"
             [class]="plan.highlight
               ? 'border-primary shadow-xl scale-[1.03]'
               : 'border-neutral-100 hover:border-neutral-200 transition-all'">

          @if (plan.highlight) {
            <div class="absolute -top-4 left-1/2 -translate-x-1/2">
              <span class="bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
                ⭐ Recommandé
              </span>
            </div>
          }

          <div class="p-8 flex-1">
            <!-- Emoji + nom -->
            <div class="text-4xl mb-3">{{ plan.emoji }}</div>
            <h2 class="font-display font-extrabold text-2xl text-neutral-900 capitalize">{{ plan.nom }}</h2>

            <!-- Prix -->
            <div class="mt-4 mb-6">
              @if (plan.prix === 0) {
                <span class="text-4xl font-extrabold text-neutral-900">Gratuit</span>
              } @else {
                <span class="text-4xl font-extrabold" [class]="plan.highlight ? 'text-primary' : 'text-neutral-900'">
                  {{ plan.prix.toLocaleString() }}
                </span>
                <span class="text-neutral-400 text-sm ml-1">FCFA / mois</span>
              }
            </div>

            <!-- Features -->
            <ul class="space-y-3">
              @for (f of plan.features; track f.label) {
                <li class="flex items-start gap-3 text-sm">
                  <span class="shrink-0 mt-0.5">{{ f.ok ? '✅' : '❌' }}</span>
                  <span [class]="f.ok ? 'text-neutral-800' : 'text-neutral-400'">{{ f.label }}</span>
                </li>
              }
            </ul>
          </div>

          <!-- CTA -->
          <div class="p-8 pt-0">
            <a routerLink="/auth/register"
               class="block w-full text-center py-3 rounded-xl text-sm font-bold transition-all"
               [class]="plan.highlight
                 ? 'bg-primary text-white hover:bg-primary-800 shadow-md'
                 : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'">
              {{ plan.cta }}
            </a>
          </div>
        </div>
      }

    </div>
  </section>

  <!-- Commission acheteur -->
  <section class="max-w-3xl mx-auto px-4 pb-14">
    <div class="bg-white rounded-2xl border border-neutral-100 shadow-card p-8 text-center">
      <h2 class="font-display font-bold text-xl text-neutral-900 mb-3">Pour les acheteurs</h2>
      <p class="text-neutral-600 mb-2">
        L'accès à la plateforme est <strong>totalement gratuit</strong> pour les acheteurs.
        Une commission de <strong class="text-primary">7%</strong> est prélevée sur chaque commande pour financer la plateforme.
      </p>
      <p class="text-sm text-neutral-400">
        L'éleveur reçoit <strong>93%</strong> du montant de la commande. Le paiement est sécurisé et libéré après confirmation de livraison.
      </p>
      <a routerLink="/auth/register"
         class="inline-block mt-5 bg-accent text-white font-bold px-7 py-3 rounded-xl hover:opacity-90 transition-all shadow-md text-sm">
        Créer un compte acheteur gratuit
      </a>
    </div>
  </section>

  <!-- FAQ rapide -->
  <section class="max-w-3xl mx-auto px-4 pb-16">
    <h2 class="font-display font-bold text-2xl text-neutral-900 mb-6 text-center">Questions fréquentes</h2>
    <div class="space-y-4">
      @for (faq of faqs; track faq.q) {
        <div class="bg-white rounded-2xl border border-neutral-100 shadow-card p-5">
          <h3 class="font-semibold text-neutral-900 text-sm mb-1">{{ faq.q }}</h3>
          <p class="text-neutral-500 text-sm">{{ faq.r }}</p>
        </div>
      }
    </div>
  </section>

</div>
`,
})
export class TarifsComponent {
  readonly plans = [
    {
      nom:       'Starter',
      emoji:     '🐣',
      prix:      5000,
      highlight: false,
      cta:       'Commencer gratuitement',
      features:  [
        { label: '3 annonces actives max',       ok: true  },
        { label: 'Accès aux commandes',          ok: true  },
        { label: 'Support email',                ok: true  },
        { label: 'Photos HD (5/annonce)',        ok: false },
        { label: 'Badge Éleveur Pro',            ok: false },
        { label: 'Mise en avant recherche',      ok: false },
      ],
    },
    {
      nom:       'Pro',
      emoji:     '🐔',
      prix:      15000,
      highlight: true,
      cta:       'Choisir Pro',
      features:  [
        { label: '10 annonces actives max',      ok: true  },
        { label: 'Accès aux commandes',          ok: true  },
        { label: 'Support prioritaire',          ok: true  },
        { label: 'Photos HD (5/annonce)',        ok: true  },
        { label: 'Badge Éleveur Pro',            ok: true  },
        { label: 'Mise en avant recherche',      ok: false },
      ],
    },
    {
      nom:       'Premium',
      emoji:     '🏆',
      prix:      30000,
      highlight: false,
      cta:       'Choisir Premium',
      features:  [
        { label: 'Annonces illimitées',          ok: true  },
        { label: 'Accès aux commandes',          ok: true  },
        { label: 'Support dédié 24/7',           ok: true  },
        { label: 'Photos HD (5/annonce)',        ok: true  },
        { label: 'Badge Premium',                ok: true  },
        { label: 'Mise en avant recherche',      ok: true  },
      ],
    },
  ];

  readonly faqs = [
    {
      q: 'Puis-je changer de plan à tout moment ?',
      r: 'Oui, vous pouvez upgrader ou downgrader votre plan depuis votre espace. Le changement prend effet immédiatement.',
    },
    {
      q: 'Comment fonctionne le paiement sécurisé ?',
      r: 'L\'acheteur paie via Wave, Orange Money ou Free Money. Le montant est conservé en escrow et libéré à l\'éleveur après confirmation de la livraison.',
    },
    {
      q: 'Que se passe-t-il si mon abonnement expire ?',
      r: 'Vos annonces passent automatiquement en statut "expiré" et ne sont plus visibles. Elles sont réactivées dès que vous renouvelez votre abonnement.',
    },
    {
      q: 'L\'inscription est-elle gratuite ?',
      r: 'L\'inscription est gratuite pour tout le monde. Le plan Starter vous permet de commencer à publier dès votre premier abonnement.',
    },
  ];
}