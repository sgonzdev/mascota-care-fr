import { Consulta, Mascota, Regla, Usuario } from '../models/consultation.model';
import { RemoteConsulta } from '../repositories/consultation.repository';

/**
 * Synthesizes the rich nested {@link Consulta} model expected by the UI from the
 * flat backend projection. Falls back to lightweight placeholders when related
 * entities are not yet loaded in client-side caches (pet/user/rule).
 */
export function hydrateConsulta(
  r: RemoteConsulta,
  mascotas: Mascota[],
  reglas: Regla[],
  meIfMatches: (id: string) => Usuario | null,
): Consulta {
  const mascota = mascotas.find(m => m.id === r.idMascota) ?? unknownPet(r.idMascota);
  const usuario = meIfMatches(r.idUsuario) ?? unknownUser(r.idUsuario);
  const reglaAplicada = r.idReglaAplicada
    ? reglas.find(rule => rule.id === r.idReglaAplicada) ?? null
    : null;
  return {
    id: r.id,
    caseNumber: r.id.slice(0, 8),
    idMascota: r.idMascota,
    idUsuario: r.idUsuario,
    fechaHora: new Date(r.fechaHora),
    descripcionSintomas: r.descripcionSintomas,
    nivelUrgencia: r.nivelUrgencia,
    respuestaGenerada: r.respuestaGenerada,
    canal: r.canal,
    idReglaAplicada: r.idReglaAplicada,
    estado: r.estado,
    notasInternas: r.notasInternas,
    actualizadaEn: new Date(r.actualizadaEn),
    mascota,
    usuario,
    reglaAplicada,
    seguimientos: [],
  };
}

export function unknownPet(id: string): Mascota {
  return {
    id, idUsuario: '', nombre: 'Mascota', especie: 'otro',
    raza: '', edadMeses: 0, pesoKg: 0, sexo: 'macho',
  };
}

export function unknownUser(id: string): Usuario {
  return {
    id, nombre: 'Usuario', email: '', telefono: '',
    rol: 'dueno', fechaRegistro: new Date(),
  };
}
