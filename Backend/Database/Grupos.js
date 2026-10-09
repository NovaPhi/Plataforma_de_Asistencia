// Correr con: mongosh Grupos.js

use("ISSTE");


// Template de un grupo, recordatorio de que tipo de datos se espera en los campos
/*
const templateGrupo = {
  id: 0,                     // id ascendente por coleccion
  estancia: 0,               // ebdi de la estancia
  sala: "",                  // Nombre de la sala (estancias.salas.nombre)
  nombre: "",
  cicloEscolar: "",          // "2026-2027"
  educador: "",              // usuario del docente que pasa lista (usuarios.usuario)
  activo: true,              // Vigencia del grupo
  deleted_at: null           // Borrado logico
};
*/




// Coleccion con validacion
db.createCollection("grupos", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id", "estancia", "sala", "nombre", "cicloEscolar", "educador", "activo"],
      properties: {
        id: { bsonType: "number" },
        estancia: { bsonType: "number" },
        sala: { bsonType: "string", maxLength: 50 },
        nombre: { bsonType: "string", maxLength: 50 },
        cicloEscolar: { bsonType: "string", maxLength: 9 },
        educador: { bsonType: "string", maxLength: 50 },
        activo: { bsonType: "bool" },
        deleted_at: { bsonType: ["date", "null"] }
      }
    }
  }
});

db.grupos.createIndex({ id: 1 }, { unique: true });
db.grupos.createIndex({ estancia: 1, cicloEscolar: 1 });
db.grupos.createIndex({ educador: 1 });

// ---------------------------------------------------------------------------
// Dummy data: 9 grupos
// _id fijos (a0...) para poder referenciarlos desde Asistencias.js. Educadores tomados de Usuarios.js
// ---------------------------------------------------------------------------

const grupos = [
  {
    id: 1,
    _id: ObjectId("a00000000000000000000001"),
    estancia: 7,
    sala: "Lactantes A",
    nombre: "Lactantes A1",
    cicloEscolar: "2026-2027",
    educador: "capt.ebdi007",
    activo: true,
    deleted_at: null
  },
  {
    id: 2,
    _id: ObjectId("a00000000000000000000002"),
    estancia: 7,
    sala: "Lactantes B",
    nombre: "Lactantes B1",
    cicloEscolar: "2026-2027",
    educador: "capt.ebdi007",
    activo: true,
    deleted_at: null
  },
  {
    id: 3,
    _id: ObjectId("a00000000000000000000003"),
    estancia: 12,
    sala: "Maternal A",
    nombre: "Maternal A1",
    cicloEscolar: "2026-2027",
    educador: "capt.ebdi012",
    activo: true,
    deleted_at: null
  },
  {
    id: 4,
    _id: ObjectId("a00000000000000000000004"),
    estancia: 33,
    sala: "Lactantes A",
    nombre: "Lactantes A1",
    cicloEscolar: "2026-2027",
    educador: "capt.ebdi033",
    activo: true,
    deleted_at: null
  },
  {
    id: 5,
    _id: ObjectId("a00000000000000000000005"),
    estancia: 33,
    sala: "Maternal B",
    nombre: "Maternal B1",
    cicloEscolar: "2026-2027",
    educador: "capt.ebdi033",
    activo: true,
    deleted_at: null
  },
  {
    id: 6,
    _id: ObjectId("a00000000000000000000006"),
    estancia: 64,
    sala: "Preescolar 1",
    nombre: "Preescolar 1A",
    cicloEscolar: "2026-2027",
    educador: "capt.ebdi064",
    activo: true,
    deleted_at: null
  },
  {
    id: 7,
    _id: ObjectId("a00000000000000000000007"),
    estancia: 64,
    sala: "Preescolar 2",
    nombre: "Preescolar 2A",
    cicloEscolar: "2026-2027",
    educador: "capt.ebdi064",
    activo: true,
    deleted_at: null
  },
  {
    id: 8,
    _id: ObjectId("a00000000000000000000008"),
    estancia: 88,
    sala: "Maternal A",
    nombre: "Maternal A1",
    cicloEscolar: "2026-2027",
    educador: "dir.ebdi088",
    activo: true,
    deleted_at: null
  },
  {
    id: 9,
    // Grupo del ciclo anterior (ya no vigente)
    _id: ObjectId("a00000000000000000000063"),
    estancia: 7,
    sala: "Lactantes A",
    nombre: "Lactantes A1",
    cicloEscolar: "2025-2026",
    educador: "capt.ebdi007",
    activo: false,
    deleted_at: null
  }
];

db.grupos.insertMany(grupos);
