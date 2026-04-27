import { InjectionToken } from '@angular/core';
import { Metrica } from '../models/consultation.model';
import { MOCK_METRICAS } from '../data/additional-data.mock';

export interface MetricsRepository {
  last7Days(): Metrica[];
}

export const METRICS_REPOSITORY = new InjectionToken<MetricsRepository>('MetricsRepository', {
  providedIn: 'root',
  factory: () => new InMemoryMetricsRepository(),
});

export class InMemoryMetricsRepository implements MetricsRepository {
  last7Days(): Metrica[] { return MOCK_METRICAS; }
}
