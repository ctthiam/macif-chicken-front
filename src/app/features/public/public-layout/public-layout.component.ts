// ============================================================
// Fichier : src/app/features/public/public-layout/public-layout.component.ts
// ============================================================
import { Component }        from '@angular/core';
import { RouterOutlet }     from '@angular/router';
import { NavbarComponent }  from '../layout/navbar/navbar.component';
import { FooterComponent }  from '../layout/footer/footer.component';

@Component({
  selector:   'app-public-layout',
  standalone: true,
  imports:    [RouterOutlet, NavbarComponent, FooterComponent],
  template: `
    <div class="min-h-screen flex flex-col bg-neutral-50">
      <app-navbar />
      <main class="flex-1">
        <router-outlet />
      </main>
      <app-footer />
    </div>
  `,
})
export class PublicLayoutComponent {}