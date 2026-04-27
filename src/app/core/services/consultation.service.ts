import { Injectable, computed, inject, signal } from '@angular/core';
import { Consulta, EstadoConsulta, Mascota, Seguimiento } from '../models/consultation.model';
import { CONSULTATION_REPOSITORY } from '../repositories/consultation.repository';
import { AuthService } from './auth.service';
import { RuleService, TriageResult } from './rule.service';

type StatusFilter = EstadoConsulta | 'all';

@Injectable({ providedIn: 'root' })
export class ConsultationService {
  private readonly repository = inject(CONSULTATION_REPOSITORY);
  private readonly auth = inject(AuthService);
  private readonly rules = inject(RuleService);

  private readonly _consultas = signal<Consulta[]>(this.repository.list());
  private readonly _selectedId = signal<string | null>(null);
  private readonly _filter = signal<StatusFilter>('all');

  readonly filter = this._filter.asReadonly();
  readonly allConsultas = this._consultas.asReadonly();

  readonly consultas = computed(() => {
    const status = this._filter();
    const list = this._consultas();
    return status === 'all' ? list : list.filter(c => c.estado === status);
  });

  readonly selected = computed(() => {
    const id = this._selectedId();
    return id ? this._consultas().find(c => c.id === id) ?? null : null;
  });

  readonly activeCount = computed(() => this._consultas().filter(c => c.estado === 'activa').length);
  readonly resolvedTodayCount = computed(() => {
    const today = new Date().toDateString();
    return this._consultas().filter(
      c => c.estado === 'resuelta' && new Date(c.actualizadaEn).toDateString() === today,
    ).length;
  });
  readonly highUrgencyCount = computed(() => this._consultas().filter(c => c.nivelUrgencia === 'ALTA').length);

  select(id: string | null): void { this._selectedId.set(id); }
  setFilter(status: StatusFilter): void { this._filter.set(status); }

  archive(id: string): void { this.patch(id, { estado: 'archivada' }); }
  updateNotes(id: string, notasInternas: string): void { this.patch(id, { notasInternas }); }

  create(mascota: Mascota, descripcionSintomas: string): { consulta: Consulta; triage: TriageResult } {
    const user = this.auth.usuario();
    const triage = this.rules.evaluate(mascota, descripcionSintomas);
    const nextCase = String(1024 + this._consultas().length + 1);
    const consulta: Consulta = {
      id: `c-${Date.now()}`,
      caseNumber: nextCase,
      idMascota: mascota.id,
      idUsuario: user?.id ?? 'u1',
      fechaHora: new Date(),
      descripcionSintomas,
      nivelUrgencia: triage.nivel,
      respuestaGenerada: triage.accion,
      canal: 'web',
      idReglaAplicada: triage.regla?.id ?? null,
      estado: triage.nivel === 'ALTA' ? 'pendiente' : 'activa',
      notasInternas: '',
      actualizadaEn: new Date(),
      mascota,
      usuario: user ?? { id: 'u1', nombre: 'Invitado', email: '', telefono: '', rol: 'dueno', fechaRegistro: new Date() },
      reglaAplicada: triage.regla,
      seguimientos: [],
    };
    this._consultas.update(list => [consulta, ...list]);
    return { consulta, triage };
  }

  addFollowup(idConsulta: string, data: Omit<Seguimiento, 'id' | 'idConsulta' | 'alertaEnviada'>): void {
    const seguimiento: Seguimiento = {
      id: `s-${Date.now()}`, idConsulta, alertaEnviada: data.estado === 'no_mejoro', ...data,
    };
    const nuevoEstado: EstadoConsulta = data.estado === 'mejoro' ? 'resuelta' : 'activa';
    this._consultas.update(list =>
      list.map(c => c.id === idConsulta
        ? { ...c, seguimientos: [...c.seguimientos, seguimiento], estado: nuevoEstado, actualizadaEn: new Date() }
        : c),
    );
  }

  private patch(id: string, changes: Partial<Consulta>): void {
    this._consultas.update(list =>
      list.map(c => (c.id === id ? { ...c, ...changes, actualizadaEn: new Date() } : c)),
    );
  }
}
