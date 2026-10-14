// Correr con: mongosh Asesorias.js

use("ISSTE");

// ---------------------------------------------------------------------------
// Dummy data: 2 asesorias
// Placeholder: los textos con DUMMY_ENC: no estan cifrados. Reemplazar cuando el backend defina el cifrado (AES-256)
// ---------------------------------------------------------------------------

const asesorias = [
  {
    _id: ObjectId("e00000000000000000000001"),
    ticket: ObjectId("d00000000000000000000001"),
    infante: ObjectId("900000000000000000000009"),
    asesoria: "DUMMY_ENC:Se orienta a la madre sobre cuidados en casa y se solicita constancia médica para el reingreso",
    fechaRetornoEstimada: ISODate("2026-10-09"),
    requiereAltaMedica: true,
    registradoPor: "med.ebdi007",
    fechaRegistro: ISODate("2026-10-05T10:00:00-06:00"),
    deleted_at: null
  },
  {
    _id: ObjectId("e00000000000000000000002"),
    ticket: ObjectId("d00000000000000000000005"),
    infante: ObjectId("900000000000000000000025"),
    asesoria: "DUMMY_ENC:Se orienta al tutor sobre prevención de accidentes en el hogar",
    fechaRetornoEstimada: ISODate("2026-10-06"),
    requiereAltaMedica: false,
    registradoPor: "ts.ebdi007",
    fechaRegistro: ISODate("2026-10-05T09:40:00-06:00"),
    deleted_at: null
  }
];

db.asesorias.insertMany(asesorias);
