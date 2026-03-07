// ============================================================
// Fichier : src/app/features/dashboard/layout/sidebar/sidebar.component.ts
// ============================================================
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule }  from '@angular/common';
import { RouterModule }  from '@angular/router';
import { AuthService }   from '../../../../core/services/auth.service';

interface NavItem {
  label:  string;
  route:  string;
  icon:   string;
  badge?: number;
}

@Component({
  selector:   'app-sidebar',
  standalone: true,
  imports:    [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  @Input()  collapsed = false;
  @Output() collapsedChange = new EventEmitter<boolean>();

  constructor(public auth: AuthService) {}

  get navItems(): NavItem[] {
    const role = this.auth.user()?.role;
    if (role === 'admin')   return this.adminNav;
    if (role === 'eleveur') return this.eleveurNav;
    return this.acheteurNav;
  }

  private eleveurNav: NavItem[] = [
    { label: 'Tableau de bord', route: '/eleveur/dashboard', icon: 'home' },
    { label: 'Mes stocks',      route: '/eleveur/stocks',    icon: 'package' },
    { label: 'Commandes',       route: '/eleveur/commandes', icon: 'shopping-bag' },
    { label: 'Avis reçus',      route: '/eleveur/avis',      icon: 'star' },
    { label: 'Abonnement',      route: '/eleveur/abonnement',icon: 'credit-card' },
    { label: 'Mon profil',      route: '/eleveur/profil',    icon: 'user' },
  ];

  private acheteurNav: NavItem[] = [
    { label: 'Tableau de bord', route: '/acheteur/dashboard',  icon: 'home' },
    { label: 'Mes commandes',   route: '/acheteur/commandes',  icon: 'shopping-bag' },
    { label: 'Favoris',         route: '/acheteur/favoris',    icon: 'heart' },
    { label: 'Mon profil',      route: '/acheteur/profil',     icon: 'user' },
  ];

  private adminNav: NavItem[] = [
    { label: 'Tableau de bord', route: '/admin/dashboard',  icon: 'home' },
    { label: 'Utilisateurs',    route: '/admin/utilisateurs', icon: 'users' },
    { label: 'Annonces',        route: '/admin/stocks',       icon: 'package' },
    { label: 'Commandes',       route: '/admin/commandes',    icon: 'shopping-bag' },
    { label: 'Litiges',         route: '/admin/litiges',      icon: 'alert-circle' },
    { label: 'Finances',        route: '/admin/finances',     icon: 'bar-chart' },
  ];

  toggle(): void {
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
  }

  logout(): void {
    this.auth.logout();
  }

  getIcon(name: string): string {
    const icons: Record<string, string> = {
      home:          'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      package:       'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
      'shopping-bag':'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
      star:          'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
      'credit-card': 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
      user:          'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      users:         'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
      heart:         'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
      'alert-circle':'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      'bar-chart':   'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      settings:      'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
      logout:        'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
    };
    return icons[name] ?? icons['home'];
  }
}