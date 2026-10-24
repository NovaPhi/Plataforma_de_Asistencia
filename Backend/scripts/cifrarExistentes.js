// Cifra los documentos que ya estaban en la BD antes de usar mongoose-field-encryption
// Correr desde Backend despues de cada carga de datos con mongosh:
//   node scripts/cifrarExistentes.js
// Hacer respaldo de la BD antes de correrlo

// Revisado con claude, me ayudo a hacer el script y a entender como funciona mongoose-field-encryption. 
import "dotenv/config";
import mongoose from "mongoose";
import Infante from "../models/Infantes.js";
import NotaConfidencial from "../models/NotasConfidenciales.js";

const modelosCifrados = [Infante, NotaConfidencial];

await mongoose.connect(process.env.MONGO_URL);

for (const Modelo of modelosCifrados) {
	// Los documentos sin la marca __enc_ del primer campo todavia estan en claro
	const marca = "__enc_" + Modelo.camposCifrados[0];
	const pendientes = await Modelo.find({ [marca]: { $exists: false } });
	let cifrados = 0;

	for (const doc of pendientes) {
		try {
			await doc.save(); // el hook de save cifra los campos
			cifrados++;
		} catch (error) {
			console.error(`${Modelo.modelName} ${doc._id}: ${error.message}`);
		}
	}
	console.log(`${Modelo.modelName}: ${cifrados} de ${pendientes.length} documentos cifrados`);
}

await mongoose.disconnect();
