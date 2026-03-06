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
  is_lu:      boolean;
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
          list.map(n => n.id === id ? { ...n, is_lu: true } : n)
        );
        this.unreadCount.update(c => Math.max(0, c - 1));
      },
    });
  }

  markAllRead(): void {
    this.http.put(`${environment.apiUrl}/notifications/tout-lire`, {}).subscribe({
      next: () => {
        this.notifications.update(list => list.map(n => ({ ...n, is_lu: true })));
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