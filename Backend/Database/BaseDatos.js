
use("ISSTE");


use("ISSTE");

print("Iniciando la base de datos ISSTE...");
print("¿Eliminar colecciones? (y/n):");
const resp = passwordPrompt();

if (resp.trim().toLowerCase() === "y") {
    print("Eliminando colecciones...");
    db.infantes.drop();
    db.usuarios.drop();
}
else {
    print("No se eliminaron las colecciones.");
}

load("Usuarios.js");
load("Infantes.js");

