import { InjectionToken } from '@angular/core';
import { Consulta } from '../models/consultation.model';
import { MOCK_CONSULTAS } from '../data/consultations.mock';

export interface ConsultationRepository {
  list(): Consulta[];
}

export const CONSULTATION_REPOSITORY = new InjectionToken<ConsultationRepository>(
  'ConsultationRepository',
  { providedIn: 'root', factory: () => new InMemoryConsultationRepository() },
);

export class InMemoryConsultationRepository implements ConsultationRepository {
  list(): Consulta[] {
    return MOCK_CONSULTAS;
  }
}
