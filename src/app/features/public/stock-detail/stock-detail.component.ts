// ============================================================
// Fichier : src/app/features/public/stock-detail/stock-detail.component.ts
// ============================================================
import { Component, signal, OnInit, computed } from '@angular/core';
import { CommonModule }                         from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule }                          from '@angular/forms';
import { HttpClient }                           from '@angular/common/http';
import { RatingStarsComponent }                 from '../../../shared/components/rating-stars/rating-stars.component';
import { BadgeStatusComponent }                 from '../../../shared/components/badge-status/badge-status.component';
import { LoadingSpinnerComponent }              from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StockCardComponent, Stock }            from '../../../shared/components/stock-card/stock-card.component';
import { AuthService }                          from '../../../core/services/auth.service';
import { environment }                          from '../../../environments/environment';

interface Avis {
  id:         number;
  note:       number;
  commentaire:string;
  created_at: string;
  auteur: { name: string; } | null;
}

interface StockDetail extends Stock {
  description:        string;
  race:               string;
  age_semaines:       number;
  date_disponibilite: string;
  localisation:       string;
  eleveur: {
    id:             number;
    name:           string;
    is_certified:   boolean;
    note_moyenne:   number;
    nombre_avis:    number;
    localisation:   string;
    bio:            string;
    total_stocks:   number;
  };
  avis: Avis[];
}

@Component({
  selector:    'app-stock-detail',
  standalone:  true,
  imports:     [CommonModule, RouterModule, FormsModule, RatingStarsComponent, BadgeStatusComponent, LoadingSpinnerComponent, StockCardComponent],
  templateUrl: './stock-detail.component.html',
})
export class StockDetailComponent implements OnInit {
  stock         = signal<StockDetail | null>(null);
  stocksSimilaires = signal<Stock[]>([]);
  loading       = signal(true);
  activePhoto   = signal(0);
  quantite      = signal(1);
  activeTab     = signal<'description'|'avis'>('description');
  commandeLoading = signal(false);
  commandeSuccess = signal(false);
  commandeError   = signal('');

  // Formulaire commande
  adresseLivraison  = signal('');
  modePaiement      = signal<'wave'|'orange_money'|'free_money'|''>('');
  dateLivraison     = signal('');
  noteLivraison     = signal('');
  showCommandeForm  = signal(false);

  readonly modesPaiement: { value: 'wave'|'orange_money'|'free_money'; label: string; logo: string }[] = [
    { value: 'wave',         label: '🌊 Wave',         logo: 'W' },
    { value: 'orange_money', label: '🟠 Orange Money',  logo: 'OM' },
    { value: 'free_money',   label: '🟢 Free Money',    logo: 'FM' },
  ];
  favoriLoading   = signal(false);
  isFavori        = signal(false);

  readonly Math  = Math;
  readonly today = new Date().toISOString().split('T')[0];

  readonly garanties = [
    { icon: '🔒', label: 'Paiement sécurisé via PayTech' },
    { icon: '✅', label: 'Éleveur vérifié par MACIF' },
    { icon: '↩️', label: 'Remboursement si problème' },
    { icon: '📞', label: 'Support disponible 7j/7' },
  ];

  get specs() {
    const s = this.stock();
    if (!s) return [];
    return [
      { label: 'Race',             value: s.race },
      { label: 'Âge',              value: s.age_semaines ? `${s.age_semaines} semaines` : null },
      { label: 'Poids moyen',      value: s.poids_moyen_kg ? `${s.poids_moyen_kg} kg` : null },
      { label: 'Mode de vente',    value: this.modeVenteLabel },
      { label: 'Disponibilité',    value: s.date_disponibilite ? this.formatDate(s.date_disponibilite) : null },
      { label: 'Localisation',     value: s.eleveur?.localisation ?? s.localisation },
    ];
  }

  onCommander(stock: Stock): void {
    this.router.navigate(['/stocks', stock.id]);
  }

  constructor(
    private http:   HttpClient,
    private route:  ActivatedRoute,
    private router: Router,
    public  auth:   AuthService,
  ) {}

  toggleFavori(): void {
    const s = this.stock();
    if (!s || !this.auth.isLoggedIn()) {
      this.router.navigate(['/auth/login']); return;
    }
    this.favoriLoading.set(true);
    const eleveurId = s.eleveur?.id;
    if (!eleveurId) return;
    if (this.isFavori()) {
      this.http.delete(`${environment.apiUrl}/acheteur/favoris/${eleveurId}`).subscribe({
        next: () => { this.isFavori.set(false); this.favoriLoading.set(false); },
        error: () => this.favoriLoading.set(false),
      });
    } else {
      this.http.post(`${environment.apiUrl}/acheteur/favoris/${eleveurId}`, {}).subscribe({
        next: () => { this.isFavori.set(true); this.favoriLoading.set(false); },
        error: () => this.favoriLoading.set(false),
      });
    }
  }

  ngOnInit(): void {
    this.route.params.subscribe(p => {
      this.loadStock(p['id']);
    });
  }

  loadStock(id: string): void {
    this.loading.set(true);
    this.activePhoto.set(0);

    this.http.get<any>(`${environment.apiUrl}/stocks/${id}`).subscribe({
      next: (res) => {
        this.stock.set(res.data);
        // Vérifier si cet éleveur est déjà en favori
        if (this.auth.isLoggedIn() && res.data?.eleveur?.id) {
          this.http.get<any>(`${environment.apiUrl}/acheteur/favoris`).subscribe({
            next: (r) => {
              const ids = (r.data ?? []).map((f: any) => f.eleveur_id);
              this.isFavori.set(ids.includes(res.data.eleveur.id));
            },
            error: () => {},
          });
        }
        this.loading.set(false);
        this.loadSimilaires(res.data);
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/recherche']);
      },
    });
  }

  loadSimilaires(stock: StockDetail): void {
    this.http.get<any>(`${environment.apiUrl}/stocks?per_page=3&statut=disponible&exclude=${stock.id}`).subscribe({
      next: (res) => this.stocksSimilaires.set(res.data ?? []),
      error: () => {},
    });
  }

  setPhoto(i: number): void   { this.activePhoto.set(i); }
  prevPhoto(): void           { this.activePhoto.update(i => Math.max(0, i - 1)); }
  nextPhoto(): void           {
    const max = (this.stock()?.photos?.length ?? 1) - 1;
    this.activePhoto.update(i => Math.min(max, i + 1));
  }

  incrementQty(): void { this.quantite.update(q => q + 1); }
  decrementQty(): void { this.quantite.update(q => Math.max(1, q - 1)); }

  get venteParUnite(): boolean {
    const s = this.stock();
    return !!(s?.prix_par_unite && ['unite', 'les_deux'].includes(s?.mode_vente ?? ''));
  }

  get prixTotal(): number {
    const s = this.stock();
    if (!s) return 0;
    // Aligner exactement avec le calcul backend
    return this.venteParUnite
      ? s.prix_par_unite! * this.quantite()
      : s.prix_par_kg * (s.poids_moyen_kg ?? 1) * this.quantite();
  }

  get uniteLabel(): string {
    return this.venteParUnite ? 'unité(s)' : 'kg';
  }

  get modeVenteLabel(): string {
    const map: Record<string, string> = {
      vivant:   '🐔 Vivant',
      abattu:   '🥩 Abattu',
      les_deux: '🐔🥩 Vivant & Abattu',
    };
    return map[this.stock()?.mode_vente ?? ''] ?? '';
  }

  ouvrirFormulaireCommande(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.showCommandeForm.set(true);
    this.commandeError.set('');
  }

  commander(): void {
    if (!this.modePaiement()) {
      this.commandeError.set('Veuillez choisir un mode de paiement.'); return;
    }
    if (!this.adresseLivraison().trim()) {
      this.commandeError.set('Veuillez saisir votre adresse de livraison.'); return;
    }

    const s = this.stock();
    if (!s) return;

    this.commandeLoading.set(true);
    this.commandeError.set('');

    this.http.post(`${environment.apiUrl}/acheteur/commandes`, {
      stock_id:                 s.id,
      quantite:                 this.quantite(),
      mode_paiement:            this.modePaiement(),
      adresse_livraison:        this.adresseLivraison().trim(),
      date_livraison_souhaitee: this.dateLivraison() || null,
      note_livraison:           this.noteLivraison().trim() || null,
    }).subscribe({
      next: (res: any) => {
        this.commandeLoading.set(false);
        this.commandeSuccess.set(true);
        setTimeout(() => {
          this.router.navigate(['/acheteur/commandes']);
        }, 2000);
      },
      error: (err) => {
        this.commandeLoading.set(false);
        const errors = err.error?.errors;
        if (errors) {
          // Afficher la première erreur de validation détaillée
          const first = Object.values(errors)[0] as string[];
          this.commandeError.set(first?.[0] ?? err.error?.message ?? 'Erreur lors de la commande.');
        } else {
          this.commandeError.set(err.error?.message ?? 'Erreur lors de la commande.');
        }
      },
    });
  }

  get notesMoyenneAvis(): number {
    const avis = this.stock()?.avis ?? [];
    if (!avis.length) return 0;
    return avis.reduce((sum, a) => sum + a.note, 0) / avis.length;
  }

  avisCountPourNote(n: number): number {
    return (this.stock()?.avis ?? []).filter(a => a.note === n).length;
  }

  avisPctPourNote(n: number): number {
    const avis = this.stock()?.avis ?? [];
    if (!avis.length) return 0;
    return (this.avisCountPourNote(n) / avis.length) * 100;
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('fr-SN', { day: 'numeric', month: 'long', year: 'numeric' });
  }
}