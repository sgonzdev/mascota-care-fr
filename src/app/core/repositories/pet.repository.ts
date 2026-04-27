import { InjectionToken } from '@angular/core';
import { Mascota } from '../models/consultation.model';
import { MOCK_MASCOTAS } from '../data/additional-data.mock';

export interface PetRepository {
  list(): Mascota[];
  listByUser(idUsuario: string): Mascota[];
  create(data: Omit<Mascota, 'id'>): Mascota;
}

export const PET_REPOSITORY = new InjectionToken<PetRepository>('PetRepository', {
  providedIn: 'root',
  factory: () => new InMemoryPetRepository(),
});

export class InMemoryPetRepository implements PetRepository {
  private data: Mascota[] = [...MOCK_MASCOTAS];

  list(): Mascota[] { return this.data; }

  listByUser(idUsuario: string): Mascota[] {
    return this.data.filter(m => m.idUsuario === idUsuario);
  }

  create(data: Omit<Mascota, 'id'>): Mascota {
    const created: Mascota = { ...data, id: `m-${Date.now()}` };
    this.data = [...this.data, created];
    return created;
  }
}
