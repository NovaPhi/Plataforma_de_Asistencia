// Correr con: mongosh Tickets.js

use("ISSTE");

// ---------------------------------------------------------------------------
// Dummy data: 5 tickets
// Tickets de las faltas de Asistencias.js. _id fijos (d0...) para Asesorias, NotasConfidenciales y Bitacora
// ---------------------------------------------------------------------------

const tickets = [
  {
    // Enfermedad en casa, requiere alta medica (bloqueo de ingreso activo)
    _id: ObjectId("d00000000000000000000001"),
    asistencia: ObjectId("c00000000000000000000002"),
    infante: ObjectId("900000000000000000000009"),
    estancia: 7,
    estado: "EN_PROCESO",
    semaforo: "VERDE",
    causa: "ENF_CASA",
    justificacion: { tipo: "MEDICA", motivo: "Enfermedad en casa, en espera de alta médica", justificada: true },
    intentosContacto: [
      {
        numero: 1,
        fechaHora: ISODate("2026-10-05T09:20:00-06:00"),
        exitoso: true,
        resumen: "La madre informa que la menor tiene fiebre desde el domingo",
        registradoPor: "ts.ebdi007"
      }
    ],
    alertaAmarilla: { activa: false, desde: null, limiteSegundoIntento: null, segundoIntentoHecho: false },
    escalado: null,
    asesoria: ObjectId("e00000000000000000000001"),
    bloqueoIngreso: true,
    contactosNotificados: [],
    fechaApertura: ISODate("2026-10-05T09:05:00-06:00"),
    fechaCierre: null,
    cerradoPor: null,
    deleted_at: null
  },
  {
    // Primer intento sin respuesta, alerta amarilla activa
    _id: ObjectId("d00000000000000000000002"),
    asistencia: ObjectId("c00000000000000000000022"),
    infante: ObjectId("90000000000000000000000b"),
    estancia: 33,
    estado: "EN_PROCESO",
    semaforo: "AMARILLO",
    causa: null,
    justificacion: null,
    intentosContacto: [
      {
        numero: 1,
        fechaHora: ISODate("2026-10-06T09:25:00-06:00"),
        exitoso: false,
        resumen: "Sin respuesta, entra buzón de voz",
        registradoPor: "med.ebdi033"
      },
      {
        numero: 2,
        fechaHora: ISODate("2026-10-06T11:05:00-06:00"),
        exitoso: false,
        resumen: "Sin respuesta",
        registradoPor: "med.ebdi033"
      }
    ],
    alertaAmarilla: {
      activa: true,
      desde: ISODate("2026-10-06T09:25:00-06:00"),
      limiteSegundoIntento: ISODate("2026-10-06T11:25:00-06:00"),
      segundoIntentoHecho: true
    },
    escalado: null,
    asesoria: null,
    bloqueoIngreso: false,
    contactosNotificados: [
      {
        nombre: "Leticia Ramírez Gómez",
        fechaHora: ISODate("2026-10-06T11:15:00-06:00"),
        medio: "LLAMADA",
        resultado: "La abuela indica que el menor está con su madre en consulta"
      }
    ],
    fechaApertura: ISODate("2026-10-06T09:10:00-06:00"),
    fechaCierre: null,
    cerradoPor: null,
    deleted_at: null
  },
  {
    // No localizado: no se hizo el segundo intento a tiempo y se escalo
    _id: ObjectId("d00000000000000000000003"),
    asistencia: ObjectId("c0000000000000000000000d"),
    infante: ObjectId("900000000000000000000011"),
    estancia: 33,
    estado: "ESCALADO",
    semaforo: "ROJO",
    causa: "NO_LOC",
    justificacion: null,
    intentosContacto: [
      {
        numero: 1,
        fechaHora: ISODate("2026-10-05T09:30:00-06:00"),
        exitoso: false,
        resumen: "Número fuera de servicio",
        registradoPor: "med.ebdi033"
      }
    ],
    alertaAmarilla: {
      activa: false,
      desde: ISODate("2026-10-05T09:30:00-06:00"),
      limiteSegundoIntento: ISODate("2026-10-05T11:30:00-06:00"),
      segundoIntentoHecho: false
    },
    escalado: ISODate("2026-10-05T11:30:00-06:00"),
    asesoria: null,
    bloqueoIngreso: false,
    contactosNotificados: [
      {
        nombre: "Karina Herrera Mendoza",
        fechaHora: ISODate("2026-10-05T11:45:00-06:00"),
        medio: "LLAMADA",
        resultado: "Sin respuesta"
      }
    ],
    fechaApertura: ISODate("2026-10-05T09:15:00-06:00"),
    fechaCierre: null,
    cerradoPor: null,
    deleted_at: null
  },
  {
    // Permiso del tutor, cerrado
    _id: ObjectId("d00000000000000000000004"),
    asistencia: ObjectId("c0000000000000000000000f"),
    infante: ObjectId("900000000000000000000023"),
    estancia: 33,
    estado: "CERRADO",
    semaforo: "VERDE",
    causa: "PER_TUT",
    justificacion: { tipo: "PERMISO", motivo: "Permiso del tutor por cita familiar", justificada: true },
    intentosContacto: [
      {
        numero: 1,
        fechaHora: ISODate("2026-10-05T09:35:00-06:00"),
        exitoso: true,
        resumen: "La madre confirma que la menor faltó por una cita familiar",
        registradoPor: "med.ebdi033"
      }
    ],
    alertaAmarilla: { activa: false, desde: null, limiteSegundoIntento: null, segundoIntentoHecho: false },
    escalado: null,
    asesoria: null,
    bloqueoIngreso: false,
    contactosNotificados: [],
    fechaApertura: ISODate("2026-10-05T09:15:00-06:00"),
    fechaCierre: ISODate("2026-10-06T08:30:00-06:00"),
    cerradoPor: "med.ebdi033",
    deleted_at: null
  },
  {
    // Accidente fuera de la estancia, cerrado
    _id: ObjectId("d00000000000000000000005"),
    asistencia: ObjectId("c00000000000000000000003"),
    infante: ObjectId("900000000000000000000025"),
    estancia: 7,
    estado: "CERRADO",
    semaforo: "VERDE",
    causa: "ACC_EXT",
    justificacion: { tipo: "ACCIDENTE", motivo: "Caída en casa durante el fin de semana", justificada: true },
    intentosContacto: [
      {
        numero: 1,
        fechaHora: ISODate("2026-10-05T09:22:00-06:00"),
        exitoso: true,
        resumen: "El tutor informa una caída en casa, sin lesiones graves",
        registradoPor: "ts.ebdi007"
      }
    ],
    alertaAmarilla: { activa: false, desde: null, limiteSegundoIntento: null, segundoIntentoHecho: false },
    escalado: null,
    asesoria: ObjectId("e00000000000000000000002"),
    bloqueoIngreso: false,
    contactosNotificados: [],
    fechaApertura: ISODate("2026-10-05T09:05:00-06:00"),
    fechaCierre: ISODate("2026-10-06T08:15:00-06:00"),
    cerradoPor: "ts.ebdi007",
    deleted_at: null
  }
];

db.tickets.insertMany(tickets);
