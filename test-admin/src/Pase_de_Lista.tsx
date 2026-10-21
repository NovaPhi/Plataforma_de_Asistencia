// Recive los alumnos en forma de array y regresa los alumnos que faltaron y presentes a bd
// recive los presente y faltante de escaneo

// LA API TE VA A REGRESAR UN OBJETO DE USUARIOS, EN EL FORNT VAS A PODER VER LAS ESTANCIAS 
//EN LA PARTE DE CAMBIAR DE SALA, CON EL OBJETO DE LA API VAS A PODER MOSTRAR LAS SALAS QUE TIENE ESE USUAARIO

import{Card, CardHeader, Button, Stack, CardContent, Box,Typography, Chip, List, ListItem, ListItemText, TextField,} from "@mui/material";
import{ useEffect, useState } from 'react';
import { API_URL } from "./config";

type Estado = "PRESENTE" | "FALTA_INJUSTIFICADA";

//objeto con una llave por estado y numero como valor
type Conteos = Record<Estado, number>;

// se usa .map para generar los chips y las cajas de cada fila
const Estados: {key: Estado; label: string}[] =[
    {key:"PRESENTE", label:"Presente"},
    {key: "FALTA_INJUSTIFICADA", label:"Falta"},
];


type Infante = {
    _id: string;
    nombre: string;
    paterno: string;
    materno: string;
    matricula: string;
    horaIngreso?: string;
    Estatus: Estado;
};

//DEBE VENIR DEL USUARIO QUE ESTA LOGGED IN
const GRUPO_ID = "ID_DEL_GRUPO"

const nombreCompleto = (i: Infante) => `${i.nombre} ${i.paterno} ${i.materno}`;

const horaTexto = (iso?: string) => 
    iso ? new Date(iso).toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }) : "";

// el estado es quien escaneo la base esta presente quien no esta marcado como faltante
const estadoBase = (i: Infante): Estado => i.horaIngreso ? "PRESENTE" : "FALTA_INJUSTIFICADA";

// el estatus guardado y si no existe usa e estado base
const estadoDe = (i:Infante): Estado => i.Estatus ?? estadoBase(i);


export const PasaLista = () => {

    const [infantes, setInfantes] = useState<Infante[]>([]);
    
    const [busqueda, setBusqueda] = useState("");
    const [cargando, setCargando] = useState(true); // true mientras llega el GET
    const [guardando, setGuardando] = useState(false); // true mientras se hace el PATCH

    // trae los infantes y la funciones mandan mensaje de error 
    /*
    * Recibe nada en el body y el api deber regresar el grupo del usuario del login
    * Regresa el arreglo en JASON (quien es? ) con los infantes del grupo en el que esta el user
    * avisa si la matricula es int para yo cambiarla a string si la puedes mandar ya como string mejor
    */
    const handleGetData = async () => {
        const request = new Request(`${API_URL}/infantes`, {
            method: "GET",
            headers: new Headers({ "Content-Type": "application/json",
                "Authentication": sessionStorage.getItem("auth") ?? "",
            }),
        });
        try {
            const res = await fetch(request);
            if (res.status < 200 || res.status >= 300) {
                throw new Error(res.statusText);
            }
            setInfantes(await res.json());
        } catch {
            throw new Error("No se pudo cargar la lista de infantes");
        }
    };

    //manda solo las faltas y el schema de asistencia requiere a fuerza el infante y grupo

    /*
    * esto se llama cada vez que hay un escaneo ya sea qr o manual
    * recibe el JASON
    * y regresa
    * Ingreso que es el infante la fecha, el turno , la hora de ingreso el metodo de guardado, y el Estatus como presente 
    * EL PRESENTE NO LO MANDA EL FRONT PORQUE NO ES SEGURO LO MEJOR ES HACER ALGUN TIPO DE TRIGER QUE CAMBIE ESO SI SE DETECTA UNA HORA DE ENTRADA
    * si no existe hora de ingreso la respuesta debereia ser un error con un mensaje de error que diga tipo nunca llego el infante o algo asi
    * si existe guarda la hora de ingreso 
    * lo de clientUUid si es repetido ignorar o rechazar y no se crea otro registro (es para el guardado local)
    */
    const handleSentData = async(
        asistencia: {infante:string;  estatus: Estado}[]
    ) => {
        const request = new Request(`${API_URL}/asistencia`, {
            method: "PATCH",
            body: JSON.stringify({
                grupo: GRUPO_ID,
                //sv-SE de el formato con la hora local
                // toISOstring usa UTC
                fecha: new Date().toLocaleDateString("sv-SE"),
                turno: "MATUTINO",
                asistencia,
            }),
            headers: new Headers({"Content-Type": "application/json"}),
        });
        try{
            const res = await fetch(request);
            if (res.status<200 || res.status >= 300){
                throw new Error(res.statusText);
            }
        }catch{
            throw new Error("No se pudo guardar el pase de lista");
        }
    };

    // el arreglo vacio hace que corra una vez cuando abren la vista y .finally ejecuta para quitar el mensaje cargando
    useEffect(() => {
        handleGetData().catch((error) => {
            console.error(error);
            alert(error.message);
        }).finally(() => setCargando(false));
    },[]);
    
    //Bloque para contar los estudiantes presentes y faltantes
    const presentes = infantes.filter((i) => estadoDe(i) === "PRESENTE").length;
    const faltas = infantes.filter((i) => estadoDe(i) === "FALTA_INJUSTIFICADA").length;

    const conteos: Conteos = { PRESENTE: presentes, FALTA_INJUSTIFICADA: faltas};
    const total = infantes.length;


    // cuantos ya tienen marca osea ya se les tomo asistencia
    const visibles = infantes.filter((i) => 
        `${nombreCompleto(i)} ${i.matricula}`.toLowerCase().includes(busqueda.toLowerCase())
    );

    //mamda a quienes no escanearon y no tienen estatus guardado los presentes ya los tiene la BD por el qr y los que ya tienen estatus no se tocan
    //tipo si tiene medica 
    const guardar = async() => {
        const faltantes = infantes.filter((i) => !i.horaIngreso && !i.Estatus).map((i)=> ({infante: i._id, estatus: "FALTA_INJUSTIFICADA" as Estado}));
        // lo de as Estado es para que ts lo trate como string normal
        setGuardando(true);
        try{
            await handleSentData(faltantes);
            alert("Pase de lista guardado")
        }catch (error){
            console.error(error);
            alert((error as Error).message);
        }finally{
            setGuardando(false) //siempre se activa con el boton error o no
        }
    };

    return (
        // lo que pone las cartas de forma vertical
        <Stack spacing={2}>
            <Card>
                    <CardHeader 
                        title="Pase de Lista" 
                        slotProps={{title: {variant: "h2"}}}
                    /> 
            </Card>

            <Card>
                <CardHeader
                    subheader={`Total de estudiantes: ${total}`}
                />
                <CardContent sx={{pt:0}}>
                    {/*Fila de conteos salta una linea si no caben*/}
                    <Stack 
                    direction={'row'} 
                    flexWrap={"wrap"} 
                    gap={3}
                    alignItems={"center"}>
                        {Estados.map((e) => (
                            // bloque por estado mas el nombre
                            <Box key={e.key} sx={{display: 'flex', alignItems: 'center', gap:1}}>
                                <Typography variant='h5' fontWeight={700}>
                                    {conteos[e.key]}
                                </Typography>
                                <Chip
                                    label={e.label}
                                    variant='outlined'
                                    size='small'
                                    sx={{fontWeight: 600}}
                                />
                            </Box>
                        ))}
                    </Stack>
                </CardContent>
            </Card>
            <Card>
                {/*la zona fija que se pueda ver siempre*/}
                <Box sx={{p:2}}>
                    <TextField
                    fullWidth
                    size='small'
                    label="Buscar Estudiante"
                    placeholder='Nombre o matricula'
                    value={busqueda}
                    onChange={(e)=> setBusqueda(e.target.value)}
                    />
                </Box>

                {cargando && (
                    <Typography color="text.secondary" sx={{p:2}}>
                        Cargando estudiantes...
                    </Typography>
                )}

                {/*Lista con el scroll propio*/}
                <List sx={{ maxHeight: "60vh", overflowY: "auto" }}>
                    {visibles.map((i) => {
                        const estado = estadoDe(i);
                        return (
                            <ListItem
                                key={i._id}
                                divider
                                secondaryAction={
                                    // las cajas de falta y presente sin boton
                                    <Stack direction="row" spacing={1}>
                                        {Estados.map((s) => (
                                            <Button
                                                key={s.key}
                                                size="small"
                                                disableRipple
                                                variant={estado === s.key ? "contained" : "outlined"}
                                                color={
                                                    estado === s.key
                                                        ? s.key === "PRESENTE" ? "success" : "error": "inherit"
                                                }
                                                sx={{ pointerEvents: "none", cursor: "default" }}
                                                tabIndex={-1}
                                            >
                                                {s.label}
                                            </Button>
                                        ))}
                                    </Stack>
                                }
                            >
                                {/* nombre, matrícula y cuando entra */}
                                <ListItemText
                                    primary={nombreCompleto(i)}
                                    secondary={`${i.matricula}${i.horaIngreso ? ` , Ingreso ${horaTexto(i.horaIngreso)}` : ""}`}
                                />
                            </ListItem>
                        );
                    })}
                </List>
            </Card>
            <Card>
                {/*texto a la izquierda boton a la derecha y el flexWrap para que se vea chido en pantalla chica*/}
              <CardContent
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                {/*conteo de presentes y faltas*/}
                <Typography variant="body2" color="text.secondary">
                  {presentes} presentes, {faltas} faltas
                </Typography>
                
                {/*manda el pase de lista a la BD*/}
                <Button
                  variant="contained"
                  size="large"
                  onClick={guardar}
                  // hace que no puedas enviar doble
                  disabled={cargando || guardando}
                >
                    {guardando ? "Guardando..." : "Guardar pase de lista"}
                </Button>
              </CardContent>
            </Card>
        </Stack>
    );
};