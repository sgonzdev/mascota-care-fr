import { Injectable, computed, inject, signal } from '@angular/core';
import { Mascota } from '../models/consultation.model';
import { PET_REPOSITORY } from '../repositories/pet.repository';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class PetService {
  private readonly repo = inject(PET_REPOSITORY);
  private readonly auth = inject(AuthService);
  private readonly _mascotas = signal<Mascota[]>(this.repo.list());

  readonly mascotas = this._mascotas.asReadonly();

  readonly myPets = computed(() => {
    const user = this.auth.usuario();
    if (!user || user.rol === 'admin') return this._mascotas();
    return this._mascotas().filter(m => m.idUsuario === user.id);
  });

  create(data: Omit<Mascota, 'id' | 'idUsuario'>): Mascota {
    const user = this.auth.usuario();
    const idUsuario = user?.id ?? 'u1';
    const created = this.repo.create({ ...data, idUsuario });
    this._mascotas.set(this.repo.list());
    return created;
  }
}
