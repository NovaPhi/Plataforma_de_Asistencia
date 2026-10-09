// Correr con: mongosh NotasConfidenciales.js

use("ISSTE");


// Template de una nota confidencial, recordatorio de que tipo de datos se espera en los campos
/*
const templateNotaConfidencial = {
  id: 0,                     // id ascendente por coleccion
  ticket: null,              // ObjectId del ticket
  infante: 0,                // id_infante
  tipo: "",                  // "MEDICA" | "FAMILIAR"
  diagnostico: null,         // Diagnostico o sintomas (cifrado). null en notas familiares
  nota: "",                  // Seguimiento o situacion familiar (cifrado)
  autor: "",                 // usuario que la escribio
  fechaRegistro: null,
  deleted_at: null           // Borrado logico
};
*/




// Coleccion con validacion
db.createCollection("notasConfidenciales", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id", "ticket", "infante", "tipo", "nota", "autor", "fechaRegistro"],
      properties: {
        id: { bsonType: "number" },
        ticket: { bsonType: "objectId" },
        infante: { bsonType: "number" },
        tipo: { enum: ["MEDICA", "FAMILIAR"] },
        diagnostico: { bsonType: ["string", "null"] },
        nota: { bsonType: "string", minLength: 1 },
        autor: { bsonType: "string", maxLength: 50 },
        fechaRegistro: { bsonType: "date" },
        deleted_at: { bsonType: ["date", "null"] }
      }
    }
  }
});

db.notasConfidenciales.createIndex({ id: 1 }, { unique: true });
db.notasConfidenciales.createIndex({ ticket: 1 });
db.notasConfidenciales.createIndex({ infante: 1 });

// ---------------------------------------------------------------------------
// Dummy data: 3 notas confidenciales
// Placeholder: los textos con DUMMY_ENC: no estan cifrados. Reemplazar cuando el backend defina el cifrado (AES-256)
// ---------------------------------------------------------------------------

const notasConfidenciales = [
  {
    id: 1,
    _id: ObjectId("f00000000000000000000001"),
    ticket: ObjectId("d00000000000000000000001"),
    infante: 199417,
    tipo: "MEDICA",
    diagnostico: "DUMMY_ENC:Fiebre de 38.5 °C y dolor de garganta, probable faringoamigdalitis",
    nota: "DUMMY_ENC:Se requiere constancia médica antes del reingreso",
    autor: "med.ebdi007",
    fechaRegistro: ISODate("2026-10-05T10:05:00-06:00"),
    deleted_at: null
  },
  {
    id: 2,
    _id: ObjectId("f00000000000000000000002"),
    ticket: ObjectId("d00000000000000000000003"),
    infante: 199425,
    tipo: "FAMILIAR",
    diagnostico: null,
    nota: "DUMMY_ENC:Tutores no localizados; se notificó a los contactos de emergencia y se escaló a dirección",
    autor: "dir.ebdi033",
    fechaRegistro: ISODate("2026-10-05T12:20:00-06:00"),
    deleted_at: null
  },
  {
    id: 3,
    _id: ObjectId("f00000000000000000000003"),
    ticket: ObjectId("d00000000000000000000005"),
    infante: 199445,
    tipo: "MEDICA",
    diagnostico: "DUMMY_ENC:Contusión leve en rodilla derecha, sin limitación de movimiento",
    nota: "DUMMY_ENC:Valorar al reingreso",
    autor: "med.ebdi007",
    fechaRegistro: ISODate("2026-10-05T09:50:00-06:00"),
    deleted_at: null
  }
];

db.notasConfidenciales.insertMany(notasConfidenciales);
