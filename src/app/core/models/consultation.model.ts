export type NivelUrgencia = 'ALTA' | 'MEDIA' | 'BAJA';
export type EstadoConsulta = 'activa' | 'resuelta' | 'archivada' | 'pendiente';
export type Especie = 'perro' | 'gato' | 'otro';
export type Sexo = 'macho' | 'hembra';
export type Canal = 'app' | 'web';
export type RolUsuario = 'dueno' | 'admin';
export type EstadoSeguimiento = 'mejoro' | 'no_mejoro' | 'sin_dato';

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  rol: RolUsuario;
  fechaRegistro: Date;
}

export interface Mascota {
  id: string;
  idUsuario: string;
  nombre: string;
  especie: Especie;
  raza: string;
  edadMeses: number;
  pesoKg: number;
  sexo: Sexo;
}

export interface Regla {
  id: string;
  condicionSintoma: string;
  especieAplica: Especie | 'todas';
  edadMinMeses: number;
  edadMaxMeses: number;
  nivelUrgenciaResultado: NivelUrgencia;
  accionRecomendada: string;
  prioridad: number;
  activa: boolean;
}

export interface Seguimiento {
  id: string;
  idConsulta: string;
  fechaSeguimiento: Date;
  estado: EstadoSeguimiento;
  observaciones: string;
  alertaEnviada: boolean;
}

export interface Consulta {
  id: string;
  caseNumber: string;
  idMascota: string;
  idUsuario: string;
  fechaHora: Date;
  descripcionSintomas: string;
  nivelUrgencia: NivelUrgencia;
  respuestaGenerada: string;
  canal: Canal;
  idReglaAplicada: string | null;
  estado: EstadoConsulta;
  notasInternas: string;
  actualizadaEn: Date;
  mascota: Mascota;
  usuario: Usuario;
  reglaAplicada: Regla | null;
  seguimientos: Seguimiento[];
}

export interface Metrica {
  id: string;
  fecha: Date;
  totalConsultas: number;
  urgenciasAltas: number;
  urgenciasMedias: number;
  urgenciasBajas: number;
  tasaMejora: number;
  reglaMasActivadaId: string | null;
}
