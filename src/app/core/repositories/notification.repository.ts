import { HttpClient } from '@angular/common/http';
import { InjectionToken, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CanalNotificacion,
  EstadoNotificacion,
  Notificacion,
} from '../models/notification.model';

interface BackendNotification {
  id: string;
  destinatario: string;
  canal: CanalNotificacion;
  asunto: string;
  contenido: string;
  estado: EstadoNotificacion;
  intentos: number;
  errorMessage: string | null;
  creadaEn: string;
  enviadaEn: string | null;
}

export interface NotificationRepository {
  list(): Promise<Notificacion[]>;
  get(id: string): Promise<Notificacion | null>;
}

export const NOTIFICATION_REPOSITORY = new InjectionToken<NotificationRepository>(
  'NotificationRepository',
  { providedIn: 'root', factory: () => new HttpNotificationRepository(inject(HttpClient)) },
);

function mapNotification(b: BackendNotification): Notificacion {
  return {
    id: b.id, destinatario: b.destinatario, canal: b.canal,
    asunto: b.asunto, contenido: b.contenido, estado: b.estado,
    intentos: b.intentos, errorMessage: b.errorMessage,
    creadaEn: new Date(b.creadaEn),
    enviadaEn: b.enviadaEn ? new Date(b.enviadaEn) : null,
  };
}

export class HttpNotificationRepository implements NotificationRepository {
  private readonly base = `${environment.apiBaseUrl}/api/notifications`;

  constructor(private readonly http: HttpClient) {}

  async list(): Promise<Notificacion[]> {
    const res = await firstValueFrom(this.http.get<BackendNotification[]>(this.base));
    return res.map(mapNotification);
  }

  async get(id: string): Promise<Notificacion | null> {
    try {
      const res = await firstValueFrom(this.http.get<BackendNotification>(`${this.base}/${id}`));
      return mapNotification(res);
    } catch {
      return null;
    }
  }
}
