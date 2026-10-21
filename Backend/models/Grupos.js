import mongoose from "mongoose";

const { Schema } = mongoose;

const grupoSchema = new Schema({
  estancia: { type: Number },                          // ebdi de la estancia
  sala: { type: String},               // Nombre de la sala (estancias.salas.nombre)
  nombre: { type: String },
  cicloEscolar: { type: String},        // "2026-2027"
  educador: { type: String},           // usuario del docente que pasa lista (usuarios.usuario)
  infantes: {                                                          // Infantes inscritos en el grupo
    type: [{ type: Schema.Types.ObjectId, ref: "Infante" }],
    default: [],
    validate: {
      validator: (v) => new Set(v.map(String)).size === v.length,
      message: "infantes no puede tener elementos repetidos"
    }
  },
  activo: { type: Boolean },                           // Vigencia del grupo
  deleted_at: { type: Date, default: null }                            // Borrado logico
});

grupoSchema.index({ estancia: 1, cicloEscolar: 1 });  
grupoSchema.index({ educador: 1 });
grupoSchema.index({ infantes: 1 });

export default mongoose.model("Grupo", grupoSchema, "grupos");