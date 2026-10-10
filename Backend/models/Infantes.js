import mongoose from "mongoose";

const { Schema } = mongoose;

// Tutores autorizados del infante
const tutorAutorizadoSchema = new Schema({
  tutor: { type: Schema.Types.ObjectId, ref: "Tutor" },
  parentesco: { type: String},
  autorizadoEgreso: { type: Boolean }
}, { _id: false }); // false porque porque es un objeto adentro no una coleccion aparte

// Contactos a notificar si no se localiza al tutor
const contactoEmergenciaSchema = new Schema({
  nombre: { type: String},
  telefono: { type: String },
  parentesco: { type: String },
  prioridad: { type: Number }
}, { _id: false }); // false porque porque es un objeto adentro no una coleccion aparte

const infanteSchema = new Schema({
  id_benef_infante: { type: Number },
  matricula: { type: String},
  ur: { type: String },
  ebdi: { type: Number },
  nombre: { type: String },
  paterno: { type: String },
  materno: { type: String },
  genero: { type: String, enum: ["H", "M"] },
  curp: { type: String },
  fnac: { type: Date },                                // Fecha de nacimiento
  freg: { type: Date },                                // Fecha de registro
  estatus_servicio: { type: Number },
  estrato: { type: String },
  movimiento: {
    tipo: { type: String },
    fecha: { type: Date },
    siguiente: { type: String },
    previo: { type: String }
  },
  activo: { type: Boolean, default: true },
  puede_editar: { type: Boolean, default: false },
  cambioEstrato: {
    idAnt: { type: Number },
    idPos: { type: Number },
    anterior: { type: String },
    posterior: { type: String },
    fechaInicio: { type: Date },
    fechaFin: { type: Date }
  },
  cambioEbdi: {
    anterior: { type: String },
    posterior: { type: String },
    fechaInicio: { type: Date },
    fechaFin: { type: Date }
  },
  baja: {
    activa: { type: Boolean, default: false },
    fecha: { type: Date },
    motivo: { type: Number }
  },
  fCambio: { type: Date },
  discapacidad: {
    tiene: { type: Boolean, default: false },
    grupo: { type: String }
  },
  diferencias: {                                                       // dif_cvrp, dif_cvfn, dif_pat, dif_mat
    curp: { type: Boolean },
    fnac: { type: Boolean },
    paterno: { type: Boolean },
    materno: { type: Boolean }
  },
  inscripcionInicial: { type: String },
  comentario: { type: String },
  usuario: { type: String },
  RegPesoTalla: {                                                      // [pesoGramos, tallaCm] p. ej. [16250, 102]
    type: [{ type: Number, min: 0 }],
    default: null,
    validate: {
      validator: (v) => v === null || v.length === 2,
      message: "RegPesoTalla debe ser [pesoGramos, tallaCm]"
    }
  },
  fsistema: { type: Date },
  inscripcion: {                                                       // ["agosto2026", "septiembre2026", etc]
    type: [{ type: String }],
    validate: {
      validator: (v) => new Set(v).size === v.length,
      message: "inscripcion no puede tener meses repetidos"
    }
  },
  bloqueoIngreso: { type: Boolean, default: false },                   // Candado cuando el infante requiere alta medica
  tutores: [tutorAutorizadoSchema],
  contactosEmergencia: [contactoEmergenciaSchema]
});

infanteSchema.index({ matricula: 1 }, { unique: true });
infanteSchema.index({ curp: 1 }, { unique: true });
infanteSchema.index({ ebdi: 1, activo: 1 });
infanteSchema.index({ inscripcion: 1 });
infanteSchema.index({ "tutores.tutor": 1 });

export default mongoose.model("Infante", infanteSchema, "infantes");
