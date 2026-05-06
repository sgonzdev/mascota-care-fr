import { Injectable, computed, inject, signal } from '@angular/core';
import {
  CanalNotificacion,
  Notificacion,
} from '../models/notification.model';
import { NOTIFICATION_REPOSITORY } from '../repositories/notification.repository';
import { ToastService } from './toast.service';

export type CanalFilter = CanalNotificacion | 'ALL';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly repo = inject(NOTIFICATION_REPOSITORY);
  private readonly toast = inject(ToastService);

  private readonly _items = signal<Notificacion[]>([]);
  private readonly _loading = signal(false);
  private readonly _canal = signal<CanalFilter>('ALL');

  readonly loading = this._loading.asReadonly();
  readonly canal = this._canal.asReadonly();
  readonly items = computed(() => {
    const c = this._canal();
    return c === 'ALL' ? this._items() : this._items().filter(n => n.canal === c);
  });

  async refresh(): Promise<void> {
    this._loading.set(true);
    try {
      this._items.set(await this.repo.list());
    } catch {
      this._items.set([]);
      this.toast.error('No se pudieron cargar las notificaciones');
    } finally {
      this._loading.set(false);
    }
  }

  setCanal(c: CanalFilter): void { this._canal.set(c); }
}
