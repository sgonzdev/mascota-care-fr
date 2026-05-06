import { Injectable, inject, signal } from '@angular/core';
import { Guia, GuiaCreatePayload } from '../models/guide.model';
import { GUIDE_REPOSITORY } from '../repositories/guide.repository';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class GuideService {
  private readonly repo = inject(GUIDE_REPOSITORY);
  private readonly toast = inject(ToastService);

  private readonly _history = signal<Guia[]>([]);
  private readonly _current = signal<Guia | null>(null);
  private readonly _loading = signal(false);

  readonly history = this._history.asReadonly();
  readonly current = this._current.asReadonly();
  readonly loading = this._loading.asReadonly();

  async loadHistory(idMascota: string): Promise<void> {
    this._loading.set(true);
    try {
      this._history.set(await this.repo.historyByPet(idMascota));
    } catch {
      this._history.set([]);
      this.toast.error('No se pudo cargar el historial de guías');
    } finally {
      this._loading.set(false);
    }
  }

  async generate(payload: GuiaCreatePayload): Promise<Guia | null> {
    this._loading.set(true);
    try {
      const guia = await this.repo.generate(payload);
      this._current.set(guia);
      await this.loadHistory(payload.idMascota);
      return guia;
    } catch {
      this.toast.error('No se pudo generar la guía');
      return null;
    } finally {
      this._loading.set(false);
    }
  }

  setCurrent(g: Guia | null): void { this._current.set(g); }
}
