export type CanalNotificacion = 'PUSH' | 'EMAIL' | 'SMS';
export type EstadoNotificacion = 'ENVIADA' | 'FALLIDA' | 'PENDIENTE';

export interface Notificacion {
  id: string;
  destinatario: string;
  canal: CanalNotificacion;
  asunto: string;
  contenido: string;
  estado: EstadoNotificacion;
  intentos: number;
  errorMessage: string | null;
  creadaEn: Date;
  enviadaEn: Date | null;
}
