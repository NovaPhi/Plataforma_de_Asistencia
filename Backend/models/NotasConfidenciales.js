import mongoose from "mongoose";

const { Schema } = mongoose;

const notaConfidencialSchema = new Schema({
  ticket: { type: Schema.Types.ObjectId, ref: "Ticket" },
  infante: { type: Schema.Types.ObjectId, ref: "Infante" },
  tipo: { type: String, enum: ["MEDICA", "FAMILIAR"] },
  diagnostico: { type: String, default: null },                        // Diagnostico o sintomas (cifrado). null en notas familiares
  nota: { type: String },                              // Seguimiento o situacion familiar (cifrado)
  autor: { type: String, maxLength: 50 },              // usuario que la escribio
  fechaRegistro: { type: Date },
  deleted_at: { type: Date, default: null }                            // Borrado logico
});

notaConfidencialSchema.index({ ticket: 1 });
notaConfidencialSchema.index({ infante: 1 });

export default mongoose.model("NotaConfidencial", notaConfidencialSchema, "notasConfidenciales");
