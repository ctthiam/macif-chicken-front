// ============================================================
// Fichier : src/app/features/dashboard/eleveur/stocks/nouveau/eleveur-stock-nouveau.component.ts
// ============================================================
import { Component, signal, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CommonModule }   from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient }     from '@angular/common/http';
import { environment }    from '../../../../../environments/environment';

@Component({
  selector:   'app-eleveur-stock-nouveau',
  standalone: true,
  imports:    [CommonModule, ReactiveFormsModule],
  template: `
<div class="space-y-6 animate-fade-in max-w-3xl">

  <!-- Header -->
  <div class="flex items-center gap-4">
    <button (click)="router.navigate(['/eleveur/stocks'])"
            class="p-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-all">
      <svg class="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
      </svg>
    </button>
    <div>
      <h1 class="font-display text-2xl font-extrabold text-neutral-900">{{ editMode() ? "Modifier l'annonce" : "Publier un stock" }}</h1>
      <p class="text-neutral-500 text-sm mt-0.5">{{ editMode() ? "Modifiez les informations de votre annonce" : "Remplissez les informations de votre annonce" }}</p>
    </div>
  </div>

  <!-- Alerte abonnement -->
  @if (erreurAbonnement()) {
    <div class="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
      <svg class="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      </svg>
      <div>
        <p class="font-semibold text-amber-800 text-sm">Limite d'abonnement atteinte</p>
        <p class="text-amber-700 text-sm mt-0.5">{{ erreurAbonnement() }}</p>
        <button (click)="router.navigate(['/eleveur/abonnement'])"
                class="mt-2 text-xs font-bold text-amber-700 underline hover:text-amber-900">
          Gérer mon abonnement →
        </button>
      </div>
    </div>
  }

  <div class="bg-white rounded-2xl border border-neutral-100 shadow-card" [formGroup]="form">

    <!-- Section 1 : Infos générales -->
    <div class="p-6 border-b border-neutral-100">
      <h2 class="font-display font-bold text-neutral-900 mb-5">Informations générales</h2>
      <div class="space-y-5">

        <div>
          <label class="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wide">
            Titre de l'annonce *
          </label>
          <input type="text" formControlName="titre" placeholder="ex: Poulets fermiers bio de Thiès"
                 class="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-100 transition-all"
                 [class.border-red-400]="isInvalid('titre')"/>
          @if (isInvalid('titre')) {
            <p class="text-red-500 text-xs mt-1">Le titre est obligatoire (min. 3 caractères).</p>
          }
        </div>

        <div>
          <label class="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wide">
            Description *
          </label>
          <textarea formControlName="description" rows="4"
                    placeholder="Décrivez votre élevage, la race, les conditions d'élevage…"
                    class="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-100 transition-all resize-none"
                    [class.border-red-400]="isInvalid('description')"></textarea>
          @if (isInvalid('description')) {
            <p class="text-red-500 text-xs mt-1">Description obligatoire (min. 10 caractères).</p>
          }
        </div>

      </div>
    </div>

    <!-- Section 2 : Stock & Prix -->
    <div class="p-6 border-b border-neutral-100">
      <h2 class="font-display font-bold text-neutral-900 mb-5">Stock & Prix</h2>
      <div class="grid sm:grid-cols-2 gap-5">

        <div>
          <label class="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wide">
            Quantité disponible *
          </label>
          <input type="number" formControlName="quantite_disponible" min="1" placeholder="ex: 50"
                 class="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-100 transition-all"
                 [class.border-red-400]="isInvalid('quantite_disponible')"/>
          @if (isInvalid('quantite_disponible')) {
            <p class="text-red-500 text-xs mt-1">Quantité obligatoire (min. 1).</p>
          }
        </div>

        <div>
          <label class="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wide">
            Poids moyen (kg) *
          </label>
          <input type="number" formControlName="poids_moyen_kg" min="0.1" step="0.1" placeholder="ex: 2.5"
                 class="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-100 transition-all"
                 [class.border-red-400]="isInvalid('poids_moyen_kg')"/>
          @if (isInvalid('poids_moyen_kg')) {
            <p class="text-red-500 text-xs mt-1">Poids moyen obligatoire (min. 0.1 kg).</p>
          }
        </div>

        <div>
          <label class="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wide">
            Prix par kg (FCFA) *
          </label>
          <input type="number" formControlName="prix_par_kg" min="1" placeholder="ex: 2500"
                 class="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-100 transition-all"
                 [class.border-red-400]="isInvalid('prix_par_kg')"/>
          @if (isInvalid('prix_par_kg')) {
            <p class="text-red-500 text-xs mt-1">Prix par kg obligatoire.</p>
          }
        </div>

        <div>
          <label class="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wide">
            Prix par unité (FCFA) <span class="text-neutral-400 font-normal">— optionnel</span>
          </label>
          <input type="number" formControlName="prix_par_unite" min="1" placeholder="ex: 5000"
                 class="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-100 transition-all"/>
        </div>

        <div>
          <label class="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wide">
            Mode de vente *
          </label>
          <select formControlName="mode_vente"
                  class="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-100 transition-all bg-white"
                  [class.border-red-400]="isInvalid('mode_vente')">
            <option value="" disabled>Choisissez…</option>
            <option value="vivant">Vivant</option>
            <option value="abattu">Abattu</option>
            <option value="les_deux">Vivant & Abattu</option>
          </select>
          @if (isInvalid('mode_vente')) {
            <p class="text-red-500 text-xs mt-1">Mode de vente obligatoire.</p>
          }
        </div>

      </div>
    </div>

    <!-- Section 3 : Dates -->
    <div class="p-6 border-b border-neutral-100">
      <h2 class="font-display font-bold text-neutral-900 mb-5">Disponibilité</h2>
      <div class="grid sm:grid-cols-2 gap-5">

        <div>
          <label class="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wide">
            Date de disponibilité *
          </label>
          <input type="date" formControlName="date_disponibilite" [min]="today"
                 class="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-100 transition-all"
                 [class.border-red-400]="isInvalid('date_disponibilite')"/>
          @if (isInvalid('date_disponibilite')) {
            <p class="text-red-500 text-xs mt-1">Date de disponibilité obligatoire (aujourd'hui ou futur).</p>
          }
        </div>

        <div>
          <label class="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wide">
            Date de péremption <span class="text-neutral-400 font-normal">— optionnel</span>
          </label>
          <input type="date" formControlName="date_peremption_stock"
                 class="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-100 transition-all"/>
        </div>

      </div>
    </div>

    <!-- Section 4 : Photos -->
    <div class="p-6 border-b border-neutral-100">
      <h2 class="font-display font-bold text-neutral-900 mb-2">Photos <span class="text-neutral-400 font-normal text-sm">— max 5</span></h2>
      <p class="text-xs text-neutral-500 mb-4">JPEG, PNG ou WebP · Max 2 Mo par photo</p>

      <div class="flex flex-wrap gap-3">
        @for (preview of photoPreviews(); track $index) {
          <div class="relative w-24 h-24 rounded-xl overflow-hidden border border-neutral-200 group">
            <img [src]="preview" class="w-full h-full object-cover"/>
            <button type="button" (click)="removePhoto($index)"
                    class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        }

        @if (photoPreviews().length < 5) {
          <label class="w-24 h-24 rounded-xl border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary-50 transition-all">
            <svg class="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            <span class="text-xs text-neutral-400 mt-1">Ajouter</span>
            <input type="file" accept="image/*" multiple class="hidden" (change)="onPhotos($event)"/>
          </label>
        }
      </div>
    </div>

    <!-- Boutons -->
    <div class="p-6 flex items-center justify-between gap-4">
      <button type="button" (click)="router.navigate(['/eleveur/stocks'])"
              class="px-5 py-3 text-sm font-semibold text-neutral-600 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-all">
        Annuler
      </button>
      <button type="button" (click)="submit()" [disabled]="submitting()"
              class="inline-flex items-center gap-2 bg-primary text-white font-semibold px-7 py-3 rounded-xl hover:bg-primary-800 disabled:opacity-50 transition-all shadow-md text-sm">
        @if (submitting()) {
          <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          Publication…
        } @else {
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          {{ editMode() ? 'Enregistrer les modifications' : "Publier l'annonce" }}
        }
      </button>
    </div>

  </div>

  <!-- Erreurs API générales -->
  @if (erreurApi()) {
    <div class="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">
      {{ erreurApi() }}
    </div>
  }

</div>
`,
})
export class EleveurStockNouveauComponent implements OnInit {
  form:       FormGroup;
  submitting  = signal(false);
  erreurApi   = signal<string | null>(null);
  erreurAbonnement = signal<string | null>(null);
  photoPreviews = signal<SafeUrl[]>([]);
  photoFiles:   File[] = [];
  editMode    = signal(false);
  stockId     = signal<number | null>(null);
  loadingEdit = signal(false);

  readonly today = new Date().toISOString().split('T')[0];

  constructor(
    private fb:       FormBuilder,
    public  router:   Router,
    private http:     HttpClient,
    private route:    ActivatedRoute,
    private sanitizer: DomSanitizer,
  ) {
    this.form = this.fb.group({
      titre:               ['', [Validators.required, Validators.minLength(3)]],
      description:         ['', [Validators.required, Validators.minLength(10)]],
      quantite_disponible: [null, [Validators.required, Validators.min(1)]],
      poids_moyen_kg:      [null, [Validators.required, Validators.min(0.1)]],
      prix_par_kg:         [null, [Validators.required, Validators.min(1)]],
      prix_par_unite:      [null],
      mode_vente:          ['', Validators.required],
      date_disponibilite:  ['', Validators.required],
      date_peremption_stock: [null],
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editMode.set(true);
      this.stockId.set(+id);
      this.loadingEdit.set(true);
      this.http.get<any>(`${environment.apiUrl}/eleveur/stocks/${id}`).subscribe({
        next: (res) => {
          const s = res.data;
          this.form.patchValue({
            titre:                s.titre,
            description:          s.description,
            quantite_disponible:  s.quantite_disponible,
            poids_moyen_kg:       s.poids_moyen_kg,
            prix_par_kg:          s.prix_par_kg,
            prix_par_unite:       s.prix_par_unite,
            mode_vente:           s.mode_vente,
            date_disponibilite:   s.date_disponibilite,
            date_peremption_stock: s.date_peremption_stock,
          });
          // Afficher les photos existantes
          if (s.photos?.length) {
            this.photoPreviews.set(s.photos.map((url: string) => this.sanitizer.bypassSecurityTrustUrl(url)));
          }
          this.loadingEdit.set(false);
        },
        error: () => {
          this.loadingEdit.set(false);
          this.router.navigate(['/eleveur/stocks']);
        },
      });
    }
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c?.touched);
  }

  onPhotos(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    const files = Array.from(input.files);
    const remaining = 5 - this.photoFiles.length;
    const toAdd = files.slice(0, remaining);
    this.photoFiles = [...this.photoFiles, ...toAdd];
    toAdd.forEach(f => {
      const reader = new FileReader();
      reader.onload = e => {
        const dataUrl = e.target?.result as string;
        const safeUrl = this.sanitizer.bypassSecurityTrustUrl(dataUrl);
        this.photoPreviews.update(prev => [...prev, safeUrl]);
      };
      reader.readAsDataURL(f);
    });
    input.value = '';
  }

  removePhoto(index: number): void {
    this.photoFiles.splice(index, 1);
    this.photoPreviews.update(prev => prev.filter((_, i) => i !== index));
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.submitting()) return;

    this.submitting.set(true);
    this.erreurApi.set(null);
    this.erreurAbonnement.set(null);

    const v = this.form.value;

    // Toujours passer par FormData : Laravel gère mieux multipart que JSON
    // pour les champs numériques quand X-Requested-With est présent.
    // On force _method override si besoin mais ici c'est un POST direct.
    const fd = new FormData();

    // Champs texte/date
    if (v['titre'])                fd.append('titre',                String(v['titre']));
    if (v['description'])          fd.append('description',          String(v['description']));
    if (v['mode_vente'])           fd.append('mode_vente',           String(v['mode_vente']));
    if (v['date_disponibilite'])   fd.append('date_disponibilite',   String(v['date_disponibilite']));

    // Champs numériques — envoyés comme string dans FormData, Laravel les cast correctement
    if (v['quantite_disponible'] != null) fd.append('quantite_disponible', String(Number(v['quantite_disponible'])));
    if (v['poids_moyen_kg']      != null) fd.append('poids_moyen_kg',      String(Number(v['poids_moyen_kg'])));
    if (v['prix_par_kg']         != null) fd.append('prix_par_kg',         String(Number(v['prix_par_kg'])));

    // Champs optionnels
    if (v['prix_par_unite'] && Number(v['prix_par_unite']) > 0) {
      fd.append('prix_par_unite', String(Number(v['prix_par_unite'])));
    }
    if (v['date_peremption_stock']) {
      fd.append('date_peremption_stock', String(v['date_peremption_stock']));
    }

    // Photos
    this.photoFiles.forEach(f => fd.append('photos[]', f));

    if (this.editMode() && this.stockId()) {
      // PUT via POST + _method=PUT (Laravel method spoofing pour FormData)
      fd.append('_method', 'PUT');
      this.http.post<any>(`${environment.apiUrl}/eleveur/stocks/${this.stockId()}`, fd)
        .subscribe({ next: () => this.onSuccess(), error: (e) => this.onError(e) });
    } else {
      this.http.post<any>(`${environment.apiUrl}/eleveur/stocks`, fd)
        .subscribe({ next: () => this.onSuccess(), error: (e) => this.onError(e) });
    }
  }

  private onSuccess(): void {
    this.submitting.set(false);
    this.router.navigate(['/eleveur/stocks']);
  }

  private onError(err: any): void {
    this.submitting.set(false);
    if (err.status === 403) {
      this.erreurAbonnement.set(err.error?.message ?? "Limite d'abonnement atteinte.");
    } else if (err.status === 422) {
      const errors = err.error?.errors ?? {};
      const msgs   = (Object.values(errors) as string[][]).flat();
      this.erreurApi.set(msgs[0] ?? 'Erreur de validation.');
    } else {
      this.erreurApi.set('Une erreur est survenue. Veuillez réessayer.');
    }
  }
}