import { InjectionToken } from '@angular/core';
import { Regla } from '../models/consultation.model';
import { MOCK_REGLAS } from '../data/additional-data.mock';

export interface RuleRepository {
  list(): Regla[];
  create(data: Omit<Regla, 'id'>): Regla;
  update(id: string, data: Partial<Regla>): Regla | null;
  toggle(id: string): void;
}

export const RULE_REPOSITORY = new InjectionToken<RuleRepository>('RuleRepository', {
  providedIn: 'root',
  factory: () => new InMemoryRuleRepository(),
});

export class InMemoryRuleRepository implements RuleRepository {
  private data: Regla[] = [...MOCK_REGLAS];

  list(): Regla[] { return this.data; }

  create(data: Omit<Regla, 'id'>): Regla {
    const created: Regla = { ...data, id: `r-${Date.now()}` };
    this.data = [...this.data, created];
    return created;
  }

  update(id: string, changes: Partial<Regla>): Regla | null {
    let updated: Regla | null = null;
    this.data = this.data.map(r => {
      if (r.id === id) { updated = { ...r, ...changes }; return updated; }
      return r;
    });
    return updated;
  }

  toggle(id: string): void {
    this.data = this.data.map(r => r.id === id ? { ...r, activa: !r.activa } : r);
  }
}
