import { Component, computed, inject } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import type { ChartConfiguration } from 'chart.js';
import { MetricsService } from '../../core/services/metrics.service';
import { RuleService } from '../../core/services/rule.service';
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

  readonly data = this.metrics.last7Days();

  readonly kpis = computed(() => {
    const total = this.data.reduce((s, m) => s + m.totalConsultas, 0);
    const altas = this.data.reduce((s, m) => s + m.urgenciasAltas, 0);
    const mejora = Math.round(this.data.reduce((s, m) => s + m.tasaMejora, 0) / this.data.length);
    return { total, altas, mejora };
  });

  readonly topRegla = computed(() => {
    const id = this.data.at(-1)?.reglaMasActivadaId;
    return id ? this.rules.reglas().find(r => r.id === id)?.condicionSintoma ?? '—' : '—';
  });

  readonly volumeChart: ChartConfiguration<'line'>['data'] = {
    labels: this.data.map(m => m.fecha.toLocaleDateString('es', { weekday: 'short' })),
    datasets: [{
      label: 'Consultas por día',
      data: this.data.map(m => m.totalConsultas),
      borderColor: '#1E90FF',
      backgroundColor: 'rgba(30,144,255,0.15)',
      fill: true,
      tension: 0.35,
    }],
  };

  readonly distributionChart: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Alta', 'Media', 'Baja'],
    datasets: [{
      data: [
        this.data.reduce((s, m) => s + m.urgenciasAltas, 0),
        this.data.reduce((s, m) => s + m.urgenciasMedias, 0),
        this.data.reduce((s, m) => s + m.urgenciasBajas, 0),
      ],
      backgroundColor: ['#EF4444', '#F59E0B', '#16A34A'],
    }],
  };

  readonly improvementChart: ChartConfiguration<'bar'>['data'] = {
    labels: this.data.map(m => m.fecha.toLocaleDateString('es', { weekday: 'short' })),
    datasets: [{
      label: 'Tasa de mejora (%)',
      data: this.data.map(m => m.tasaMejora),
      backgroundColor: '#1E90FF',
      borderRadius: 6,
    }],
  };

  readonly chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
  };
}
