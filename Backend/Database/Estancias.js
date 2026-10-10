// Correr con: mongosh Estancias.js

use("ISSTE");

// ---------------------------------------------------------------------------
// Dummy data: 13 estancias
// UR / EBDI iguales a los de Infantes.js y Usuarios.js
// ---------------------------------------------------------------------------

const estancias = [
  // ---- UR 090 ----
  {
    ebdi: 1,
    nombre: "Estancia de Bienestar y Desarrollo Infantil No. 1",
    ur: "090",
    domicilio: "Av. Insurgentes Sur 1235, Col. Del Valle, Benito Juárez, CDMX",
    telefono: "5571124335",
    salas: [
      { nombre: "Lactantes A", capacidad: 20 },
      { nombre: "Lactantes B", capacidad: 30 },
      { nombre: "Maternal A", capacidad: 25 },
      { nombre: "Maternal B", capacidad: 25 },
      { nombre: "Preescolar 1", capacidad: 20 },
      { nombre: "Preescolar 2", capacidad: 30 }
    ],
    activo: true,
    deleted_at: null
  },
  {
    ebdi: 7,
    nombre: "Estancia de Bienestar y Desarrollo Infantil No. 7",
    ur: "090",
    domicilio: "Calz. de Tlalpan 3015, Col. Santa Úrsula Coapa, Coyoacán, CDMX",
    telefono: "5580154316",
    salas: [
      { nombre: "Lactantes A", capacidad: 20 },
      { nombre: "Lactantes B", capacidad: 20 },
      { nombre: "Maternal A", capacidad: 24 },
      { nombre: "Maternal B", capacidad: 20 },
      { nombre: "Preescolar 1", capacidad: 24 },
      { nombre: "Preescolar 2", capacidad: 24 }
    ],
    activo: true,
    deleted_at: null
  },
  {
    ebdi: 58,
    nombre: "Estancia de Bienestar y Desarrollo Infantil No. 58",
    ur: "090",
    domicilio: "Av. Instituto Politécnico Nacional 4500, Col. Lindavista, Gustavo A. Madero, CDMX",
    telefono: "5550215205",
    salas: [
      { nombre: "Lactantes A", capacidad: 20 },
      { nombre: "Lactantes B", capacidad: 20 },
      { nombre: "Maternal A", capacidad: 25 },
      { nombre: "Maternal B", capacidad: 24 },
      { nombre: "Preescolar 1", capacidad: 25 },
      { nombre: "Preescolar 2", capacidad: 20 }
    ],
    activo: true,
    deleted_at: null
  },
  {
    ebdi: 105,
    nombre: "Estancia de Bienestar y Desarrollo Infantil No. 105",
    ur: "090",
    domicilio: "Av. Vasco de Quiroga 1800, Col. Santa Fe, Álvaro Obregón, CDMX",
    telefono: "5583419082",
    salas: [
      { nombre: "Lactantes A", capacidad: 24 },
      { nombre: "Lactantes B", capacidad: 30 },
      { nombre: "Maternal A", capacidad: 20 },
      { nombre: "Maternal B", capacidad: 24 },
      { nombre: "Preescolar 1", capacidad: 25 },
      { nombre: "Preescolar 2", capacidad: 24 }
    ],
    activo: true,
    deleted_at: null
  },
  // ---- UR 140 ----
  {
    ebdi: 20,
    nombre: "Estancia de Bienestar y Desarrollo Infantil No. 20",
    ur: "140",
    domicilio: "Av. Federalismo Sur 1100, Col. Moderna, Guadalajara, Jal.",
    telefono: "3312223863",
    salas: [
      { nombre: "Lactantes A", capacidad: 30 },
      { nombre: "Lactantes B", capacidad: 30 },
      { nombre: "Maternal A", capacidad: 30 },
      { nombre: "Maternal B", capacidad: 30 },
      { nombre: "Preescolar 1", capacidad: 20 },
      { nombre: "Preescolar 2", capacidad: 25 }
    ],
    activo: true,
    deleted_at: null
  },
  {
    ebdi: 42,
    nombre: "Estancia de Bienestar y Desarrollo Infantil No. 42",
    ur: "140",
    domicilio: "Av. López Mateos Sur 2375, Col. Ciudad del Sol, Zapopan, Jal.",
    telefono: "3305424685",
    salas: [
      { nombre: "Lactantes A", capacidad: 25 },
      { nombre: "Lactantes B", capacidad: 24 },
      { nombre: "Maternal A", capacidad: 25 },
      { nombre: "Maternal B", capacidad: 24 },
      { nombre: "Preescolar 1", capacidad: 30 },
      { nombre: "Preescolar 2", capacidad: 30 }
    ],
    activo: true,
    deleted_at: null
  },
  {
    ebdi: 64,
    nombre: "Estancia de Bienestar y Desarrollo Infantil No. 64",
    ur: "140",
    domicilio: "Calle Pedro Moreno 1621, Col. Americana, Guadalajara, Jal.",
    telefono: "3341297447",
    salas: [
      { nombre: "Lactantes A", capacidad: 30 },
      { nombre: "Lactantes B", capacidad: 30 },
      { nombre: "Maternal A", capacidad: 20 },
      { nombre: "Maternal B", capacidad: 25 },
      { nombre: "Preescolar 1", capacidad: 30 },
      { nombre: "Preescolar 2", capacidad: 20 }
    ],
    activo: true,
    deleted_at: null
  },
  // ---- UR 150 ----
  {
    ebdi: 12,
    nombre: "Estancia de Bienestar y Desarrollo Infantil No. 12",
    ur: "150",
    domicilio: "Av. Lerdo Poniente 300, Col. Centro, Toluca, Edo. Méx.",
    telefono: "7223936055",
    salas: [
      { nombre: "Lactantes A", capacidad: 20 },
      { nombre: "Lactantes B", capacidad: 25 },
      { nombre: "Maternal A", capacidad: 30 },
      { nombre: "Maternal B", capacidad: 25 },
      { nombre: "Preescolar 1", capacidad: 30 },
      { nombre: "Preescolar 2", capacidad: 20 }
    ],
    activo: true,
    deleted_at: null
  },
  {
    ebdi: 33,
    nombre: "Estancia de Bienestar y Desarrollo Infantil No. 33",
    ur: "150",
    domicilio: "Blvd. Toluca-Metepec 1150, Col. La Providencia, Metepec, Edo. Méx.",
    telefono: "7229605643",
    salas: [
      { nombre: "Lactantes A", capacidad: 24 },
      { nombre: "Lactantes B", capacidad: 24 },
      { nombre: "Maternal A", capacidad: 30 },
      { nombre: "Maternal B", capacidad: 24 },
      { nombre: "Preescolar 1", capacidad: 30 },
      { nombre: "Preescolar 2", capacidad: 30 }
    ],
    activo: true,
    deleted_at: null
  },
  // ---- UR 190 ----
  {
    ebdi: 9,
    nombre: "Estancia de Bienestar y Desarrollo Infantil No. 9",
    ur: "190",
    domicilio: "Av. Constitución 2100, Col. Obispado, Monterrey, N.L.",
    telefono: "8171099644",
    salas: [
      { nombre: "Lactantes A", capacidad: 25 },
      { nombre: "Lactantes B", capacidad: 30 },
      { nombre: "Maternal A", capacidad: 25 },
      { nombre: "Maternal B", capacidad: 20 },
      { nombre: "Preescolar 1", capacidad: 24 },
      { nombre: "Preescolar 2", capacidad: 30 }
    ],
    activo: true,
    deleted_at: null
  },
  {
    ebdi: 71,
    nombre: "Estancia de Bienestar y Desarrollo Infantil No. 71",
    ur: "190",
    domicilio: "Av. Universidad 1500, Col. Anáhuac, San Nicolás de los Garza, N.L.",
    telefono: "8120568326",
    salas: [
      { nombre: "Lactantes A", capacidad: 30 },
      { nombre: "Lactantes B", capacidad: 20 },
      { nombre: "Maternal A", capacidad: 30 },
      { nombre: "Maternal B", capacidad: 25 },
      { nombre: "Preescolar 1", capacidad: 30 },
      { nombre: "Preescolar 2", capacidad: 30 }
    ],
    activo: true,
    deleted_at: null
  },
  // ---- UR 210 ----
  {
    ebdi: 15,
    nombre: "Estancia de Bienestar y Desarrollo Infantil No. 15",
    ur: "210",
    domicilio: "Av. Reforma 1520, Col. Centro, Puebla, Pue.",
    telefono: "2225164807",
    salas: [
      { nombre: "Lactantes A", capacidad: 24 },
      { nombre: "Lactantes B", capacidad: 20 },
      { nombre: "Maternal A", capacidad: 24 },
      { nombre: "Maternal B", capacidad: 30 },
      { nombre: "Preescolar 1", capacidad: 24 },
      { nombre: "Preescolar 2", capacidad: 24 }
    ],
    activo: true,
    deleted_at: null
  },
  {
    ebdi: 88,
    nombre: "Estancia de Bienestar y Desarrollo Infantil No. 88",
    ur: "210",
    domicilio: "Blvd. Atlixcáyotl 2401, Col. Reserva Territorial, San Andrés Cholula, Pue.",
    telefono: "2220987695",
    salas: [
      { nombre: "Lactantes A", capacidad: 24 },
      { nombre: "Lactantes B", capacidad: 30 },
      { nombre: "Maternal A", capacidad: 20 },
      { nombre: "Maternal B", capacidad: 20 },
      { nombre: "Preescolar 1", capacidad: 20 },
      { nombre: "Preescolar 2", capacidad: 20 }
    ],
    activo: true,
    deleted_at: null
  }
];

db.estancias.insertMany(estancias);
