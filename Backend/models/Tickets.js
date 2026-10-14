import mongoose from "mongoose";

const { Schema } = mongoose;

const justificacionSchema = new Schema({
  tipo: { type: String, maxLength: 30 },
  motivo: { type: String, maxLength: 200 },
  justificada: { type: Boolean }
}, { _id: false });

const intentoContactoSchema = new Schema({
  numero: { type: Number, min: 1 },
  fechaHora: { type: Date },
  exitoso: { type: Boolean },
  resumen: { type: String, maxLength: 500 },
  registradoPor: { type: String, maxLength: 50 }
}, { _id: false });

const contactoNotificadoSchema = new Schema({
  nombre: { type: String, maxLength: 150 },
  fechaHora: { type: Date },
  medio: { type: String, maxLength: 20 },
  resultado: { type: String, maxLength: 200 }
}, { _id: false });

const ticketSchema = new Schema({
  asistencia: { type: Schema.Types.ObjectId, ref: "Asistencia" }, // Asistencia que origino el ticket
  infante: { type: Schema.Types.ObjectId, ref: "Infante" },
  estancia: { type: Number },                          // ebdi
  estado: { type: String, enum: ["ABIERTO", "EN_PROCESO", "ESCALADO", "CERRADO"] },
  semaforo: { type: String, enum: ["VERDE", "AMARILLO", "ROJO"] },
  causa: { type: String, enum: ["ENF_CASA", "ACC_EXT", "PER_TUT", "NO_LOC", null], default: null },
  justificacion: { type: justificacionSchema, default: null },
  intentosContacto: [intentoContactoSchema],
  alertaAmarilla: {
    activa: { type: Boolean },
    desde: { type: Date, default: null },
    limiteSegundoIntento: { type: Date, default: null },
    segundoIntentoHecho: { type: Boolean }
  },
  escalado: { type: Date, default: null },                             // Cuando escalo por no hacer el segundo intento
  asesoria: { type: Schema.Types.ObjectId, ref: "Asesoria", default: null },
  bloqueoIngreso: { type: Boolean },                   // Candado de requiere alta medica
  contactosNotificados: [contactoNotificadoSchema],
  fechaApertura: { type: Date },
  fechaCierre: { type: Date, default: null },
  cerradoPor: { type: String, default: null },                         // usuario que cerro el caso
  deleted_at: { type: Date, default: null }                            // Borrado logico
});

ticketSchema.index({ asistencia: 1 }, { unique: true });
ticketSchema.index({ estancia: 1, estado: 1 });
ticketSchema.index({ infante: 1 });

export default mongoose.model("Ticket", ticketSchema, "tickets");
