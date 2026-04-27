import { Mascota, Regla, Metrica } from '../models/consultation.model';

export const MOCK_MASCOTAS: Mascota[] = [
  { id: 'm1', idUsuario: 'u1', nombre: 'Luna', especie: 'perro', raza: 'Golden Retriever', edadMeses: 3, pesoKg: 8.5, sexo: 'hembra' },
  { id: 'm2', idUsuario: 'u2', nombre: 'Max', especie: 'perro', raza: 'Labrador', edadMeses: 8, pesoKg: 12.0, sexo: 'macho' },
  { id: 'm3', idUsuario: 'u3', nombre: 'Mochi', especie: 'perro', raza: 'Bulldog Francés', edadMeses: 5, pesoKg: 4.2, sexo: 'macho' },
  { id: 'm4', idUsuario: 'u1', nombre: 'Misi', especie: 'gato', raza: 'Siamés', edadMeses: 18, pesoKg: 3.8, sexo: 'hembra' },
];

export const MOCK_REGLAS: Regla[] = [
  {
    id: 'r1', condicionSintoma: 'diarrea_leve_sin_sangre', especieAplica: 'perro',
    edadMinMeses: 2, edadMaxMeses: 24, nivelUrgenciaResultado: 'BAJA',
    accionRecomendada: 'Ayuno de 12h y dieta blanda. Acudir al veterinario si persiste más de 24h.',
    prioridad: 3, activa: true,
  },
  {
    id: 'r2', condicionSintoma: 'vomito_ocasional', especieAplica: 'todas',
    edadMinMeses: 0, edadMaxMeses: 240, nivelUrgenciaResultado: 'MEDIA',
    accionRecomendada: 'Observar 24h, mantener hidratación. Consultar veterinario si vomita repetidamente.',
    prioridad: 5, activa: true,
  },
  {
    id: 'r3', condicionSintoma: 'dificultad_respiratoria', especieAplica: 'todas',
    edadMinMeses: 0, edadMaxMeses: 240, nivelUrgenciaResultado: 'ALTA',
    accionRecomendada: 'Derivación inmediata a clínica veterinaria. Es una emergencia.',
    prioridad: 1, activa: true,
  },
  {
    id: 'r4', condicionSintoma: 'picaduras_piel', especieAplica: 'perro',
    edadMinMeses: 0, edadMaxMeses: 240, nivelUrgenciaResultado: 'BAJA',
    accionRecomendada: 'Limpiar la zona con agua fría. Consultar si hay hinchazón o dificultad respiratoria.',
    prioridad: 6, activa: false,
  },
];

function last7Days(): Metrica[] {
  const out: Metrica[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const total = 8 + Math.floor(Math.random() * 10);
    const altas = Math.floor(total * 0.15);
    const medias = Math.floor(total * 0.45);
    out.push({
      id: `met-${i}`,
      fecha: d,
      totalConsultas: total,
      urgenciasAltas: altas,
      urgenciasMedias: medias,
      urgenciasBajas: total - altas - medias,
      tasaMejora: 65 + Math.floor(Math.random() * 25),
      reglaMasActivadaId: 'r1',
    });
  }
  return out;
}

export const MOCK_METRICAS: Metrica[] = last7Days();
