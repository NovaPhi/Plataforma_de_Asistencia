import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import argon2 from "argon2";
import jwt from "jsonwebtoken";

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

mongoose.connect(MONGO_URL).then(() => {
  console.log("Conectado a la base de datos");
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
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

// Actualiza un registro de una coleccion por su id
async function updateData(collection, req, res){
	let valores=req.body;
	valores["id"]=valores["id"];
	let data=await modelos[collection].updateOne({"_id":valores["id"]},{"$set":valores});
	data=await modelos[collection].findOne({"_id":valores["id"]}).exec();
	res.json(data);
}

// Borra un registro de una coleccion por su id
async function deleteData(collection, id, req, res){
	let data=await modelos[collection].deleteOne({"_id":id});
	res.json(data);
}

// Crea un registro de una coleccion
async function createData(collection, req, res){
	let valores=req.body;
	valores["id"]=Number(valores["id"]);
	let data=await modelos[collection].create(valores);
	res.json(data);

}



app.get("/productos", async (req,res)=>{
	try{
		let usuario=await dataUsuarios(req);
		let campos=camposVisibles(usuario);
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
});

app.get("/Productos/:id", async(req, res)=>{
	await getOne("infantes", req.params.id, req, res);
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





