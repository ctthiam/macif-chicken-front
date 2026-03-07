// ============================================================
// Fichier : src/app/features/dashboard/eleveur/profil/eleveur-profil.component.ts
// ============================================================
import { Component, signal, OnInit } from '@angular/core';
import { CommonModule }   from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient }     from '@angular/common/http';
import { AuthService }    from '../../../../core/services/auth.service';
import { environment }    from '../../../../environments/environment';

@Component({
  selector:   'app-eleveur-profil',
  standalone: true,
  imports:    [CommonModule, ReactiveFormsModule],
  template: `
<div class="space-y-6 animate-fade-in max-w-2xl">

  <div>
    <h1 class="font-display text-2xl font-extrabold text-neutral-900">Mon profil</h1>
    <p class="text-neutral-500 text-sm mt-0.5">Gérez vos informations personnelles et votre poulailler</p>
  </div>

  <!-- Avatar + nom -->
  <div class="bg-white rounded-2xl border border-neutral-100 shadow-card p-6">
    <div class="flex items-center gap-5">
      <div class="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shrink-0 shadow-md">
        <span class="text-3xl font-extrabold text-white">{{ initiale }}</span>
      </div>
      <div>
        <h2 class="font-display font-bold text-neutral-900 text-xl">{{ auth.user()?.name }}</h2>
        <p class="text-sm text-neutral-500">{{ auth.user()?.email }}</p>
        <span class="inline-flex items-center gap-1.5 mt-2 bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
          🌾 Éleveur
        </span>
      </div>
    </div>
  </div>

  <!-- Informations personnelles -->
  <div class="bg-white rounded-2xl border border-neutral-100 shadow-card p-6" [formGroup]="form">
    <h3 class="font-display font-bold text-neutral-900 mb-5">Informations personnelles</h3>
    <div class="space-y-4">
      <div class="grid sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wide">Nom complet *</label>
          <input type="text" formControlName="name"
                 class="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-100 transition-all"
                 [class.border-red-400]="form.get('name')?.invalid && form.get('name')?.touched"/>
        </div>
        <div>
          <label class="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wide">Téléphone</label>
          <input type="tel" formControlName="phone"
                 class="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-100 transition-all"/>
        </div>
      </div>
      <div>
        <label class="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wide">Adresse</label>
        <input type="text" formControlName="adresse"
               class="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-100 transition-all"/>
      </div>
    </div>
  </div>

  <!-- Infos poulailler -->
  <div class="bg-white rounded-2xl border border-neutral-100 shadow-card p-6" [formGroup]="poulaillerForm">
    <h3 class="font-display font-bold text-neutral-900 mb-5">Mon poulailler</h3>
    <div class="space-y-4">
      <div>
        <label class="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wide">Nom du poulailler *</label>
        <input type="text" formControlName="nom_poulailler"
               class="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-100 transition-all"/>
      </div>
      <div>
        <label class="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wide">Localisation</label>
        <input type="text" formControlName="localisation" placeholder="ex: Thiès, Sénégal"
               class="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-100 transition-all"/>
      </div>
      <div>
        <label class="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wide">Description</label>
        <textarea formControlName="description" rows="3" placeholder="Décrivez votre exploitation..."
                  class="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-100 transition-all resize-none"></textarea>
      </div>
    </div>
  </div>

  <!-- Toast -->
  @if (toast()) {
    <div class="fixed bottom-6 right-6 z-50 bg-green-600 text-white font-semibold px-5 py-3 rounded-2xl shadow-xl animate-fade-in flex items-center gap-2">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
      </svg>
      Profil mis à jour
    </div>
  }

  <!-- Bouton sauvegarde -->
  <div class="flex justify-end gap-3">
    <button (click)="save()" [disabled]="saving()"
            class="inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-800 disabled:opacity-50 transition-all shadow-md text-sm">
      @if (saving()) {
        <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        Sauvegarde…
      } @else {
        Enregistrer les modifications
      }
    </button>
  </div>

</div>
`,
})
export class EleveurProfilComponent implements OnInit {
  form:          FormGroup;
  poulaillerForm: FormGroup;
  saving = signal(false);
  toast  = signal(false);

  get initiale(): string {
    return (this.auth.user()?.name ?? 'E')[0].toUpperCase();
  }

  constructor(
    private fb:   FormBuilder,
    private http: HttpClient,
    public  auth: AuthService,
  ) {
    this.form = this.fb.group({
      name:    ['', Validators.required],
      phone:   [''],
      adresse: [''],
    });
    this.poulaillerForm = this.fb.group({
      nom_poulailler: ['', Validators.required],
      localisation:   [''],
      description:    [''],
    });
  }

  ngOnInit(): void {
    const u = this.auth.user();
    if (u) {
      this.form.patchValue({ name: u.name, phone: u.phone ?? '', adresse: u.adresse ?? '' });
    }
    this.http.get<any>(`${environment.apiUrl}/eleveur/profile`).subscribe({
      next: (res) => {
        const p = res.data ?? res;
        this.poulaillerForm.patchValue({
          nom_poulailler: p.nom_poulailler ?? '',
          localisation:   p.localisation   ?? '',
          description:    p.description    ?? '',
        });
      },
    });
  }

  save(): void {
    if (this.saving()) return;
    this.saving.set(true);
    const payload = { ...this.form.value, ...this.poulaillerForm.value };
    this.http.put(`${environment.apiUrl}/eleveur/profile`, payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.set(true);
        setTimeout(() => this.toast.set(false), 3000);
      },
      error: () => this.saving.set(false),
    });
  }
}