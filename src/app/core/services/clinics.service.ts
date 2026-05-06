import { Injectable, inject, signal } from '@angular/core';
import { Clinica } from '../models/clinic.model';
import { CLINICS_REPOSITORY } from '../repositories/clinics.repository';

export type ClinicsErrorKind = 'permission' | 'unavailable' | 'network' | 'unknown';

export interface ClinicsError {
  kind: ClinicsErrorKind;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ClinicsService {
  private readonly repo = inject(CLINICS_REPOSITORY);

  private readonly _clinicas = signal<Clinica[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<ClinicsError | null>(null);

  readonly clinicas = this._clinicas.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  async findNearby(): Promise<void> {
    this._error.set(null);
    this._loading.set(true);
    try {
      const coords = await this.geolocate();
      const list = await this.repo.findNearby({ lat: coords.lat, lng: coords.lng });
      this._clinicas.set(list);
    } catch (err) {
      this._clinicas.set([]);
      this._error.set(this.toError(err));
    } finally {
      this._loading.set(false);
    }
  }

  reset(): void {
    this._clinicas.set([]);
    this._error.set(null);
  }

  private geolocate(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        reject({ kind: 'unavailable', message: 'Tu navegador no soporta geolocalización' } as ClinicsError);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        e => reject(this.fromGeoErr(e)),
        { timeout: 10000, maximumAge: 60000, enableHighAccuracy: false },
      );
    });
  }

  private fromGeoErr(e: GeolocationPositionError): ClinicsError {
    if (e.code === e.PERMISSION_DENIED) {
      return { kind: 'permission', message: 'Permiso de ubicación denegado' };
    }
    if (e.code === e.POSITION_UNAVAILABLE) {
      return { kind: 'unavailable', message: 'No se pudo determinar tu ubicación' };
    }
    return { kind: 'unknown', message: 'No se pudo obtener la ubicación' };
  }

  private toError(err: unknown): ClinicsError {
    if (err && typeof err === 'object' && 'kind' in err) return err as ClinicsError;
    return { kind: 'network', message: 'Error consultando clínicas cercanas' };
  }
}
