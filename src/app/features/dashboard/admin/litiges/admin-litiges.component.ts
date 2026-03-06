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
  id:          number;
  motif:       string;
  description: string;
  statut:      string;
  resolution:  string | null;
  created_at:  string;
  acheteur:    { id: number; name: string; email: string };
  eleveur:     { id: number; name: string; email: string };
  commande:    { id: number; montant: number };
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
             [class]="l.statut === 'ouvert' ? 'border-red-200' : 'border-neutral-100'">

          <!-- Header -->
          <div class="flex items-center justify-between px-5 py-3.5 border-b"
               [class]="l.statut === 'ouvert' ? 'bg-red-50 border-red-100' : 'bg-neutral-50 border-neutral-100'">
            <div class="flex items-center gap-3">
              <span class="text-xs font-semibold px-2.5 py-1 rounded-full"
                    [class]="getStatutClass(l.statut)">{{ l.statut }}</span>
              <span class="text-xs text-neutral-400">#{{ l.id }} · {{ formatDate(l.created_at) }}</span>
            </div>
            <span class="font-bold text-sm"
                  [class]="l.statut === 'ouvert' ? 'text-red-600' : 'text-neutral-600'">
              {{ formatMontant(l.commande.montant) }}
            </span>
          </div>

          <div class="p-5 space-y-4">
            <!-- Motif -->
            <div>
              <p class="text-sm font-bold text-neutral-900">{{ l.motif }}</p>
              <p class="text-xs text-neutral-600 mt-1 leading-relaxed">{{ l.description }}</p>
            </div>

            <!-- Parties -->
            <div class="grid sm:grid-cols-2 gap-3">
              <div class="bg-blue-50 rounded-xl p-3">
                <p class="text-xs font-semibold text-blue-600 mb-1">🛒 Acheteur</p>
                <p class="text-sm font-semibold text-neutral-900">{{ l.acheteur.name }}</p>
                <p class="text-xs text-neutral-500">{{ l.acheteur.email }}</p>
              </div>
              <div class="bg-green-50 rounded-xl p-3">
                <p class="text-xs font-semibold text-green-600 mb-1">🌾 Éleveur</p>
                <p class="text-sm font-semibold text-neutral-900">{{ l.eleveur.name }}</p>
                <p class="text-xs text-neutral-500">{{ l.eleveur.email }}</p>
              </div>
            </div>

            <!-- Résolution existante -->
            @if (l.resolution) {
              <div class="bg-green-50 border border-green-200 rounded-xl p-3">
                <p class="text-xs font-semibold text-green-700 mb-1">✅ Résolution</p>
                <p class="text-xs text-green-800">{{ l.resolution }}</p>
              </div>
            }

            <!-- Actions si ouvert -->
            @if (l.statut !== 'resolu') {
              <div class="border-t border-neutral-100 pt-4 flex flex-wrap gap-2">
                <button (click)="ouvrirResolution(l)"
                        class="text-xs font-semibold bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-800 transition-colors">
                  ⚖️ Résoudre le litige
                </button>
                @if (l.statut === 'ouvert') {
                  <button (click)="changerStatut(l, 'en_cours')"
                          class="text-xs font-semibold bg-orange-100 text-orange-700 px-4 py-2 rounded-lg hover:bg-orange-200 transition-colors">
                    Prendre en charge
                  </button>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>
  }

  <!-- Modal résolution -->
  @if (resolutionModal()) {
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" [formGroup]="resolForm">
        <h3 class="font-display font-bold text-neutral-900 text-lg mb-1">Résoudre le litige</h3>
        <p class="text-sm text-neutral-500 mb-5">{{ resolutionModal()!.motif }}</p>

        <div class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wide">Décision *</label>
            <div class="space-y-2">
              @for (d of decisions; track d.value) {
                <label class="flex items-center gap-2.5 cursor-pointer">
                  <input type="radio" [value]="d.value" formControlName="decision" class="w-4 h-4 text-primary"/>
                  <span class="text-sm text-neutral-700">{{ d.label }}</span>
                </label>
              }
            </div>
          </div>
          <div>
            <label class="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wide">Note de résolution *</label>
            <textarea formControlName="resolution" rows="4"
                      placeholder="Expliquez la décision prise…"
                      class="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-100 resize-none">
            </textarea>
          </div>
        </div>

        @if (resolError()) {
          <p class="text-xs text-red-600 mt-3">{{ resolError() }}</p>
        }

        <div class="flex gap-3 mt-5">
          <button (click)="resolutionModal.set(null)"
                  class="flex-1 border-2 border-neutral-200 text-neutral-600 font-semibold py-3 rounded-xl hover:border-neutral-400 transition-all text-sm">
            Annuler
          </button>
          <button (click)="soumettrResolution()" [disabled]="resolving()"
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
  litiges        = signal<Litige[]>([]);
  total          = signal(0);
  loading        = signal(true);
  filtreStatut   = signal('ouvert');
  resolutionModal = signal<Litige | null>(null);
  resolError     = signal('');
  resolving      = signal(false);
  resolForm!:    FormGroup;

  readonly statutFiltres = [
    { value: 'ouvert',   label: '🔴 Ouverts' },
    { value: 'en_cours', label: '🟡 En cours' },
    { value: 'resolu',   label: '🟢 Résolus' },
    { value: '',         label: 'Tous' },
  ];

  readonly decisions = [
    { value: 'faveur_acheteur', label: '🛒 En faveur de l\'acheteur (remboursement)' },
    { value: 'faveur_eleveur',  label: '🌾 En faveur de l\'éleveur (paiement libéré)' },
    { value: 'partage',         label: '⚖️ Partage équitable' },
  ];

  constructor(private http: HttpClient, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.resolForm = this.fb.group({
      decision:   ['', Validators.required],
      resolution: ['', Validators.required],
    });
    this.load();
  }

  load(): void {
    this.loading.set(true);
    let url = `${environment.apiUrl}/admin/litiges?per_page=20`;
    if (this.filtreStatut()) url += `&statut=${this.filtreStatut()}`;
    this.http.get<any>(url).subscribe({
      next: (res) => { this.litiges.set(res.data ?? []); this.total.set(res.meta?.total ?? 0); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  changerStatut(l: Litige, statut: string): void {
    this.http.put(`${environment.apiUrl}/admin/litiges/${l.id}/statut`, { statut }).subscribe({
      next: () => this.litiges.update(list => list.map(x => x.id === l.id ? { ...x, statut } : x)),
      error: () => {},
    });
  }

  ouvrirResolution(l: Litige): void {
    this.resolutionModal.set(l);
    this.resolForm.reset();
    this.resolError.set('');
  }

  soumettrResolution(): void {
    if (this.resolForm.invalid) { this.resolForm.markAllAsTouched(); return; }
    const l = this.resolutionModal();
    if (!l) return;
    this.resolving.set(true);
    this.http.post(`${environment.apiUrl}/admin/litiges/${l.id}/resoudre`, this.resolForm.value).subscribe({
      next: () => {
        this.resolving.set(false);
        this.resolutionModal.set(null);
        this.litiges.update(list => list.map(x => x.id === l.id ? { ...x, statut: 'resolu', resolution: this.resolForm.value.resolution } : x));
      },
      error: (e) => { this.resolving.set(false); this.resolError.set(e.error?.message ?? 'Erreur.'); },
    });
  }

  getStatutClass(statut: string): string {
    return { ouvert: 'bg-red-100 text-red-700', en_cours: 'bg-orange-100 text-orange-700', resolu: 'bg-green-100 text-green-700' }[statut] ?? 'bg-neutral-100 text-neutral-600';
  }

  formatMontant(v: number): string { return new Intl.NumberFormat('fr-SN').format(v) + ' FCFA'; }
  formatDate(d: string): string    { return new Date(d).toLocaleDateString('fr-SN', { day: 'numeric', month: 'short', year: 'numeric' }); }
}