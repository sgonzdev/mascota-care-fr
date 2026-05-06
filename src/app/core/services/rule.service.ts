import { Injectable, effect, inject, signal } from '@angular/core';
import { Mascota, NivelUrgencia, Regla } from '../models/consultation.model';
import { RULE_REPOSITORY } from '../repositories/rule.repository';
import { AuthService } from './auth.service';

export interface TriageResult {
  nivel: NivelUrgencia;
  regla: Regla | null;
  accion: string;
}

@Injectable({ providedIn: 'root' })
export class RuleService {
  private readonly repo = inject(RULE_REPOSITORY);
  private readonly auth = inject(AuthService);
  private readonly _reglas = signal<Regla[]>([]);
  readonly reglas = this._reglas.asReadonly();

  constructor() {
    effect(() => {
      if (this.auth.usuario()) {
        void this.refresh();
      }
    });
  }

  async refresh(): Promise<void> {
    try {
      const list = await this.repo.list();
      this._reglas.set(list);
    } catch {
      this._reglas.set([]);
    }
  }

  async create(data: Omit<Regla, 'id'>): Promise<Regla> {
    const r = await this.repo.create(data);
    await this.refresh();
    return r;
  }

  async update(id: string, changes: Partial<Regla>): Promise<void> {
    await this.repo.update(id, changes);
    await this.refresh();
  }

  async toggle(id: string): Promise<void> {
    await this.repo.toggle(id);
    await this.refresh();
  }

  /** Local fallback evaluator (used by the in-memory consultation flow). */
  evaluate(mascota: Mascota, sintomas: string): TriageResult {
    const text = sintomas.toLowerCase();
    const active = this._reglas()
      .filter(r => r.activa)
      .filter(r => r.especieAplica === 'todas' || r.especieAplica === mascota.especie)
      .filter(r => mascota.edadMeses >= r.edadMinMeses && mascota.edadMeses <= r.edadMaxMeses)
      .sort((a, b) => a.prioridad - b.prioridad);

    const matched = active.find(r => this.matches(text, r.condicionSintoma));
    if (matched) {
      return { nivel: matched.nivelUrgenciaResultado, regla: matched, accion: matched.accionRecomendada };
    }
    return {
      nivel: 'MEDIA',
      regla: null,
      accion:
        'No se encontró una regla específica. Se recomienda consulta veterinaria en 24-48h para evaluación.',
    };
  }

  private matches(text: string, condition: string): boolean {
    const keywords = condition.split('_').filter(w => w.length > 3);
    return keywords.some(k => text.includes(k));
  }
}
