import mongoose from "mongoose";

const { Schema } = mongoose;

const consentimientoSchema = new Schema({
  tutor: { type: Schema.Types.ObjectId, ref: "Tutor"}, // Tutor que acepto el aviso de privacidad
  infante: { type: Schema.Types.ObjectId, ref: "Infante"},
  versionAviso: { type: String },       // Version del aviso aceptado
  aceptado: { type: Boolean},                         // Sin esto en true no se activa el seguimiento
  fechaAceptacion: { type: Date },
  registradoPor: { type: String },      // usuario de la directora que lo registro
  deleted_at: { type: Date, default: null }                            // Borrado logico
});

consentimientoSchema.index({ tutor: 1, infante: 1, versionAviso: 1 }, { unique: true });
consentimientoSchema.index({ infante: 1 });

export default mongoose.model("Consentimiento", consentimientoSchema, "consentimientos");
