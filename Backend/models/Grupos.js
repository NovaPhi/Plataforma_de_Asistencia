import mongoose from "mongoose";

const { Schema } = mongoose;

const grupoSchema = new Schema({
  estancia: { type: Number },                          // ebdi de la estancia
  sala: { type: String},               // Nombre de la sala (estancias.salas.nombre)
  nombre: { type: String },
  cicloEscolar: { type: String},        // "2026-2027"
  educador: { type: String},           // usuario del docente que pasa lista (usuarios.usuario)
  activo: { type: Boolean },                           // Vigencia del grupo
  deleted_at: { type: Date, default: null }                            // Borrado logico
});

grupoSchema.index({ estancia: 1, cicloEscolar: 1 });
grupoSchema.index({ educador: 1 });

export default mongoose.model("Grupo", grupoSchema, "grupos");
