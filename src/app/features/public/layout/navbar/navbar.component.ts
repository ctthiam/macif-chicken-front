// ============================================================
// Fichier : src/app/features/public/layout/navbar/navbar.component.ts
// ============================================================
import { Component, signal, HostListener } from '@angular/core';
import { CommonModule }    from '@angular/common';
import { RouterModule }    from '@angular/router';
import { AuthService }     from '../../../../core/services/auth.service';

@Component({
  selector:    'app-navbar',
  standalone:  true,
  imports:     [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  menuOpen    = signal(false);
  scrolled    = signal(false);

  constructor(public auth: AuthService) {}

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 10);
  }

  get dashboardRoute(): string {
    const role = this.auth.user()?.role;
    if (role === 'admin')   return '/admin/dashboard';
    if (role === 'eleveur') return '/eleveur/dashboard';
    return '/acheteur/dashboard';
  }

  toggleMenu(): void {
    this.menuOpen.set(!this.menuOpen());
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  logout(): void {
    this.auth.logout();
    this.closeMenu();
  }
}