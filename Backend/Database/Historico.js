// Correr con: mongosh Historico.js

use("ISSTE");

// ---------------------------------------------------------------------------
// Dummy data: 2 registros historicos
// Tickets del ciclo 2025-2026 ya archivados (sus originales ya no estan en tickets)
// ---------------------------------------------------------------------------

const historico = [
  {
    ticketIdOriginal: ObjectId("d00000000000000000000385"),
    ticket: {
      _id: ObjectId("d00000000000000000000385"),
      asistencia: ObjectId("c00000000000000000000385"),
      infante: ObjectId("90000000000000000000002b"),
      estancia: 7,
      estado: "CERRADO",
      semaforo: "VERDE",
      causa: "ENF_CASA",
      justificacion: { tipo: "MEDICA", motivo: "Varicela", justificada: true },
      intentosContacto: [
        {
          numero: 1,
          fechaHora: ISODate("2026-03-09T09:15:00-06:00"),
          exitoso: true,
          resumen: "La madre informa que la menor tiene varicela",
          registradoPor: "ts.ebdi007"
        }
      ],
      alertaAmarilla: { activa: false, desde: null, limiteSegundoIntento: null, segundoIntentoHecho: false },
      escalado: null,
      asesoria: ObjectId("e00000000000000000000385"),
      bloqueoIngreso: false,
      contactosNotificados: [],
      fechaApertura: ISODate("2026-03-09T09:05:00-06:00"),
      fechaCierre: ISODate("2026-03-18T08:20:00-06:00"),
      cerradoPor: "ts.ebdi007",
      deleted_at: null
    },
    asesorias: [
      {
        _id: ObjectId("e00000000000000000000385"),
        ticket: ObjectId("d00000000000000000000385"),
        infante: ObjectId("90000000000000000000002b"),
        asesoria: "DUMMY_ENC:Aislamiento en casa hasta que todas las lesiones formen costra",
        fechaRetornoEstimada: ISODate("2026-03-18"),
        requiereAltaMedica: true,
        registradoPor: "med.ebdi007",
        fechaRegistro: ISODate("2026-03-09T10:00:00-06:00"),
        deleted_at: null
      }
    ],
    notasConfidenciales: [
      {
        _id: ObjectId("f00000000000000000000385"),
        ticket: ObjectId("d00000000000000000000385"),
        infante: ObjectId("90000000000000000000002b"),
        tipo: "MEDICA",
        diagnostico: "DUMMY_ENC:Varicela",
        nota: "DUMMY_ENC:Alta médica entregada el 17 de marzo",
        autor: "med.ebdi007",
        fechaRegistro: ISODate("2026-03-17T13:00:00-06:00"),
        deleted_at: null
      }
    ],
    infanteId: ObjectId("90000000000000000000002b"),
    estanciaId: 7,
    cicloEscolar: "2025-2026",
    fechaCierre: ISODate("2026-03-18T08:20:00-06:00"),
    archivadoEn: ISODate("2026-08-01T02:00:00-06:00"),
    fechaDepuracion: ISODate("2031-08-01T02:00:00-06:00")
  },
  {
    ticketIdOriginal: ObjectId("d00000000000000000000386"),
    ticket: {
      _id: ObjectId("d00000000000000000000386"),
      asistencia: ObjectId("c00000000000000000000386"),
      infante: ObjectId("900000000000000000000003"),
      estancia: 33,
      estado: "CERRADO",
      semaforo: "VERDE",
      causa: "NO_LOC",
      justificacion: { tipo: "FAMILIAR", motivo: "Cambio de domicilio sin aviso", justificada: false },
      intentosContacto: [
        {
          numero: 1,
          fechaHora: ISODate("2026-05-18T09:30:00-06:00"),
          exitoso: false,
          resumen: "Sin respuesta",
          registradoPor: "med.ebdi033"
        },
        {
          numero: 2,
          fechaHora: ISODate("2026-05-18T11:10:00-06:00"),
          exitoso: true,
          resumen: "El padre informa cambio de domicilio",
          registradoPor: "med.ebdi033"
        }
      ],
      alertaAmarilla: {
        activa: false,
        desde: ISODate("2026-05-18T09:30:00-06:00"),
        limiteSegundoIntento: ISODate("2026-05-18T11:30:00-06:00"),
        segundoIntentoHecho: true
      },
      escalado: null,
      asesoria: null,
      bloqueoIngreso: false,
      contactosNotificados: [],
      fechaApertura: ISODate("2026-05-18T09:15:00-06:00"),
      fechaCierre: ISODate("2026-05-21T12:00:00-06:00"),
      cerradoPor: "dir.ebdi033",
      deleted_at: null
    },
    asesorias: [],
    notasConfidenciales: [
      {
        _id: ObjectId("f00000000000000000000386"),
        ticket: ObjectId("d00000000000000000000386"),
        infante: ObjectId("900000000000000000000003"),
        tipo: "FAMILIAR",
        diagnostico: null,
        nota: "DUMMY_ENC:Se actualizan datos de contacto del tutor",
        autor: "dir.ebdi033",
        fechaRegistro: ISODate("2026-05-21T11:50:00-06:00"),
        deleted_at: null
      }
    ],
    infanteId: ObjectId("900000000000000000000003"),
    estanciaId: 33,
    cicloEscolar: "2025-2026",
    fechaCierre: ISODate("2026-05-21T12:00:00-06:00"),
    archivadoEn: ISODate("2026-08-01T02:00:00-06:00"),
    fechaDepuracion: ISODate("2031-08-01T02:00:00-06:00")
  }
];

db.historico.insertMany(historico);
