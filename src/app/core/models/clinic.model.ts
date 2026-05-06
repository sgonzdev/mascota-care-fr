export type ClinicaFuente = 'GOOGLE' | 'OSM';

export interface Clinica {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string | null;
  lat: number;
  lng: number;
  distanciaMetros: number;
  fuente: ClinicaFuente;
}
