// Correr con: mongosh Tickets.js

use("ISSTE");


// Template de un ticket, recordatorio de que tipo de datos se espera en los campos
/*
const templateTicket = {
  id: 0,                     // id ascendente por coleccion
  asistencia: null,          // ObjectId de la asistencia que origino el ticket
  infante: 0,                // id_infante
  estancia: 0,               // ebdi
  estado: "",                // "ABIERTO" | "EN_PROCESO" | "ESCALADO" | "CERRADO"
  semaforo: "",              // "VERDE" | "AMARILLO" | "ROJO"
  causa: null,               // "ENF_CASA" | "ACC_EXT" | "PER_TUT" | "NO_LOC"
  justificacion: null,       // { tipo: "", motivo: "", justificada: false }
  intentosContacto: [],      // [{ numero: 1, fechaHora: null, exitoso: false, resumen: "", registradoPor: "" }]
  alertaAmarilla: { activa: false, desde: null, limiteSegundoIntento: null, segundoIntentoHecho: false },
  escalado: null,            // Cuando escalo por no hacer el segundo intento
  asesoria: null,            // ObjectId de la asesoria
  bloqueoIngreso: false,     // Candado de requiere alta medica
  contactosNotificados: [],  // [{ nombre: "", fechaHora: null, medio: "", resultado: "" }]
  fechaApertura: null,
  fechaCierre: null,
  cerradoPor: null,          // usuario que cerro el caso
  deleted_at: null           // Borrado logico
};
*/




// Coleccion con validacion
db.createCollection("tickets", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id", "asistencia", "infante", "estancia", "estado", "semaforo", "intentosContacto", "alertaAmarilla", "bloqueoIngreso", "contactosNotificados", "fechaApertura"],
      properties: {
        id: { bsonType: "number" },
        asistencia: { bsonType: "objectId" },
        infante: { bsonType: "number" },
        estancia: { bsonType: "number" },
        estado: { enum: ["ABIERTO", "EN_PROCESO", "ESCALADO", "CERRADO"] },
        semaforo: { enum: ["VERDE", "AMARILLO", "ROJO"] },
        causa: { enum: ["ENF_CASA", "ACC_EXT", "PER_TUT", "NO_LOC", null] },
        justificacion: {
          bsonType: ["object", "null"],
          required: ["tipo", "motivo", "justificada"],
          properties: {
            tipo: { bsonType: "string", maxLength: 30 },
            motivo: { bsonType: "string", maxLength: 200 },
            justificada: { bsonType: "bool" }
          }
        },
        intentosContacto: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["numero", "fechaHora", "exitoso", "registradoPor"],
            properties: {
              numero: { bsonType: "int", minimum: 1 },
              fechaHora: { bsonType: "date" },
              exitoso: { bsonType: "bool" },
              resumen: { bsonType: "string", maxLength: 500 },
              registradoPor: { bsonType: "string", maxLength: 50 }
            }
          }
        },
        alertaAmarilla: {
          bsonType: "object",
          required: ["activa", "desde", "limiteSegundoIntento", "segundoIntentoHecho"],
          properties: {
            activa: { bsonType: "bool" },
            desde: { bsonType: ["date", "null"] },
            limiteSegundoIntento: { bsonType: ["date", "null"] },
            segundoIntentoHecho: { bsonType: "bool" }
          }
        },
        escalado: { bsonType: ["date", "null"] },
        asesoria: { bsonType: ["objectId", "null"] },
        bloqueoIngreso: { bsonType: "bool" },
        contactosNotificados: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["nombre", "fechaHora", "medio", "resultado"],
            properties: {
              nombre: { bsonType: "string", maxLength: 150 },
              fechaHora: { bsonType: "date" },
              medio: { bsonType: "string", maxLength: 20 },
              resultado: { bsonType: "string", maxLength: 200 }
            }
          }
        },
        fechaApertura: { bsonType: "date" },
        fechaCierre: { bsonType: ["date", "null"] },
        cerradoPor: { bsonType: ["string", "null"] },
        deleted_at: { bsonType: ["date", "null"] }
      }
    }
  }
});

db.tickets.createIndex({ id: 1 }, { unique: true });
db.tickets.createIndex({ asistencia: 1 }, { unique: true });
db.tickets.createIndex({ estancia: 1, estado: 1 });
db.tickets.createIndex({ infante: 1 });

// ---------------------------------------------------------------------------
// Dummy data: 5 tickets
// Tickets de las faltas de Asistencias.js. _id fijos (d0...) para Asesorias, NotasConfidenciales y Bitacora
// ---------------------------------------------------------------------------

const tickets = [
  {
    id: 1,
    // Enfermedad en casa, requiere alta medica (bloqueo de ingreso activo)
    _id: ObjectId("d00000000000000000000001"),
    asistencia: ObjectId("c00000000000000000000002"),
    infante: 199417,
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
    id: 2,
    // Primer intento sin respuesta, alerta amarilla activa
    _id: ObjectId("d00000000000000000000002"),
    asistencia: ObjectId("c00000000000000000000022"),
    infante: 199419,
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
    id: 3,
    // No localizado: no se hizo el segundo intento a tiempo y se escalo
    _id: ObjectId("d00000000000000000000003"),
    asistencia: ObjectId("c0000000000000000000000d"),
    infante: 199425,
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
    id: 4,
    // Permiso del tutor, cerrado
    _id: ObjectId("d00000000000000000000004"),
    asistencia: ObjectId("c0000000000000000000000f"),
    infante: 199443,
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
    id: 5,
    // Accidente fuera de la estancia, cerrado
    _id: ObjectId("d00000000000000000000005"),
    asistencia: ObjectId("c00000000000000000000003"),
    infante: 199445,
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
