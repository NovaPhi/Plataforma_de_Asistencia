// Correr con: mongosh Consentimientos.js

use("ISSTE");


// Template de un consentimiento, recordatorio de que tipo de datos se espera en los campos
/*
const templateConsentimiento = {
  tutor: null,               // ObjectId del tutor que acepto el aviso de privacidad
  infante: 0,                // id_infante
  versionAviso: "",          // Version del aviso aceptado
  aceptado: false,           // Sin esto en true no se activa el seguimiento
  fechaAceptacion: null,
  registradoPor: "",         // usuario de la directora que lo registro
  deleted_at: null           // Borrado logico
};
*/




// Coleccion con validacion
db.createCollection("consentimientos", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["tutor", "infante", "versionAviso", "aceptado", "registradoPor"],
      properties: {
        tutor: { bsonType: "objectId" },
        infante: { bsonType: "number" },
        versionAviso: { bsonType: "string", maxLength: 20 },
        aceptado: { bsonType: "bool" },
        fechaAceptacion: { bsonType: ["date", "null"] },
        registradoPor: { bsonType: "string", maxLength: 50 },
        deleted_at: { bsonType: ["date", "null"] }
      }
    }
  }
});

db.consentimientos.createIndex({ tutor: 1, infante: 1, versionAviso: 1 }, { unique: true });
db.consentimientos.createIndex({ infante: 1 });

// ---------------------------------------------------------------------------
// Dummy data: 10 consentimientos
// Consentimientos de los infantes con tickets (actuales y del historico)
// ---------------------------------------------------------------------------

const consentimientos = [
  {
    tutor: ObjectId("b00000000000000000000044"),
    infante: 199451,
    versionAviso: "2025.1",
    aceptado: true,
    fechaAceptacion: ISODate("2025-08-11T08:40:00-06:00"),
    registradoPor: "dir.ebdi007",
    deleted_at: null
  },
  {
    tutor: ObjectId("b00000000000000000000004"),
    infante: 199411,
    versionAviso: "2025.1",
    aceptado: true,
    fechaAceptacion: ISODate("2025-08-12T09:10:00-06:00"),
    registradoPor: "dir.ebdi033",
    deleted_at: null
  },
  {
    tutor: ObjectId("b0000000000000000000000b"),
    infante: 199417,
    versionAviso: "2026.1",
    aceptado: true,
    fechaAceptacion: ISODate("2026-08-10T08:54:00-06:00"),
    registradoPor: "dir.ebdi007",
    deleted_at: null
  },
  {
    tutor: ObjectId("b0000000000000000000003a"),
    infante: 199445,
    versionAviso: "2026.1",
    aceptado: true,
    fechaAceptacion: ISODate("2026-08-10T08:40:00-06:00"),
    registradoPor: "dir.ebdi007",
    deleted_at: null
  },
  {
    tutor: ObjectId("b00000000000000000000044"),
    infante: 199451,
    versionAviso: "2026.1",
    aceptado: true,
    fechaAceptacion: ISODate("2026-08-11T08:02:00-06:00"),
    registradoPor: "dir.ebdi007",
    deleted_at: null
  },
  {
    tutor: ObjectId("b0000000000000000000000d"),
    infante: 199419,
    versionAviso: "2026.1",
    aceptado: true,
    fechaAceptacion: ISODate("2026-08-10T08:28:00-06:00"),
    registradoPor: "dir.ebdi033",
    deleted_at: null
  },
  {
    tutor: ObjectId("b00000000000000000000018"),
    infante: 199425,
    versionAviso: "2026.1",
    aceptado: true,
    fechaAceptacion: ISODate("2026-08-11T08:04:00-06:00"),
    registradoPor: "dir.ebdi033",
    deleted_at: null
  },
  {
    tutor: ObjectId("b00000000000000000000038"),
    infante: 199443,
    versionAviso: "2026.1",
    aceptado: true,
    fechaAceptacion: ISODate("2026-08-11T08:19:00-06:00"),
    registradoPor: "dir.ebdi033",
    deleted_at: null
  },
  {
    tutor: ObjectId("b00000000000000000000004"),
    infante: 199411,
    versionAviso: "2026.1",
    aceptado: true,
    fechaAceptacion: ISODate("2026-08-12T08:52:00-06:00"),
    registradoPor: "dir.ebdi033",
    deleted_at: null
  },
  {
    // Aviso pendiente de aceptar: no se puede activar seguimiento
    tutor: ObjectId("b00000000000000000000007"),
    infante: 199414,
    versionAviso: "2026.1",
    aceptado: false,
    fechaAceptacion: null,
    registradoPor: "dir.ebdi007",
    deleted_at: null
  }
];

db.consentimientos.insertMany(consentimientos);
