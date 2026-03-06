// ============================================================
// Fichier : src/app/features/public/commande-tunnel/commande-tunnel.component.ts
// 4 étapes : Stock → Quantité → Livraison → Confirmation
// ============================================================
import { Component, signal, OnInit }           from '@angular/core';
import { CommonModule }                         from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient }                           from '@angular/common/http';
import { AuthService }                          from '../../../core/services/auth.service';
import { environment }                          from '../../../environments/environment';

interface Stock {
  id:                  number;
  titre:               string;
  prix_par_kg:         number;
  prix_par_unite:      number | null;
  poids_moyen_kg:      number;
  quantite_disponible: number;
  mode_vente:          string;
  photos:              string[];
  statut:              string;
  eleveur: {
    id:   number;
    name: string;
    localisation: string;
  };
}

@Component({
  selector:    'app-commande-tunnel',
  standalone:  true,
  imports:     [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './commande-tunnel.component.html',
})
export class CommandeTunnelComponent implements OnInit {
  // Étape courante : 0=stock, 1=quantité, 2=livraison, 3=confirmation/succès
  step      = signal(0);
  stock     = signal<Stock | null>(null);
  loading   = signal(true);
  submitting = signal(false);
  error     = signal('');
  commandeId = signal<number | null>(null);

  // Étape 1 : quantité
  quantite  = signal(1);

  // Étape 2 : livraison
  livraisonForm!: FormGroup;

  // Étape 3 : récap
  readonly steps = [
    { label: 'Produit',   icon: '🐔' },
    { label: 'Quantité',  icon: '🔢' },
    { label: 'Livraison', icon: '📍' },
    { label: 'Confirmer', icon: '✅' },
  ];

  readonly villes = [
    'Dakar', 'Thiès', 'Saint-Louis', 'Ziguinchor',
    'Kaolack', 'Touba', 'Mbour', 'Diourbel', 'Tambacounda',
  ];

  constructor(
    private fb:     FormBuilder,
    private http:   HttpClient,
    private route:  ActivatedRoute,
    private router: Router,
    public  auth:   AuthService,
  ) {}

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.livraisonForm = this.fb.group({
      nom_destinataire: [this.auth.user()?.name ?? '', Validators.required],
      telephone:        [this.auth.user()?.phone ?? '', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
      adresse:          ['', Validators.required],
      ville:            ['Dakar', Validators.required],
      instructions:     [''],
    });

    this.route.queryParams.subscribe(params => {
      if (params['stock_id']) {
        this.loadStock(params['stock_id']);
      } else {
        this.router.navigate(['/recherche']);
      }
    });
  }

  loadStock(id: string): void {
    this.http.get<any>(`${environment.apiUrl}/stocks/${id}`).subscribe({
      next:  (res) => { this.stock.set(res.data); this.loading.set(false); },
      error: ()    => { this.loading.set(false); this.router.navigate(['/recherche']); },
    });
  }

  // Navigation stepper
  goTo(s: number): void {
    if (s < this.step()) this.step.set(s); // retour autorisé
  }

  nextStep(): void {
    if (this.step() === 1) {
      // Valider quantité
      const s = this.stock();
      if (!s || this.quantite() < 1 || this.quantite() > s.quantite_disponible) return;
    }
    if (this.step() === 2 && this.livraisonForm.invalid) {
      this.livraisonForm.markAllAsTouched();
      return;
    }
    this.step.update(s => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  prevStep(): void {
    this.step.update(s => Math.max(0, s - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Quantité
  increment(): void {
    const max = this.stock()?.quantite_disponible ?? 99;
    this.quantite.update(q => Math.min(q + 1, max));
  }
  decrement(): void { this.quantite.update(q => Math.max(1, q - 1)); }

  // Prix calculé
  get prixUnitaire(): number {
    const s = this.stock();
    if (!s) return 0;
    return s.prix_par_unite ?? (s.prix_par_kg * s.poids_moyen_kg);
  }

  get prixTotal(): number {
    return this.prixUnitaire * this.quantite();
  }

  get fraisLivraison(): number {
    return 1500; // FCFA forfait
  }

  get totalGeneral(): number {
    return this.prixTotal + this.fraisLivraison;
  }

  // Soumettre la commande
  confirmer(): void {
    if (this.submitting()) return;
    const s = this.stock();
    if (!s) return;

    this.submitting.set(true);
    this.error.set('');

    const payload = {
      stock_id:         s.id,
      quantite:         this.quantite(),
      nom_destinataire: this.livraisonForm.value.nom_destinataire,
      telephone:        this.livraisonForm.value.telephone,
      adresse_livraison: `${this.livraisonForm.value.adresse}, ${this.livraisonForm.value.ville}`,
      instructions:     this.livraisonForm.value.instructions,
    };

    this.http.post<any>(`${environment.apiUrl}/commandes`, payload).subscribe({
      next: (res) => {
        this.commandeId.set(res.data?.id ?? null);
        this.submitting.set(false);
        this.step.set(4); // étape succès
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err.error?.message ?? 'Une erreur est survenue. Veuillez réessayer.');
      },
    });
  }

  voirCommandes(): void {
    this.router.navigate(['/acheteur/commandes']);
  }

  // Helpers template
  get modeVenteLabel(): string {
    const map: Record<string, string> = { vivant: '🐔 Vivant', abattu: '🥩 Abattu', les_deux: '🐔🥩 Les deux' };
    return map[this.stock()?.mode_vente ?? ''] ?? '';
  }

  fieldError(field: string): string | null {
    const ctrl = this.livraisonForm.get(field);
    if (!ctrl || !ctrl.invalid || !ctrl.touched) return null;
    if (ctrl.errors?.['required']) return 'Ce champ est requis';
    if (ctrl.errors?.['pattern'])  return 'Format invalide (9 chiffres)';
    return 'Valeur invalide';
  }
}