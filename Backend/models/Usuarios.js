import mongoose from "mongoose";

const { Schema } = mongoose;

// Opciones de rol. Se exporta porque Bitacora usa la misma lista
export const ROLES = [
  "ADMINISTRADOR_CENTRAL",   // Gestiona usuarios, estancias, salas, infantes y tutores
  "SUPERVISOR_CENTRAL",      // Solo estadisticas agregadas de las 212 estancias
  "SUPERVISOR_REGIONAL",     // Tablero y reportes de su region
  "DIRECTORA_ESTANCIA",      // Responsable de una estancia
  "MEDICO_ESTANCIA",         // Seguimiento medico y alta medica
  "TRABAJO_SOCIAL",          // Trabajo Social / Enfermeria: llamadas y seguimiento de faltas
  "CAPTURISTA_DOCENTE"       // Educadora de sala: pase de lista y escaneo de credenciales
];

const usuarioSchema = new Schema({
  numeroEmpleado: { type: String },
  usuario: { type: String, minLength: 3, maxLength: 50 },
  passwordHash: { type: String },
  nombre: { type: String, maxLength: 50 },
  paterno: { type: String, maxLength: 50 },
  materno: { type: String, maxLength: 50 },
  correo: { type: String },
  telefono: { type: String },
  rol: {
    type: [{ type: String, enum: ROLES }],
    default: undefined,                                                // Igual que antes: si no viene, no se guarda
    validate: {
      validator: (v) => v.length > 0 && new Set(v).size === v.length,
      message: "rol debe tener al menos un elemento y sin repetir"
    }
  },
  ambito: {
    ur: { type: String, maxLength: 3 },                                // Region / Unidad Responsable. Vacio = todas (roles centrales)
    ebdi: { type: Number, default: null },                             // Estancia a la que esta ligada la sesion. null = no aplica
    salas: [{ type: String }]                                          // Solo para CAPTURISTA_DOCENTE: salas que atiende
  },
  activo: { type: Boolean },
  ultimoAcceso: { type: Date, default: null },
  fsistema: { type: Date, default: null },
  deleted_at: { type: Date, default: null }                            // Borrado logico
});

usuarioSchema.index({ usuario: 1 }, { unique: true });
usuarioSchema.index({ rol: 1 });

export default mongoose.model("Usuario", usuarioSchema, "usuarios");
