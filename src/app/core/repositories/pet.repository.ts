import { HttpClient } from '@angular/common/http';
import { InjectionToken, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Especie, Mascota, Sexo } from '../models/consultation.model';
import { MOCK_MASCOTAS } from '../data/additional-data.mock';

export interface PetRepository {
  list(): Promise<Mascota[]>;
  listByUser(idUsuario: string): Promise<Mascota[]>;
  get(id: string): Promise<Mascota | null>;
  create(data: Omit<Mascota, 'id'>): Promise<Mascota>;
  update(id: string, data: Omit<Mascota, 'id'>): Promise<Mascota>;
  remove(id: string): Promise<void>;
}

export const PET_REPOSITORY = new InjectionToken<PetRepository>('PetRepository', {
  providedIn: 'root',
  factory: () => {
    if (environment.useMocks) return new InMemoryPetRepository();
    return new HttpPetRepository(inject(HttpClient));
  },
});

// ---------- Mapping helpers (frontend lowercase ⇄ backend MAYÚSCULAS) ----------

interface BackendPet {
  id: string;
  idUsuario: string;
  nombre: string;
  especie: 'PERRO' | 'GATO' | 'OTRO';
  raza: string;
  edadMeses: number;
  pesoKg: number;
  sexo: 'MACHO' | 'HEMBRA';
}

function especieToBackend(e: Especie): 'PERRO' | 'GATO' | 'OTRO' {
  return e.toUpperCase() as 'PERRO' | 'GATO' | 'OTRO';
}
function especieFromBackend(e: 'PERRO' | 'GATO' | 'OTRO'): Especie {
  return e.toLowerCase() as Especie;
}
function sexoToBackend(s: Sexo): 'MACHO' | 'HEMBRA' {
  return s.toUpperCase() as 'MACHO' | 'HEMBRA';
}
function sexoFromBackend(s: 'MACHO' | 'HEMBRA'): Sexo {
  return s.toLowerCase() as Sexo;
}

function mapPetFromBackend(p: BackendPet): Mascota {
  return {
    id: p.id,
    idUsuario: p.idUsuario,
    nombre: p.nombre,
    especie: especieFromBackend(p.especie),
    raza: p.raza,
    edadMeses: p.edadMeses,
    pesoKg: p.pesoKg,
    sexo: sexoFromBackend(p.sexo),
  };
}

function mapPetToBackend(m: Omit<Mascota, 'id'>): Omit<BackendPet, 'id'> {
  return {
    idUsuario: m.idUsuario,
    nombre: m.nombre,
    especie: especieToBackend(m.especie),
    raza: m.raza,
    edadMeses: m.edadMeses,
    pesoKg: m.pesoKg,
    sexo: sexoToBackend(m.sexo),
  };
}

// ---------- HTTP implementation ----------

export class HttpPetRepository implements PetRepository {
  private readonly base = `${environment.apiBaseUrl}/api/pets`;

  constructor(private readonly http: HttpClient) {}

  async list(): Promise<Mascota[]> {
    const res = await firstValueFrom(this.http.get<BackendPet[]>(this.base));
    return res.map(mapPetFromBackend);
  }

  async listByUser(idUsuario: string): Promise<Mascota[]> {
    const res = await firstValueFrom(
      this.http.get<BackendPet[]>(this.base, { params: { idUsuario } }),
    );
    return res.map(mapPetFromBackend);
  }

  async get(id: string): Promise<Mascota | null> {
    try {
      const res = await firstValueFrom(this.http.get<BackendPet>(`${this.base}/${id}`));
      return mapPetFromBackend(res);
    } catch {
      return null;
    }
  }

  async create(data: Omit<Mascota, 'id'>): Promise<Mascota> {
    const body = mapPetToBackend(data);
    const res = await firstValueFrom(this.http.post<BackendPet>(this.base, body));
    return mapPetFromBackend(res);
  }

  async update(id: string, data: Omit<Mascota, 'id'>): Promise<Mascota> {
    const body = mapPetToBackend(data);
    const res = await firstValueFrom(this.http.put<BackendPet>(`${this.base}/${id}`, body));
    return mapPetFromBackend(res);
  }

  async remove(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${this.base}/${id}`));
  }
}

// ---------- In-memory implementation ----------

export class InMemoryPetRepository implements PetRepository {
  private data: Mascota[] = [...MOCK_MASCOTAS];

  async list(): Promise<Mascota[]> {
    return this.data;
  }

  async listByUser(idUsuario: string): Promise<Mascota[]> {
    return this.data.filter(m => m.idUsuario === idUsuario);
  }

  async get(id: string): Promise<Mascota | null> {
    return this.data.find(m => m.id === id) ?? null;
  }

  async create(data: Omit<Mascota, 'id'>): Promise<Mascota> {
    const created: Mascota = { ...data, id: `m-${Date.now()}` };
    this.data = [...this.data, created];
    return created;
  }

  async update(id: string, data: Omit<Mascota, 'id'>): Promise<Mascota> {
    const updated: Mascota = { ...data, id };
    this.data = this.data.map(m => (m.id === id ? updated : m));
    return updated;
  }

  async remove(id: string): Promise<void> {
    this.data = this.data.filter(m => m.id !== id);
  }
}
