import mongoose from "mongoose";

const { Schema } = mongoose;

const tutorSchema = new Schema({
  nombre: { type: String, maxLength: 50 },
  paterno: { type: String, maxLength: 50 },
  materno: { type: String, maxLength: 50 },
  curp: { type: String, minLength: 18, maxLength: 18 },
  telefono: { type: String, maxLength: 10 },           // Contacto para seguimiento
  correo: { type: String, default: null },                             // Contacto alterno
  codigoCredencial: { type: String },                  // Valor del QR
  infantes: {                                                          // Infantes a su cargo
    type: [{ type: Schema.Types.ObjectId, ref: "Infante" }],
    validate: {
      validator: (v) => v.length > 0 && new Set(v.map(String)).size === v.length,
      message: "infantes debe tener al menos un elemento y sin repetir"
    }
  },
  activo: { type: Boolean },                           // Vigencia del tutor
  deleted_at: { type: Date, default: null }                            // Borrado logico
});

tutorSchema.index({ curp: 1 }, { unique: true });
tutorSchema.index({ codigoCredencial: 1 }, { unique: true });
tutorSchema.index({ infantes: 1 });

export default mongoose.model("Tutor", tutorSchema, "tutores");
