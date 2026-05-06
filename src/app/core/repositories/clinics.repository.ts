import { HttpClient } from '@angular/common/http';
import { InjectionToken, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Clinica } from '../models/clinic.model';

export interface ClinicsQuery {
  lat: number;
  lng: number;
  radius?: number;
  limit?: number;
}

export interface ClinicsRepository {
  findNearby(q: ClinicsQuery): Promise<Clinica[]>;
}

export const CLINICS_REPOSITORY = new InjectionToken<ClinicsRepository>('ClinicsRepository', {
  providedIn: 'root',
  factory: () => new HttpClinicsRepository(inject(HttpClient)),
});

export class HttpClinicsRepository implements ClinicsRepository {
  private readonly base = `${environment.apiBaseUrl}/api/clinics`;

  constructor(private readonly http: HttpClient) {}

  async findNearby(q: ClinicsQuery): Promise<Clinica[]> {
    const params: Record<string, string> = {
      lat: String(q.lat),
      lng: String(q.lng),
      radius: String(q.radius ?? 5000),
      limit: String(q.limit ?? 10),
    };
    return firstValueFrom(this.http.get<Clinica[]>(`${this.base}/nearby`, { params }));
  }
}
