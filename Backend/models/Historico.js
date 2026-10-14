import mongoose from "mongoose";

const { Schema } = mongoose;

const historicoSchema = new Schema({
  ticketIdOriginal: { type: Schema.Types.ObjectId },   // Ticket de origen (ya no existe en tickets)
  ticket: { type: Schema.Types.Mixed},                // Copia integra del ticket al archivarse
  asesorias: [{ type: Schema.Types.Mixed }],                           // Copia de las asesorias del ticket
  notasConfidenciales: [{ type: Schema.Types.Mixed }],                 // Copia de las notas (siguen cifradas)
  infanteId: { type: Schema.Types.ObjectId, ref: "Infante" }, // Para armar el expediente
  estanciaId: { type: Number },                        // ebdi, para indexar por estancia
  cicloEscolar: { type: String },        // Ciclo en que estuvo activa la incidencia
  fechaCierre: { type: Date },                         // Cierre del caso
  archivadoEn: { type: Date },                         // Cuando paso de activa a archivo
  fechaDepuracion: { type: Date}                      // archivadoEn + 5 anos; al llegar se borra (indice TTL)
});

historicoSchema.index({ ticketIdOriginal: 1 }, { unique: true });
historicoSchema.index({ infanteId: 1 });
historicoSchema.index({ estanciaId: 1 });
// TTL: Mongo borra el documento cuando llega fechaDepuracion
historicoSchema.index({ fechaDepuracion: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Historico", historicoSchema, "historico");
