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

mongoose.connect("mongodb://127.0.0.1:27017").then(() => {
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


async function getList(collection, req, res){
	let sortBy=req.query._sort;
	let sortOrder=req.query._order=="ASC"?1:-1;
	let inicio=Number(req.query._start);
	let fin=Number(req.query._end);
	let sorter={}
	sorter[sortBy]=sortOrder;
	// Query de mongoose
	let data=await modelos[collection].find({}).sort("id").exec();
	res.set("Access-Control-Expose-Headers", "X-Total-Count");
	res.set("X-Total-Count", data.length);
	data=await data.slice(inicio, fin);
	res.json(data);
}

async function getMany(collection, req, res){
	let data=[]
	for(let index=0;index<req.query.id.length; index++){
		let dataParcial=await modelos[collection].find({id:Number(req.query.id[index])}).toArray();
		data=await data.concat(dataParcial);
	}
	res.json(data);
}

async function getManyReference(collection, req, res){
	let data=await modelos[collection].find(req.query).toArray();
	res.set("Access-Control-Expose-Headers", "X-Total-Count");
	res.set("X-Total-Count", data.length);
	res.json(data);
}

async function getOne(collection, id, req,res){
	let data=await modelos[collection].find({"id":id}).toArray();
	res.json(data[0]);
}

async function updateData(collection, req, res){
	let valores=req.body;
	valores["id"]=Number(valores["id"]);
	let data=await modelos[collection].updateOne({"id":valores["id"]},{"$set":valores});
	data=await modelos[collection].find({"id":valores["id"]}).project({"_id":0}).toArray();
	res.json(data[0]);
}

async function deleteData(collection, id, req, res){
	let data=await modelos[collection].deleteOne({"id":id});
	res.json(data);
}

async function createData(collection, req, res){
	let valores=req.body;
	valores["id"]=Number(valores["id"]);
	let data=await modelos[collection].create(valores);
	res.json(data);

}



app.get("/productos", async (req,res)=>{
	try{
		//let token=req.get("Authentication");
		//let verifiedToken=await jwt.verify(token, process.env.JWTSECRET);
		if("_sort" in req.query){
			console.log("entrando a getList");
			await getList("infantes", req, res);
		}else if("id" in req.query){
			console.log("entrando a getMany");
			await getMany("infantes", req, res);
		}else{
			console.log("entrando a getManyReference");
			await getManyReference("infantes", req, res);
		}
	}catch{
		res.sendStatus(401);	
	}
});

app.get("/Productos/:id", async(req, res)=>{
	await getOne("infantes", Number(req.params.id), req, res);
});

app.put("/Productos/:id", async(req, res)=>{
	await updateData("infantes", req, res);
});

app.delete("/Productos/:id", async(req, res)=>{
	await deleteData("infantes", Number(req.params.id), req, res);
});

app.post("/Productos/", async(req, res)=>{
	await createData("infantes",  req, res);
});




app.post("/registrarse", async(req, res)=>{
	let user=req.body.username;
	let pass=req.body.password;
	let data=await Usuario.findOne({"usuario":user});
	//console.log(data);
	if (data==null){
		const hash=await argon2.hash(pass, {type: argon2.argon2id, memoryCost: 64*1024, timeCost:3, parallelism:1, saltLength:128});
		await Usuario.create({"usuario": user, "passwordHash": hash});
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
		let token=jwt.sign({"usuario":data.usuario}, "llavesecreta", {expiresIn:900});
		res.json({"token": token, "id":data.usuario});
	}else{
		res.sendStatus(401);
	}
});





