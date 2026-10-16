//BOTON QUE COLAPSE LA LISTA DE EL ESQUEMA  
//LA API MANDA OBJETOS USA NOTACION PUNTO
// recibe todos los bloques de la api y regresa cualquier cambio hecho en front
import { useEffect, useState } from "react";
import { Box, Card, CardContent, CardHeader,Stack, Button, Dialog, DialogTitle, DialogContent, TextField, MenuItem, DialogActions } from "@mui/material"
import {DataTable,ListContextProvider,ResourceContextProvider,useList,DateField, EmailField, Pagination} from "react-admin"


// los registros de la BD 
type Register = {_id: string; [campo: string]: unknown};

//Lo que regresa el get que esto lo que hace es una llave por coleccion cada una es un array de registros
type DB = {
    usuarios: Register[];
    estancias: Register[];
    grupos: Register[];
    salas: Register[];
    infantes: Register[];
    tutores: Register[];
};

type Coleccion = "usuarios" | "estancias" | "grupos" | "salas" | "infantes" | "tutores";

// REACT NECESITA UN CAMPO ID NO SE SI YA LO CAMBIAN A ID PERO POR SI ACASO SE HACE EL CAMBIO A ID
//La funcion copio _id a id el [] evita errores mientras la api no responde
const conId = (filas: Register[] = []) => filas.map((f) => ({...f, id: f._id}));

//Funcion base del post y patch arma el request manda el jason y revisa el status
//Se conserva el menaje que mande el backend para mostrar la alerta
const enviar = async (method: "POST" | "PATCH", url: string, body:object) => {
    const request = new Request(url, {
        method,
        body: JSON.stringify(body),
        headers: new Headers({"Content-Type": "application/json"}),
    });
    let res: Response;
    try{
        res = await fetch(request);
    } catch{
        throw new Error("Error de conexioncon el servidor");
    }
    if (res.status < 200 || res.status >= 300) {
        throw new Error((await res.text()) || res.statusText);
    }
};

/*
* el POST llama en estilo :coleccion porque toma cualquier coleccion previamente definida
* Se llama al picar GUARDAR en el dialogo cuando es un registro nuevo
* recibe el Jason con todos los campos del registro
* regresa el codigo 2xx si se crea algo 
* el backend checa el activo true
* si falla regresa alerta 4xx con el mensaje 
*/
const handleCreate = (coleccion:Coleccion, datos: object) =>
    enviar("POST", `${"http://localhost:3000/Pase_de_Lista/base_de_datos"}/${coleccion}`, datos);

/*
* el patch se llama al picar guardar en el dialogo cuando se edita un registro
* solo recibe el jason con los campos a cambiar 
* EL FRONT MANDA EL REGISTRO ENTERO CON _ID, ID Y OBJETOS EMBEDIDOS
* el back solo acepta los campos permitidos de cada coleccion no solo pases el req.body directo
* regresa los mismos codigos que el handle delete
*/
const handleEdit = (coleccion: Coleccion, id:string, datos: object) =>
    enviar("PATCH", `${"http://localhost:3000/Pase_de_Lista/base_de_datos"}/${coleccion}/${id}`, datos);

/*
* API Patch se llama al picar eliminar y ya despues se tiene que confirmar (el patch es como edit pero solo ciertos datos)
* esto es el borrado logico no se borra solo se cambia el elemto active a false
* regresa mensaje 2xx si se actualiza
* despues de esto el get no manda registro
*/
const handleDelete = (coleccion:Coleccion, id:string) =>
    handleEdit(coleccion, id, {activo: false});

export const VBD = () => {

    // se usan los hooks use state para renderizar la info y cambiar por decier asi el estado de 
    // ciertas funciones como el guardando que es para un disable que no deja llamar la funcion de guardar
    // mientras se esta enviando la informacion por eso es use state tiene la parte de guardando que desabilita
    // guardar y despues desabilita guardando y habilita guaradr
    const [dialogo, setDialogo] = useState<{coleccion: Coleccion; registro?: Register} | null>(null);
    const [datos, setDatos] = useState<Record<string, string>>({});
    const [guardando,setGuardando] = useState(false);
    const [bd, setbd] = useState<Partial<DB>>({});

    // abre la ventana de dialogo par con la coleccion que se creo
    // se haga una funcion que sean para todos los dialogos sean iguales 
    const abrirNuevo = (coleccion: Coleccion) => {
        setDatos({});
        setDialogo({coleccion});
        
    }

    // Abre el dialogo con los valores del boton que se pico editar
    // copia los registros completos pero el AS solo le dice al 
    // typescript que es string como prepo entrando a un antro con ine falsa
    // EL PATCH MANDA TODO LOS DATOS QUE PUEDEN SER _ID Y ESO PERO EL BACK ES EL QUE TIENE QUE FILTRAR 
    // QUE CAMPOS SI SON PERMITIDOS
    const abrirEditar = (coleccion: Coleccion, registro:Register) => {
        setDatos(registro as Record<string, string>);
        setDialogo({coleccion,registro});
    }

    //crea o edita segun el dialogo cierra y vuelve a cargar las tablas para ver la info actualizada
    const guardar = async () => {
        if (!dialogo) return;
        setGuardando(true);
        try {
            if (dialogo.registro){
                await handleEdit(dialogo.coleccion, dialogo.registro._id, datos);
            } else {
                await handleCreate(dialogo.coleccion, datos);
            }
            setDialogo(null);
            await handleGetData();
        } catch (error){
            alert((error as Error).message);
        }finally{
            setGuardando(false); // hace que siempre se reactive el botton no importa si haya error o no
        }
    }

    // cambia el valor de activo de true a false y la api ya no lo manda por lo que desaparece de la tabla
    const borrar = async (coleccion: Coleccion, registro: Register) => {
        if (!window.confirm("Borrar el registro?")) return;
        try{
            await handleDelete(coleccion, registro._id);
            await handleGetData();
        } catch (error) {
            alert((error as Error).message);
        }
    };


    {/* 
    * esto se llama cuando se carga la pagina por primera vez y despues de cada valor que se cambia ya sea crear editar o borrar
    * no recibe nada como tal en el body
    * regresa un objeto con una llave por coleccion y cada una es un arreglo estilo
    * {usuarios: [], estancias: [], etc...}
    * cada registro debera de traer el _id ya aqui se cambia a id para que el react admin no tenga pedo
    * si una coleccion esta vacia debera de mandar [] y no omitirla
    * no mandes los registros con activo = falso ya que es lo que deberia de filtrar para el borrado logico
    * nunca se manda la contrasena 
    * el educador de grupos espero que me lo mandes como string o se rompe esta madre la info deberia de ser _id
    */}
    const handleGetData = async () => {
        const request = new Request("http://localhost:3000/PASE_DE_LISTA/base_de_datos", {
            method: "GET",
            headers: new Headers({"Content-Type": "application/json"}),
        });
        try{
            const res = await fetch(request);
            if (res.status<200 || res.status >= 300){
                throw new Error(res.statusText);
            }
            setbd(await res.json());
        }catch{
            throw new Error("No se pudo cargar la base de datos");
        }
    };

    // si hay un arreglo vacio [] hace que no se vuelva a correr excepto cuando se habre la pantalla para evitar errores
    useEffect(() => {
        handleGetData().catch((error) => {
            console.error(error);
            alert(error.message);
        });
    }, []);


    // genera las listas separadas por coleccion lo de per page es que se hacen como paginas 
    //de 10 elementos cada una esto se pude cambiar vamo viendo como se va viendo

    // CHANCE CAMBIAR A USEMEMO SI CREA LOOPS O TIENE PROBLEMAS
    const listUsuarios = useList({ data: conId(bd.usuarios), perPage: 10})
    const listEstancias = useList({ data: conId(bd.estancias), perPage: 10 })
    const listGrupos = useList({ data: conId(bd.grupos), perPage: 10 })
    const listInfantes = useList({ data: conId(bd.infantes), perPage: 10 })
    const listTutores = useList({ data: conId(bd.tutores), perPage: 10 })




    return (
        <Stack spacing={2}>
            <Card>
                <CardHeader title="Vista de Base de datos" />
            </Card>
            <Card sx={{ minWidth: 0, maxWidth: "100%" }}>
                <CardHeader 
                    title="Usuarios"
                    action={<Button variant = "contained" onClick={() => abrirNuevo("usuarios")}> Nuevo </Button>}
                
                />
                {/*Resource context provider y list context provider le dan a la Datatable los datos sin usar el dataprovider y solo con los datos que recibe*/}
                <ResourceContextProvider value="Usuarios">
                    <ListContextProvider value={listUsuarios}>
                        <CardContent sx={{pt: 0}}>
                            <Box>
                                <DataTable bulkActionButtons={false} >
                                    <DataTable.Col source="NumEmpleado"/>
                                    <DataTable.Col source="Usuario"/>
                                    <DataTable.Col source="Nombre"/>
                                    <DataTable.Col source="Paterno"/>
                                    <DataTable.Col source="Materno"/>
                                    <DataTable.Col source="Correo" field={EmailField}>
                                    </DataTable.Col>
                                    <DataTable.Col source="Telefono"/>
                                    <DataTable.Col source="Rol"/>
                                    <DataTable.Col label="Acciones" render={(r:Register) => (
                                        <Box sx={{display: "flex", gap: 1}}>
                                            <Button size="small" onClick={() => abrirEditar("usuarios", r)}>Editar</Button>
                                            <Button size="small" color="error" onClick={() => borrar("usuarios",r)}>Eliminar</Button>
                                        </Box>
                                    )}
                                    />
                                </DataTable>
                                {/**
                                 * lo que hace que se vean las paginas de datos
                                 * PONER ROWSPERPAGEOPTIONS ={[MIN, MED, MAX]}
                                 * PARA QUE SE VEAN LAS OPCIONES CALAR CUANTOS PONER PARA QUE SEA MEJOR DESPUES DE QUE TENGAMOS LA VIEW DE API
                                 */}
                                <Pagination/>  
                            </Box>
                        </CardContent>
                    </ListContextProvider>
                </ResourceContextProvider>
            </Card>
            <Card>
                <CardHeader title="Estancias"/>
                <ResourceContextProvider value="Estancias">
                    <ListContextProvider value={listEstancias}>
                        <CardContent sx={{pt: 0}}>
                            <Box>
                                <DataTable bulkActionButtons={false}>
                                    <DataTable.Col source="EBDI"/>
                                    <DataTable.Col source="nombre"/>
                                    <DataTable.Col source="Ur"/>
                                    <DataTable.Col source="Domicilio"/>
                                    <DataTable.Col source="telefono" />
                                    {/*use notacion punto por lo que quedamos que lo recibe como un objeto y no como arreglo AVISAR PARA CAMBIAR */}
                                    <DataTable.Col source="salas.nombre" label="Sala"/>
                                    <DataTable.Col source="salas.capacidad" label="Capacidad de la sala"/>
                                    <DataTable.Col label="Acciones" render={(r:Register) => (
                                        <Box sx={{display: "flex", gap: 1}}>
                                            <Button size="small" onClick={() => abrirEditar("estancias", r)}>Editar</Button>
                                            <Button size="small" color="error" onClick={() => borrar("estancias",r)}>Eliminar</Button>
                                        </Box>
                                    )}
                                    />
                                </DataTable>
                                <Pagination/>
                            </Box>
                        </CardContent>
                    </ListContextProvider>
                </ResourceContextProvider>
                
            </Card>
            <Card>
                <CardHeader title="Grupos"/>
                {/* <DataTable source="Infantes.Matricula" label="Matricula"/>*/}
                <ResourceContextProvider value="Grupos">
                    <ListContextProvider value={listGrupos}>
                        <DataTable bulkActionButtons={false}>
                            <DataTable.Col source="estancia._id" label="Id de estancia"/>
                            <DataTable.Col source="sala"/>
                            <DataTable.Col source="cicloescolar"/>
                            <DataTable.Col source="turno"/>
                            <DataTable.Col source="educador"/>
                            <DataTable.Col label="Acciones" render={(r:Register) => (
                                <Box sx={{display: "flex", gap: 1}}>
                                    <Button size="small" onClick={() => abrirEditar("grupos", r)}>Editar</Button>
                                    <Button size="small" color="error" onClick={() => borrar("grupos",r)}>Eliminar</Button>
                                </Box>
                            )}
                            />
                        </DataTable>
                        <Pagination/>
                    </ListContextProvider>
                </ResourceContextProvider>
            </Card>
            <Card sx={{ minWidth: 0, maxWidth: "100%" }}>
                <CardHeader title="Infantes" />     
                <CardContent sx={{ pt: 0 }}>
                    <ResourceContextProvider value="infantes">
                        <ListContextProvider value={listInfantes}>
                            <DataTable bulkActionButtons={false}>
                                <DataTable.Col source="Id"/>
                                <DataTable.Col source="Matricula"/>
                                <DataTable.Col source="Ur"/>
                                <DataTable.Col source="EBDI"/>
                                <DataTable.Col source="Nombre"/>
                                <DataTable.Col source="Paterno"/>
                                <DataTable.Col source="Materno"/>
                                <DataTable.Col source="Genero"/>
                                <DataTable.Col source="Curp"/>
                                <DataTable.Col source="Fnac" field={DateField}/>
                                <DataTable.Col source="Freg" field={DateField}/>
                                <DataTable.Col source="Inscripcion" field={DateField}/>
                                <DataTable.Col label="Acciones" render={(r:Register) => (
                                    <Box sx={{display: "flex", gap: 1}}>
                                        <Button size="small" onClick={() => abrirEditar("infantes", r)}>Editar</Button>
                                        <Button size="small" color="error" onClick={() => borrar("infantes",r)}>Eliminar</Button>
                                    </Box>
                                )}
                                />
                            </DataTable>
                            <Pagination />
                        </ListContextProvider>
                    </ResourceContextProvider>        
                </CardContent>
            </Card>
            <Card>
                <CardHeader title="Tutores"/>
                <CardContent sx={{pt: 0}}>
                    <ResourceContextProvider value="Tutores">
                        <ListContextProvider value={listTutores}>
                            <DataTable bulkActionButtons={false}>
                                <DataTable.Col source="nombre"/>
                                <DataTable.Col source="paterno"/>
                                <DataTable.Col source="materno"/>
                                <DataTable.Col source="curp"/>
                                <DataTable.Col source="telefono"/>
                                <DataTable.Col source="correo" field={EmailField}/>
                                <DataTable.Col source="codigoCredencial"/>
                                {/* como infantes es un array no se puede usar el . lo que hace esto es agarrar el nombre poner un espacio y agarrar el apellido  */}
                                <DataTable.Col
                                    label="Lista de infantes"
                                    render={(g) => 
                                        g.infantes?.map((i: any) => 
                                            `${i.nombre} ${i.paterno}`).join(", ") ?? ""}
                                />
                                <DataTable.Col label="Acciones" render={(r:Register) => (
                                    <Box sx={{display: "flex", gap: 1}}>
                                        <Button size="small" onClick={() => abrirEditar("tutores", r)}>Editar</Button>
                                        <Button size="small" color="error" onClick={() => borrar("tutores",r)}>Eliminar</Button>
                                    </Box>
                                )}
                                />
                            </DataTable>
                            <Pagination/>
                        </ListContextProvider>
                    </ResourceContextProvider>
                </CardContent>
            </Card>

            {/*el dialogo esto hace que solo exista mientras que este abierto y cuando lo cierra se borra para que el nuevo se abra limpio */}
            {dialogo && (
                <Dialog open onClose={() => setDialogo(null)} fullWidth maxWidth="sm">
                    <DialogTitle>
                        {dialogo.registro ? "Editar" : "Nuevo"}, {dialogo.coleccion}
                    </DialogTitle>

                    <DialogContent sx={{display: "grid", gap: 2, pt:2}}>
                        {/**
                         * cada bloque solo aparece paraa su coleccion
                         * basicamente dice primero abre el dialogo de la coleccion x 
                         * despues este es el nombre que va a ver el ususario por dato que es lo que hace un textfield
                         * el label es lo que ve el usuario 
                         * en value se pone el valor estilo datos.valor ya que esta dentro de un objeto o se pone vacio en caso de crear o editar si no encuentra el valor
                         * desspues el onchange es el dato que se cambia dice on change e (es el identificador) set datos y es daato anterior (dato anterior, dato: el dato a cambiar)
                         */}
                        {dialogo.coleccion === "usuarios" && (
                            <>
                                <TextField
                                    label="Número de Empleado"
                                    value={datos.numEmpleado ?? ""}
                                    onChange={(e) => setDatos((prev) => ({ ...prev, numEmpleado: e.target.value }))}
                                />
                                <TextField
                                    label="Usuario"
                                    value={datos.usuario ?? ""}
                                    onChange={(e) => setDatos((prev) => ({ ...prev, usuario: e.target.value }))}
                                />
                                <TextField
                                    label="Nombre"
                                    value={datos.nombre ?? ""}
                                    onChange={(e) => setDatos((prev) => ({ ...prev, nombre: e.target.value }))}
                                />
                                <TextField
                                    label="Apellido paterno"
                                    value={datos.paterno ?? ""}
                                    onChange={(e) => setDatos((prev) => ({ ...prev, paterno: e.target.value }))}
                                />
                                <TextField
                                    label="Apellido materno"
                                    value={datos.materno ?? ""}
                                    onChange={(e) => setDatos((prev) => ({ ...prev, materno: e.target.value }))}
                                />
                                <TextField
                                    label="Correo"
                                    type="email"
                                    value={datos.correo ?? ""}
                                    onChange={(e) => setDatos((prev) => ({ ...prev, correo: e.target.value }))}
                                />
                                <TextField
                                    label="Telefono"
                                    value={datos.telefono ?? ""}
                                    onChange={(e) => setDatos((prev) => ({ ...prev, telefono: e.target.value }))}
                                />
                                <TextField
                                    label="Rol"
                                    value={datos.rol ?? ""}
                                    onChange={(e) => setDatos((prev) => ({ ...prev, rol: e.target.value }))}
                                />
                                {!dialogo.registro && (
                                    <TextField
                                        label="Contrasena"
                                        type="password"
                                        value={datos.password ?? ""}
                                        onChange={(e) => setDatos((prev) => ({...prev, password: e.target.value}))}
                                    />
                                )}
                            </>
                        )}

                        {dialogo.coleccion === "estancias" && (
                            <>
                                <TextField
                                    label="EBDI"
                                    value={datos.EBDI ?? ""}
                                    onChange={(e) => setDatos((prev) => ({ ...prev, EBDI: e.target.value }))}
                                />
                                <TextField
                                    label="Nombre"
                                    value={datos.nombre ?? ""}
                                    onChange={(e) => setDatos((prev) => ({ ...prev, nombre: e.target.value }))}
                                />
                                <TextField
                                    label="UR"
                                    value={datos.Ur ?? ""}
                                    onChange={(e) => setDatos((prev) => ({ ...prev, ur: e.target.value }))}
                                />
                                <TextField
                                    label="Domicilio"
                                    value={datos.Domicilio ?? ""}
                                    onChange={(e) => setDatos((prev) => ({ ...prev, domicilio: e.target.value }))}
                                />
                                <TextField
                                    label="Telefono"
                                    value={datos.telefono ?? ""}
                                    onChange={(e) => setDatos((prev) => ({ ...prev, telefono: e.target.value }))}
                                />                                
                            </>
                        )}

                        {dialogo.coleccion === "grupos" && (
                            <>
                                <TextField
                                    label="Sala"
                                    value={datos.sala ?? ""}
                                    onChange={(e) => setDatos((prev) => ({ ...prev, sala: e.target.value }))}
                                />
                                <TextField
                                    label="Ciclo Escolar"
                                    value={datos.cicloescolar ?? ""}
                                    onChange={(e) => setDatos((prev) => ({ ...prev, cicloescolar: e.target.value }))}
                                />
                                <TextField
                                    label="Turno"
                                    value={datos.turno ?? ""}
                                    onChange={(e) => setDatos((prev) => ({ ...prev, turno: e.target.value }))}
                                />
                                {/**
                                 * educaddor es una referencia por lo que lo convertimos que el nombre se ponga y solo se guarda el _id
                                 */}
                                <TextField
                                    label="Educador"
                                    value={datos.educador ?? ""}
                                    onChange={(e) => setDatos((prev) => ({ ...prev, educador: e.target.value }))}

                                >
                                    {/**
                                     * solo agarra los usuaarios si tienen rol docente
                                     */}
                                    {(bd.usuarios ?? []).map((u: any) => (
                                    <MenuItem key={u._id} value={u._id}>
                                    {u.Nombre ?? u.nombre} {u.Paterno ?? u.paterno}
                                    </MenuItem>
                                    ))}
                                </TextField>
                            </>
                        )}

                        {dialogo.coleccion === "infantes" && (
                            <>
                                <TextField
                                    label="Matricula"
                                    value={datos.Matricula ?? ""}
                                    onChange={(e) => setDatos((prev) => ({ ...prev, matricula: e.target.value }))}
                                />
                                <TextField
                                    label="UR"
                                    value={datos.UR ?? ""}
                                    onChange={(e) => setDatos((prev) => ({ ...prev, ur: e.target.value }))}
                                />
                                <TextField
                                    label="EBDI"
                                    value={datos.EBDI ?? ""}
                                    onChange={(e) => setDatos((prev) => ({ ...prev, ebdi: e.target.value }))}
                                />
                                <TextField
                                    label="Nombre"
                                    value={datos.nombre ?? ""}
                                    onChange={(e) => setDatos((prev) => ({ ...prev, nombre: e.target.value }))}
                                />
                                <TextField
                                    label="Apellido Paterno"
                                    value={datos.paterno ?? ""}
                                    onChange={(e) => setDatos((prev) => ({ ...prev, paterno: e.target.value }))}
                                />
                                <TextField
                                    label="Apellido Materno"
                                    value={datos.materno ?? ""}
                                    onChange={(e) => setDatos((prev) => ({ ...prev, materno: e.target.value }))}
                                />
                                <TextField
                                    label="Genero"
                                    value={datos.genero ?? ""}
                                    onChange={(e) => setDatos((prev) => ({ ...prev, genero: e.target.value }))}
                                />
                                <TextField
                                    label="CURP"
                                    value={datos.curp ?? ""}
                                    onChange={(e) => setDatos((prev) => ({ ...prev, curp: e.target.value }))}
                                />
                                <TextField
                                    label="Fecha de Nacimiento"
                                    value={datos.fnac ?? ""}
                                    onChange={(e) => setDatos((prev) => ({ ...prev, fnac: e.target.value }))}
                                />
                                <TextField
                                    label="Fecha de Registro"
                                    value={datos.freg ?? ""}
                                    onChange={(e) => setDatos((prev) => ({ ...prev, freg: e.target.value }))}
                                />
                                <TextField
                                    label="Insicripcion"
                                    type="date"
                                    slotProps={{inputLabel: {shrink:true}}}
                                    value={(datos.inscripcion ?? "").slice(0,10)}
                                    onChange={(e) => setDatos((prev) => ({ ...prev, inscripcion :e.target.value }))}
                                />
                            </>
                        )}

                        {dialogo.coleccion === "tutores" && (
                            <>
                                <TextField
                                    label="Nombre"
                                    value={datos.nombre ?? ""}
                                    onChange={(e) => setDatos((prev) => ({ ...prev, nombre: e.target.value }))}
                                />
                                <TextField
                                    label="Apellido Paterno"
                                    value={datos.paterno ?? ""}
                                    onChange={(e) => setDatos((prev) => ({ ...prev, paterno: e.target.value }))}
                                />
                                <TextField
                                    label="Apellido Matrno"
                                    value={datos.materno ?? ""}
                                    onChange={(e) => setDatos((prev) => ({ ...prev, materno: e.target.value }))}
                                />
                                <TextField
                                    label="CURP"
                                    value={datos.curp ?? ""}
                                    onChange={(e) => setDatos((prev) => ({ ...prev, curp: e.target.value }))}
                                />
                                <TextField
                                    label="Telefono"
                                    value={datos.telefono ?? ""}
                                    onChange={(e) => setDatos((prev) => ({ ...prev, telefono: e.target.value }))}
                                />
                                <TextField
                                    label="Correo"
                                    type="email"
                                    value={datos.correo ?? ""}
                                    onChange={(e) => setDatos((prev) => ({ ...prev, correo: e.target.value }))}
                                />
                                <TextField
                                    label="Codigo de Credencial"
                                    value={datos.codigoCredencial ?? ""}
                                    onChange={(e) => setDatos((prev) => ({ ...prev, codigoCredencial: e.target.value }))}
                                />
                            </>
                        )}

                    </DialogContent>
                    <DialogActions sx={{p:2}}>
                        <Button onClick={() => setDialogo(null)}>Cancelar</Button>
                        {/**
                         * el disabled evita el doble envio mientras se guarda
                         */}
                        <Button variant="contained" onClick={guardar} disabled={guardando}>
                            {guardando ? "Giardando..." : "Guardar"}
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </Stack>
    )
}