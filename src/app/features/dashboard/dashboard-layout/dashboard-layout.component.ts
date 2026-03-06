// ============================================================
// Fichier : src/app/features/dashboard/dashboard-layout/dashboard-layout.component.ts
// ============================================================
import { Component, signal, HostListener } from '@angular/core';
import { CommonModule }     from '@angular/common';
import { RouterOutlet }     from '@angular/router';
import { SidebarComponent } from '../layout/sidebar/sidebar.component';
import { TopbarComponent }  from '../layout/topbar/topbar.component';

@Component({
  selector:    'app-dashboard-layout',
  standalone:  true,
  imports:     [CommonModule, RouterOutlet, SidebarComponent, TopbarComponent],
  templateUrl: './dashboard-layout.component.html',
})
export class DashboardLayoutComponent {
  sidebarCollapsed = signal(false);
  mobileOpen       = signal(false);
  isMobile         = signal(window.innerWidth < 768);

  @HostListener('window:resize')
  onResize(): void {
    const mobile = window.innerWidth < 768;
    this.isMobile.set(mobile);
    if (!mobile) this.mobileOpen.set(false);
  }

  toggleSidebar(): void {
    if (this.isMobile()) {
      this.mobileOpen.set(!this.mobileOpen());
    } else {
      this.sidebarCollapsed.set(!this.sidebarCollapsed());
    }
  }

  closeMobile(): void {
    this.mobileOpen.set(false);
  }
}