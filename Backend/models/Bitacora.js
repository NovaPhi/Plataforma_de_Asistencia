import mongoose from "mongoose";
import { ROLES } from "./Usuarios.js";

const { Schema } = mongoose;

// La bitacora no tiene borrado logico porque no se edita desde la app
const bitacoraSchema = new Schema({
  usuario: { type: String},            // usuario que hizo la accion
  rol: { type: String },                  // Rol que tenia en ese momento
  ip: { type: String },
  userAgent: { type: String},                         // Navegador o dispositivo
  fechaHora: { type: Date},                           // Momento exacto del cambio
  accion: { type: String},             // "LLAMADA" | "CAMBIO_ESTATUS" | "VER_NOTA" | "CREAR" | "ACTUALIZAR" | "CERRAR_TICKET" | etc
  coleccion: {                                                         // Coleccion afectada
    type: String,
    enum: ["infantes",
           "usuarios",
           "estancias",
           "grupos",
           "tutores",
           "asistencias",
           "tickets",
           "asesorias",
           "notasConfidenciales",
           "consentimientos",
           "historico"]
  },
  registro: { type: Schema.Types.Mixed, default: null },               // _id, ebdi o usuario segun la coleccion
  datosAnteriores: { type: Schema.Types.Mixed, default: null },        // Valores antes del cambio
  datosNuevos: { type: Schema.Types.Mixed, default: null }             // Valores despues del cambio
});

bitacoraSchema.index({ fechaHora: -1 });
bitacoraSchema.index({ coleccion: 1, registro: 1 });
bitacoraSchema.index({ usuario: 1 });

export default mongoose.model("Bitacora", bitacoraSchema, "bitacora");
