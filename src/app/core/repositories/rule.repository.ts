import { HttpClient } from '@angular/common/http';
import { InjectionToken, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Especie, NivelUrgencia, Regla } from '../models/consultation.model';
import { MOCK_REGLAS } from '../data/additional-data.mock';

export interface RuleRepository {
  list(): Promise<Regla[]>;
  create(data: Omit<Regla, 'id'>): Promise<Regla>;
  update(id: string, data: Partial<Regla>): Promise<Regla | null>;
  toggle(id: string): Promise<Regla | null>;
  remove(id: string): Promise<void>;
}

export const RULE_REPOSITORY = new InjectionToken<RuleRepository>('RuleRepository', {
  providedIn: 'root',
  factory: () => {
    if (environment.useMocks) return new InMemoryRuleRepository();
    return new HttpRuleRepository(inject(HttpClient));
  },
});

// ---------- Mapping helpers ----------

type BackendEspecie = 'PERRO' | 'GATO' | 'OTRO' | 'TODAS';

interface BackendRule {
  id: string;
  condicionSintoma: string;
  especieAplica: BackendEspecie;
  edadMinMeses: number;
  edadMaxMeses: number;
  nivelUrgenciaResultado: NivelUrgencia;
  accionRecomendada: string;
  prioridad: number;
  activa: boolean;
}

function especieAplicaToBackend(e: Especie | 'todas'): BackendEspecie {
  return e.toUpperCase() as BackendEspecie;
}
function especieAplicaFromBackend(e: BackendEspecie): Especie | 'todas' {
  return e.toLowerCase() as Especie | 'todas';
}

function mapRuleFromBackend(r: BackendRule): Regla {
  return {
    id: r.id,
    condicionSintoma: r.condicionSintoma,
    especieAplica: especieAplicaFromBackend(r.especieAplica),
    edadMinMeses: r.edadMinMeses,
    edadMaxMeses: r.edadMaxMeses,
    nivelUrgenciaResultado: r.nivelUrgenciaResultado,
    accionRecomendada: r.accionRecomendada,
    prioridad: r.prioridad,
    activa: r.activa,
  };
}

function mapRuleToBackend(r: Partial<Regla>): Partial<BackendRule> {
  const out: Partial<BackendRule> = { ...r } as Partial<BackendRule>;
  if (r.especieAplica !== undefined) {
    out.especieAplica = especieAplicaToBackend(r.especieAplica);
  }
  return out;
}

// ---------- HTTP implementation ----------

export class HttpRuleRepository implements RuleRepository {
  private readonly base = `${environment.apiBaseUrl}/api/rules`;

  constructor(private readonly http: HttpClient) {}

  async list(): Promise<Regla[]> {
    const res = await firstValueFrom(this.http.get<BackendRule[]>(this.base));
    return res.map(mapRuleFromBackend);
  }

  async create(data: Omit<Regla, 'id'>): Promise<Regla> {
    const body = mapRuleToBackend(data);
    const res = await firstValueFrom(this.http.post<BackendRule>(this.base, body));
    return mapRuleFromBackend(res);
  }

  async update(id: string, data: Partial<Regla>): Promise<Regla | null> {
    const body = mapRuleToBackend(data);
    const res = await firstValueFrom(this.http.put<BackendRule>(`${this.base}/${id}`, body));
    return mapRuleFromBackend(res);
  }

  async toggle(id: string): Promise<Regla | null> {
    const res = await firstValueFrom(this.http.post<BackendRule>(`${this.base}/${id}/toggle`, {}));
    return mapRuleFromBackend(res);
  }

  async remove(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${this.base}/${id}`));
  }
}

// ---------- In-memory implementation ----------

export class InMemoryRuleRepository implements RuleRepository {
  private data: Regla[] = [...MOCK_REGLAS];

  async list(): Promise<Regla[]> {
    return this.data;
  }

  async create(data: Omit<Regla, 'id'>): Promise<Regla> {
    const created: Regla = { ...data, id: `r-${Date.now()}` };
    this.data = [...this.data, created];
    return created;
  }

  async update(id: string, changes: Partial<Regla>): Promise<Regla | null> {
    let updated: Regla | null = null;
    this.data = this.data.map(r => {
      if (r.id === id) {
        updated = { ...r, ...changes };
        return updated;
      }
      return r;
    });
    return updated;
  }

  async toggle(id: string): Promise<Regla | null> {
    let updated: Regla | null = null;
    this.data = this.data.map(r => {
      if (r.id === id) {
        updated = { ...r, activa: !r.activa };
        return updated;
      }
      return r;
    });
    return updated;
  }

  async remove(id: string): Promise<void> {
    this.data = this.data.filter(r => r.id !== id);
  }
}
