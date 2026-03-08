// ============================================================
// Fichier : src/app/features/dashboard/layout/topbar/topbar.component.ts
// ============================================================
import { Component, Input, Output, EventEmitter, signal, OnInit } from '@angular/core';
import { CommonModule }   from '@angular/common';
import { RouterModule }   from '@angular/router';
import { HttpClient }     from '@angular/common/http';
import { AuthService }    from '../../../../core/services/auth.service';
import { environment }    from '../../../../environments/environment';

interface Notification {
  id:         number;
  type:       string;
  titre:      string;
  message:    string;
  is_read:    boolean;
  created_at: string;
}

@Component({
  selector:   'app-topbar',
  standalone: true,
  imports:    [CommonModule, RouterModule],
  templateUrl: './topbar.component.html',
})
export class TopbarComponent implements OnInit {
  @Input()  pageTitle   = '';
  @Input()  sidebarCollapsed = false;
  @Output() toggleSidebar    = new EventEmitter<void>();

  notifOpen    = signal(false);
  avatarOpen   = signal(false);
  notifications= signal<Notification[]>([]);
  unreadCount  = signal(0);

  constructor(
    public  auth: AuthService,
    private http: HttpClient,
  ) {}

  get profilRoute(): string {
    const role = this.auth.user()?.role;
    if (role === 'eleveur')  return '/eleveur/profil';
    if (role === 'acheteur') return '/acheteur/profil';
    if (role === 'admin')    return '/admin/parametres';
    return '/';
  }

  get notificationsRoute(): string {
    const role = this.auth.user()?.role;
    if (role === 'eleveur')  return '/eleveur/notifications';
    if (role === 'acheteur') return '/acheteur/notifications';
    if (role === 'admin')    return '/admin/notifications';
    return '/';
  }

  get parametresRoute(): string {
    const role = this.auth.user()?.role;
    if (role === 'eleveur')  return '/eleveur/parametres';
    if (role === 'acheteur') return '/acheteur/parametres';
    if (role === 'admin')    return '/admin/parametres';
    return '/';
  }


  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.http.get<any>(`${environment.apiUrl}/notifications?non_lues=1`).subscribe({
      next: (res) => {
        this.notifications.set(res.data?.slice(0, 5) ?? []);
        this.unreadCount.set(res.meta?.non_lues ?? 0);
      },
      error: () => {},
    });
  }

  markAsRead(id: number): void {
    this.http.put(`${environment.apiUrl}/notifications/${id}/lu`, {}).subscribe({
      next: () => {
        this.notifications.update(list =>
          list.map(n => n.id === id ? { ...n, is_read: true } : n)
        );
        this.unreadCount.update(c => Math.max(0, c - 1));
      },
    });
  }

  markAllRead(): void {
    this.http.put(`${environment.apiUrl}/notifications/tout-lire`, {}).subscribe({
      next: () => {
        this.notifications.update(list => list.map(n => ({ ...n, is_read: true })));
        this.unreadCount.set(0);
      },
    });
  }

  toggleNotif(): void {
    this.notifOpen.set(!this.notifOpen());
    this.avatarOpen.set(false);
  }

  toggleAvatar(): void {
    this.avatarOpen.set(!this.avatarOpen());
    this.notifOpen.set(false);
  }

  closeDropdowns(): void {
    this.notifOpen.set(false);
    this.avatarOpen.set(false);
  }

  get notifIcon(): Record<string, string> {
    return {
      new_order:    '🛒',
      payment:      '💰',
      delivery:     '🚚',
      system:       '⚙️',
      subscription: '📋',
      review:       '⭐',
    };
  }

  logout(): void {
    this.auth.logout();
  }
}