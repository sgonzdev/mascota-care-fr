import { Injectable, inject, signal } from '@angular/core';
import { Regla, NivelUrgencia, Mascota } from '../models/consultation.model';
import { RULE_REPOSITORY } from '../repositories/rule.repository';

export interface TriageResult {
  nivel: NivelUrgencia;
  regla: Regla | null;
  accion: string;
}

@Injectable({ providedIn: 'root' })
export class RuleService {
  private readonly repo = inject(RULE_REPOSITORY);
  private readonly _reglas = signal<Regla[]>(this.repo.list());
  readonly reglas = this._reglas.asReadonly();

  create(data: Omit<Regla, 'id'>): Regla {
    const r = this.repo.create(data);
    this.refresh();
    return r;
  }

  update(id: string, changes: Partial<Regla>): void {
    this.repo.update(id, changes);
    this.refresh();
  }

  toggle(id: string): void {
    this.repo.toggle(id);
    this.refresh();
  }

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
      accion: 'No se encontró una regla específica. Se recomienda consulta veterinaria en 24-48h para evaluación.',
    };
  }

  private matches(text: string, condition: string): boolean {
    const keywords = condition.split('_').filter(w => w.length > 3);
    return keywords.some(k => text.includes(k));
  }

  private refresh(): void {
    this._reglas.set([...this.repo.list()]);
  }
}
