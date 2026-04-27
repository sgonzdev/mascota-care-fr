import { Consulta, Mascota, Regla, Usuario } from '../models/consultation.model';

const USUARIOS: Record<string, Usuario> = {
  u1: {
    id: 'u1', nombre: 'Carlos Mendoza', email: 'carlos.mendoza@email.com',
    telefono: '+34 612 345 678', rol: 'dueno', fechaRegistro: new Date('2025-09-01'),
  },
  u2: {
    id: 'u2', nombre: 'Ana García', email: 'ana.garcia@email.com',
    telefono: '+34 698 765 432', rol: 'dueno', fechaRegistro: new Date('2025-10-14'),
  },
  u3: {
    id: 'u3', nombre: 'Pedro López', email: 'pedro.lopez@email.com',
    telefono: '+34 611 222 333', rol: 'dueno', fechaRegistro: new Date('2026-01-20'),
  },
};

const MASCOTAS: Record<string, Mascota> = {
  m1: { id: 'm1', idUsuario: 'u1', nombre: 'Luna', especie: 'perro', raza: 'Golden Retriever', edadMeses: 3, pesoKg: 8.5, sexo: 'hembra' },
  m2: { id: 'm2', idUsuario: 'u2', nombre: 'Max', especie: 'perro', raza: 'Labrador', edadMeses: 8, pesoKg: 12.0, sexo: 'macho' },
  m3: { id: 'm3', idUsuario: 'u3', nombre: 'Mochi', especie: 'perro', raza: 'Bulldog Francés', edadMeses: 5, pesoKg: 4.2, sexo: 'macho' },
};

const REGLAS: Record<string, Regla> = {
  r1: {
    id: 'r1',
    condicionSintoma: 'diarrea_leve_sin_sangre',
    especieAplica: 'perro',
    edadMinMeses: 2,
    edadMaxMeses: 24,
    nivelUrgenciaResultado: 'BAJA',
    accionRecomendada: 'Ayuno de 12h. Mantener hidratación continua. Tras el ayuno, ofrecer dieta blanda (arroz cocido con pollo hervido sin sal). Acudir al veterinario si aparece sangre, vómitos repetidos, letargo o la diarrea persiste más de 24h.',
    prioridad: 3,
    activa: true,
  },
};

export const MOCK_CONSULTAS: Consulta[] = [
  {
    id: '1',
    caseNumber: '1024',
    idMascota: 'm1',
    idUsuario: 'u1',
    fechaHora: new Date(Date.now() - 86400000),
    descripcionSintomas: 'Diarrea leve sin sangre. Inició hace 12 horas. Apetito normal, juega de forma habitual.',
    nivelUrgencia: 'BAJA',
    respuestaGenerada: 'Situación manejable en casa con ayuno e hidratación. Acudir al veterinario si empeora.',
    canal: 'app',
    idReglaAplicada: 'r1',
    estado: 'resuelta',
    notasInternas: '',
    actualizadaEn: new Date(),
    mascota: MASCOTAS['m1']!,
    usuario: USUARIOS['u1']!,
    reglaAplicada: REGLAS['r1']!,
    seguimientos: [
      {
        id: 's1', idConsulta: '1', fechaSeguimiento: new Date(),
        estado: 'mejoro', observaciones: 'Luna ya hizo heces más sólidas y está jugando feliz.',
        alertaEnviada: false,
      },
    ],
  },
  {
    id: '2',
    caseNumber: '1025',
    idMascota: 'm2',
    idUsuario: 'u2',
    fechaHora: new Date(Date.now() - 21600000),
    descripcionSintomas: 'Vómito ocasional y letargo desde hace 6 horas. No quiere comer.',
    nivelUrgencia: 'MEDIA',
    respuestaGenerada: 'Observar evolución en las próximas 24h. Consultar al veterinario si persiste.',
    canal: 'app',
    idReglaAplicada: null,
    estado: 'activa',
    notasInternas: 'Revisar si ingirió algo extraño.',
    actualizadaEn: new Date(Date.now() - 21600000),
    mascota: MASCOTAS['m2']!,
    usuario: USUARIOS['u2']!,
    reglaAplicada: null,
    seguimientos: [],
  },
  {
    id: '3',
    caseNumber: '1026',
    idMascota: 'm3',
    idUsuario: 'u3',
    fechaHora: new Date(Date.now() - 7200000),
    descripcionSintomas: 'Dificultad para respirar desde hace 2 horas. No come ni bebe.',
    nivelUrgencia: 'ALTA',
    respuestaGenerada: 'Derivación inmediata a veterinario. Se ha enviado alerta.',
    canal: 'app',
    idReglaAplicada: null,
    estado: 'activa',
    notasInternas: '',
    actualizadaEn: new Date(Date.now() - 7200000),
    mascota: MASCOTAS['m3']!,
    usuario: USUARIOS['u3']!,
    reglaAplicada: null,
    seguimientos: [],
  },
];
