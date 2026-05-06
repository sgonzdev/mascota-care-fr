import { HttpClient } from '@angular/common/http';
import { InjectionToken, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Canal,
  EstadoConsulta,
  EstadoSeguimiento,
  Mascota,
  NivelUrgencia,
} from '../models/consultation.model';
import { MOCK_CONSULTAS } from '../data/consultations.mock';

export interface TriageRemoteResult {
  idSintoma: string;
  nivelUrgencia: NivelUrgencia;
  accionRecomendada: string;
  idReglaAplicada: string | null;
}

export interface FollowupCreatePayload {
  idConsulta: string;
  idMascota: string;
  estado: EstadoSeguimiento;
  observaciones: string;
}

/** Flat backend projection of /api/consultations. The richer nested model is built in the service. */
export interface RemoteConsulta {
  id: string;
  idMascota: string;
  idUsuario: string;
  fechaHora: string;
  descripcionSintomas: string;
  nivelUrgencia: NivelUrgencia;
  respuestaGenerada: string;
  idReglaAplicada: string | null;
  canal: Canal;
  estado: EstadoConsulta;
  notasInternas: string;
  actualizadaEn: string;
}

export interface ConsultationPatch {
  estado?: EstadoConsulta;
  notasInternas?: string;
}

export interface ConsultationRepository {
  list(idUsuario?: string): Promise<RemoteConsulta[]>;
  get(id: string): Promise<RemoteConsulta | null>;
  patch(id: string, body: ConsultationPatch): Promise<RemoteConsulta>;
  triage(input: { mascota: Mascota; descripcionLibre: string }): Promise<TriageRemoteResult | null>;
  saveFollowup(payload: FollowupCreatePayload): Promise<boolean>;
}

export const CONSULTATION_REPOSITORY = new InjectionToken<ConsultationRepository>(
  'ConsultationRepository',
  {
    providedIn: 'root',
    factory: () => {
      if (environment.useMocks) return new InMemoryConsultationRepository();
      return new HttpConsultationRepository(inject(HttpClient));
    },
  },
);

// ---------- HTTP implementation ----------

interface BackendTriageFlowResponse {
  idSintoma: string;
  nivelUrgencia: NivelUrgencia;
  accionRecomendada: string;
  idReglaAplicada: string | null;
  detalleSintoma?: unknown;
}

export class HttpConsultationRepository implements ConsultationRepository {
  private readonly base = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  async list(idUsuario?: string): Promise<RemoteConsulta[]> {
    const params: Record<string, string> = { estado: 'all' };
    if (idUsuario) params['idUsuario'] = idUsuario;
    return firstValueFrom(
      this.http.get<RemoteConsulta[]>(`${this.base}/api/consultations`, { params }),
    );
  }

  async get(id: string): Promise<RemoteConsulta | null> {
    try {
      return await firstValueFrom(
        this.http.get<RemoteConsulta>(`${this.base}/api/consultations/${id}`),
      );
    } catch {
      return null;
    }
  }

  async patch(id: string, body: ConsultationPatch): Promise<RemoteConsulta> {
    return firstValueFrom(
      this.http.patch<RemoteConsulta>(`${this.base}/api/consultations/${id}`, body),
    );
  }

  async triage(input: {
    mascota: Mascota;
    descripcionLibre: string;
  }): Promise<TriageRemoteResult | null> {
    const { mascota, descripcionLibre } = input;
    const body = {
      idMascota: mascota.id,
      especie: mascota.especie.toUpperCase(),
      edadMeses: mascota.edadMeses,
      descripcionLibre,
    };
    const res = await firstValueFrom(
      this.http.post<BackendTriageFlowResponse>(`${this.base}/api/symptoms/triage`, body),
    );
    return {
      idSintoma: res.idSintoma,
      nivelUrgencia: res.nivelUrgencia,
      accionRecomendada: res.accionRecomendada,
      idReglaAplicada: res.idReglaAplicada ?? null,
    };
  }

  async saveFollowup(payload: FollowupCreatePayload): Promise<boolean> {
    const body = {
      idConsulta: payload.idConsulta,
      idMascota: payload.idMascota,
      estado: estadoSeguimientoToBackend(payload.estado),
      observaciones: payload.observaciones,
    };
    try {
      await firstValueFrom(this.http.post(`${this.base}/api/followups`, body));
      return true;
    } catch {
      return false;
    }
  }
}

function estadoSeguimientoToBackend(e: EstadoSeguimiento): 'MEJORO' | 'NO_MEJORO' | 'SIN_DATO' {
  switch (e) {
    case 'mejoro': return 'MEJORO';
    case 'no_mejoro': return 'NO_MEJORO';
    default: return 'SIN_DATO';
  }
}

// ---------- In-memory implementation ----------

export class InMemoryConsultationRepository implements ConsultationRepository {
  async list(): Promise<RemoteConsulta[]> {
    return MOCK_CONSULTAS.map(c => ({
      id: c.id, idMascota: c.idMascota, idUsuario: c.idUsuario,
      fechaHora: c.fechaHora.toISOString(), descripcionSintomas: c.descripcionSintomas,
      nivelUrgencia: c.nivelUrgencia, respuestaGenerada: c.respuestaGenerada,
      idReglaAplicada: c.idReglaAplicada, canal: c.canal, estado: c.estado,
      notasInternas: c.notasInternas, actualizadaEn: c.actualizadaEn.toISOString(),
    }));
  }
  async get(): Promise<RemoteConsulta | null> { return null; }
  async patch(_id: string, _body: ConsultationPatch): Promise<RemoteConsulta> {
    throw new Error('InMemory patch not supported');
  }
  async triage(): Promise<TriageRemoteResult | null> { return null; }
  async saveFollowup(): Promise<boolean> { return true; }
}
