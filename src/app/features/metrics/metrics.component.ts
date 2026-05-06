import { Component, computed, inject, signal } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import type { ChartConfiguration } from 'chart.js';
import { MetricsService } from '../../core/services/metrics.service';
import { RuleService } from '../../core/services/rule.service';
import { DashboardData } from '../../core/repositories/metrics.repository';
import { CardComponent } from '../../shared/components/card/card.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-metrics',
  standalone: true,
  imports: [BaseChartDirective, CardComponent, PageHeaderComponent],
  templateUrl: './metrics.component.html',
  styleUrl: './metrics.component.scss',
})
export class MetricsComponent {
  private readonly metrics = inject(MetricsService);
  private readonly rules = inject(RuleService);

  private readonly _data = signal<DashboardData | null>(null);

  readonly kpis = computed(() => {
    const d = this._data();
    if (!d) return { total: 0, altas: 0, mejora: 0 };
    return {
      total: d.totalConsultas,
      altas: d.distribucionUrgencia.ALTA,
      mejora: Math.round(d.tasaMejora * 100),
    };
  });

  readonly topRegla = computed(() => {
    const id = this._data()?.topReglas[0]?.reglaId;
    return id ? this.rules.reglas().find(r => r.id === id)?.condicionSintoma ?? '—' : '—';
  });

  readonly volumeChart = computed<ChartConfiguration<'line'>['data']>(() => {
    const points = this._data()?.consultasPorDia ?? [];
    return {
      labels: points.map(p => p.fecha.toLocaleDateString('es', { weekday: 'short' })),
      datasets: [
        {
          label: 'Consultas por día',
          data: points.map(p => p.total),
          borderColor: '#1E90FF',
          backgroundColor: 'rgba(30,144,255,0.15)',
          fill: true,
          tension: 0.35,
        },
      ],
    };
  });

  readonly distributionChart = computed<ChartConfiguration<'doughnut'>['data']>(() => {
    const d = this._data();
    return {
      labels: ['Alta', 'Media', 'Baja'],
      datasets: [
        {
          data: [
            d?.distribucionUrgencia.ALTA ?? 0,
            d?.distribucionUrgencia.MEDIA ?? 0,
            d?.distribucionUrgencia.BAJA ?? 0,
          ],
          backgroundColor: ['#EF4444', '#F59E0B', '#16A34A'],
        },
      ],
    };
  });

  readonly improvementChart = computed<ChartConfiguration<'bar'>['data']>(() => {
    const points = this._data()?.consultasPorDia ?? [];
    const tasaPct = Math.round((this._data()?.tasaMejora ?? 0) * 100);
    return {
      labels: points.map(p => p.fecha.toLocaleDateString('es', { weekday: 'short' })),
      datasets: [
        {
          label: 'Tasa de mejora (%)',
          // The backend returns an aggregate rate, so we render it flat across the series.
          data: points.map(() => tasaPct),
          backgroundColor: '#1E90FF',
          borderRadius: 6,
        },
      ],
    };
  });

  readonly chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
  };

  constructor() {
    void this.metrics.loadDashboard(7).then(data => this._data.set(data));
  }
}
