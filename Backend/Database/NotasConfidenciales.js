// Correr con: mongosh NotasConfidenciales.js

use("ISSTE");

// ---------------------------------------------------------------------------
// Dummy data: 3 notas confidenciales
// Placeholder: los textos con DUMMY_ENC: no estan cifrados. Reemplazar cuando el backend defina el cifrado (AES-256)
// ---------------------------------------------------------------------------

const notasConfidenciales = [
  {
    _id: ObjectId("f00000000000000000000001"),
    ticket: ObjectId("d00000000000000000000001"),
    infante: ObjectId("900000000000000000000009"),
    tipo: "MEDICA",
    diagnostico: "DUMMY_ENC:Fiebre de 38.5 °C y dolor de garganta, probable faringoamigdalitis",
    nota: "DUMMY_ENC:Se requiere constancia médica antes del reingreso",
    autor: "med.ebdi007",
    fechaRegistro: ISODate("2026-10-05T10:05:00-06:00"),
    deleted_at: null
  },
  {
    _id: ObjectId("f00000000000000000000002"),
    ticket: ObjectId("d00000000000000000000003"),
    infante: ObjectId("900000000000000000000011"),
    tipo: "FAMILIAR",
    diagnostico: null,
    nota: "DUMMY_ENC:Tutores no localizados; se notificó a los contactos de emergencia y se escaló a dirección",
    autor: "dir.ebdi033",
    fechaRegistro: ISODate("2026-10-05T12:20:00-06:00"),
    deleted_at: null
  },
  {
    _id: ObjectId("f00000000000000000000003"),
    ticket: ObjectId("d00000000000000000000005"),
    infante: ObjectId("900000000000000000000025"),
    tipo: "MEDICA",
    diagnostico: "DUMMY_ENC:Contusión leve en rodilla derecha, sin limitación de movimiento",
    nota: "DUMMY_ENC:Valorar al reingreso",
    autor: "med.ebdi007",
    fechaRegistro: ISODate("2026-10-05T09:50:00-06:00"),
    deleted_at: null
  }
];

db.notasConfidenciales.insertMany(notasConfidenciales);
