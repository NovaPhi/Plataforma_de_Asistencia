
use("ISSTE");


use("ISSTE");

print("Iniciando la base de datos ISSTE...");
print("¿Eliminar colecciones? (y/n):");
const resp = passwordPrompt();

if (resp.trim().toLowerCase() === "y") {
    print("Eliminando colecciones...");
    db.infantes.drop();
    db.usuarios.drop();
    db.estancias.drop();
    db.grupos.drop();
    db.tutores.drop();
    db.asistencias.drop();
    db.tickets.drop();
    db.asesorias.drop();
    db.notasConfidenciales.drop();
    db.consentimientos.drop();
    db.bitacora.drop();
    db.historico.drop();
}
else {
    print("No se eliminaron las colecciones.");
}

load("Usuarios.js");
load("Infantes.js");
load("Estancias.js");
load("Grupos.js");
load("Tutores.js");
load("Asistencias.js");
load("Tickets.js");
load("Asesorias.js");
load("NotasConfidenciales.js");
load("Consentimientos.js");
load("Bitacora.js");
load("Historico.js");

