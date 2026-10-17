// Correr con: mongosh Grupos.js

use("ISSTE");

// ---------------------------------------------------------------------------
// Dummy data: 9 grupos
// _id fijos (a0...) para poder referenciarlos desde Asistencias.js. Educadores tomados de Usuarios.js
// infantes: _id de Infantes.js, coinciden con el grupo de cada infante en Asistencias.js
// ---------------------------------------------------------------------------

const grupos = [
  {
    _id: ObjectId("a00000000000000000000001"),
    estancia: 7,
    sala: "Lactantes A",
    nombre: "Lactantes A1",
    cicloEscolar: "2026-2027",
    educador: "capt.ebdi007",
    infantes: [
      ObjectId("900000000000000000000006")
    ],
    activo: true,
    deleted_at: null
  },
  {
    _id: ObjectId("a00000000000000000000002"),
    estancia: 7,
    sala: "Lactantes B",
    nombre: "Lactantes B1",
    cicloEscolar: "2026-2027",
    educador: "capt.ebdi007",
    infantes: [
      ObjectId("900000000000000000000009"),
      ObjectId("900000000000000000000025"),
      ObjectId("90000000000000000000002b")
    ],
    activo: true,
    deleted_at: null
  },
  {
    _id: ObjectId("a00000000000000000000003"),
    estancia: 12,
    sala: "Maternal A",
    nombre: "Maternal A1",
    cicloEscolar: "2026-2027",
    educador: "admin.central",
    infantes: [
      ObjectId("90000000000000000000000a"),
      ObjectId("900000000000000000000013"),
      ObjectId("90000000000000000000001a"),
      ObjectId("900000000000000000000027")
    ],
    activo: true,
    deleted_at: null
  },
  {
    _id: ObjectId("a00000000000000000000004"),
    estancia: 33,
    sala: "Lactantes A",
    nombre: "Lactantes A1",
    cicloEscolar: "2026-2027",
    educador: "capt.ebdi033",
    infantes: [
      ObjectId("900000000000000000000008"),
      ObjectId("90000000000000000000000b"),
      ObjectId("90000000000000000000000f"),
      ObjectId("900000000000000000000011"),
      ObjectId("900000000000000000000023")
    ],
    activo: true,
    deleted_at: null
  },
  {
    _id: ObjectId("a00000000000000000000005"),
    estancia: 33,
    sala: "Maternal B",
    nombre: "Maternal B1",
    cicloEscolar: "2026-2027",
    educador: "capt.ebdi033",
    infantes: [
      ObjectId("900000000000000000000003"),
      ObjectId("900000000000000000000018"),
      ObjectId("90000000000000000000002a")
    ],
    activo: true,
    deleted_at: null
  },
  {
    _id: ObjectId("a00000000000000000000006"),
    estancia: 64,
    sala: "Preescolar 1",
    nombre: "Preescolar 1A",
    cicloEscolar: "2026-2027",
    educador: "capt.ebdi064",
    infantes: [
      ObjectId("900000000000000000000002"),
      ObjectId("90000000000000000000002c")
    ],
    activo: true,
    deleted_at: null
  },
  {
    _id: ObjectId("a00000000000000000000007"),
    estancia: 64,
    sala: "Preescolar 2",
    nombre: "Preescolar 2A",
    cicloEscolar: "2026-2027",
    educador: "capt.ebdi064",
    infantes: [
      ObjectId("900000000000000000000012"),
      ObjectId("900000000000000000000014"),
      ObjectId("900000000000000000000019"),
      ObjectId("900000000000000000000026")
    ],
    activo: true,
    deleted_at: null
  },
  {
    _id: ObjectId("a00000000000000000000008"),
    estancia: 88,
    sala: "Maternal A",
    nombre: "Maternal A1",
    cicloEscolar: "2026-2027",
    educador: "dir.ebdi088",
    infantes: [
      ObjectId("900000000000000000000030")
    ],
    activo: true,
    deleted_at: null
  },
  {
    // Grupo del ciclo anterior (ya no vigente)
    _id: ObjectId("a00000000000000000000063"),
    estancia: 7,
    sala: "Lactantes A",
    nombre: "Lactantes A1",
    cicloEscolar: "2025-2026",
    educador: "capt.ebdi007",
    infantes: [
      ObjectId("900000000000000000000032")
    ],
    activo: false,
    deleted_at: null
  }
];

db.grupos.insertMany(grupos);