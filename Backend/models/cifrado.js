// Cifrado de campos con mongoose-field-encryption (AES-256-CBC)
// Cifra en save, insertMany, updateOne y findOneAndUpdate, y descifra al leer
import { fieldEncryption } from "mongoose-field-encryption";

// Se lee al usarse y no al importar, porque index.js llama dotenv.config() despues de importar los modelos
function secreto() {
	if (!process.env.ENC_SECRET) throw new Error("Falta ENC_SECRET en el .env");
	return process.env.ENC_SECRET;
}

// Quita las marcas que agrega la libreria (__enc_campo y __enc_campo_d)
function quitarMarcas(obj, campos) {
	for (const campo of campos) {
		delete obj["__enc_" + campo];
		delete obj["__enc_" + campo + "_d"];
	}
}

export default function cifrarCampos(schema, campos) {
	schema.plugin(fieldEncryption, { fields: campos, secret: secreto });

	// Lista de campos cifrados, la usan la bitacora y el script de migracion
	schema.statics.camposCifrados = campos;

	// .lean() no pasa por los hooks de documento: aqui se descifran los objetos planos
	schema.post(["find", "findOne"], function (res) {
		if (!this._mongooseOptions.lean || !res) return;
		const descifrar = obj => {
			this.model.prototype.decryptFieldsSync.call(obj);
			quitarMarcas(obj, campos);
		};
		Array.isArray(res) ? res.forEach(descifrar) : descifrar(res);
	});
}
