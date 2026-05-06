import { HttpClient } from '@angular/common/http';
import { InjectionToken, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Metrica } from '../models/consultation.model';
import { MOCK_METRICAS } from '../data/additional-data.mock';

export interface DashboardData {
  totalConsultas: number;
  distribucionUrgencia: { ALTA: number; MEDIA: number; BAJA: number };
  tasaMejora: number;
  consultasPorDia: { fecha: Date; total: number }[];
  topReglas: { reglaId: string; activaciones: number }[];
}

export interface MetricsRepository {
  /** Legacy per-day shape (used by mock-only views). */
  last7Days(): Promise<Metrica[]>;
  /** Aggregated dashboard payload (the canonical shape going forward). */
  dashboard(days?: number): Promise<DashboardData>;
}

export const METRICS_REPOSITORY = new InjectionToken<MetricsRepository>('MetricsRepository', {
  providedIn: 'root',
  factory: () => {
    if (environment.useMocks) return new InMemoryMetricsRepository();
    return new HttpMetricsRepository(inject(HttpClient));
  },
});

// ---------- HTTP implementation ----------

interface BackendDashboardResponse {
  totalConsultas: number;
  distribucionUrgencia: Record<string, number>;
  tasaMejora: number;
  consultasPorDia: { fecha: string; total: number }[];
  topReglas: { reglaId: string; activaciones: number }[];
}

export class HttpMetricsRepository implements MetricsRepository {
  private readonly base = `${environment.apiBaseUrl}/api/metrics`;

  constructor(private readonly http: HttpClient) {}

  async dashboard(days = 7): Promise<DashboardData> {
    const res = await firstValueFrom(
      this.http.get<BackendDashboardResponse>(`${this.base}/dashboard`, {
        params: { days: String(days) },
      }),
    );
    return {
      totalConsultas: res.totalConsultas,
      distribucionUrgencia: {
        ALTA: res.distribucionUrgencia?.['ALTA'] ?? 0,
        MEDIA: res.distribucionUrgencia?.['MEDIA'] ?? 0,
        BAJA: res.distribucionUrgencia?.['BAJA'] ?? 0,
      },
      tasaMejora: res.tasaMejora,
      consultasPorDia: (res.consultasPorDia ?? []).map(p => ({
        fecha: new Date(p.fecha),
        total: p.total,
      })),
      topReglas: res.topReglas ?? [],
    };
  }

  async last7Days(): Promise<Metrica[]> {
    const d = await this.dashboard(7);
    // Synthesize legacy Metrica[] from the per-day points so old views keep working.
    const totalDist =
      d.distribucionUrgencia.ALTA + d.distribucionUrgencia.MEDIA + d.distribucionUrgencia.BAJA;
    const altaShare = totalDist === 0 ? 0 : d.distribucionUrgencia.ALTA / totalDist;
    const mediaShare = totalDist === 0 ? 0 : d.distribucionUrgencia.MEDIA / totalDist;
    const topRule = d.topReglas[0]?.reglaId ?? null;
    return d.consultasPorDia.map((p, idx) => {
      const altas = Math.round(p.total * altaShare);
      const medias = Math.round(p.total * mediaShare);
      return {
        id: `met-${idx}`,
        fecha: p.fecha,
        totalConsultas: p.total,
        urgenciasAltas: altas,
        urgenciasMedias: medias,
        urgenciasBajas: Math.max(0, p.total - altas - medias),
        tasaMejora: Math.round(d.tasaMejora * 100),
        reglaMasActivadaId: topRule,
      };
    });
  }
}

// ---------- In-memory implementation ----------

export class InMemoryMetricsRepository implements MetricsRepository {
  async last7Days(): Promise<Metrica[]> {
    return MOCK_METRICAS;
  }

  async dashboard(): Promise<DashboardData> {
    const data = MOCK_METRICAS;
    const totalConsultas = data.reduce((s, m) => s + m.totalConsultas, 0);
    const altas = data.reduce((s, m) => s + m.urgenciasAltas, 0);
    const medias = data.reduce((s, m) => s + m.urgenciasMedias, 0);
    const bajas = data.reduce((s, m) => s + m.urgenciasBajas, 0);
    const tasaMejora =
      data.reduce((s, m) => s + m.tasaMejora, 0) / Math.max(1, data.length) / 100;
    const topRule = data.at(-1)?.reglaMasActivadaId ?? null;
    return {
      totalConsultas,
      distribucionUrgencia: { ALTA: altas, MEDIA: medias, BAJA: bajas },
      tasaMejora,
      consultasPorDia: data.map(m => ({ fecha: m.fecha, total: m.totalConsultas })),
      topReglas: topRule ? [{ reglaId: topRule, activaciones: altas + medias + bajas }] : [],
    };
  }
}
