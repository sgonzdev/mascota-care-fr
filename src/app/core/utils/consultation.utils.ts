import { EstadoConsulta, NivelUrgencia, Sexo } from '../models/consultation.model';
import { BadgeVariant } from '../../shared/components/badge/badge.component';

export const URGENCIA_LABEL: Record<NivelUrgencia, string> = {
  ALTA: 'Alta',
  MEDIA: 'Media',
  BAJA: 'Baja',
};

export const URGENCIA_VARIANT: Record<NivelUrgencia, BadgeVariant> = {
  ALTA: 'danger',
  MEDIA: 'warning',
  BAJA: 'success',
};

export const ESTADO_LABEL: Record<EstadoConsulta, string> = {
  activa: 'Activa',
  resuelta: 'Resuelta',
  archivada: 'Archivada',
  pendiente: 'Pendiente',
};

export const ESTADO_VARIANT: Record<EstadoConsulta, BadgeVariant> = {
  activa: 'primary',
  resuelta: 'success',
  archivada: 'secondary',
  pendiente: 'warning',
};

export const SEXO_LABEL: Record<Sexo, string> = {
  macho: 'Macho',
  hembra: 'Hembra',
};

export function formatPetAge(edadMeses: number): string {
  if (edadMeses < 12) return `${edadMeses} meses`;
  const years = Math.floor(edadMeses / 12);
  return `${years} año${years > 1 ? 's' : ''}`;
}

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]!.toUpperCase())
    .join('');
}
