import { Injectable, inject } from '@angular/core';
import { METRICS_REPOSITORY } from '../repositories/metrics.repository';

@Injectable({ providedIn: 'root' })
export class MetricsService {
  private readonly repo = inject(METRICS_REPOSITORY);
  last7Days() { return this.repo.last7Days(); }
}
