// Correr con: mongosh Bitacora.js

use("ISSTE");

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
    registro: ObjectId("900000000000000000000009"),
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
