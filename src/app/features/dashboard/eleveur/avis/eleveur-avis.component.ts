// ============================================================
// Fichier : src/app/features/dashboard/eleveur/avis/eleveur-avis.component.ts
// ============================================================
import { Component, signal, OnInit } from '@angular/core';
import { CommonModule }   from '@angular/common';
import { HttpClient }     from '@angular/common/http';
import { FormsModule }    from '@angular/forms';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { environment }    from '../../../../environments/environment';

interface Avis {
  id:         number;
  note:       number;
  commentaire: string;
  reponse:    string | null;
  created_at: string;
  acheteur:   { name: string };
  stock:      { titre: string };
}

@Component({
  selector:   'app-eleveur-avis',
  standalone: true,
  imports:    [CommonModule, FormsModule, LoadingSpinnerComponent],
  template: `
<div class="space-y-6 animate-fade-in">

  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="font-display text-2xl font-extrabold text-neutral-900">Avis reçus</h1>
      <p class="text-neutral-500 text-sm mt-0.5">{{ total() }} avis — note moyenne
        <span class="font-bold text-amber-500">{{ moyenneStr() }}/5</span>
      </p>
    </div>
  </div>

  <!-- Stats rapides -->
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
    @for (s of stats; track s.note) {
      <div class="bg-white rounded-2xl border border-neutral-100 shadow-card p-4 text-center">
        <div class="text-2xl font-extrabold text-neutral-900">{{ countByNote(s.note) }}</div>
        <div class="flex justify-center gap-0.5 mt-1">
          @for (i of [1,2,3,4,5]; track i) {
            <svg class="w-3 h-3" [class]="i <= s.note ? 'text-amber-400' : 'text-neutral-200'"
                 fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
          }
        </div>
        <div class="text-xs text-neutral-500 mt-1">{{ s.note }} étoile{{ s.note > 1 ? 's' : '' }}</div>
      </div>
    }
  </div>

  @if (loading()) {
    <app-loading-spinner [fullPage]="true" />
  } @else if (avis().length === 0) {
    <div class="bg-white rounded-2xl border border-neutral-100 p-20 text-center">
      <span class="text-6xl">⭐</span>
      <h3 class="font-display font-bold text-neutral-900 text-xl mt-4 mb-2">Aucun avis pour l'instant</h3>
      <p class="text-neutral-500 text-sm">Les avis apparaîtront ici après vos premières livraisons.</p>
    </div>
  } @else {
    <div class="space-y-4">
      @for (a of avis(); track a.id) {
        <div class="bg-white rounded-2xl border border-neutral-100 shadow-card p-6">
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-start gap-4">
              <!-- Avatar -->
              <div class="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                <span class="text-sm font-bold text-white">{{ a.acheteur.name[0].toUpperCase() }}</span>
              </div>
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-semibold text-neutral-900 text-sm">{{ a.acheteur.name }}</span>
                  <span class="text-neutral-400 text-xs">•</span>
                  <span class="text-xs text-neutral-500">{{ a.stock.titre }}</span>
                </div>
                <!-- Étoiles -->
                <div class="flex gap-0.5 mt-1">
                  @for (i of [1,2,3,4,5]; track i) {
                    <svg class="w-4 h-4" [class]="i <= a.note ? 'text-amber-400' : 'text-neutral-200'"
                         fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  }
                </div>
                <p class="text-sm text-neutral-700 mt-2">{{ a.commentaire }}</p>
                <!-- Réponse existante -->
                @if (a.reponse) {
                  <div class="mt-3 pl-4 border-l-2 border-primary-200 bg-primary-50 rounded-r-xl py-2 pr-3">
                    <p class="text-xs font-semibold text-primary-700 mb-0.5">Votre réponse</p>
                    <p class="text-sm text-neutral-700">{{ a.reponse }}</p>
                  </div>
                }
              </div>
            </div>
            <span class="text-xs text-neutral-400 shrink-0">{{ formatDate(a.created_at) }}</span>
          </div>

          <!-- Répondre -->
          @if (!a.reponse) {
            <div class="mt-4 pt-4 border-t border-neutral-100">
              @if (replyingTo() === a.id) {
                <div class="flex gap-3">
                  <textarea [(ngModel)]="replyText" rows="2"
                            placeholder="Répondez à cet avis…"
                            class="flex-1 text-sm border border-neutral-200 rounded-xl px-4 py-3 resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-100 transition-all"
                            [ngModelOptions]="{standalone: true}"></textarea>
                  <div class="flex flex-col gap-2">
                    <button (click)="submitReply(a.id)"
                            class="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-800 transition-all">
                      Envoyer
                    </button>
                    <button (click)="replyingTo.set(null)"
                            class="px-4 py-2 bg-neutral-100 text-neutral-600 text-xs font-semibold rounded-xl hover:bg-neutral-200 transition-all">
                      Annuler
                    </button>
                  </div>
                </div>
              } @else {
                <button (click)="replyingTo.set(a.id)"
                        class="text-xs font-semibold text-primary hover:text-primary-700 transition-colors">
                  + Répondre à cet avis
                </button>
              }
            </div>
          }
        </div>
      }
    </div>
  }

</div>
`,
})
export class EleveurAvisComponent implements OnInit {
  avis      = signal<Avis[]>([]);
  loading   = signal(true);
  total     = signal(0);
  replyingTo = signal<number | null>(null);
  replyText  = '';

  stats = [
    { note: 5 }, { note: 4 }, { note: 3 }, { note: 2 },
  ];

  moyenneStr(): string {
    if (!this.avis().length) return '—';
    const avg = this.avis().reduce((s, a) => s + a.note, 0) / this.avis().length;
    return avg.toFixed(1);
  }

  countByNote(n: number): number {
    return this.avis().filter(a => a.note === n).length;
  }

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any>(`${environment.apiUrl}/eleveur/avis`).subscribe({
      next: (res) => {
        this.avis.set(res.data ?? res);
        this.total.set(res.total ?? (res.data ?? res).length);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  submitReply(avisId: number): void {
    if (!this.replyText.trim()) return;
    this.http.put(`${environment.apiUrl}/eleveur/avis/${avisId}/reply`, { reponse: this.replyText }).subscribe({
      next: () => {
        this.avis.update(list =>
          list.map(a => a.id === avisId ? { ...a, reponse: this.replyText } : a)
        );
        this.replyingTo.set(null);
        this.replyText = '';
      },
    });
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}