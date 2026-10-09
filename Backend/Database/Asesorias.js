// Correr con: mongosh Asesorias.js

use("ISSTE");


// Template de una asesoria, recordatorio de que tipo de datos se espera en los campos
/*
const templateAsesoria = {
  id: 0,                     // id ascendente por coleccion
  ticket: null,              // ObjectId del ticket
  infante: 0,                // id_infante
  asesoria: "",              // Orientacion brindada (cifrado)
  fechaRetornoEstimada: null,
  requiereAltaMedica: false, // Si es true activa el bloqueo de ingreso
  registradoPor: "",         // usuario de Trabajo Social o Medico
  fechaRegistro: null,
  deleted_at: null           // Borrado logico
};
*/




// Coleccion con validacion
db.createCollection("asesorias", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id", "ticket", "infante", "asesoria", "requiereAltaMedica", "registradoPor", "fechaRegistro"],
      properties: {
        id: { bsonType: "number" },
        ticket: { bsonType: "objectId" },
        infante: { bsonType: "number" },
        asesoria: { bsonType: "string", minLength: 1 },
        fechaRetornoEstimada: { bsonType: ["date", "null"] },
        requiereAltaMedica: { bsonType: "bool" },
        registradoPor: { bsonType: "string", maxLength: 50 },
        fechaRegistro: { bsonType: "date" },
        deleted_at: { bsonType: ["date", "null"] }
      }
    }
  }
});

db.asesorias.createIndex({ id: 1 }, { unique: true });
db.asesorias.createIndex({ ticket: 1 });
db.asesorias.createIndex({ infante: 1 });

// ---------------------------------------------------------------------------
// Dummy data: 2 asesorias
// Placeholder: los textos con DUMMY_ENC: no estan cifrados. Reemplazar cuando el backend defina el cifrado (AES-256)
// ---------------------------------------------------------------------------

const asesorias = [
  {
    id: 1,
    _id: ObjectId("e00000000000000000000001"),
    ticket: ObjectId("d00000000000000000000001"),
    infante: 199417,
    asesoria: "DUMMY_ENC:Se orienta a la madre sobre cuidados en casa y se solicita constancia médica para el reingreso",
    fechaRetornoEstimada: ISODate("2026-10-09"),
    requiereAltaMedica: true,
    registradoPor: "med.ebdi007",
    fechaRegistro: ISODate("2026-10-05T10:00:00-06:00"),
    deleted_at: null
  },
  {
    id: 2,
    _id: ObjectId("e00000000000000000000002"),
    ticket: ObjectId("d00000000000000000000005"),
    infante: 199445,
    asesoria: "DUMMY_ENC:Se orienta al tutor sobre prevención de accidentes en el hogar",
    fechaRetornoEstimada: ISODate("2026-10-06"),
    requiereAltaMedica: false,
    registradoPor: "ts.ebdi007",
    fechaRegistro: ISODate("2026-10-05T09:40:00-06:00"),
    deleted_at: null
  }
];

db.asesorias.insertMany(asesorias);
