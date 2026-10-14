import mongoose from "mongoose";

const { Schema } = mongoose;

const asistenciaSchema = new Schema({
  estancia: { type: Number},                          // ebdi donde se registro
  infante: { type: Schema.Types.ObjectId, ref: "Infante", required: true },
  grupo: { type: Schema.Types.ObjectId, ref: "Grupo", required: true }, // Grupo del pase de lista
  fecha: { type: Date,},                               // Dia del registro
  turno: { type: String },              // "MATUTINO"
  estatus: {
    type: String,
    enum: ["PRESENTE",
           "AUSENTE_JUSTIFICADO",
           "FALTA_INJUSTIFICADA",
           "COMISION_MEDICA",
           "FILTRO_SANITARIO"]
  },
  horaIngreso: { type: Date, default: null },
  horaEgreso: { type: Date, default: null },
  tutorIngreso: { type: Schema.Types.ObjectId, ref: "Tutor", default: null }, // Tutor que entrego al infante
  tutorEgreso: { type: Schema.Types.ObjectId, ref: "Tutor", default: null },  // Tutor que recogio al infante
  metodo: { type: String, enum: ["MANUAL", "QR"] },
  offline: { type: Boolean },                          // true si se capturo sin conexion
  clientUuid: { type: String }, // Id generado en el dispositivo para evitar duplicados
  capturadoEn: { type: Date},                         // Momento real de captura
  sincronizadoEn: { type: Date },                       // Cuando llego al servidor
  ticket: { type: Schema.Types.ObjectId, ref: "Ticket", default: null }, // Ticket generado por la falta
  registradoPor: { type: String},      // usuario que capturo
  deleted_at: { type: Date, default: null }                            // Borrado logico
});

asistenciaSchema.index({ clientUuid: 1 }, { unique: true });
asistenciaSchema.index({ estancia: 1, infante: 1, fecha: 1, turno: 1 });
asistenciaSchema.index({ grupo: 1, fecha: 1 });

export default mongoose.model("Asistencia", asistenciaSchema, "asistencias");
