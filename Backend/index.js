import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import fs from "fs";
import https from "https";


import Usuario from "./models/Usuarios.js";
import Infante from "./models/Infantes.js";
import Estancia from "./models/Estancias.js";
import Grupo from "./models/Grupos.js";
import Tutor from "./models/Tutores.js";
import Asistencia from "./models/Asistencias.js";
import Ticket from "./models/Tickets.js";
import Asesoria from "./models/Asesorias.js";
import NotaConfidencial from "./models/NotasConfidenciales.js";
import Consentimiento from "./models/Consentimientos.js";
import Bitacora from "./models/Bitacora.js";
import Historico from "./models/Historico.js";
import Incidencia from "./models/Incidencias.js";



// React Admin necesita un campo "id" en cada registro: se manda el _id como id
mongoose.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => { delete ret._id; }
});

const app = express();
dotenv.config();
app.use(cors());
app.use(bodyParser.json());
const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL ;

const options={
	key: fs.readFileSync("backend.key"),
	cert: fs.readFileSync("backend.crt")
};



// Pone en falta las asistencias de dias anteriores que se quedaron sin marcar
//async lo que hace es que la funcion devuelve una promesa y se puede usar await 
// para esperar a que termine
async function cerrarDia(){
	const hoy = new Date(new Date().toLocaleDateString("sv-SE"));
	const r = await Asistencia.updateMany(
		{ estatus: null, fecha: { $lt: hoy }, deleted_at: null },
		{ $set: { estatus: "FALTA_INJUSTIFICADA", sincronizadoEn: new Date() } }
	);
	console.log("Cierre del dia, asistencias puestas en falta:", r.modifiedCount);
}

// Programa cerrarDia para la siguiente medianoche del servidor y se vuelve a programar
function programarCierre(){
	const ahora = new Date();
	const medianoche = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 1);
	setTimeout(async () => {
		try {
			await cerrarDia();
		} catch (error) {
			console.error("Error en el cierre del dia:", error);
		}
		programarCierre();
	}, medianoche - ahora);
}

mongoose.connect(MONGO_URL).then(() => {
  console.log("Conectado a la base de datos");
  // por si el servidor estuvo apagado a medianoche
  cerrarDia().catch(error => console.error("Error en el cierre del dia:", error));
  programarCierre();
  https.createServer(options,app).listen(PORT, async ()=>{
	console.log(`Backend corriendo en puerto ${PORT}`);
});
  
}).catch((error) => {
  console.error("Error al conectar a la base de datos:", error);
});

// Modelos de Mongoose
// Relaciona el nombre de cada colección con su modelo
const modelos = {
	usuarios: Usuario,
	infantes: Infante,
	estancias: Estancia,
	grupos: Grupo,
	tutores: Tutor,
	asistencias: Asistencia,
	tickets: Ticket,
	asesorias: Asesoria,
	notasConfidenciales: NotaConfidencial,
	consentimientos: Consentimiento,
	bitacora: Bitacora,
	historico: Historico,
	incidencias: Incidencia
};

// Campos de infantes que puede ver cada rol en getList. null = todos los campos
const camposInfantes = {
	ADMINISTRADOR_CENTRAL: null,
	DIRECTORA_ESTANCIA: null,
	MEDICO_ESTANCIA: null,
	TRABAJO_SOCIAL: null,
	CAPTURISTA_DOCENTE: ["matricula", "ur", "ebdi", "nombre", "paterno", "materno", "genero", "fnac", "activo", "bloqueoIngreso", "inscripcion", "tutores"],
	SUPERVISOR_CENTRAL: ["ur", "ebdi", "genero", "estrato", "activo", "estatus_servicio"],
	SUPERVISOR_REGIONAL: ["ur", "ebdi", "genero", "estrato", "activo", "estatus_servicio"]
};

// Roles que pueden crear, editar y eliminar infantes
const rolesModificanInfantes = ["ADMINISTRADOR_CENTRAL", "DIRECTORA_ESTANCIA"];

const rolesVenBitacora = ["ADMINISTRADOR_CENTRAL"];

// Roles que pueden usar cada pantalla (los mismos de App.tsx)
const rolesPaseLista = ["CAPTURISTA_DOCENTE"]; // Pase de lista y Escanear credencial
const rolesVenSeguimiento = ["TRABAJO_SOCIAL", "MEDICO_ESTANCIA"];
const rolesVenIncidencias = ["TRABAJO_SOCIAL", "MEDICO_ESTANCIA"];
const rolesVenBaseDatos = ["ADMINISTRADOR_CENTRAL"]; // Vistas de Base de Datos

// Roles que pueden ver la pantalla de estadisticas (los mismos de ROLES_ESTADISTICAS en Estadisticas.tsx)
const rolesVenEstadisticas = ["ADMINISTRADOR_CENTRAL", "SUPERVISOR_CENTRAL", "SUPERVISOR_REGIONAL"];

// Traduce el codigo de causa del ticket al texto que usa el frontend de seguimiento
const etiquetasCausa = {
	ENF_CASA: "Enfermedad en casa",
	ACC_EXT: "Accidente fuera del plantel",
	PER_TUT: "Permiso particular o tramite",
	NO_LOC: "Sin respuesta del tutor"
};

// Opciones de como termino una llamada al tutor (las mismas del enum en Tickets.js)
const resultadosLlamada = ["Contestó", "No contestó", "Número equivocado"];

// Opciones de tipo y gravedad de una incidencia (las mismas del enum en Incidencias.js)
const tiposIncidencia = ["Accidente", "Enfermedad", "Conducta"];
const gravedadesIncidencia = ["grave", "moderada", "leve"];

// Opciones del menu "Registrar accion" de una incidencia (las mismas de TIPOS_ACCION en Datos_Historicos.tsx)
const tiposAccionIncidencia = ["Primeros auxilios", "Llamada al tutor", "Traslado a servicio médico", "Observación", "Otra"];

// Traduce el estado del ticket al estado (pestaña) del frontend de seguimiento
const estadosSeguimiento = {
	ABIERTO: "abierto",
	EN_PROCESO: "seguimiento",
	ESCALADO: "seguimiento",
	CERRADO: "cerrado"
};

// Busca al usuario que inicio sesion con el token del header "Authentication"
async function dataUsuarios(req){
	let token=req.get("Authentication");
	let verifiedToken=await jwt.verify(token, process.env.JWTSECRET);
	let data=await Usuario.findOne({"usuario":verifiedToken.usuario}).exec();
	if(data==null || data.rol==null){
		throw new Error("Usuario no encontrado o sin rol");
	}
	return data;
}

// true si alguno de los roles del usuario puede crear, editar y eliminar
function puedeModificar(usuario){
	return usuario.rol.some(r=>rolesModificanInfantes.includes(r));
}

// Junta los campos que pueden ver los roles del usuario. null = todos los campos
function camposVisibles(usuario){
	let campos=[];
	for(let r of usuario.rol){
		if(camposInfantes[r]===null){
			return null;
		}
		campos=campos.concat(camposInfantes[r]??[]);
	}
	return campos;
}

// Devuelve la lista de registros de una coleccion, con paginacion y ordenamiento
async function getList(collection, campos, req, res){
	let sortBy=req.query._sort;
	let sortOrder=req.query._order=="ASC"?1:-1;
	let inicio=Number(req.query._start);
	let fin=Number(req.query._end);
	let sorter={}
	sorter[sortBy]=sortOrder;
	// Query de mongoose
	let query=modelos[collection].find({}).sort("id");
	if(campos!==null){
		query=query.select(campos.join(" "));
	}
	let data=await query.exec();
	res.set("Access-Control-Expose-Headers", "X-Total-Count");
	res.set("X-Total-Count", data.length);
	data=await data.slice(inicio, fin);
	res.json(data);
}

// Devuelve los registros de una coleccion que coinciden con los ids del query
async function getMany(collection, req, res){
	let data=[]
	for(let index=0;index<req.query.id.length; index++){
		let dataParcial=await modelos[collection].find({id:Number(req.query.id[index])}).toArray();
		data=await data.concat(dataParcial);
	}
	res.json(data);
}

// Devuelve los registros de una coleccion que coinciden con los filtros del query
async function getManyReference(collection, req, res){
	let data=await modelos[collection].find(req.query).toArray();
	res.set("Access-Control-Expose-Headers", "X-Total-Count");
	res.set("X-Total-Count", data.length);
	res.json(data);
}

// Devuelve un registro de una coleccion por su id
async function getOne(collection, id, req,res){
	let data=await modelos[collection].findOne({"_id":id}).exec();
	res.json(data);
}

async function getAll(collection, req, res){
	let query=modelos[collection].find({});
	let data=await query.exec();
	res.json(data);
}

// Actualiza un registro de una coleccion por su id
// Regresa el registro como estaba antes del cambio para la bitacora
async function updateData(collection, req, res){
	let valores=req.body;
	valores["id"]=valores["id"];
	let antes=await modelos[collection].findOne({"_id":req.params.id}).lean();
	let r = await modelos[collection].updateOne({ _id: req.params.id }, { $set: valores });
	r =await modelos[collection].findOne({"_id":valores["id"]}).exec();
	res.json(r);
	return antes;
}

// Borra un registro de una coleccion por su id
async function deleteData(collection, id, req, res){
	let data=await modelos[collection].deleteOne({"_id":id});
	res.json(data);
}

// Crea un registro de una coleccion
async function createData(collection, req, res) {
	if (!modelos[collection]) {
		res.status(404).json({ error: "Colección no válida" });
		return null;
	}

	// Copia del body sin los campos que nunca deben venir del cliente
	
	

	// Los usuarios necesitan contraseña: se guarda el hash, nunca el texto
	if (collection === "usuarios") {
		delete req.body.rol;
		req.body.activo = true;
		req.body.rol = ["CAPTURISTA_DOCENTE"]; // rol por defecto para nuevos usuarios
		if (!req.body.password) {
			res.status(400).json({ error: "La contraseña es obligatoria" });
			return null;
		}
		req.body.passwordHash = await argon2.hash(req.body.password, {
			type: argon2.argon2id,
			memoryCost: 64 * 1024,
			timeCost: 3,
			parallelism: 1
		});
		delete req.body.password; // nunca se guarda el texto plano
	}

	if (typeof req.body.rol === "string") req.body.rol = [req.body.rol];
	
	console.log("Creando registro en colección:", collection, "con datos:", req.body);
	const nuevo = await modelos[collection].create(req.body);
	res.sendStatus(201);
	return nuevo;
}



app.get("/Pase_de_Lista/infantes", async (req, res) => {
	let usuario;
	try {
		usuario = await dataUsuarios(req);
	} catch {
		return res.sendStatus(401);
	}
	if (!usuario.rol.some(r => rolesPaseLista.includes(r))) {
		// se guarda el intento en la bitacora con la ruta que quiso abrir
		req.body = { ...req.body, ruta: req.originalUrl, metodo: req.method };
		await log(usuario.usuario, "ACCESO_DENEGADO", null, req, null, "asistencias");
		return res.sendStatus(403);
	}
    const data = await Infante.find({ activo: { $ne: false } }).lean();
    res.json(data);
});

app.patch("/Pase_de_Lista/base_de_datos/:coleccion/:id", async (req, res) => {
	try {	
		let usuario = await dataUsuarios(req);
		if (!puedeModificar(usuario)) {
			// se guarda el intento en la bitacora con los campos que quiso cambiar
			req.body = { ...req.body, ruta: req.originalUrl, metodo: req.method };
			await log(usuario.usuario, "ACCESO_DENEGADO", null, req, null);
			return res.sendStatus(403);
		}
		let antes = await updateData(req.params.coleccion, req, res);
		// VistaBD hace el borrado logico mandando activo:false
		// accion es ELIMINAR o ACTUALIZAR segun el valor de activo
		let accion = req.body.activo === false ? "ELIMINAR" : "ACTUALIZAR";
		await log(usuario.usuario, accion, antes, req, req.params.id);
	} catch (error) {
		console.error("ERROR EN PATCH:", error.message);
		res.sendStatus(401);
	}
});
app.post("/Pase_de_Lista/base_de_datos/:coleccion", async (req, res) => {
	try {
		let usuario = await dataUsuarios(req);
		if (!puedeModificar(usuario)) {
			// se guarda el intento en la bitacora con los campos que quiso crear
			req.body = { ...req.body, ruta: req.originalUrl, metodo: req.method };
			await log(usuario.usuario, "ACCESO_DENEGADO", null, req, null);
			return res.sendStatus(403);
		}
		try {
			const nuevo = await createData(req.params.coleccion, req, res);
			console.log("Nuevo registro creado:", nuevo);
			if (nuevo) {
				await log(usuario.usuario, "CREAR", null, req, nuevo._id);
			}
		}
		catch (error) {
			console.error("Error al crear registro:", error);
			res.status(500).json({ error: "Error al crear el registro" });
		}
	
	} catch (error) {
		console.error("ERROR EN POST:", error.message);
		res.sendStatus(401);
	}
});

app.get("/infantes", async (req, res) => {
	let usuario;
	try {
		usuario = await dataUsuarios(req);
	} catch {
		return res.sendStatus(401);
	}
	if (!usuario.rol.some(r => rolesPaseLista.includes(r))) {
		// se guarda el intento en la bitacora con la ruta que quiso abrir
		req.body = { ...req.body, ruta: req.originalUrl, metodo: req.method };
		await log(usuario.usuario, "ACCESO_DENEGADO", null, req, null, "asistencias");
		return res.sendStatus(403);
	}
	try {
		const grupos = await Grupo.find({ educador: usuario.usuario }).lean();
		const infanteIds = grupos.flatMap(grupo => grupo.infantes);

		const infantes = await Infante.find({
			_id: { $in: infanteIds },
			activo: { $ne: false }
		}).lean();

		const grupoPorInfante = new Map();
		for (const g of grupos) {
			for (const i of g.infantes ?? []) {
				grupoPorInfante.set(String(i), g._id);
			}
		}

		// se crea la asistencia de hoy de cada niño como pendiente (estatus null) si no existe
		// a medianoche cerrarDia pone en falta las que sigan pendientes
		const fechaHoy = new Date().toLocaleDateString("sv-SE");
		const hoy = new Date(fechaHoy);
		const turno = "MATUTINO";
		const ahora = new Date();
		if (infantes.length) {
			await Asistencia.bulkWrite(infantes.map(i => ({
				updateOne: {
					filter: { infante: i._id, fecha: hoy, turno, deleted_at: null },
					update: { $setOnInsert: {
						grupo: grupoPorInfante.get(String(i._id)),
						estatus: null,
						capturadoEn: ahora,
						clientUuid: `${i._id}-${fechaHoy}-${turno}`
					} },
					upsert: true
				}
			})));
		}

		// solo las asistencias de hoy
		const asistencias = await Asistencia.find({
			infante: { $in: infantes.map(i => i._id) },
			fecha: hoy,
			turno,
			deleted_at: null
		}).lean();
		const asistenciaPorInfante = new Map(asistencias.map(a => [String(a.infante), a]));

		const resultado = infantes.map(infante => {
			const a = asistenciaPorInfante.get(String(infante._id));
			return {
				_id: String(infante._id),
				nombre: infante.nombre,
				paterno: infante.paterno,
				materno: infante.materno,
				matricula: infante.matricula,
				horaIngreso: a?.horaIngreso ?? null,
				estatus: a?.estatus ?? null
			};
		});
		res.json(resultado);
	} catch (error) {
		console.error("Error en infantes:", error);
		res.status(500).json({ error: "Error al obtener los infantes" });
	}
});

app.get("/PASE_DE_LISTA/base_de_datos", async (req, res) => {
	let usuario;
	try {
		usuario = await dataUsuarios(req);
	} catch {
		return res.sendStatus(401);
	}
	if (!usuario.rol.some(r => rolesVenBaseDatos.includes(r))) {
		// se guarda el intento en la bitacora con la ruta que quiso abrir
		req.body = { ...req.body, ruta: req.originalUrl, metodo: req.method };
		await log(usuario.usuario, "ACCESO_DENEGADO", null, req, null);
		return res.sendStatus(403);
	}
	try {

		const resultado = {};
		//map no espera a que termine cada iteracion, por eso se usa Promise.all para esperar a que todas terminen
		// Promise.all espera a que todas terminen y devuelve un array con los resultados
		await Promise.all(
			Object.entries(modelos).map(async ([nombre, modelo]) => {
				// $ne: false excluye solo los borrados lógicos (activo: false)
				// y no descarta las colecciones/registros que no tienen el campo "activo"
				let query = modelo.find({ activo: { $ne: false } });

				

				// lean() devuelve objetos planos: se queda el _id (sin pasar por el toJSON que lo borra)
				// y los ObjectId, incluido el educador de grupos, viajan como string al serializar
				resultado[nombre] = await query.lean();
			})
		);

		// Cada colección siempre existe en la respuesta; si está vacía queda []
		res.json(resultado);
	} catch (error) {
	
		console.error("Error en base_de_datos:", error);
		res.status(500).json({ error: "Error al obtener la base de datos" });
	}
});


app.post("/Pase_de_Lista/escaneo", async (req, res) => {
	let usuario;
	try {
		usuario = await dataUsuarios(req);
	} catch {
		return res.sendStatus(401);
	}
	if (!usuario.rol.some(r => rolesPaseLista.includes(r))) {
		// se guarda el intento en la bitacora con lo que quiso registrar
		req.body = { ...req.body, ruta: req.originalUrl, metodo: req.method };
		await log(usuario.usuario, "ACCESO_DENEGADO", null, req, null, "asistencias");
		return res.sendStatus(403);
	}
  try {
    const { matricula, grupo, tipo, metodo, fecha, turno, capturadoEN, clientUuid } = req.body;

	if (!matricula || !grupo || !tipo || !clientUuid) {
	return res.status(400).json({ error: "Faltan campos obligatorios" });
	}

	const inf = await Infante.findOne({ matricula });
	if (!inf) return res.status(404).json({ error: "Infante no encontrado" });
	if(inf.activo === false) return res.status(400).json({ error: "Infante inactivo" });
	// se actualiza la asistencia del dia (la que crea GET /infantes) en vez de crear otra
	const filtro = { infante: inf._id, fecha: new Date(fecha), turno, deleted_at: null };
	const existente = await Asistencia.findOne(filtro);
	// si ya llego se conserva la primera hora de ingreso
	if (existente?.horaIngreso) return res.status(200).json(existente);

	const nueva = await Asistencia.findOneAndUpdate(
		filtro,
		{
			$set: { estatus: "PRESENTE", horaIngreso: capturadoEN, metodo, grupo, sincronizadoEn: new Date() },
			$setOnInsert: { clientUuid, capturadoEn: new Date() }
		},
		{ upsert: true, new: true, runValidators: true }
	);

    res.status(201).json(nueva);
  	} catch (error) {
		if (error.code === 11000) {
		const existente = await Asistencia.findOne({ clientUuid: req.body.clientUuid });
		return res.status(200).json(existente);
		}
		console.error("Error al registrar asistencia:", error);
		if (error.name === "ValidationError") {
		return res.status(400).json({ error: error.message });
		}
		res.status(500).json({ error: error.message });
	}
});

// Guarda el pase de lista: body { grupo, fecha: "YYYY-MM-DD", turno, asistencia: [{ infante, estatus }] }
// Si el infante ya tiene asistencia ese dia y turno se actualiza el estatus, si no se crea
app.patch("/asistencia", async (req, res) => {
	let usuario;
	try {
		usuario = await dataUsuarios(req);
	} catch {
		return res.sendStatus(401);
	}
	if (!usuario.rol.some(r => rolesPaseLista.includes(r))) {
		// se guarda el intento en la bitacora con lo que quiso registrar
		req.body = { ...req.body, ruta: req.originalUrl, metodo: req.method };
		await log(usuario.usuario, "ACCESO_DENEGADO", null, req, null, "asistencias");
		return res.sendStatus(403);
	}
	try {
		const { fecha, turno, asistencia } = req.body;
		if (!fecha || !turno || !Array.isArray(asistencia)) {
			return res.status(400).json({ error: "Faltan campos obligatorios" });
		}

		// el grupo se saca de los grupos del educador porque el front todavia no lo tiene
		const grupos = await Grupo.find({ educador: usuario.usuario }).lean();
		const grupoPorInfante = new Map();
		for (const g of grupos) {
			for (const i of g.infantes ?? []) {
				grupoPorInfante.set(String(i), g._id);
			}
		}

		const ahora = new Date();
		const guardadas = [];
		for (const a of asistencia) {
			const grupo = grupoPorInfante.get(String(a.infante));
			if (!grupo) {
				return res.status(400).json({ error: `El infante ${a.infante} no está en un grupo del usuario` });
			}
			// clientUuid es unico en el schema: se arma con infante, fecha y turno para no duplicar
			const r = await Asistencia.findOneAndUpdate(
				{ infante: a.infante, fecha: new Date(fecha), turno, deleted_at: null },
				{
					$set: { estatus: a.estatus, grupo, sincronizadoEn: ahora, registradoPor: usuario.usuario },
					$setOnInsert: { metodo: "MANUAL", offline: false, capturadoEn: ahora, clientUuid: `${a.infante}-${fecha}-${turno}` }
				},
				{ upsert: true, new: true, runValidators: true }
			);
			guardadas.push(r);
		}

		await log(usuario.usuario, "ACTUALIZAR", null, req, null, "asistencias");
		res.json(guardadas);
	} catch (error) {
		console.error("Error al guardar pase de lista:", error);
		if (error.name === "ValidationError" || error.name === "CastError") {
			return res.status(400).json({ error: error.message });
		}
		res.status(500).json({ error: error.message });
	}
});


app.post("/registrarse", async(req, res)=>{
	let user=req.body.username;
	let pass=req.body.password;
	let data=await Usuario.findOne({"usuario":user});
	//console.log(data);
	if (data==null){
		const hash=await argon2.hash(pass, {type: argon2.argon2id, memoryCost: 64*1024, timeCost:3, parallelism:1, saltLength:128});
		await Usuario.create({"usuario": user, "passwordHash": hash, "rol": ["CAPTURISTA_DOCENTE"]});
		res.sendStatus(201);
	}else{
		res.sendStatus(403);
	}
});

app.post("/login", async (req, res)=>{
	console.log("Login request body:", req.body);
	let user=req.body.username;
	let pass=req.body.password;
	let data=await Usuario.findOne({"usuario":user});
	console.log(data);
	if(data==null){
		
		res.sendStatus(401);

	}else if(await argon2.verify(data.passwordHash, pass)){
		let token=jwt.sign({"usuario":data.usuario, rol: data.rol}, process.env.JWTSECRET, {expiresIn:900});
		return res.json({"token": token, "id":data.usuario, rol: data.rol});
	}else{
		res.sendStatus(401);
	}
});

app.get("/bitacora", async (req, res) => {
	// primero se valida quien es, si el token es malo o vencio responde 401
	let usuario;
	try {
		usuario = await dataUsuarios(req);
	} catch {
		return res.sendStatus(401);
	}
	// solo los roles permitidos pueden verlo
	if (!usuario.rol.some(r => rolesVenBitacora.includes(r))) {
		// se guarda el intento en la bitacora con la ruta que quiso abrir
		req.body = { ...req.body, ruta: req.originalUrl, metodo: req.method };
		await log(usuario.usuario, "ACCESO_DENEGADO", null, req, null);
		return res.sendStatus(403);
	}
	try {
		// lean() devuelve objetos planos y conserva el _id, que es el que usa el frontend
		const data = await Bitacora.find({}).sort({ fechaHora: -1 }).lean();
		res.json(data);
	} catch (error) {
		console.error("Error en bitacora:", error);
		res.status(500).json({ error: "Error al obtener la bitacora" });
	}
});

// coleccionLog es opcional: se usa en las rutas que no traen :coleccion en la URL (como /incidencias)
async function log(sujeto, accion, objetoBefore, req, registro, coleccionLog){
	let coleccion = coleccionLog ?? req.params.coleccion;
	let objeto = req.body;
	let nuevoLog={};
	nuevoLog["usuario"]=sujeto;
	let usuario = sujeto;
	let rol =await Usuario.findOne({"usuario":usuario}).select("rol").exec();
	nuevoLog["rol"]= rol?.rol;
	console.log("Rol del usuario:", nuevoLog["rol"]);
	nuevoLog["fechaHora"]=new Date();
	nuevoLog["accion"]=accion;
	nuevoLog["coleccion"]=coleccion;
	nuevoLog["ip"]= req.ip;
	nuevoLog["userAgent"]= req.get("User-Agent");
	// Identificador del registro afectado: el que se pasa al crear, o el :id de la URL
	nuevoLog["registro"]= registro ?? req.params.id ?? null;
	if(objetoBefore==null){
		nuevoLog["datosAnteriores"]=null;
	}
	else{
	nuevoLog["datosAnteriores"]= objetoBefore;
	}
	// La contraseña y su hash nunca se guardan en la bitacora
	let { passwordHash, password, ...datosNuevos } = objeto ?? {};
	// Los campos cifrados no se guardan en claro en la bitacora
	for (const campo of modelos[coleccion]?.camposCifrados ?? []) {
		if (datosNuevos[campo] !== undefined) datosNuevos[campo] = "[cifrado]";
		if (nuevoLog["datosAnteriores"]?.[campo] !== undefined) nuevoLog["datosAnteriores"][campo] = "[cifrado]";
	}
	nuevoLog["datosNuevos"]= datosNuevos;

	// si falla la bitacora no se rompe la peticion, al cliente ya se le respondio
	try{
		await Bitacora.create(nuevoLog);
	}catch(error){
		console.error("Error al guardar en bitacora:", error.message);
	}
}

app.get("/seguimiento", async (req, res) => {
	// primero se valida quien es, si el token es malo o vencio responde 401
	let usuario;
	try {
		usuario = await dataUsuarios(req);
	} catch {
		return res.sendStatus(401);
	}
	// solo los roles permitidos pueden verlo
	if (!usuario.rol.some(r => rolesVenSeguimiento.includes(r))) {
		// se guarda el intento en la bitacora con la ruta que quiso abrir
		req.body = { ...req.body, ruta: req.originalUrl, metodo: req.method };
		await log(usuario.usuario, "ACCESO_DENEGADO", null, req, null, "tickets");
		return res.sendStatus(403);
	}
	try {
		// cada falta es un caso, la mas reciente primero
		const faltas = await Asistencia.find({
			deleted_at: null
		})
			.sort({ fecha: -1 })
			.lean();

		// se traen de una vez los infantes, grupos y tickets de todas las faltas
		const [infantes, grupos, tickets] = await Promise.all([
			Infante.find({ _id: { $in: faltas.map(f => f.infante) }, activo: { $ne: false } }).lean(),
			Grupo.find({ _id: { $in: faltas.map(f => f.grupo) } }).lean(),
			Ticket.find({ asistencia: { $in: faltas.map(f => f._id) }, deleted_at: null }).lean()
		]);

		// Map por id para no hacer una consulta por cada falta
		// utilizamos un diccionario debido a que de esa forma no tenemos que recorrer 
		// el arreglo de infantes, grupos y tickets para cada falta, si no que accedemos directamente 
		// al objeto correspondiente
		const infantesPorId = new Map(infantes.map(i => [String(i._id), i])); // el diccionario sale como {infanteId: infante}
		const gruposPorId = new Map(grupos.map(g => [String(g._id), g]));
		const ticketsPorAsistencia = new Map(tickets.map(t => [String(t.asistencia), t]));

		const resultado = [];
		for (const falta of faltas) {
			const infante = infantesPorId.get(String(falta.infante));
			// si el infante esta inactivo o ya no existe, no se muestra el caso
			if (!infante) continue;
			const ticket = ticketsPorAsistencia.get(String(falta._id));

			// sin ticket todavia no se ha hecho nada: el caso esta abierto
			let estado = "abierto";
			if (ticket) {
				estado = estadosSeguimiento[ticket.estado] ?? "abierto";
				if (estado !== "cerrado" && ticket.bloqueoIngreso) estado = "alta_medica";
			}

			// JUSTIFICACION DE IA
			let alerta;
			if (ticket?.escalado) {
				alerta = "Caso escalado: no se hizo el segundo intento";
			} else if (ticket?.alertaAmarilla?.activa && !ticket.alertaAmarilla.segundoIntentoHecho) {
				alerta = "Segundo intento pendiente";
			}
			
			// el frontend toma intentos[0] como la ultima llamada, por eso van de la mas reciente a la mas antigua
			const intentos = [...(ticket?.intentosContacto ?? [])]
				.sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora))
				.map(i => ({
					fecha: i.fechaHora,
					resultado: i.resultado ?? (i.exitoso ? "Contestó" : "No contestó"),
					responsable: i.registradoPor,
					notas: i.resumen
				}));

			resultado.push({
				id: falta._id,
				nombre: `${infante.nombre ?? ""} ${infante.paterno ?? ""} ${infante.materno ?? ""}`.trim(),
				sala: gruposPorId.get(String(falta.grupo))?.sala ?? "Sin sala",
				fechaFalta: falta.fecha,
				folio: infante.matricula,
				estado,
				alerta,
				causa: etiquetasCausa[ticket?.causa],
				intentos
			});
		}
		res.json(resultado);
	} catch (error) {
		console.error("Error en seguimiento:", error);
		res.status(500).json({ error: "Error al obtener los seguimientos" });
	}
});

// Registra una llamada al tutor en el caso de la falta :id (el id del caso es el _id de la asistencia)
// Si la falta todavia no tiene ticket se crea en este momento. Regresa el caso ya actualizado
app.post("/seguimiento/:id/llamadas", async (req, res) => {
	let usuario;
	try {
		usuario = await dataUsuarios(req);
	} catch {
		return res.sendStatus(401);
	}
	if (!usuario.rol.some(r => rolesVenSeguimiento.includes(r))) {
		// se guarda el intento en la bitacora con la ruta que quiso abrir
		req.body = { ...req.body, ruta: req.originalUrl, metodo: req.method };
		await log(usuario.usuario, "ACCESO_DENEGADO", null, req, null, "tickets");
		return res.sendStatus(403);
	}
	try {
		const { resultado, causa, notas } = req.body;
		if (!resultadosLlamada.includes(resultado)) {
			return res.status(400).json({ error: "Resultado de llamada no válido" });
		}
		// el frontend manda la etiqueta ("Enfermedad en casa"), en el ticket se guarda el codigo ("ENF_CASA")
		// causa vacia significa que no se eligio ninguna y se deja la que ya tenga el ticket
		const codigoCausa = Object.keys(etiquetasCausa).find(k => etiquetasCausa[k] === causa);
		if (causa && !codigoCausa) {
			return res.status(400).json({ error: "Causa no válida" });
		}

		const falta = await Asistencia.findOne({ _id: req.params.id, deleted_at: null }).lean();
		if (!falta) return res.sendStatus(404);
		const [infante, grupo] = await Promise.all([
			Infante.findOne({ _id: falta.infante, activo: { $ne: false } }).lean(),
			Grupo.findOne({ _id: falta.grupo }).lean()
		]);
		if (!infante) return res.sendStatus(404);

		// sin lean() porque aqui si se modifica el ticket y se guarda con save()
		let ticket = await Ticket.findOne({ asistencia: falta._id, deleted_at: null });
		if (!ticket) {
			ticket = new Ticket({
				asistencia: falta._id,
				infante: falta.infante,
				estancia: falta.estancia,
				estado: "ABIERTO",
				fechaApertura: new Date()
			});
		}

		if (ticket.estado === "CERRADO") {
			return res.status(400).json({ error: "El caso ya está cerrado" });
		}
		//dentro de ticket.intentosContacto se hce un push de un objeto con los datos de la llamada,
		// incluyendo el resultado, notas y quien la registro
		// esto se hace por que el ticket puede tener varios intentos de contacto, y se quiere guardar
		// un historial de todos ellos
		ticket.intentosContacto.push({
			numero: ticket.intentosContacto.length + 1,
			fechaHora: new Date(),
			exitoso: resultado === "Contestó",
			resultado,
			resumen: notas || undefined,
			registradoPor: usuario.usuario
		});
		// con la primera llamada el caso pasa a "En seguimiento"
		if (ticket.estado === "ABIERTO") ticket.estado = "EN_PROCESO";
		if (codigoCausa) ticket.causa = codigoCausa;
		// la alerta amarilla pide un segundo intento: con la segunda llamada ya queda hecho
		if (ticket.alertaAmarilla?.activa && ticket.intentosContacto.length >= 2) {
			ticket.alertaAmarilla.segundoIntentoHecho = true;
		}

		const esNuevo = ticket.isNew;
		await ticket.save();
		// la asistencia guarda la referencia al ticket que genero
		if (esNuevo) {
			await Asistencia.updateOne({ _id: falta._id }, { $set: { ticket: ticket._id } });
		}
		await log(usuario.usuario, "LLAMADA", null, req, ticket._id, "tickets");

		// se regresa el caso con la misma forma que el GET /seguimiento
		let estado = estadosSeguimiento[ticket.estado] ?? "abierto";
		if (estado !== "cerrado" && ticket.bloqueoIngreso) estado = "alta_medica";

		let alerta;
		if (ticket.escalado) {
			alerta = "Caso escalado: no se hizo el segundo intento";
		} else if (ticket.alertaAmarilla?.activa && !ticket.alertaAmarilla.segundoIntentoHecho) {
			alerta = "Segundo intento pendiente";
		}

		// el frontend toma intentos[0] como la ultima llamada, por eso van de la mas reciente a la mas antigua
		const intentos = [...ticket.intentosContacto]
			.sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora))
			.map(i => ({
				fecha: i.fechaHora,
				resultado: i.resultado ?? (i.exitoso ? "Contestó" : "No contestó"),
				responsable: i.registradoPor,
				notas: i.resumen
			}));

		res.status(201).json({
			id: falta._id,
			nombre: `${infante.nombre ?? ""} ${infante.paterno ?? ""} ${infante.materno ?? ""}`.trim(),
			sala: grupo?.sala ?? "Sin sala",
			fechaFalta: falta.fecha,
			folio: infante.matricula,
			estado,
			alerta,
			causa: etiquetasCausa[ticket.causa],
			intentos
		});
	} catch (error) {
		console.error("Error al registrar llamada:", error);
		if (error.name === "ValidationError") {
			return res.status(400).json({ error: error.message });
		}
		res.status(500).json({ error: "Error al registrar la llamada" });
	}
});

// Guarda el expediente del caso :id: causa, asesoria brindada, fecha probable de retorno y notas confidenciales
// La asesoria y la nota se guardan como registros nuevos (historial), los campos vacios no cambian nada
// Si la falta todavia no tiene ticket se crea en este momento. Regresa el caso ya actualizado
app.patch("/seguimiento/:id", async (req, res) => {
	let usuario;
	try {
		usuario = await dataUsuarios(req);
	} catch {
		return res.sendStatus(401);
	}
	if (!usuario.rol.some(r => rolesVenSeguimiento.includes(r))) {
		// se guarda el intento en la bitacora; la nota no debe quedar en claro
		req.body = { ...req.body, notas: req.body?.notas ? "[cifrado]" : undefined, ruta: req.originalUrl, metodo: req.method };
		await log(usuario.usuario, "ACCESO_DENEGADO", null, req, null, "tickets");
		return res.sendStatus(403);
	}
	try {
		const { causa, asesoria, fechaRetorno, notas } = req.body;
		// el frontend manda la etiqueta ("Enfermedad en casa"), en el ticket se guarda el codigo ("ENF_CASA")
		const codigoCausa = Object.keys(etiquetasCausa).find(k => etiquetasCausa[k] === causa);
		if (causa && !codigoCausa) {
			return res.status(400).json({ error: "Causa no válida" });
		}
		// la fecha llega como "aaaa-mm-dd" desde el calendario

		const fechaRetornoEstimada = fechaRetorno ? new Date(fechaRetorno) : null; // Si la fecha llega con valor se guarda como Date, si no es null
		if (fechaRetornoEstimada && isNaN(fechaRetornoEstimada.getTime())) {
			return res.status(400).json({ error: "Fecha de retorno no válida" });
		}

		// si la falta no existe o ya fue borrada, no se puede hacer nada
		const falta = await Asistencia.findOne({ _id: req.params.id, deleted_at: null }).lean();
		if (!falta) return res.sendStatus(404);
	
		// Se busca el infante y el grupo de la falta para regresar el nombre y la sala en la respuesta
		const [infante, grupo] = await Promise.all([
			Infante.findOne({ _id: falta.infante, activo: { $ne: false } }).lean(),
			Grupo.findOne({ _id: falta.grupo }).lean()
		]);
		if (!infante) return res.sendStatus(404);

		// sin lean() porque aqui si se modifica el ticket y se guarda con save()
		let ticket = await Ticket.findOne({ asistencia: falta._id, deleted_at: null });
		if (!ticket) {
			ticket = new Ticket({
				asistencia: falta._id,
				infante: falta.infante,
				estancia: falta.estancia,
				estado: "ABIERTO",
				fechaApertura: new Date()
			});
		}
		if (ticket.estado === "CERRADO") {
			return res.status(400).json({ error: "El caso ya está cerrado" });
		}

		
		if (codigoCausa) ticket.causa = codigoCausa;
		const esNuevo = ticket.isNew;
		await ticket.save(); // Si ya existe se guardan los cambios, si no existe se crea y se guarda
		if (esNuevo) {
			await Asistencia.updateOne({ _id: falta._id }, { $set: { ticket: ticket._id } });
		}

		// cada vez que se escribe una asesoria o una fecha se crea una nueva y el ticket apunta a la mas reciente
		if (asesoria || fechaRetornoEstimada) {
			const nuevaAsesoria = await Asesoria.create({
				ticket: ticket._id,
				infante: falta.infante,
				asesoria: asesoria || undefined,
				fechaRetornoEstimada,
				registradoPor: usuario.usuario,
				fechaRegistro: new Date()
			});
			ticket.asesoria = nuevaAsesoria._id;
			await ticket.save();
		}
		// la nota se cifra en el modelo de NotaConfidencial
		if (notas) {
			await NotaConfidencial.create({
				ticket: ticket._id,
				infante: falta.infante,
				nota: notas,
				autor: usuario.usuario,
				fechaRegistro: new Date()
			});
			// la bitacora guarda el body tal cual, la nota no debe quedar en claro
			req.body = { ...req.body, notas: "[cifrado]" };
		}
		await log(usuario.usuario, "ACTUALIZAR", null, req, ticket._id, "tickets");

		const asesoriaActual = ticket.asesoria
			? await Asesoria.findOne({ _id: ticket.asesoria, deleted_at: null }).lean()
			: null;

		// se regresa el caso con la misma forma que el GET /seguimiento
		let estado = estadosSeguimiento[ticket.estado] ?? "abierto";
		if (estado !== "cerrado" && ticket.bloqueoIngreso) estado = "alta_medica";

		let alerta;
		if (ticket.escalado) {
			alerta = "Caso escalado: no se hizo el segundo intento";
		} else if (ticket.alertaAmarilla?.activa && !ticket.alertaAmarilla.segundoIntentoHecho) {
			alerta = "Segundo intento pendiente";
		}

		// el frontend toma intentos[0] como la ultima llamada, por eso van de la mas reciente a la mas antigua
		const intentos = [...ticket.intentosContacto]
			.sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora))
			.map(i => ({
				fecha: i.fechaHora,
				resultado: i.resultado ?? (i.exitoso ? "Contestó" : "No contestó"),
				responsable: i.registradoPor,
				notas: i.resumen
			}));

		res.json({
			id: falta._id,
			nombre: `${infante.nombre ?? ""} ${infante.paterno ?? ""} ${infante.materno ?? ""}`.trim(),
			sala: grupo?.sala ?? "Sin sala",
			fechaFalta: falta.fecha,
			folio: infante.matricula,
			estado,
			alerta,
			causa: etiquetasCausa[ticket.causa],
			intentos,
			asesoria: asesoriaActual?.asesoria,
			fechaRetorno: asesoriaActual?.fechaRetornoEstimada ?? undefined
		});
	} catch (error) {
		console.error("Error al guardar expediente:", error);
		if (error.name === "ValidationError") {
			return res.status(400).json({ error: error.message });
		}
		res.status(500).json({ error: "Error al guardar el expediente" });
	}
});

// Cierra el caso :id: pone el ticket en CERRADO y guarda quien y cuando lo cerro
// Si la falta todavia no tiene ticket se crea ya cerrado. Regresa el caso ya actualizado
app.patch("/seguimiento/:id/cerrar", async (req, res) => {
	let usuario;
	try {
		usuario = await dataUsuarios(req);
	} catch {
		return res.sendStatus(401);
	}
	if (!usuario.rol.some(r => rolesVenSeguimiento.includes(r))) {
		// se guarda el intento en la bitacora con la ruta que quiso abrir
		req.body = { ...req.body, ruta: req.originalUrl, metodo: req.method };
		await log(usuario.usuario, "ACCESO_DENEGADO", null, req, null, "tickets");
		return res.sendStatus(403);
	}
	try {
		const falta = await Asistencia.findOne({ _id: req.params.id, deleted_at: null }).lean();
		if (!falta) return res.sendStatus(404);


		const [infante, grupo] = await Promise.all([
			Infante.findOne({ _id: falta.infante, activo: { $ne: false } }).lean(),
			Grupo.findOne({ _id: falta.grupo }).lean()
		]);
		if (!infante) return res.sendStatus(404);

		let ticket = await Ticket.findOne({ asistencia: falta._id, deleted_at: null });
		if (!ticket) {
			ticket = new Ticket({
				asistencia: falta._id,
				infante: falta.infante,
				estancia: falta.estancia,
				fechaApertura: new Date()
			});
		}
		if (ticket.estado === "CERRADO") {
			return res.status(400).json({ error: "El caso ya está cerrado" });
		}
		// se guarda como estaba antes para la bitacora
		const antes = { estado: ticket.estado ?? null };

		ticket.estado = "CERRADO";
		ticket.fechaCierre = new Date();
		ticket.cerradoPor = usuario.usuario;

		const esNuevo = ticket.isNew;
		await ticket.save();
		if (esNuevo) {
			await Asistencia.updateOne({ _id: falta._id }, { $set: { ticket: ticket._id } });
		}
		await log(usuario.usuario, "CERRAR_TICKET", antes, req, ticket._id, "tickets");

		// cerrado ya no lleva alerta ni alta medica, solo se arma el resto del caso
		const intentos = [...ticket.intentosContacto]
			.sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora))
			.map(i => ({
				fecha: i.fechaHora,
				resultado: i.resultado ?? (i.exitoso ? "Contestó" : "No contestó"),
				responsable: i.registradoPor,
				notas: i.resumen
			}));

		res.json({
			id: falta._id,
			nombre: `${infante.nombre ?? ""} ${infante.paterno ?? ""} ${infante.materno ?? ""}`.trim(),
			sala: grupo?.sala ?? "Sin sala",
			fechaFalta: falta.fecha,
			folio: infante.matricula,
			estado: "cerrado",
			causa: etiquetasCausa[ticket.causa],
			intentos
		});
	} catch (error) {
		console.error("Error al cerrar caso:", error);
		res.status(500).json({ error: "Error al cerrar el caso" });
	}
});

// se revisó con Claude qué podía causar errores en este endpoint y se usó de referencia para los siguientes / Ayudado por Claude
app.get("/incidencias", async (req, res) => {
	// primero se valida quien es, si el token es malo o vencio responde 401
	let usuario;
	try {
		usuario = await dataUsuarios(req);
	} catch {
		return res.sendStatus(401);
	}
	// solo los roles permitidos pueden verlo
	// .some devuelve true si al menos un elemento del arreglo cumple la condicion
	if (!usuario.rol.some(r => rolesVenIncidencias.includes(r))) {
		// se guarda el intento en la bitacora con la ruta que quiso abrir
		// ...req.body hace una copia de lo que ya tenia el body, para no perderlo
		req.body = { ...req.body, ruta: req.originalUrl, metodo: req.method };
		await log(usuario.usuario, "ACCESO_DENEGADO", null, req, null, "incidencias");
		return res.sendStatus(403);
	}
	try {
		// todas las incidencias, la mas reciente primero
		//.lean() se encarga de que los ObjectId se serialicen como string y no como objeto
		const incidencias = await Incidencia.find({ deleted_at: null })
			.sort({ fechaHora: -1 })
			.lean();

		// se traen de una vez los infantes y grupos de todas las incidencias
		// no se filtra por activo porque las historicas pueden ser de infantes que ya se dieron de baja
		const [infantes, grupos] = await Promise.all([
			Infante.find({ _id: { $in: incidencias.map(i => i.infante) } }).lean(),
			Grupo.find({ _id: { $in: incidencias.map(i => i.grupo) } }).lean()
		]);

		// Map por id para no hacer una consulta por cada incidencia
		const infantesPorId = new Map(infantes.map(i => [String(i._id), i]));
		const gruposPorId = new Map(grupos.map(g => [String(g._id), g]));

		const resultado = [];
		for (const inc of incidencias) {
			const infante = infantesPorId.get(String(inc.infante));
			// si el infante ya no existe, no se muestra la incidencia
			if (!infante) continue;

			// el estado decide la pestaña en el frontend: solo "resuelta" va a Historicas
			const estado = inc.estado ?? "abierta";

			// el frontend muestra las acciones de la mas vieja a la mas nueva
			const acciones = [...(inc.acciones ?? [])]
				.sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora))
				.map(a => ({
					hora: a.fechaHora,
					texto: a.texto,
					responsable: a.responsable
				}));

			resultado.push({
				id: inc._id,
				folio: inc.folio,
				nombre: `${infante.nombre ?? ""} ${infante.paterno ?? ""} ${infante.materno ?? ""}`.trim(),
				sala: gruposPorId.get(String(inc.grupo))?.sala ?? "Sin sala",
				tipo: inc.tipo,
				gravedad: inc.gravedad,
				fechaHora: inc.fechaHora,
				reporto: inc.reporto,
				estado,
				descripcion: inc.descripcion,
				tutorNotificado: inc.tutorNotificado ?? false,
				acciones,
				// la resolucion solo se manda cuando ya fue resuelta
				resolucion: estado === "resuelta" ? inc.resolucion : undefined
			});
		}
		res.json(resultado);
	} catch (error) {
		console.error("Error en incidencias:", error);
		res.status(500).json({ error: "Error al obtener las incidencias" });
	}
});

// Crea una incidencia con la fecha del servidor, estado "abierta" y quien reporto sacado del token
// Regresa la incidencia creada con la misma forma que el GET /incidencias
app.post("/incidencias", async (req, res) => {
	let usuario;
	try {
		usuario = await dataUsuarios(req);
	} catch {
		return res.sendStatus(401);
	}
	if (!usuario.rol.some(r => rolesVenIncidencias.includes(r))) {
		// se guarda el intento en la bitacora con la ruta que quiso abrir
		req.body = { ...req.body, ruta: req.originalUrl, metodo: req.method };
		await log(usuario.usuario, "ACCESO_DENEGADO", null, req, null, "incidencias");
		return res.sendStatus(403);
	}
	try {
		const { matricula, tipo, gravedad, descripcion } = req.body;
		if (!matricula) {
			return res.status(400).json({ error: "La matrícula es obligatoria" });
		}
		if (!tiposIncidencia.includes(tipo)) {
			return res.status(400).json({ error: "Tipo de incidencia no válido" });
		}
		if (!gravedadesIncidencia.includes(gravedad)) {
			return res.status(400).json({ error: "Gravedad no válida" });
		}

		const infante = await Infante.findOne({ matricula, activo: { $ne: false } }).lean();
		if (!infante) return res.status(404).json({ error: "Infante no encontrado" });
		// la sala sale del grupo vigente en el que esta inscrito el infante
		const grupo = await Grupo.findOne({ infantes: infante._id, deleted_at: null, activo: { $ne: false } }).lean();

		const incidencia = new Incidencia({
			infante: infante._id,
			grupo: grupo?._id ?? null,
			estancia: infante.ebdi,
			tipo,
			gravedad,
			descripcion,
			estado: "abierta",
			fechaHora: new Date(),
			reporto: usuario.usuario
		});
		// el _id ya existe antes de guardar, se usa para el folio y asi no hay que contar registros
		incidencia.folio = "INC-" + String(incidencia._id).slice(-6).toUpperCase();
		await incidencia.save();

		await log(usuario.usuario, "CREAR", null, req, incidencia._id, "incidencias");

		res.status(201).json({
			id: incidencia._id,
			folio: incidencia.folio,
			nombre: `${infante.nombre ?? ""} ${infante.paterno ?? ""} ${infante.materno ?? ""}`.trim(),
			sala: grupo?.sala ?? "Sin sala",
			tipo: incidencia.tipo,
			gravedad: incidencia.gravedad,
			fechaHora: incidencia.fechaHora,
			reporto: incidencia.reporto,
			estado: incidencia.estado,
			descripcion: incidencia.descripcion,
			tutorNotificado: false,
			acciones: []
		});
	} catch (error) {
		console.error("Error al registrar incidencia:", error);
		if (error.name === "ValidationError") {
			return res.status(400).json({ error: error.message });
		}
		res.status(500).json({ error: "Error al registrar la incidencia" });
	}
});


// Agrega una accion a la incidencia :id con la hora del servidor y el usuario del token
// Con la primera accion la incidencia pasa a "en_atencion". Regresa la incidencia ya actualizada
app.post("/incidencias/:id/acciones", async (req, res) => {
	let usuario;
	try {
		usuario = await dataUsuarios(req);
	} catch {
		return res.sendStatus(401);
	}
	if (!usuario.rol.some(r => rolesVenIncidencias.includes(r))) {
		// se guarda el intento en la bitacora con la ruta que quiso abrir
		req.body = { ...req.body, ruta: req.originalUrl, metodo: req.method };
		await log(usuario.usuario, "ACCESO_DENEGADO", null, req, null, "incidencias");
		return res.sendStatus(403);
	}
	try {
		const { tipo, notas } = req.body;
		if (!tiposAccionIncidencia.includes(tipo)) {
			return res.status(400).json({ error: "Tipo de acción no válido" });
		}

		// sin lean() porque aqui si se modifica la incidencia y se guarda con save()
		const incidencia = await Incidencia.findOne({ _id: req.params.id, deleted_at: null });
		if (!incidencia) return res.sendStatus(404);
		if (incidencia.estado === "resuelta") {
			return res.status(400).json({ error: "La incidencia ya está resuelta" });
		}

		// el texto que se muestra es el tipo de accion y, si hay, las notas
		incidencia.acciones.push({
			fechaHora: new Date(),
			texto: notas ? `${tipo}: ${notas}` : tipo,
			responsable: usuario.usuario
		});
		if (incidencia.estado === "abierta") incidencia.estado = "en_atencion";
		if (tipo === "Llamada al tutor") incidencia.tutorNotificado = true;
		await incidencia.save();

		await log(usuario.usuario, "ACCION", null, req, incidencia._id, "incidencias");

		const [infante, grupo] = await Promise.all([
			Infante.findOne({ _id: incidencia.infante }).lean(),
			Grupo.findOne({ _id: incidencia.grupo }).lean()
		]);

		// se regresa con la misma forma que el GET /incidencias, acciones de la mas vieja a la mas nueva
		const acciones = [...incidencia.acciones]
			.sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora))
			.map(a => ({
				hora: a.fechaHora,
				texto: a.texto,
				responsable: a.responsable
			}));

		res.status(201).json({
			id: incidencia._id,
			folio: incidencia.folio,
			nombre: `${infante?.nombre ?? ""} ${infante?.paterno ?? ""} ${infante?.materno ?? ""}`.trim(),
			sala: grupo?.sala ?? "Sin sala",
			tipo: incidencia.tipo,
			gravedad: incidencia.gravedad,
			fechaHora: incidencia.fechaHora,
			reporto: incidencia.reporto,
			estado: incidencia.estado,
			descripcion: incidencia.descripcion,
			tutorNotificado: incidencia.tutorNotificado ?? false,
			acciones
		});
	} catch (error) {
		console.error("Error al registrar acción:", error);
		if (error.name === "ValidationError") {
			return res.status(400).json({ error: error.message });
		}
		res.status(500).json({ error: "Error al registrar la acción" });
	}
});

// Resuelve la incidencia :id: estado "resuelta" y guarda quien y cuando la resolvio
// Regresa la incidencia ya actualizada
app.patch("/incidencias/:id/resolver", async (req, res) => {
	let usuario;
	try {
		usuario = await dataUsuarios(req);
	} catch {
		return res.sendStatus(401);
	}
	if (!usuario.rol.some(r => rolesVenIncidencias.includes(r))) {
		// se guarda el intento en la bitacora con la ruta que quiso abrir
		req.body = { ...req.body, ruta: req.originalUrl, metodo: req.method };
		await log(usuario.usuario, "ACCESO_DENEGADO", null, req, null, "incidencias");
		return res.sendStatus(403);
	}
	try {
		const incidencia = await Incidencia.findOne({ _id: req.params.id, deleted_at: null });
		if (!incidencia) return res.sendStatus(404);
		if (incidencia.estado === "resuelta") {
			return res.status(400).json({ error: "La incidencia ya está resuelta" });
		}
		// se guarda como estaba antes para la bitacora
		const antes = { estado: incidencia.estado };

		incidencia.estado = "resuelta";
		incidencia.resolucion = { fecha: new Date(), por: usuario.usuario };
		await incidencia.save();

		await log(usuario.usuario, "RESOLVER", antes, req, incidencia._id, "incidencias");

		const [infante, grupo] = await Promise.all([
			Infante.findOne({ _id: incidencia.infante }).lean(),
			Grupo.findOne({ _id: incidencia.grupo }).lean()
		]);

		const acciones = [...incidencia.acciones]
			.sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora))
			.map(a => ({
				hora: a.fechaHora,
				texto: a.texto,
				responsable: a.responsable
			}));

		res.json({
			id: incidencia._id,
			folio: incidencia.folio,
			nombre: `${infante?.nombre ?? ""} ${infante?.paterno ?? ""} ${infante?.materno ?? ""}`.trim(),
			sala: grupo?.sala ?? "Sin sala",
			tipo: incidencia.tipo,
			gravedad: incidencia.gravedad,
			fechaHora: incidencia.fechaHora,
			reporto: incidencia.reporto,
			estado: incidencia.estado,
			descripcion: incidencia.descripcion,
			tutorNotificado: incidencia.tutorNotificado ?? false,
			acciones,
			resolucion: incidencia.resolucion
		});
	} catch (error) {
		console.error("Error al resolver incidencia:", error);
		res.status(500).json({ error: "Error al resolver la incidencia" });
	}
});

// Estadisticas agregadas para la pantalla de Estadisticas: solo conteos y porcentajes, sin nombres ni matriculas
// Filtros del query: periodo ("hoy" | "mes" | "trimestre"), region (ur) y estancia (clave o parte del nombre)
// Los conteos de grupos con menos de 5 niños se mandan como null para que no se pueda identificar a nadie
app.get("/estadisticas", async (req, res) => {
	// primero se valida quien es, si el token es malo o vencio responde 401
	let usuario;
	console.log("hola");
	try {
		usuario = await dataUsuarios(req);
	} catch {
		return res.sendStatus(401);
	}
	// solo los roles permitidos pueden verlo
	if (!usuario.rol.some(r => rolesVenEstadisticas.includes(r))) {
		// se guarda el intento en la bitacora con la ruta que quiso abrir
		req.body = { ...req.body, ruta: req.originalUrl, metodo: req.method };
		await log(usuario.usuario, "ACCESO_DENEGADO", null, req, null);
		return res.sendStatus(403);
	}
	try {
		const esAdmin = usuario.rol.includes("ADMINISTRADOR_CENTRAL");
		// el regional solo ve su region aunque mande otra en el query, los centrales ven todas
		const esRegional = !esAdmin && !usuario.rol.includes("SUPERVISOR_CENTRAL");
		if (esRegional && !usuario.ambito?.ur) {
			return res.sendStatus(403);
		}
		const region = esRegional ? usuario.ambito.ur : (req.query.region || "");
		const busqueda = String(req.query.estancia ?? "").trim().toLowerCase();

		// fechas de hoy, días del periodo, inicio del periodo y del periodo anterior para comparar las estadísticas / Ayudado por Claude
		// rangos de fechas: los dias empiezan a las 00:00 del servidor
		const dia = 24 * 60 * 60 * 1000;
		const hoy = new Date();
		hoy.setHours(0, 0, 0, 0);
		const diasPeriodo = { hoy: 1, mes: 30, trimestre: 90 };
		const inicioPeriodo = new Date(hoy.getTime() - ((diasPeriodo[req.query.periodo] ?? 1) - 1) * dia);
		const inicioPeriodoAnterior = new Date(inicioPeriodo.getTime() - (diasPeriodo[req.query.periodo] ?? 1) * dia);

		// estancias vigentes; las regiones del filtro salen de todas las estancias
		const todasEstancias = await Estancia.find({ activo: { $ne: false }, deleted_at: null }).lean();
		const regiones = esRegional
			? [usuario.ambito.ur]
			: [...new Set(todasEstancias.map(e => e.ur).filter(Boolean))].sort();
		const estancias = todasEstancias.filter(e =>
			(!region || e.ur === region) &&
			(!busqueda || String(e.ebdi) === busqueda || (e.nombre ?? "").toLowerCase().includes(busqueda))
		);

		// las asistencias se buscan por grupo porque las del escaneo no traen el campo estancia
		// se traen desde 60 dias antes para poder calcular la tendencia de dia, semana y mes
		const grupos = await Grupo.find({ estancia: { $in: estancias.map(e => e.ebdi) }, deleted_at: null }).lean();
		const desde = new Date(Math.min(inicioPeriodoAnterior.getTime(), hoy.getTime() - 59 * dia));
		const asistencias = await Asistencia.find({
			grupo: { $in: grupos.map(g => g._id) },
			fecha: { $gte: desde },
			deleted_at: null
		}).lean();

		// Map por id para no buscar el grupo de cada asistencia en el arreglo
		const gruposPorId = new Map(grupos.map(g => [String(g._id), g]));

		// el escaneo no guarda estatus: si tiene hora de ingreso el niño llego y cuenta como presente
		const esPresente = a => a.estatus === "PRESENTE" || (!a.estatus && a.horaIngreso != null);
		// ausencia en porcentaje de las asistencias con fecha en [inicio, fin)
		const ausenciaEntre = (inicio, fin) => {
			const lista = asistencias.filter(a => new Date(a.fecha) >= inicio && new Date(a.fecha) < fin);
			if (lista.length === 0) return 0;
			return (lista.filter(a => !esPresente(a)).length / lista.length) * 100;
		};

		// asistencias del periodo elegido
		const manana = new Date(hoy.getTime() + dia);
		const delPeriodo = asistencias.filter(a => new Date(a.fecha) >= inicioPeriodo && new Date(a.fecha) < manana);
		const presentes = delPeriodo.filter(esPresente).length;
		const tasaAsistencia = delPeriodo.length ? (presentes / delPeriodo.length) * 100 : 0;
		const tasaAusencia = delPeriodo.length ? 100 - tasaAsistencia : 0;

		// tendencia: puntos de ausencia contra el periodo anterior del mismo tamaño, positivo es que subio
		const tendencia = {
			dia: ausenciaEntre(hoy, manana) - ausenciaEntre(new Date(hoy.getTime() - dia), hoy),
			semana: ausenciaEntre(new Date(hoy.getTime() - 6 * dia), manana) - ausenciaEntre(new Date(hoy.getTime() - 13 * dia), new Date(hoy.getTime() - 6 * dia)),
			mes: ausenciaEntre(new Date(hoy.getTime() - 29 * dia), manana) - ausenciaEntre(new Date(hoy.getTime() - 59 * dia), new Date(hoy.getTime() - 29 * dia))
		};

		// asistencia por grupo; si el grupo tiene menos de 5 inscritos la tasa va como null
		const porGrupo = grupos.map(g => {
			const lista = delPeriodo.filter(a => String(a.grupo) === String(g._id));
			const tasa = lista.length ? (lista.filter(esPresente).length / lista.length) * 100 : 0;
			return {
				grupo: g.nombre ?? g.sala ?? "Sin sala",
				tasa: (g.infantes?.length ?? 0) < 5 ? null : tasa
			};
		});

		// un renglon por estancia; sinCaptura es si hoy no hay ninguna asistencia registrada
		const filasEstancias = estancias.map(e => {
			const lista = delPeriodo.filter(a => gruposPorId.get(String(a.grupo))?.estancia === e.ebdi);
			const deHoy = lista.filter(a => new Date(a.fecha) >= hoy);
			return {
				estancia: String(e.ebdi),
				region: e.ur ?? "",
				tasa: lista.length ? (lista.filter(esPresente).length / lista.length) * 100 : 0,
				sinCaptura: deHoy.length === 0
			};
		});

		// tickets de las faltas del periodo
		const tickets = await Ticket.find({
			asistencia: { $in: delPeriodo.map(a => a._id) },
			deleted_at: null
		}).lean();
		const abiertos = tickets.filter(t => t.estado !== "CERRADO");
		const cerrados = tickets.filter(t => t.estado === "CERRADO" && t.fechaCierre && t.fechaApertura);
		// promedio de dias entre apertura y cierre, con un decimal
		const promedioDias = lista => lista.length
			? Math.round(lista.reduce((s, t) => s + (new Date(t.fechaCierre) - new Date(t.fechaApertura)) / dia, 0) / lista.length * 10) / 10
			: 0;

		// casos abiertos por causa; los de menos de 5 casos van como null
		const conteoCausas = new Map();
		for (const t of abiertos) {
			const causa = t.causa ?? "Sin causa";
			conteoCausas.set(causa, (conteoCausas.get(causa) ?? 0) + 1);
		}
		const casosPorCausa = [...conteoCausas].map(([etiqueta, total]) => ({
			etiqueta,
			total: total < 5 ? null : total
		}));

		const resultado = {
			alcance: region ? `Región ${region}` : "Nacional",
			regiones,
			asistencia: {
				tasaAsistencia,
				tasaAusencia,
				tendencia,
				porGrupo,
				estancias: filasEstancias
			},
			seguimiento: {
				casosPorCausa,
				abiertos: abiertos.length,
				cerrados: tickets.filter(t => t.estado === "CERRADO").length,
				diasPromedioCierre: promedioDias(cerrados),
				conBloqueo: abiertos.filter(t => t.bloqueoIngreso).length,
				// la alta se toma como el cierre de los casos que tenian bloqueo
				diasPromedioAlta: promedioDias(cerrados.filter(t => t.bloqueoIngreso))
			}
		};

		// la auditoria solo se manda al administrador, son conteos de la bitacora sin decir quien
		if (esAdmin) {
			const [accesosNotas, cambiosEstatus] = await Promise.all([
				Bitacora.countDocuments({ accion: "VER_NOTA", fechaHora: { $gte: inicioPeriodo } }),
				Bitacora.countDocuments({ accion: { $in: ["CAMBIO_ESTATUS", "CERRAR_TICKET", "RESOLVER"] }, fechaHora: { $gte: inicioPeriodo } })
			]);
			resultado.auditoria = { accesosNotas, cambiosEstatus };
		}
		console.log(resultado);
		res.json(resultado);
	} catch (error) {
		console.error("Error en estadisticas:", error);
		res.status(500).json({ error: "Error al obtener las estadisticas" });
	}
});
