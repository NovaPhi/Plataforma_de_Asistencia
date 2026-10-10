// Correr con: mongosh Consentimientos.js

use("ISSTE");

// ---------------------------------------------------------------------------
// Dummy data: 10 consentimientos
// Consentimientos de los infantes con tickets (actuales y del historico)
// ---------------------------------------------------------------------------

const consentimientos = [
  {
    tutor: ObjectId("b00000000000000000000044"),
    infante: ObjectId("90000000000000000000002b"),
    versionAviso: "2025.1",
    aceptado: true,
    fechaAceptacion: ISODate("2025-08-11T08:40:00-06:00"),
    registradoPor: "dir.ebdi007",
    deleted_at: null
  },
  {
    tutor: ObjectId("b00000000000000000000004"),
    infante: ObjectId("900000000000000000000003"),
    versionAviso: "2025.1",
    aceptado: true,
    fechaAceptacion: ISODate("2025-08-12T09:10:00-06:00"),
    registradoPor: "dir.ebdi033",
    deleted_at: null
  },
  {
    tutor: ObjectId("b0000000000000000000000b"),
    infante: ObjectId("900000000000000000000009"),
    versionAviso: "2026.1",
    aceptado: true,
    fechaAceptacion: ISODate("2026-08-10T08:54:00-06:00"),
    registradoPor: "dir.ebdi007",
    deleted_at: null
  },
  {
    tutor: ObjectId("b0000000000000000000003a"),
    infante: ObjectId("900000000000000000000025"),
    versionAviso: "2026.1",
    aceptado: true,
    fechaAceptacion: ISODate("2026-08-10T08:40:00-06:00"),
    registradoPor: "dir.ebdi007",
    deleted_at: null
  },
  {
    tutor: ObjectId("b00000000000000000000044"),
    infante: ObjectId("90000000000000000000002b"),
    versionAviso: "2026.1",
    aceptado: true,
    fechaAceptacion: ISODate("2026-08-11T08:02:00-06:00"),
    registradoPor: "dir.ebdi007",
    deleted_at: null
  },
  {
    tutor: ObjectId("b0000000000000000000000d"),
    infante: ObjectId("90000000000000000000000b"),
    versionAviso: "2026.1",
    aceptado: true,
    fechaAceptacion: ISODate("2026-08-10T08:28:00-06:00"),
    registradoPor: "dir.ebdi033",
    deleted_at: null
  },
  {
    tutor: ObjectId("b00000000000000000000018"),
    infante: ObjectId("900000000000000000000011"),
    versionAviso: "2026.1",
    aceptado: true,
    fechaAceptacion: ISODate("2026-08-11T08:04:00-06:00"),
    registradoPor: "dir.ebdi033",
    deleted_at: null
  },
  {
    tutor: ObjectId("b00000000000000000000038"),
    infante: ObjectId("900000000000000000000023"),
    versionAviso: "2026.1",
    aceptado: true,
    fechaAceptacion: ISODate("2026-08-11T08:19:00-06:00"),
    registradoPor: "dir.ebdi033",
    deleted_at: null
  },
  {
    tutor: ObjectId("b00000000000000000000004"),
    infante: ObjectId("900000000000000000000003"),
    versionAviso: "2026.1",
    aceptado: true,
    fechaAceptacion: ISODate("2026-08-12T08:52:00-06:00"),
    registradoPor: "dir.ebdi033",
    deleted_at: null
  },
  {
    // Aviso pendiente de aceptar: no se puede activar seguimiento
    tutor: ObjectId("b00000000000000000000007"),
    infante: ObjectId("900000000000000000000006"),
    versionAviso: "2026.1",
    aceptado: false,
    fechaAceptacion: null,
    registradoPor: "dir.ebdi007",
    deleted_at: null
  }
];

db.consentimientos.insertMany(consentimientos);
