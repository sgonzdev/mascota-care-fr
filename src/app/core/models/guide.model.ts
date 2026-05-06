export type TipoGuia = 'CUIDADO' | 'ALIMENTACION' | 'ALARMA';
export type FuenteGuia = 'TEMPLATE' | 'AI';

export interface Guia {
  id: string;
  idMascota: string;
  tipo: TipoGuia;
  contenidoHtml: string;
  fuente: FuenteGuia;
  fechaGeneracion: Date;
}

export interface GuiaCreatePayload {
  idMascota: string;
  tipo: TipoGuia;
  especie: string;
  raza: string;
  edadMeses: number;
  contextoAdicional?: string;
}
