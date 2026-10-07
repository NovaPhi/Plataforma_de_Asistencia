// Correr con: mongosh Bitacora.js

use("ISSTE");


// Template de un registro de bitacora, recordatorio de que tipo de datos se espera en los campos
/*
const templateBitacora = {
  usuario: "",               // usuario que hizo la accion
  rol: "",                   // Rol que tenia en ese momento
  ip: "",
  userAgent: "",             // Navegador o dispositivo
  fechaHora: null,           // Momento exacto del cambio
  accion: "",                // "LLAMADA" | "CAMBIO_ESTATUS" | "VER_NOTA" | "CREAR" | "ACTUALIZAR" | "CERRAR_TICKET" | etc
  coleccion: "",             // Coleccion afectada
  registro: null,            // Documento afectado (_id, id_infante, ebdi o usuario segun la coleccion)
  datosAnteriores: null,     // Valores antes del cambio
  datosNuevos: null          // Valores despues del cambio
};
*/




// Coleccion con validacion
db.createCollection("bitacora", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["usuario", "rol", "ip", "userAgent", "fechaHora", "accion", "coleccion"],
      properties: {
        usuario: { bsonType: "string", maxLength: 50 },
        rol: { enum: ["ADMINISTRADOR_CENTRAL",
                      "SUPERVISOR_CENTRAL",
                      "SUPERVISOR_REGIONAL",
                      "DIRECTORA_ESTANCIA",
                      "MEDICO_ESTANCIA",
                      "TRABAJO_SOCIAL",
                      "CAPTURISTA_DOCENTE" ]
        },
        ip: { bsonType: "string", maxLength: 45 },
        userAgent: { bsonType: "string" },
        fechaHora: { bsonType: "date" },
        accion: { bsonType: "string", maxLength: 30 },
        coleccion: { enum: ["infantes",
                            "usuarios",
                            "estancias",
                            "grupos",
                            "tutores",
                            "asistencias",
                            "tickets",
                            "asesorias",
                            "notasConfidenciales",
                            "consentimientos",
                            "historico" ]
        },
        registro: { bsonType: ["objectId", "number", "string", "null"] },
        datosAnteriores: { bsonType: ["object", "null"] },
        datosNuevos: { bsonType: ["object", "null"] }
      }
    }
  }
});

db.bitacora.createIndex({ fechaHora: -1 });
db.bitacora.createIndex({ coleccion: 1, registro: 1 });
db.bitacora.createIndex({ usuario: 1 });

// ---------------------------------------------------------------------------
// Dummy data: 9 registros de bitacora
// Acciones sobre los tickets de Tickets.js. La bitacora no tiene borrado logico porque no se edita desde la app
// ---------------------------------------------------------------------------

const bitacora = [
  {
    usuario: "ts.ebdi007",
    rol: "TRABAJO_SOCIAL",
    ip: "10.90.7.30",
    userAgent: "Mozilla/5.0 (Linux; Android 14; SM-X210) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36",
    fechaHora: ISODate("2026-10-05T09:20:05-06:00"),
    accion: "LLAMADA",
    coleccion: "tickets",
    registro: ObjectId("d00000000000000000000001"),
    datosAnteriores: { intentosContacto: [] },
    datosNuevos: { intentosContacto: [{ numero: 1, exitoso: true }] }
  },
  {
    usuario: "med.ebdi007",
    rol: "MEDICO_ESTANCIA",
    ip: "10.90.7.31",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36",
    fechaHora: ISODate("2026-10-05T10:00:03-06:00"),
    accion: "CREAR",
    coleccion: "asesorias",
    registro: ObjectId("e00000000000000000000001"),
    datosAnteriores: null,
    datosNuevos: { requiereAltaMedica: true, fechaRetornoEstimada: ISODate("2026-10-09") }
  },
  {
    usuario: "med.ebdi007",
    rol: "MEDICO_ESTANCIA",
    ip: "10.90.7.31",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36",
    fechaHora: ISODate("2026-10-05T10:00:04-06:00"),
    accion: "ACTUALIZAR",
    coleccion: "infantes",
    registro: 199417,
    datosAnteriores: { bloqueoIngreso: false },
    datosNuevos: { bloqueoIngreso: true }
  },
  {
    usuario: "ts.ebdi007",
    rol: "TRABAJO_SOCIAL",
    ip: "10.90.7.30",
    userAgent: "Mozilla/5.0 (Linux; Android 14; SM-X210) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36",
    fechaHora: ISODate("2026-10-06T08:14:10-06:00"),
    accion: "CAMBIO_ESTATUS",
    coleccion: "asistencias",
    registro: ObjectId("c00000000000000000000003"),
    datosAnteriores: { estatus: "FALTA_INJUSTIFICADA" },
    datosNuevos: { estatus: "AUSENTE_JUSTIFICADO" }
  },
  {
    usuario: "ts.ebdi007",
    rol: "TRABAJO_SOCIAL",
    ip: "10.90.7.30",
    userAgent: "Mozilla/5.0 (Linux; Android 14; SM-X210) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36",
    fechaHora: ISODate("2026-10-06T08:15:02-06:00"),
    accion: "CERRAR_TICKET",
    coleccion: "tickets",
    registro: ObjectId("d00000000000000000000005"),
    datosAnteriores: { estado: "EN_PROCESO", cerradoPor: null },
    datosNuevos: { estado: "CERRADO", cerradoPor: "ts.ebdi007" }
  },
  {
    usuario: "med.ebdi007",
    rol: "MEDICO_ESTANCIA",
    ip: "10.90.7.31",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36",
    fechaHora: ISODate("2026-10-06T08:40:30-06:00"),
    accion: "VER_NOTA",
    coleccion: "notasConfidenciales",
    registro: ObjectId("f00000000000000000000001"),
    datosAnteriores: null,
    datosNuevos: null
  },
  {
    usuario: "med.ebdi033",
    rol: "MEDICO_ESTANCIA",
    ip: "10.150.33.31",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36",
    fechaHora: ISODate("2026-10-06T08:29:50-06:00"),
    accion: "CAMBIO_ESTATUS",
    coleccion: "asistencias",
    registro: ObjectId("c0000000000000000000000f"),
    datosAnteriores: { estatus: "FALTA_INJUSTIFICADA" },
    datosNuevos: { estatus: "AUSENTE_JUSTIFICADO" }
  },
  {
    usuario: "med.ebdi033",
    rol: "MEDICO_ESTANCIA",
    ip: "10.150.33.31",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36",
    fechaHora: ISODate("2026-10-06T08:30:00-06:00"),
    accion: "CERRAR_TICKET",
    coleccion: "tickets",
    registro: ObjectId("d00000000000000000000004"),
    datosAnteriores: { estado: "EN_PROCESO", cerradoPor: null },
    datosNuevos: { estado: "CERRADO", cerradoPor: "med.ebdi033" }
  },
  {
    usuario: "dir.ebdi033",
    rol: "DIRECTORA_ESTANCIA",
    ip: "10.150.33.31",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36",
    fechaHora: ISODate("2026-10-06T09:02:11-06:00"),
    accion: "VER_NOTA",
    coleccion: "notasConfidenciales",
    registro: ObjectId("f00000000000000000000002"),
    datosAnteriores: null,
    datosNuevos: null
  }
];

db.bitacora.insertMany(bitacora);
