// Correr con: mongosh Usuarios.js

use("ISSTE");


// Template de un usuario, recordatorio de que tipo de datos se espera en los campos
/*
const templateUsuario = {
  id: 0,                     // id ascendente por coleccion
  numeroEmpleado: "",        
  usuario: "",               
  passwordHash: "",          
  nombre: "",
  paterno: "",
  materno: "",
  correo: "",
  telefono: "",
  // Opciones de rol. Cada usuario guarda solo los que tiene: rol: ["DIRECTORA_ESTANCIA"]
  rol: [
    "ADMINISTRADOR_CENTRAL",   // Gestiona usuarios, estancias, salas, infantes y tutores
    "SUPERVISOR_CENTRAL",      // Solo estadisticas agregadas de las 212 estancias
    "SUPERVISOR_REGIONAL",     // Tablero y reportes de su region
    "DIRECTORA_ESTANCIA",      // Responsable de una estancia
    "MEDICO_ESTANCIA",         // Seguimiento medico y alta medica
    "TRABAJO_SOCIAL",          // Trabajo Social / Enfermeria: llamadas y seguimiento de faltas
    "CAPTURISTA_DOCENTE"       // Educadora de sala: pase de lista y escaneo de credenciales
  ],
  ambito: {
    ur: "",                  // Region / Unidad Responsable. Vacio = todas (roles centrales)
    ebdi: null,              // Estancia a la que esta ligada la sesion. null = no aplica
    salas: []                // Solo para CAPTURISTA_DOCENTE: salas que atiende
  },
  activo: true,
  ultimoAcceso: null,       
  fsistema: null,           
  deleted_at: null           // Borrado logico 
};
*/




// Coleccion con validacion
db.createCollection("usuarios", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["usuario", "passwordHash"], //, "nombre", "paterno", "rol", "ambito", "activo"],
      properties: {
        id: { bsonType: "number" },
        numeroEmpleado: { bsonType: "string" },
        usuario: { bsonType: "string", minLength: 3, maxLength: 50 },
        passwordHash: { bsonType: "string", minLength: 1 },
        nombre: { bsonType: "string", maxLength: 50 },
        paterno: { bsonType: "string", maxLength: 50 },
        materno: { bsonType: "string", maxLength: 50 },
        correo: { bsonType: "string" },
        telefono: { bsonType: "string"},
        rol: {
          bsonType: "array",
          minItems: 1,
          uniqueItems: true,
          items: { enum: ["ADMINISTRADOR_CENTRAL",   
                          "SUPERVISOR_CENTRAL",      
                          "SUPERVISOR_REGIONAL",     
                          "DIRECTORA_ESTANCIA",      
                          "MEDICO_ESTANCIA",         
                          "TRABAJO_SOCIAL",          
                          "CAPTURISTA_DOCENTE" ]
                 }
          
        },
        ambito: {
          bsonType: "object",
          required: ["ur", "ebdi", "salas"],
          properties: {
            ur: { bsonType: "string", maxLength: 3 },
            ebdi: { bsonType: ["number", "null"] },
            salas: { bsonType: "array", items: { bsonType: "string" } }
          }
        },
        activo: { bsonType: "bool" },
        ultimoAcceso: { bsonType: ["date", "null"] },
        fsistema: { bsonType: ["date", "null"] },
        deleted_at: { bsonType: ["date", "null"] }
      }
    }
  }
});

db.usuarios.createIndex({ id: 1 }, { unique: true });
db.usuarios.createIndex({ usuario: 1 }, { unique: true });
db.usuarios.createIndex({ rol: 1});

// ---------------------------------------------------------------------------
// Dummy data: 28 usuarios
// UR / EBDI tomados de BaseDatosMongo.js para que coincidan con los infantes
//   090: 1, 7, 58, 105 | 140: 20, 42, 64 | 150: 12, 33 | 190: 9, 71 | 210: 15, 88
// ---------------------------------------------------------------------------

// Placeholder: no es un hash real. Reemplazar cuando el backend defina el algoritmo (bcrypt, argon2, etc.)
const PASSWORD_DUMMY = "DUMMY_HASH_Issste2026";

const usuarios = [
  // ---- Administradores centrales ----
  {
    id: 1,
    numeroEmpleado: "100001",
    usuario: "admin.central",
    passwordHash: PASSWORD_DUMMY,
    nombre: "Laura",
    paterno: "Mendoza",
    materno: "Villalobos",
    correo: "laura.mendoza@ejemplo.gob.mx",
    telefono: "5512345601",
    rol: ["ADMINISTRADOR_CENTRAL"],
    ambito: { ur: "", ebdi: null, salas: [] },
    activo: true,
    ultimoAcceso: ISODate("2026-10-05T08:12:00Z"),
    fsistema: ISODate("2021-11-15T09:00:00Z"),
    deleted_at: null
  },
  {
    id: 2,
    numeroEmpleado: "100002",
    usuario: "admin.soporte",
    passwordHash: PASSWORD_DUMMY,
    nombre: "Ricardo",
    paterno: "Salinas",
    materno: "Ochoa",
    correo: "ricardo.salinas@ejemplo.gob.mx",
    telefono: "5512345602",
    rol: ["ADMINISTRADOR_CENTRAL"],
    ambito: { ur: "", ebdi: null, salas: [] },
    activo: true,
    ultimoAcceso: ISODate("2026-10-03T16:40:00Z"),
    fsistema: ISODate("2022-03-02T10:30:00Z"),
    deleted_at: null
  },

  // ---- Supervisores centrales ----
  {
    id: 3,
    numeroEmpleado: "100010",
    usuario: "sup.central01",
    passwordHash: PASSWORD_DUMMY,
    nombre: "Patricia",
    paterno: "Herrera",
    materno: "Quintero",
    correo: "patricia.herrera@ejemplo.gob.mx",
    telefono: "5512345610",
    rol: ["SUPERVISOR_CENTRAL"],
    ambito: { ur: "", ebdi: null, salas: [] },
    activo: true,
    ultimoAcceso: ISODate("2026-10-02T11:05:00Z"),
    fsistema: ISODate("2022-01-20T09:15:00Z"),
    deleted_at: null
  },
  {
    id: 4,
    numeroEmpleado: "100011",
    usuario: "sup.central02",
    passwordHash: PASSWORD_DUMMY,
    nombre: "Fernando",
    paterno: "Arellano",
    materno: "Cisneros",
    correo: "fernando.arellano@ejemplo.gob.mx",
    telefono: "5512345611",
    rol: ["SUPERVISOR_CENTRAL"],
    ambito: { ur: "", ebdi: null, salas: [] },
    activo: true,
    ultimoAcceso: ISODate("2026-09-28T13:22:00Z"),
    fsistema: ISODate("2023-06-12T12:00:00Z"),
    deleted_at: null
  },

  // ---- Supervisores regionales (uno por UR) ----
  {
    id: 5,
    numeroEmpleado: "200090",
    usuario: "sup.reg090",
    passwordHash: PASSWORD_DUMMY,
    nombre: "Gabriela",
    paterno: "Núñez",
    materno: "Bautista",
    correo: "gabriela.nunez@ejemplo.gob.mx",
    telefono: "5523456090",
    rol: ["SUPERVISOR_REGIONAL"],
    ambito: { ur: "090", ebdi: null, salas: [] },
    activo: true,
    ultimoAcceso: ISODate("2026-10-04T09:47:00Z"),
    fsistema: ISODate("2022-02-01T08:30:00Z"),
    deleted_at: null
  },
  {
    id: 6,
    numeroEmpleado: "200140",
    usuario: "sup.reg140",
    passwordHash: PASSWORD_DUMMY,
    nombre: "Héctor",
    paterno: "Lozano",
    materno: "Espinoza",
    correo: "hector.lozano@ejemplo.gob.mx",
    telefono: "3312345140",
    rol: ["SUPERVISOR_REGIONAL"],
    ambito: { ur: "140", ebdi: null, salas: [] },
    activo: true,
    ultimoAcceso: ISODate("2026-10-01T10:15:00Z"),
    fsistema: ISODate("2022-02-01T08:45:00Z"),
    deleted_at: null
  },
  {
    id: 7,
    numeroEmpleado: "200150",
    usuario: "sup.reg150",
    passwordHash: PASSWORD_DUMMY,
    nombre: "Adriana",
    paterno: "Cervantes",
    materno: "Molina",
    correo: "adriana.cervantes@ejemplo.gob.mx",
    telefono: "7221234150",
    rol: ["SUPERVISOR_REGIONAL"],
    ambito: { ur: "150", ebdi: null, salas: [] },
    activo: true,
    ultimoAcceso: ISODate("2026-10-05T07:58:00Z"),
    fsistema: ISODate("2022-02-02T09:10:00Z"),
    deleted_at: null
  },
  {
    id: 8,
    numeroEmpleado: "200190",
    usuario: "sup.reg190",
    passwordHash: PASSWORD_DUMMY,
    nombre: "Óscar",
    paterno: "Treviño",
    materno: "Garza",
    correo: "oscar.trevino@ejemplo.gob.mx",
    telefono: "8112345190",
    rol: ["SUPERVISOR_REGIONAL"],
    ambito: { ur: "190", ebdi: null, salas: [] },
    activo: true,
    ultimoAcceso: ISODate("2026-09-30T15:30:00Z"),
    fsistema: ISODate("2022-02-03T10:00:00Z"),
    deleted_at: null
  },
  {
    id: 9,
    numeroEmpleado: "200210",
    usuario: "sup.reg210",
    passwordHash: PASSWORD_DUMMY,
    nombre: "Mónica",
    paterno: "Zavala",
    materno: "Pineda",
    correo: "monica.zavala@ejemplo.gob.mx",
    telefono: "2221234210",
    rol: ["SUPERVISOR_REGIONAL"],
    ambito: { ur: "210", ebdi: null, salas: [] },
    activo: true,
    ultimoAcceso: ISODate("2026-10-02T12:40:00Z"),
    fsistema: ISODate("2023-01-09T09:20:00Z"),
    deleted_at: null
  },

  // ---- Directoras de estancia ----
  {
    id: 10,
    numeroEmpleado: "300042",
    usuario: "dir.ebdi042",
    passwordHash: PASSWORD_DUMMY,
    nombre: "Verónica",
    paterno: "Castañeda",
    materno: "Ibarra",
    correo: "veronica.castaneda@ejemplo.gob.mx",
    telefono: "3323456042",
    rol: ["DIRECTORA_ESTANCIA"],
    ambito: { ur: "140", ebdi: 42, salas: [] },
    activo: true,
    ultimoAcceso: ISODate("2026-10-05T07:30:00Z"),
    fsistema: ISODate("2022-01-05T08:00:00Z"),
    deleted_at: null
  },
  {
    id: 11,
    numeroEmpleado: "300020",
    usuario: "dir.ebdi020",
    passwordHash: PASSWORD_DUMMY,
    nombre: "Claudia",
    paterno: "Robles",
    materno: "Fuentes",
    correo: "claudia.robles@ejemplo.gob.mx",
    telefono: "3323456020",
    rol: ["DIRECTORA_ESTANCIA"],
    ambito: { ur: "140", ebdi: 20, salas: [] },
    activo: true,
    ultimoAcceso: ISODate("2026-10-04T08:05:00Z"),
    fsistema: ISODate("2022-01-06T08:30:00Z"),
    deleted_at: null
  },
  {
    id: 12,
    numeroEmpleado: "300105",
    usuario: "dir.ebdi105",
    passwordHash: PASSWORD_DUMMY,
    nombre: "Silvia",
    paterno: "Montes",
    materno: "Aguirre",
    correo: "silvia.montes@ejemplo.gob.mx",
    telefono: "5523456105",
    rol: ["DIRECTORA_ESTANCIA"],
    ambito: { ur: "090", ebdi: 105, salas: [] },
    activo: true,
    ultimoAcceso: ISODate("2026-10-05T07:45:00Z"),
    fsistema: ISODate("2022-08-01T09:00:00Z"),
    deleted_at: null
  },
  {
    id: 13,
    numeroEmpleado: "300007",
    usuario: "dir.ebdi007",
    passwordHash: PASSWORD_DUMMY,
    nombre: "Rocío",
    paterno: "Delgado",
    materno: "Paredes",
    correo: "rocio.delgado@ejemplo.gob.mx",
    telefono: "5523456007",
    rol: ["DIRECTORA_ESTANCIA"],
    ambito: { ur: "090", ebdi: 7, salas: [] },
    activo: true,
    ultimoAcceso: ISODate("2026-10-03T08:20:00Z"),
    fsistema: ISODate("2023-02-14T10:00:00Z"),
    deleted_at: null
  },
  {
    id: 14,
    numeroEmpleado: "300033",
    usuario: "dir.ebdi033",
    passwordHash: PASSWORD_DUMMY,
    nombre: "Teresa",
    paterno: "Vázquez",
    materno: "Lara",
    correo: "teresa.vazquez@ejemplo.gob.mx",
    telefono: "7223456033",
    rol: ["DIRECTORA_ESTANCIA"],
    ambito: { ur: "150", ebdi: 33, salas: [] },
    activo: true,
    ultimoAcceso: ISODate("2026-10-05T07:15:00Z"),
    fsistema: ISODate("2022-01-10T08:00:00Z"),
    deleted_at: null
  },
  {
    id: 15,
    numeroEmpleado: "300071",
    usuario: "dir.ebdi071",
    passwordHash: PASSWORD_DUMMY,
    nombre: "Lorena",
    paterno: "Cantú",
    materno: "Elizondo",
    correo: "lorena.cantu@ejemplo.gob.mx",
    telefono: "8123456071",
    rol: ["DIRECTORA_ESTANCIA"],
    ambito: { ur: "190", ebdi: 71, salas: [] },
    activo: true,
    ultimoAcceso: ISODate("2026-10-02T08:10:00Z"),
    fsistema: ISODate("2022-02-15T09:30:00Z"),
    deleted_at: null
  },
  {
    id: 16,
    // Estancia pequeña: la directora tambien pasa lista en una sala
    numeroEmpleado: "300088",
    usuario: "dir.ebdi088",
    passwordHash: PASSWORD_DUMMY,
    nombre: "Beatriz",
    paterno: "Solís",
    materno: "Campos",
    correo: "beatriz.solis@ejemplo.gob.mx",
    telefono: "2223456088",
    rol: ["DIRECTORA_ESTANCIA", "CAPTURISTA_DOCENTE"],
    ambito: { ur: "210", ebdi: 88, salas: ["Maternal A"] },
    activo: true,
    ultimoAcceso: ISODate("2026-10-05T08:00:00Z"),
    fsistema: ISODate("2024-08-19T09:00:00Z"),
    deleted_at: null
  },

  // ---- Medicos de estancia ----
  {
    id: 17,
    numeroEmpleado: "400007",
    usuario: "med.ebdi007",
    passwordHash: PASSWORD_DUMMY,
    nombre: "Arturo",
    paterno: "Guerrero",
    materno: "Sandoval",
    correo: "arturo.guerrero@ejemplo.gob.mx",
    telefono: "5534567007",
    rol: ["MEDICO_ESTANCIA"],
    ambito: { ur: "090", ebdi: 7, salas: [] },
    activo: true,
    ultimoAcceso: ISODate("2026-10-03T10:30:00Z"),
    fsistema: ISODate("2023-02-20T08:00:00Z"),
    deleted_at: null
  },
  {
    id: 18,
    numeroEmpleado: "400033",
    usuario: "med.ebdi033",
    passwordHash: PASSWORD_DUMMY,
    nombre: "Diana",
    paterno: "Rangel",
    materno: "Olvera",
    correo: "diana.rangel@ejemplo.gob.mx",
    telefono: "7224567033",
    rol: ["MEDICO_ESTANCIA"],
    ambito: { ur: "150", ebdi: 33, salas: [] },
    activo: true,
    ultimoAcceso: ISODate("2026-10-04T09:10:00Z"),
    fsistema: ISODate("2022-03-01T08:00:00Z"),
    deleted_at: null
  },
  {
    id: 19,
    // Medico con funciones de enfermeria / trabajo social
    numeroEmpleado: "400064",
    usuario: "med.ebdi064",
    passwordHash: PASSWORD_DUMMY,
    nombre: "Javier",
    paterno: "Orozco",
    materno: "Meza",
    correo: "javier.orozco@ejemplo.gob.mx",
    telefono: "3324567064",
    rol: ["MEDICO_ESTANCIA", "TRABAJO_SOCIAL"],
    ambito: { ur: "140", ebdi: 64, salas: [] },
    activo: true,
    ultimoAcceso: ISODate("2026-10-01T11:45:00Z"),
    fsistema: ISODate("2022-05-16T08:30:00Z"),
    deleted_at: null
  },

  // ---- Trabajo social / Enfermeria ----
  {
    id: 20,
    numeroEmpleado: "500007",
    usuario: "ts.ebdi007",
    passwordHash: PASSWORD_DUMMY,
    nombre: "Elena",
    paterno: "Barrera",
    materno: "Trujillo",
    correo: "elena.barrera@ejemplo.gob.mx",
    telefono: "5545678007",
    rol: ["TRABAJO_SOCIAL"],
    ambito: { ur: "090", ebdi: 7, salas: [] },
    activo: true,
    ultimoAcceso: ISODate("2026-10-05T09:20:00Z"),
    fsistema: ISODate("2023-03-01T08:00:00Z"),
    deleted_at: null
  },
  {
    id: 21,
    numeroEmpleado: "500071",
    usuario: "ts.ebdi071",
    passwordHash: PASSWORD_DUMMY,
    nombre: "Norma",
    paterno: "Villarreal",
    materno: "Leal",
    correo: "norma.villarreal@ejemplo.gob.mx",
    telefono: "8145678071",
    rol: ["TRABAJO_SOCIAL"],
    ambito: { ur: "190", ebdi: 71, salas: [] },
    activo: true,
    ultimoAcceso: ISODate("2026-09-29T10:00:00Z"),
    fsistema: ISODate("2022-02-20T09:00:00Z"),
    deleted_at: null
  },
  {
    id: 22,
    numeroEmpleado: "500015",
    usuario: "ts.ebdi015",
    passwordHash: PASSWORD_DUMMY,
    nombre: "Alicia",
    paterno: "Tapia",
    materno: "Rosales",
    correo: "alicia.tapia@ejemplo.gob.mx",
    telefono: "2225678015",
    rol: ["TRABAJO_SOCIAL"],
    ambito: { ur: "210", ebdi: 15, salas: [] },
    activo: true,
    ultimoAcceso: ISODate("2026-10-02T14:15:00Z"),
    fsistema: ISODate("2023-08-07T08:30:00Z"),
    deleted_at: null
  },

  // ---- Capturistas docentes (educadoras de sala) ----
  {
    id: 23,
    numeroEmpleado: "600007",
    usuario: "capt.ebdi007",
    passwordHash: PASSWORD_DUMMY,
    nombre: "Karla",
    paterno: "Medina",
    materno: "Soto",
    correo: "karla.medina@ejemplo.gob.mx",
    telefono: "5556789007",
    rol: ["CAPTURISTA_DOCENTE"],
    ambito: { ur: "090", ebdi: 7, salas: ["Lactantes A", "Lactantes B"] },
    activo: true,
    ultimoAcceso: ISODate("2026-10-05T07:05:00Z"),
    fsistema: ISODate("2022-01-12T08:00:00Z"),
    deleted_at: null
  },
  {
    id: 24,
    numeroEmpleado: "600012",
    usuario: "capt.ebdi012",
    passwordHash: PASSWORD_DUMMY,
    nombre: "Daniela",
    paterno: "Acosta",
    materno: "Reyna",
    correo: "daniela.acosta@ejemplo.gob.mx",
    telefono: "7226789012",
    rol: ["CAPTURISTA_DOCENTE"],
    ambito: { ur: "150", ebdi: 12, salas: ["Maternal A"] },
    activo: true,
    ultimoAcceso: ISODate("2026-10-05T07:10:00Z"),
    fsistema: ISODate("2022-01-12T08:30:00Z"),
    deleted_at: null
  },
  {
    id: 25,
    numeroEmpleado: "600033",
    usuario: "capt.ebdi033",
    passwordHash: PASSWORD_DUMMY,
    nombre: "Mariana",
    paterno: "Escobar",
    materno: "Luna",
    correo: "mariana.escobar@ejemplo.gob.mx",
    telefono: "7226789033",
    rol: ["CAPTURISTA_DOCENTE"],
    ambito: { ur: "150", ebdi: 33, salas: ["Lactantes A", "Maternal B"] },
    activo: true,
    ultimoAcceso: ISODate("2026-10-05T07:02:00Z"),
    fsistema: ISODate("2023-08-01T08:00:00Z"),
    deleted_at: null
  },
  {
    id: 26,
    numeroEmpleado: "600064",
    usuario: "capt.ebdi064",
    passwordHash: PASSWORD_DUMMY,
    nombre: "Fabiola",
    paterno: "Galindo",
    materno: "Cortés",
    correo: "fabiola.galindo@ejemplo.gob.mx",
    telefono: "3326789064",
    rol: ["CAPTURISTA_DOCENTE"],
    ambito: { ur: "140", ebdi: 64, salas: ["Preescolar 1", "Preescolar 2"] },
    activo: true,
    ultimoAcceso: ISODate("2026-10-03T07:20:00Z"),
    fsistema: ISODate("2022-05-20T08:00:00Z"),
    deleted_at: null
  },
  {
    id: 27,
    // Usuario inactivo: licencia temporal
    numeroEmpleado: "600009",
    usuario: "capt.ebdi009",
    passwordHash: PASSWORD_DUMMY,
    nombre: "Yolanda",
    paterno: "Saucedo",
    materno: "Martínez",
    correo: "yolanda.saucedo@ejemplo.gob.mx",
    telefono: "8126789009",
    rol: ["CAPTURISTA_DOCENTE"],
    ambito: { ur: "190", ebdi: 9, salas: ["Maternal A"] },
    activo: false,
    ultimoAcceso: ISODate("2026-06-12T07:15:00Z"),
    fsistema: ISODate("2022-08-08T08:00:00Z"),
    deleted_at: null
  },
  {
    id: 28,
    // Usuario con borrado logico (baja de la institucion)
    numeroEmpleado: "600015",
    usuario: "capt.ebdi015",
    passwordHash: PASSWORD_DUMMY,
    nombre: "Irene",
    paterno: "Pacheco",
    materno: "Salgado",
    correo: "irene.pacheco@ejemplo.gob.mx",
    telefono: "2226789015",
    rol: ["CAPTURISTA_DOCENTE"],
    ambito: { ur: "210", ebdi: 15, salas: ["Lactantes B"] },
    activo: false,
    ultimoAcceso: ISODate("2025-12-18T07:40:00Z"),
    fsistema: ISODate("2022-01-14T08:00:00Z"),
    deleted_at: ISODate("2026-01-08T10:00:00Z")
  }
];

db.usuarios.insertMany(usuarios);


