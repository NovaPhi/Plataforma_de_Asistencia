import mongoose from "mongoose";

const { Schema } = mongoose;

const salaSchema = new Schema({
  nombre: { type: String, required: true, maxLength: 50 },
  capacidad: { type: Number, required: true, min: 1 }
}, { _id: false }); // false porque porque es un objeto adentro no una coleccion aparte

const estanciaSchema = new Schema({
  ebdi: { type: Number},                              // Clave unica de la estancia (la misma que usan infantes y usuarios)
  nombre: { type: String },
  ur: { type: String },                  // Region a la que pertenece
  domicilio: { type: String },
  telefono: { type: String },
  salas: [salaSchema],                                                 // [{ nombre: "Lactantes A", capacidad: 25 }]
  activo: { type: Boolean},                           // Si la estancia opera
  deleted_at: { type: Date }                            // Borrado logico
});

estanciaSchema.index({ ebdi: 1 }, { unique: true });
estanciaSchema.index({ ur: 1 });

export default mongoose.model("Estancia", estanciaSchema, "estancias");
