import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  Consulta,
  EstadoConsulta,
  Mascota,
  Seguimiento,
  Usuario,
} from '../models/consultation.model';
import { CONSULTATION_REPOSITORY } from '../repositories/consultation.repository';
import { hydrateConsulta } from '../utils/consulta-hydrate';
import { AuthService } from './auth.service';
import { PetService } from './pet.service';
import { RuleService, TriageResult } from './rule.service';
import { ToastService } from './toast.service';

type StatusFilter = EstadoConsulta | 'all';

@Injectable({ providedIn: 'root' })
export class ConsultationService {
  private readonly repository = inject(CONSULTATION_REPOSITORY);
  private readonly auth = inject(AuthService);
  private readonly pets = inject(PetService);
  private readonly rules = inject(RuleService);
  private readonly toast = inject(ToastService);

  private readonly _consultas = signal<Consulta[]>([]);
  private readonly _selectedId = signal<string | null>(null);
  private readonly _filter = signal<StatusFilter>('all');
  private readonly _loading = signal(false);

  readonly filter = this._filter.asReadonly();
  readonly allConsultas = this._consultas.asReadonly();
  readonly loading = this._loading.asReadonly();

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
  readonly highUrgencyCount = computed(
    () => this._consultas().filter(c => c.nivelUrgencia === 'ALTA').length,
  );

  constructor() {
    effect(() => {
      const user = this.auth.usuario();
      if (user) void this.refresh();
      else this._consultas.set([]);
    });
  }

  async refresh(): Promise<void> {
    if (environment.useMocks) return;
    const user = this.auth.usuario();
    if (!user) return;
    this._loading.set(true);
    try {
      const remote = user.rol === 'admin'
        ? await this.repository.list()
        : await this.repository.list(user.id);
      this._consultas.set(remote.map(r => this.hydrate(r.idUsuario === user.id ? r : r, user)));
    } catch {
      this.toast.error('No se pudieron cargar las consultas');
    } finally {
      this._loading.set(false);
    }
  }

  select(id: string | null): void { this._selectedId.set(id); }
  setFilter(status: StatusFilter): void { this._filter.set(status); }
  archive(id: string): void { void this.applyPatch(id, { estado: 'archivada' }); }
  updateNotes(id: string, notasInternas: string): void { void this.applyPatch(id, { notasInternas }); }

  async create(
    mascota: Mascota,
    descripcionSintomas: string,
  ): Promise<{ consulta: Consulta; triage: TriageResult }> {
    const triage = await this.runTriage(mascota, descripcionSintomas);
    if (!environment.useMocks) {
      await this.refresh();
      const found = this._consultas().find(
        c => c.idMascota === mascota.id && c.descripcionSintomas === descripcionSintomas,
      );
      if (found) return { consulta: found, triage };
    }
    const consulta = this.buildLocalConsulta(mascota, descripcionSintomas, triage);
    this._consultas.update(list => [consulta, ...list]);
    return { consulta, triage };
  }

  async addFollowup(
    idConsulta: string,
    data: Omit<Seguimiento, 'id' | 'idConsulta' | 'alertaEnviada'>,
  ): Promise<void> {
    const consulta = this._consultas().find(c => c.id === idConsulta);
    if (consulta && !environment.useMocks) {
      await this.repository.saveFollowup({
        idConsulta, idMascota: consulta.idMascota,
        estado: data.estado, observaciones: data.observaciones,
      });
    }
    const seguimiento: Seguimiento = {
      id: `s-${Date.now()}`, idConsulta,
      alertaEnviada: data.estado === 'no_mejoro', ...data,
    };
    const nuevoEstado: EstadoConsulta = data.estado === 'mejoro' ? 'resuelta' : 'activa';
    this._consultas.update(list =>
      list.map(c => c.id === idConsulta
        ? { ...c, seguimientos: [...c.seguimientos, seguimiento],
            estado: nuevoEstado, actualizadaEn: new Date() }
        : c),
    );
    if (!environment.useMocks) await this.applyPatch(idConsulta, { estado: nuevoEstado });
  }

  private async applyPatch(id: string, changes: Partial<Consulta>): Promise<void> {
    if (environment.useMocks) {
      this.localPatch(id, changes);
      return;
    }
    try {
      const remote = await this.repository.patch(id, {
        estado: changes.estado, notasInternas: changes.notasInternas,
      });
      this.localPatch(id, {
        estado: remote.estado, notasInternas: remote.notasInternas,
        actualizadaEn: new Date(remote.actualizadaEn),
      });
    } catch {
      this.toast.error('No se pudo actualizar la consulta');
    }
  }

  private async runTriage(mascota: Mascota, descripcion: string): Promise<TriageResult> {
    if (!environment.useMocks) {
      const remote = await this.repository.triage({ mascota, descripcionLibre: descripcion });
      if (remote) {
        const regla = remote.idReglaAplicada
          ? this.rules.reglas().find(r => r.id === remote.idReglaAplicada) ?? null
          : null;
        return { nivel: remote.nivelUrgencia, regla, accion: remote.accionRecomendada };
      }
    }
    return this.rules.evaluate(mascota, descripcion);
  }

  private hydrate(r: Parameters<typeof hydrateConsulta>[0], user: Usuario): Consulta {
    return hydrateConsulta(
      r, this.pets.mascotas(), this.rules.reglas(),
      id => (id === user.id ? user : null),
    );
  }

  private buildLocalConsulta(mascota: Mascota, desc: string, triage: TriageResult): Consulta {
    const user = this.auth.usuario();
    const usuario: Usuario = user ?? {
      id: '', nombre: 'Invitado', email: '', telefono: '',
      rol: 'dueno', fechaRegistro: new Date(),
    };
    return {
      id: `c-${Date.now()}`, caseNumber: String(1024 + this._consultas().length + 1),
      idMascota: mascota.id, idUsuario: usuario.id,
      fechaHora: new Date(), descripcionSintomas: desc,
      nivelUrgencia: triage.nivel, respuestaGenerada: triage.accion, canal: 'web',
      idReglaAplicada: triage.regla?.id ?? null,
      estado: triage.nivel === 'ALTA' ? 'pendiente' : 'activa',
      notasInternas: '', actualizadaEn: new Date(),
      mascota, usuario, reglaAplicada: triage.regla, seguimientos: [],
    };
  }

  private localPatch(id: string, changes: Partial<Consulta>): void {
    this._consultas.update(list =>
      list.map(c => (c.id === id ? { ...c, ...changes, actualizadaEn: new Date() } : c)),
    );
  }
}
