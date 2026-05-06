import { Injectable, inject, signal } from '@angular/core';
import { Metrica } from '../models/consultation.model';
import { DashboardData, METRICS_REPOSITORY } from '../repositories/metrics.repository';

@Injectable({ providedIn: 'root' })
export class MetricsService {
  private readonly repo = inject(METRICS_REPOSITORY);
  private readonly _last7 = signal<Metrica[]>([]);
  private readonly _dashboard = signal<DashboardData | null>(null);

  readonly last7 = this._last7.asReadonly();
  readonly dashboard = this._dashboard.asReadonly();

  async loadLast7Days(): Promise<Metrica[]> {
    try {
      const data = await this.repo.last7Days();
      this._last7.set(data);
      return data;
    } catch {
      this._last7.set([]);
      return [];
    }
  }

  async loadDashboard(days = 7): Promise<DashboardData | null> {
    try {
      const data = await this.repo.dashboard(days);
      this._dashboard.set(data);
      return data;
    } catch {
      this._dashboard.set(null);
      return null;
    }
  }
}
