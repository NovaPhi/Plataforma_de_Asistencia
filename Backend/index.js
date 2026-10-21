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



mongoose.connect(MONGO_URL).then(() => {
  console.log("Conectado a la base de datos");
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
	historico: Historico
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
async function updateData(collection, req, res){
	let valores=req.body;
	valores["id"]=valores["id"];
	let r = await modelos[collection].updateOne({ _id: req.params.id }, { $set: valores });
	r =await modelos[collection].findOne({"_id":valores["id"]}).exec();
	res.json(r);
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
	delete req.body._id;
	delete req.body.id;
	delete req.body.__v;
	delete req.body.passwordHash;
	delete req.body.rol;
	req.body.activo = true;
	req.body.rol = ["CAPTURISTA_DOCENTE"]; // rol por defecto para nuevos usuarios

	// Los usuarios necesitan contraseña: se guarda el hash, nunca el texto
	if (collection === "usuarios") {
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

	const nuevo = await modelos[collection].create(req.body);
	res.sendStatus(201);
	return nuevo;
}


/*
app.get("/", async (req,res)=>{
	try{
		let usuario=await dataUsuarios(req);
		let campos=camposVisibles(usuario);
		console.log("Entro");
		if(campos!==null && campos.length==0){
			res.sendStatus(403);
			return;
		}
		if("_sort" in req.query){
			await getList("infantes", campos, req, res);
		}else if("id" in req.query){
			await getMany("infantes", req, res);
		}else{
			await getManyReference("infantes", req, res);
		}
	}catch{
		res.sendStatus(401);	
	}
});*/

app.get("/Productos/:id", async(req, res)=>{
	await getOne("infantes", req.params.id, req, res);
});

app.get("/Pase_de_Lista/infantes", async (req, res) => {
    const data = await Infante.find({ activo: { $ne: false } }).lean();
    res.json(data);
});

app.patch("/Pase_de_Lista/base_de_datos/:coleccion/:id", async (req, res) => {
	try {
		let usuario = await dataUsuarios(req);
		if (!puedeModificar(usuario)) {
			return res.sendStatus(403);
		}
		await updateData(req.params.coleccion, req, res);
	} catch (error) {
		console.error("ERROR EN PATCH:", error.message);
		res.sendStatus(401);
	}
});
app.post("/Pase_de_Lista/base_de_datos/:coleccion", async (req, res) => {
	try {
		let usuario = await dataUsuarios(req);
		if (!puedeModificar(usuario)) {
			return res.sendStatus(403);
		}
		try {
			const nuevo = await createData(req.params.coleccion, req, res);
			if (nuevo) {
				await log(usuario.usuario, "crear registro", null, req, nuevo._id);
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
	try {
		const usuario = await dataUsuarios(req);
		const grupos = await Grupo.find({ educador: usuario.usuario }).lean();
		const infanteIds = grupos.flatMap(grupo => grupo.infantes);

		const infantes = await Infante.find({
			_id: { $in: infanteIds },
			activo: { $ne: false }
		}).lean();

		const asistencias = await Asistencia.find({
			infante: { $in: infantes.map(i => i._id) },
			deleted_at: null
		})
			.sort({ fecha: -1, capturadoEn: -1 })
			.lean();

		// Ordenadas de más reciente a más antigua: la primera de cada niño es la que cuenta
		const estatusPorInfante = new Map();
		for (const a of asistencias) {
			const key = String(a.infante);
			if (!estatusPorInfante.has(key)) {
				estatusPorInfante.set(key, a.estatus);
			}
		}

		const resultado = infantes.map(infante => ({
			nombre: infante.nombre,
			paterno: infante.paterno,
			materno: infante.materno,
			matricula: infante.matricula,
			estatus: estatusPorInfante.get(String(infante._id)) ?? null
		}));
		console.log("estatusPorInfante", estatusPorInfante);
		res.json(resultado);
	} catch (error) {
		console.error("Error en infantes:", error);
		res.status(500).json({ error: "Error al obtener los infantes" });
	}
});

app.get("/PASE_DE_LISTA/base_de_datos", async (req, res) => {
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
  try {
    const { matricula, grupo, tipo, metodo, fecha, turno, capturadoEN, clientUuid } = req.body;

	if (!matricula || !grupo || !tipo || !clientUuid) {
	return res.status(400).json({ error: "Faltan campos obligatorios" });
	}

	const inf = await Infante.findOne({ matricula });
	if (!inf) return res.status(404).json({ error: "Infante no encontrado" });
	if(inf.activo === false) return res.status(400).json({ error: "Infante inactivo" });
	const nueva = await modelos["asistencias"].create({
	infante: inf._id,
	grupo, tipo, metodo, fecha, turno, horaIngreso:capturadoEN, clientUuid,
	});

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


app.put("/Productos/:id", async(req, res)=>{
	try{
		let usuario=await dataUsuarios(req);
		if(!puedeModificar(usuario)){
			res.sendStatus(403);
			return;
		}
		await updateData("infantes", req, res);
	}catch{
		res.sendStatus(401);
	}
});


app.delete("/Productos/:id", async(req, res)=>{
	try{
		let usuario=await dataUsuarios(req);
		if(!puedeModificar(usuario)){
			res.sendStatus(403);
			return;
		}
		await deleteData("infantes", req.params.id, req, res);
	}catch{
		res.sendStatus(401);
	}
});

app.post("/Productos/", async(req, res)=>{
	try{
		let usuario=await dataUsuarios(req);
		if(!puedeModificar(usuario)){
			res.sendStatus(403);
			return;
		}
		await createData("infantes",  req, res);
	}catch{
		res.sendStatus(401);
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
		let token=jwt.sign({"usuario":data.usuario}, process.env.JWTSECRET, {expiresIn:900});
		res.json({"token": token, "id":data.usuario});
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

async function log(sujeto, accion, objetoBefore, req, registro){
	let coleccion = req.params.coleccion;
	let objeto = req.body;
	//console.log("Logueando accion:", sujeto, accion, coleccion, objetoBefore, objeto);
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
	nuevoLog["datosNuevos"]= datosNuevos;

	await Bitacora.create(nuevoLog);
}




