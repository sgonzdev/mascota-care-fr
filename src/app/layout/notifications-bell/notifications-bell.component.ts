import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-notifications-bell',
  standalone: true,
  imports: [IonIcon, DatePipe],
  templateUrl: './notifications-bell.component.html',
  styleUrl: './notifications-bell.component.scss',
})
export class NotificationsBellComponent {
  protected readonly notif = inject(NotificationService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly open = signal(false);
  readonly recent = computed(() => this.notif.items().slice(0, 5));
  readonly unread = computed(() =>
    this.notif.items().filter(n => n.estado === 'PENDIENTE' || n.estado === 'FALLIDA').length,
  );

  constructor() {
    effect(() => {
      if (this.auth.isLoggedIn()) void this.notif.refresh();
    });
  }

  toggle(): void { this.open.update(v => !v); }
  close(): void { this.open.set(false); }

  viewAll(): void {
    this.close();
    this.router.navigate(['/notifications']);
  }

  iconFor(canal: string): string {
    return canal === 'PUSH' ? 'phone-portrait-outline'
         : canal === 'EMAIL' ? 'mail-outline'
         : 'chatbubble-outline';
  }
}
