import { HttpClient } from '@angular/common/http';
import { InjectionToken, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  FuenteGuia,
  Guia,
  GuiaCreatePayload,
  TipoGuia,
} from '../models/guide.model';

interface BackendGuide {
  id: string;
  idMascota: string;
  tipo: TipoGuia;
  contenidoHtml: string;
  fuente: FuenteGuia;
  fechaGeneracion: string;
}

function mapGuide(b: BackendGuide): Guia {
  return {
    id: b.id, idMascota: b.idMascota, tipo: b.tipo,
    contenidoHtml: b.contenidoHtml, fuente: b.fuente,
    fechaGeneracion: new Date(b.fechaGeneracion),
  };
}

export interface GuideRepository {
  generate(payload: GuiaCreatePayload): Promise<Guia>;
  historyByPet(idMascota: string): Promise<Guia[]>;
  get(id: string): Promise<Guia | null>;
}

export const GUIDE_REPOSITORY = new InjectionToken<GuideRepository>('GuideRepository', {
  providedIn: 'root',
  factory: () => new HttpGuideRepository(inject(HttpClient)),
});

export class HttpGuideRepository implements GuideRepository {
  private readonly base = `${environment.apiBaseUrl}/api/guides`;

  constructor(private readonly http: HttpClient) {}

  async generate(payload: GuiaCreatePayload): Promise<Guia> {
    const body = { ...payload, especie: payload.especie.toUpperCase() };
    const res = await firstValueFrom(this.http.post<BackendGuide>(`${this.base}/generate`, body));
    return mapGuide(res);
  }

  async historyByPet(idMascota: string): Promise<Guia[]> {
    const res = await firstValueFrom(
      this.http.get<BackendGuide[]>(`${this.base}/by-pet/${idMascota}`),
    );
    return res.map(mapGuide);
  }

  async get(id: string): Promise<Guia | null> {
    try {
      const res = await firstValueFrom(this.http.get<BackendGuide>(`${this.base}/${id}`));
      return mapGuide(res);
    } catch {
      return null;
    }
  }
}
