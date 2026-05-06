import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Mascota } from '../models/consultation.model';
import { PET_REPOSITORY } from '../repositories/pet.repository';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class PetService {
  private readonly repo = inject(PET_REPOSITORY);
  private readonly auth = inject(AuthService);
  private readonly _mascotas = signal<Mascota[]>([]);
  private readonly _loading = signal(false);

  readonly mascotas = this._mascotas.asReadonly();
  readonly loading = this._loading.asReadonly();

  readonly myPets = computed(() => {
    const user = this.auth.usuario();
    if (!user) return [];
    if (user.rol === 'admin') return this._mascotas();
    return this._mascotas().filter(m => m.idUsuario === user.id);
  });

  constructor() {
    // Reload pets whenever authentication state changes.
    effect(() => {
      const user = this.auth.usuario();
      if (user) {
        void this.refresh();
      } else {
        this._mascotas.set([]);
      }
    });
  }

  async refresh(): Promise<void> {
    this._loading.set(true);
    try {
      const user = this.auth.usuario();
      const list =
        user && user.rol !== 'admin'
          ? await this.repo.listByUser(user.id)
          : await this.repo.list();
      this._mascotas.set(list);
    } catch {
      this._mascotas.set([]);
    } finally {
      this._loading.set(false);
    }
  }

  async create(data: Omit<Mascota, 'id' | 'idUsuario'>): Promise<Mascota> {
    const user = this.auth.usuario();
    const idUsuario = user?.id ?? '';
    const created = await this.repo.create({ ...data, idUsuario });
    this._mascotas.update(list => [...list, created]);
    return created;
  }

  async update(id: string, data: Omit<Mascota, 'id' | 'idUsuario'>): Promise<Mascota> {
    const existing = this._mascotas().find(m => m.id === id);
    const idUsuario = existing?.idUsuario ?? this.auth.usuario()?.id ?? '';
    const updated = await this.repo.update(id, { ...data, idUsuario });
    this._mascotas.update(list => list.map(m => (m.id === id ? updated : m)));
    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.repo.remove(id);
    this._mascotas.update(list => list.filter(m => m.id !== id));
  }

  async getById(id: string): Promise<Mascota | null> {
    const cached = this._mascotas().find(m => m.id === id);
    return cached ?? this.repo.get(id);
  }
}
