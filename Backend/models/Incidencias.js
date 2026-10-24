import mongoose from "mongoose";

const { Schema } = mongoose;

// Lo que se hizo para atender la incidencia
const accionSchema = new Schema({
  fechaHora: { type: Date },
  texto: { type: String, maxLength: 500 },
  responsable: { type: String }                        // usuario que registro la accion
}, { _id: false }); // false porque porque es un objeto adentro no una coleccion aparte

const incidenciaSchema = new Schema({
  folio: { type: String },                             // "INC-" + final del _id
  infante: { type: Schema.Types.ObjectId, ref: "Infante", required: true },
  grupo: { type: Schema.Types.ObjectId, ref: "Grupo", default: null }, // Grupo (sala) donde estaba el infante al momento de la incidencia
  estancia: { type: Number },                          // ebdi
  tipo: { type: String, enum: ["Accidente", "Enfermedad", "Conducta"], required: true },
  gravedad: { type: String, enum: ["grave", "moderada", "leve"], required: true },
  descripcion: { type: String, maxLength: 1000 },
  estado: { type: String, enum: ["abierta", "en_atencion", "resuelta"], default: "abierta" },
  fechaHora: { type: Date },                           // Momento en que se registro (hora del servidor)
  reporto: { type: String },                           // usuario que la registro (sale del token)
  tutorNotificado: { type: Boolean, default: false },
  acciones: [accionSchema],
  resolucion: {
    fecha: { type: Date, default: null },
    por: { type: String, default: null }               // usuario que la resolvio
  },
  deleted_at: { type: Date, default: null }                            // Borrado logico
});

incidenciaSchema.index({ folio: 1 }, { unique: true });
incidenciaSchema.index({ infante: 1 });
incidenciaSchema.index({ estancia: 1, estado: 1 });

export default mongoose.model("Incidencia", incidenciaSchema, "incidencias");
