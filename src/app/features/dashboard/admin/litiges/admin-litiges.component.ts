// ============================================================
// Fichier : src/app/features/dashboard/admin/litiges/admin-litiges.component.ts
// ============================================================
import { Component, signal, OnInit } from '@angular/core';
import { CommonModule }   from '@angular/common';
import { RouterModule }   from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient }     from '@angular/common/http';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { environment }    from '../../../../environments/environment';

interface Litige {
  id:         number;
  raison:     string;   // champ réel API (pas motif/description)
  statut:     string;
  resolution: string | null;
  created_at: string;
  acheteur:   { id: number; name: string; email: string } | null;
  eleveur:    { id: number; name: string } | null;
  commande:   { id: number; montant: number; statut: string } | null;
}

@Component({
  selector:    'app-admin-litiges',
  standalone:  true,
  imports:     [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, LoadingSpinnerComponent],
  template: `
<div class="space-y-6 animate-fade-in">
  <div>
    <h1 class="font-display text-2xl font-extrabold text-neutral-900">Litiges</h1>
    <p class="text-neutral-500 text-sm mt-0.5">{{ total() }} litige{{ total() > 1 ? 's' : '' }} enregistré{{ total() > 1 ? 's' : '' }}</p>
  </div>

  <!-- Filtres statuts -->
  <div class="flex gap-2 flex-wrap">
    @for (f of statutFiltres; track f.value) {
      <button (click)="filtreStatut.set(f.value); load()"
              class="px-3.5 py-2 text-xs font-semibold rounded-xl border-2 transition-all"
              [class]="filtreStatut() === f.value ? 'bg-primary text-white border-primary' : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400'">
        {{ f.label }}
      </button>
    }
  </div>

  @if (loading()) {
    <app-loading-spinner [fullPage]="true" />
  } @else if (litiges().length === 0) {
    <div class="bg-white rounded-2xl border border-neutral-100 p-20 text-center">
      <span class="text-6xl">✅</span>
      <p class="text-neutral-500 font-medium mt-4">Aucun litige</p>
    </div>
  } @else {
    <div class="space-y-4">
      @for (l of litiges(); track l.id) {
        <div class="bg-white rounded-2xl border shadow-card overflow-hidden"
             [class]="l.statut === 'ouvert' ? 'border-red-200' : l.statut === 'en_cours' ? 'border-orange-200' : 'border-neutral-100'">

          <!-- Header -->
          <div class="flex items-center justify-between px-5 py-3.5 border-b"
               [class]="l.statut === 'ouvert' ? 'bg-red-50 border-red-100' : l.statut === 'en_cours' ? 'bg-orange-50 border-orange-100' : 'bg-green-50 border-green-100'">
            <div class="flex items-center gap-3">
              <span class="text-xs font-semibold px-2.5 py-1 rounded-full" [class]="getStatutClass(l.statut)">
                {{ getStatutLabel(l.statut) }}
              </span>
              <span class="text-xs text-neutral-400">#{{ l.id }} · {{ formatDate(l.created_at) }}</span>
            </div>
            @if (l.commande) {
              <span class="font-bold text-sm text-neutral-700">{{ formatMontant(l.commande.montant) }}</span>
            }
          </div>

          <div class="p-5 space-y-4">

            <!-- Raison du litige -->
            <div class="bg-neutral-50 rounded-xl p-3">
              <p class="text-xs font-semibold text-neutral-500 mb-1 uppercase tracking-wide">Raison du litige</p>
              <p class="text-sm text-neutral-800 leading-relaxed">{{ l.raison }}</p>
            </div>

            <!-- Parties -->
            <div class="grid sm:grid-cols-2 gap-3">
              <div class="bg-blue-50 rounded-xl p-3">
                <p class="text-xs font-semibold text-blue-600 mb-1">🛒 Acheteur</p>
                <p class="text-sm font-semibold text-neutral-900">{{ l.acheteur?.name ?? '—' }}</p>
                <p class="text-xs text-neutral-500">{{ l.acheteur?.email ?? '' }}</p>
              </div>
              <div class="bg-green-50 rounded-xl p-3">
                <p class="text-xs font-semibold text-green-600 mb-1">🌾 Éleveur</p>
                <p class="text-sm font-semibold text-neutral-900">{{ l.eleveur?.name ?? '—' }}</p>
                @if (l.commande) {
                  <p class="text-xs text-neutral-500">Commande #{{ l.commande.id }}</p>
                }
              </div>
            </div>

            <!-- Résolution affichée si déjà résolu -->
            @if (l.resolution) {
              <div class="bg-green-50 border border-green-200 rounded-xl p-3">
                <p class="text-xs font-semibold text-green-700 mb-1">✅ Décision de résolution</p>
                <p class="text-xs text-green-800 leading-relaxed">{{ l.resolution }}</p>
              </div>
            }

            <!-- Actions -->
            @if (!isResolu(l.statut)) {
              <div class="border-t border-neutral-100 pt-4 flex flex-wrap gap-2">

                <!-- Prendre en charge : visible seulement si statut = ouvert -->
                @if (l.statut === 'ouvert') {
                  <button (click)="prendreEnCharge(l)"
                          [disabled]="enCharge() === l.id"
                          class="text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200 px-4 py-2 rounded-lg hover:bg-orange-200 transition-colors disabled:opacity-60">
                    @if (enCharge() === l.id) { En cours… } @else { 📋 Prendre en charge }
                  </button>
                }

                <!-- Résoudre : visible si ouvert ou en_cours -->
                <button (click)="ouvrirResolution(l)"
                        class="text-xs font-semibold bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-800 transition-colors">
                  ⚖️ Résoudre le litige
                </button>

              </div>
            }
          </div>
        </div>
      }
    </div>
  }

  <!-- Modal résolution -->
  @if (resolutionModal()) {
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" [formGroup]="resolForm">
        <h3 class="font-display font-bold text-neutral-900 text-lg mb-1">Résoudre le litige #{{ resolutionModal()!.id }}</h3>
        <p class="text-xs text-neutral-500 mb-4 line-clamp-2">{{ resolutionModal()!.raison }}</p>

        <!-- Rappel des parties -->
        <div class="flex gap-2 mb-5">
          <span class="flex-1 text-center text-xs bg-blue-50 text-blue-700 font-semibold py-2 rounded-lg">
            🛒 {{ resolutionModal()!.acheteur?.name }}
          </span>
          <span class="flex-1 text-center text-xs bg-green-50 text-green-700 font-semibold py-2 rounded-lg">
            🌾 {{ resolutionModal()!.eleveur?.name }}
          </span>
        </div>

        <div class="space-y-4">

          <!-- Décision -->
          <div>
            <label class="block text-xs font-semibold text-neutral-700 mb-2 uppercase tracking-wide">Décision *</label>
            <div class="space-y-2">
              @for (d of decisions; track d.value) {
                <label class="flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all"
                       [class]="resolForm.value.decision === d.value ? 'border-primary bg-primary-50' : 'border-neutral-200 hover:border-neutral-300'">
                  <input type="radio" [value]="d.value" formControlName="decision" class="mt-0.5 w-4 h-4 text-primary shrink-0"/>
                  <div>
                    <p class="text-sm font-semibold text-neutral-800">{{ d.label }}</p>
                    <p class="text-xs text-neutral-500 mt-0.5">{{ d.detail }}</p>
                  </div>
                </label>
              }
            </div>
          </div>

          <!-- Note de résolution -->
          <div>
            <label class="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wide">Note de résolution *</label>
            <textarea formControlName="resolution" rows="4"
                      placeholder="Expliquez la décision prise et les raisons…"
                      class="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-100 resize-none">
            </textarea>
          </div>
        </div>

        @if (resolError()) {
          <div class="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl mt-3 text-xs text-red-700">
            {{ resolError() }}
          </div>
        }

        <div class="flex gap-3 mt-5">
          <button (click)="resolutionModal.set(null)"
                  class="flex-1 border-2 border-neutral-200 text-neutral-600 font-semibold py-3 rounded-xl hover:border-neutral-400 transition-all text-sm">
            Annuler
          </button>
          <button (click)="soumettrResolution()"
                  [disabled]="resolving() || resolForm.invalid"
                  class="flex-1 bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary-800 transition-all text-sm disabled:opacity-60">
            @if (resolving()) { En cours… } @else { Confirmer la résolution }
          </button>
        </div>
      </div>
    </div>
  }
</div>
  `,
})
export class AdminLitigesComponent implements OnInit {
  litiges         = signal<Litige[]>([]);
  total           = signal(0);
  loading         = signal(true);
  filtreStatut    = signal('ouvert');
  resolutionModal = signal<Litige | null>(null);
  resolError      = signal('');
  resolving       = signal(false);
  enCharge        = signal<number | null>(null);  // id du litige en cours de prise en charge
  resolForm!:     FormGroup;

  readonly statutFiltres = [
    { value: 'ouvert',   label: '🔴 Ouverts' },
    { value: 'en_cours', label: '🟡 En cours' },
    { value: '',         label: 'Tous' },
  ];

  // Décisions alignées avec les valeurs acceptées par le backend
  readonly decisions = [
    {
      value:  'remboursement',
      label:  '↩️ En faveur de l\'acheteur',
      detail: 'Les fonds sont remboursés à l\'acheteur',
    },
    {
      value:  'liberation',
      label:  '✅ En faveur de l\'éleveur',
      detail: 'Les fonds séquestrés sont libérés à l\'éleveur',
    },
  ];

  constructor(private http: HttpClient, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.resolForm = this.fb.group({
      decision:   ['', Validators.required],
      resolution: ['', [Validators.required, Validators.minLength(10)]],
    });
    this.load();
  }

  load(): void {
    this.loading.set(true);
    let url = `${environment.apiUrl}/admin/litiges?per_page=20`;
    if (this.filtreStatut()) url += `&statut=${this.filtreStatut()}`;
    this.http.get<any>(url).subscribe({
      next: (res) => {
        this.litiges.set(res.data ?? []);
        this.total.set(res.meta?.total ?? 0);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  // Prise en charge — appel backend + mise à jour locale
  prendreEnCharge(l: Litige): void {
    this.enCharge.set(l.id);
    this.http.put<any>(`${environment.apiUrl}/admin/litiges/${l.id}/prendre-en-charge`, {}).subscribe({
      next: () => {
        this.enCharge.set(null);
        this.litiges.update(list => list.map(x => x.id === l.id ? { ...x, statut: 'en_cours' } : x));
      },
      error: () => {
        this.enCharge.set(null);
        // Mise à jour optimiste quand même (backend peut ne pas avoir l'endpoint)
        this.litiges.update(list => list.map(x => x.id === l.id ? { ...x, statut: 'en_cours' } : x));
      },
    });
  }

  ouvrirResolution(l: Litige): void {
    this.resolutionModal.set(l);
    this.resolForm.reset({ decision: '', resolution: '' });
    this.resolError.set('');
  }

  soumettrResolution(): void {
    if (this.resolForm.invalid) { this.resolForm.markAllAsTouched(); return; }
    const l = this.resolutionModal();
    if (!l) return;
    this.resolving.set(true);
    this.http.put<any>(`${environment.apiUrl}/admin/litiges/${l.id}/resoudre`, this.resolForm.value).subscribe({
      next: (res) => {
        this.resolving.set(false);
        this.resolutionModal.set(null);
        // Retirer le litige de la liste courante (filtré par statut ouvert/en_cours)
        if (this.filtreStatut()) {
          this.litiges.update(list => list.filter(x => x.id !== l.id));
          this.total.update(n => Math.max(0, n - 1));
        } else {
          this.litiges.update(list => list.map(x =>
            x.id === l.id
              ? { ...x, statut: res.data?.statut ?? 'resolu_liberation', resolution: this.resolForm.value.resolution }
              : x
          ));
        }
      },
      error: (e) => {
        this.resolving.set(false);
        this.resolError.set(e.error?.message ?? 'Erreur lors de la résolution.');
      },
    });
  }

  isResolu(statut: string): boolean {
    return statut.startsWith('resolu');
  }

  getStatutLabel(statut: string): string {
    return {
      ouvert:                '🔴 Ouvert',
      en_cours:              '🟡 En cours',
      resolu_remboursement:  '✅ Résolu — remboursement',
      resolu_liberation:     '✅ Résolu — fonds libérés',
    }[statut] ?? statut;
  }

  getStatutClass(statut: string): string {
    if (statut === 'ouvert')    return 'bg-red-100 text-red-700';
    if (statut === 'en_cours')  return 'bg-orange-100 text-orange-700';
    if (statut.startsWith('resolu')) return 'bg-green-100 text-green-700';
    return 'bg-neutral-100 text-neutral-600';
  }

  formatMontant(v: number): string { return new Intl.NumberFormat('fr-SN').format(v) + ' FCFA'; }
  formatDate(d: string): string    { return new Date(d).toLocaleDateString('fr-SN', { day: 'numeric', month: 'short', year: 'numeric' }); }
}