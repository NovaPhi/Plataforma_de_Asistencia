import mongoose from "mongoose";

const { Schema } = mongoose;

const asesoriaSchema = new Schema({
  ticket: { type: Schema.Types.ObjectId, ref: "Ticket", required: true },
  infante: { type: Schema.Types.ObjectId, ref: "Infante", required: true },
  asesoria: { type: String },                          // Orientacion brindada (cifrado)
  fechaRetornoEstimada: { type: Date, default: null },
  requiereAltaMedica: { type: Boolean},               // Si es true activa el bloqueo de ingreso
  registradoPor: { type: String},      // usuario de Trabajo Social o Medico
  fechaRegistro: { type: Date, required: true },
  deleted_at: { type: Date, default: null }                            // Borrado logico
});

asesoriaSchema.index({ ticket: 1 });
asesoriaSchema.index({ infante: 1 });

export default mongoose.model("Asesoria", asesoriaSchema, "asesorias");
