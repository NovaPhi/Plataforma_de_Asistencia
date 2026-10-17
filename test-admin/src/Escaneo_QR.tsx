import { useEffect, useRef, useState } from "react";
import {Box, Card, CardHeader, Grid, Stack, Typography, Button, ToggleButtonGroup, ToggleButton, CardContent, Avatar, Alert, TextField, ListItem, List, ListItemText} from "@mui/material";
import { Html5Qrcode } from "html5-qrcode";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";

// Reemplazar con conexiones api
// elige si entran o salen
type Tipo = "Ingreso" | "Egreso";

// resultado del ultimo scan bueno
type Scan = {
    Nombre: string;
    Matricula: string;
    Hora: string;
    tipo: Tipo;
};


// fila de la lista ultimos registros
type Registro = {
  Id: string;
  Hora: string;
  Nombre: string;
  tipo: Tipo;
};

type Infante ={
    _id: string;
    nombre: string;
    paterno: string;
    materno: string;
    matricula: string;
};

type Metodo = "QR" | "MANUAL";

const GRUPO_ID = "665f1c2e8b3a4d0012ab34cd";

const nombreCompleto = (i:Infante) => `${i.nombre} ${i.paterno} ${i.materno}`; 

// devuelve las iniciales de un nombre para que el resultado se vea chido como en correos y asi
const iniciales = (nombre: string) =>
    nombre.split(" ").slice(0, 2). map((p)=> p[0]).join("").toUpperCase();

// QR Reader
const ELEMENT_ID = "lector-qr";

// recibe onScan que es funcion de la libreria
const LectorQR = ({ onScan }: { onScan: (texto: string) => void }) => {
    //guarda la ultima version de onScan para no reiniciar la camara
    // cuando cambia de ingreso a egreso
    const onScanRef = useRef(onScan);
    onScanRef.current = onScan; // siempre la última versión

    // evita registrar el mismo QR muchas veces seguidas
    // se acuerda del ultimo texto leido y cuadno lo leyo
    const ultimo = useRef({ texto: "", t: 0 });

    // se ejecuta una sola vez al prender la camara como constructor
    useEffect(() => {
    const scanner = new Html5Qrcode(ELEMENT_ID);

    // inicia la camara
    const iniciando = scanner.start(
        // usa la camara trasera si existe
        { facingMode: "environment" },
        { 
          fps: 10, // veces que lee por segundo

          // zona de lectura
          qrbox: (ancho: number, alto: number) => ({
              width: Math.floor(ancho),
              height: Math.floor(alto)  
          }),
        },
        // se ejecuta cuando detecta un QR
        (texto) => {
          const ahora = Date.now();
          // ignora si se lee el mismo codigo durante 3 segundos
          if (texto === ultimo.current.texto && ahora - ultimo.current.t < 3000) return;
          ultimo.current = { texto, t: ahora };
          // le dice que ya leyo el text y se lo da
          onScanRef.current(texto);
        },
        // se ignora cuando no lee un QR
        undefined
    );

    // si no puede abrir la camara el pobre lo muesra en consola como error CONVERTIR EN UN POPUP DE ERROR QUE DESAPREZCA
    iniciando.catch((err) => console.error("No se pudo abrir la cámara:", err));

    // limpia todo cuando se sale de la camara y para la camara
    return () => {
      iniciando
        .then(() => scanner.stop())
        .then(() => scanner.clear())
        .catch(() => {});
    };
  }, []);

  // contenedor donde la libreria dibuja el video
  return <div id={ELEMENT_ID} style={{ width: "100%", height: "100%" }} />;
};

export const Escaneo_Credencial = () =>{
    const [tipo, setTipo] = useState <Tipo>("Ingreso");
    const [leido, setLeido] = useState<Scan | null>(null);
    const [errorScan, setErrorScan] = useState("");
    const [Registros, setRegistros] = useState<Registro[]>([]);
    const [manual,setManual] = useState("");
    const [infantes, setInfantes] = useState<Infante[]>([]);


    /*
    * se llama una vez al abrir la pantalla
    * no recibe nada
    * regresa un arreglo con los infantes que puede accesar el usaurio
    * estilo [{_id,nombre, etc..}]
    * la matricula debe ser string ya que asi viene en el qr y la trae como texto y es lo que usa para comparar valor y encontrar chamacos
    * no mandes los infantes con activo: false que se supone que estan borrados
    * seguimos con los mismos mensajes de falla de 4xx o 5xx
    */
    const handleGetData = async() => {
        const request = new Request("http://localhost:3000/Pase_de_Lista/infantes", {
        method: "GET",
        headers: new Headers({ "Content-Type": "application/json" }),
    });
        try{
            const res = await fetch(request);
            if (res.status < 200 || res.status >= 300){
                throw new Error(res.statusText);
            }
            setInfantes(await res.json());
        } catch{
            throw new Error("No se pudo cargar la lista de infantes");
        }
    };

    /*
     * esto se llama cada vez que hay un escaneo ya sea qr o manual
    * recibe el jaosn con infante (id), grupo, si llego o se va, y el metodo osea si es por qr o manual
    * si es que llego guarda la hora de ingreso el metodo y la fecha del infante
    * regres 2xx si se guarda (esto es pa todo)
    * EL STATUS PRESENTE LO TIENE QUE CAMBIAR AUTOMATICAMENTE EN API POQUE NO ES SEGURO Y SE PUEDE FALSIFICAR UN ESTADO PRESENTE
    * QUE UN TRIGGER EN BACK LO PONGA CON LA HORA DE INGRESO
    * SI VIENE UN STATUS ESPECIAL DE TICKECT NO LO CAMBIES 
    * SE EL CHAMACO VA A SALIR Y NO EXISTE HORA DE ENTRADA LA RESPUESTA DEBERA SER UN ERROR 4XX
    * si existe hora de ingreso guarda la hora de engreso y no cambia el status 
    * lo de cliente Uuid si esta repetido ignorar si no se crea otro registro para hacer mas facil luego hacer el gualdado local
    */
    const handleSentData = async (infantes: Infante, metodo: Metodo) => {
        console.log("INFANTE RECIBIDO:", infantes);
        console.log("_id:", infantes._id, "| id:", (infantes as any).id);
        const request = new Request("http://localhost:3000/Pase_de_Lista/escaneo", {
            method: "POST",
            body: JSON.stringify({
                matricula: infantes.matricula,
                grupo: GRUPO_ID,
                tipo,
                metodo,
                fecha: new Date(). toLocaleDateString("sv-SE"),
                turno: 'MATUTINO',
                capturadoEN: new Date().toISOString(),
                // genera un id unico por escaneo que es usado para evitar registros duplicados
                clientUuid: crypto.randomUUID(), 
            }),
            
            headers: new Headers({"Content-Type": "application/json"}),
        });
        
        console.log("Enviando datos al backend:", request.body);
        let res: Response;
        try{
            res = await fetch(request);
        } catch{
            throw new Error("Error de conexion con el servidor");
        }
        if (res.status < 200 || res.status >= 300){
            const msg = await res.text();
            throw new Error(msg || res.statusText);
        }
    };

    useEffect(()=>{
        handleGetData().catch((error)=>{
            console.error(error);
            setErrorScan(error.message);
        });
    }, []);
    

    // se llama cuando encuentra el qr o se le da el texto manual
    const alEscanear = async (texto: string, metodo:Metodo) => {
        // limpia espacios
        const matricula = texto.trim();
        if (!matricula) return;
        // Busca al bro con la matricula que coincida
        const est = infantes.find((i) => i.matricula === matricula);
        
        // no existe muestra el error y termina
        if(!est) {
            setLeido(null);
            setErrorScan(`Credencial no reconocida: ${texto}`);
            return;
        }
        // hora actual del dispositivo
        const hora = new Date().toLocaleTimeString("es-MX", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });

        // debe validar la reglas de egreso sin ingreso
        try{
            await handleSentData(est, metodo);
        } catch(error){
            console.error(error);
            setLeido(null);
            setErrorScan((error as Error).message);
            return;
        }
        
        //limpia el error si es una buena lectura y lo muestra aqui va le post a la api con la regla de que no hay egreso sin ingreso lo valida con la backend
        //AGREGAR MENSAJE DE ERROR CUANDO INTENTA SALIR SIN ENTRAR
        setErrorScan("");
        setLeido({
            Nombre: nombreCompleto(est),
            Matricula: est.matricula,
            tipo,
            Hora:hora,
        });
        setManual("");
        // agrega registro al inicio de la lista 
        setRegistros((prev) => 
            [{Id: `${est._id}-${Date.now()}`, Hora: hora, Nombre: est.nombre, tipo }, ...prev]
        );

        setManual("");
    };

    return(
        <Grid spacing={3}>
            <Card>
                <CardHeader
                    title = "Escaneo de Codigo QR"
                    sx={{
                        //centra el selector y quita margenes
                        "& .MuiCardHeader-action":{
                            alignSelf: "center",
                            marginTop: 0,
                            marginRight: 0,
                        },
                    }}
                    // selector de modo que solo sea uno a la vez
                    action={
                        <ToggleButtonGroup
                        value={tipo}
                        exclusive
                        size="large"
                        // hace que si se toca de nuevo el mismo boton no haga nada
                        onChange={(_,v: Tipo|null) => v && setTipo(v)}
                        sx = {{"& .MuiToggleButton-root": {textTransform: "none", fontWeight: 600, gap:1}}}
                        >
                            <ToggleButton value= "Ingreso">
                                Ingreso
                            </ToggleButton>
                            <ToggleButton value="Egreso">
                                Egreso
                            </ToggleButton>
                        </ToggleButtonGroup>
                    }
                    slotProps={{
                        title: {variant: "h4"}
                    }}
                />
            </Card>

            <Grid container spacing={3}>
                {/*la parte de la camara en celular ocupa todo el ancho en compu la mitad*/}
                <Grid size={{xs:12, md:6}}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                        Lee la credencial del infante
                    </Typography>
                    {/*caja de la camara se adapta a dispositivo*/}
                    <Box
                        sx={{
                            height:{xs: 260, sm:300, md:400},
                            width: "100%",
                            overflow: "hidden",
                            bgcolor: "action.hover",
                            border:1,
                            borderColor: "divider",
                            borderRadius:2,

                            // fuerza al video a llenar la caja
                            "& video": {
                                width: "100% !important",
                                height: "100% !important",
                                objectFit: "cover"
                            },
                        }}
                    >
                        {/*cada Qr leido lo manda a la funcion de escaneo*/}
                        <LectorQR onScan={(t) => alEscanear(t,"QR")}/>
                    </Box>
                    {/*instrucciones para el usuario*/}
                    <Typography variant="h6" gutterBottom align="center">
                        Apunta la camara al codigo QR
                    </Typography>
                </Grid>
                {/*resultado de lo que leyo*/}
                <Grid size={{xs:12, md:6}}>
                    <Card 
                    variant="outlined" 
                    sx={{
                        border:1,
                        borderColor: "primary.main",
                    }}
                    >
                        <CardContent>
                            <Typography variant="h4" fontWeight={400} gutterBottom>
                                Resultado del Scan
                            </Typography>
                            {/*tiene si fue valido error o esta esperando*/} 
                            {leido ? (
                                <>
                                {/*datos del estudiante con iniciales nombre y matricula*/}
                                <Box sx={{display: "flex", alignItems: "center", gap: 2, my:2}}>
                                    <Avatar sx={{width:56, height: 56}}> {iniciales(leido.Nombre)}</Avatar>
                                    <Box>
                                        <Typography variant="h6" fontWeight={700}>
                                            {leido.Nombre}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Matricula {leido.Matricula}
                                        </Typography>
                                    </Box>
                                </Box>
                                {/*confirmacion con severity que pone color dependiendo y el tipo de movimiento y hora*/}
                                <Alert severity="success">
                                    <strong>
                                        {leido.tipo} registrado {leido.Hora}
                                    </strong>
                                    <br />
                                    Hora tomada del dispositivo al leer la credencial.
                                </Alert>
                                </>
                            ): errorScan ? (
                                // error rojo que es credencial falsa o mensaje del backend papita
                                <Alert severity="error">{errorScan}</Alert>
                            ): (
                                // estado inicial
                                <Typography color="text.secondary">Esperando Scan...</Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Card>
                <CardHeader 
                    title= "Matricula o folio de la credencial"
                    slotProps={{title:{variant: "h6"} }}
                >
                </CardHeader>
                <Stack direction="row">
                    <Box sx={{p:1}}>
                        {/*campo de matricula que dispara la busqueda manual*/}
                        <TextField
                            fullWidth
                            size="medium"
                            label="Matricula"
                            placeholder="8 Digitos"
                            value={manual}
                            onChange={(e) => setManual(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && alEscanear(manual, "MANUAL")}
                            sx={{ flex: 1, maxWidth: { sm: 420 } }}
                        />
                    </Box>
                    {/*boton que busca con el texto escrito que es la misma logica que qr pero el texto lo ingresamos manualmente*/}
                    <Button
                    variant="contained"
                    onClick={() => alEscanear(manual, "MANUAL")}
                    sx ={{minWidth: {sm:150},fontWeight:600}} 
                    >    
                    Buscar
                    </Button>
                </Stack>
                <Typography align="left" variant="body2" gutterBottom marginLeft={1}>
                        Si la camara no lee el codigo, escribelo.
                </Typography>
            </Card>
            <Box>
                <Typography
                variant="h6" 
                fontWeight={700}
                gutterBottom>
                    Ultimos registros
                </Typography>
                <Card 
                    variant="outlined" 
                    sx={{
                        border:1,
                        borderColor: "primary.main",
                    }}
                    >
                    {/*muestra la lista si hay registros si no solo pone que no hay joven*/}
                    {Registros.length === 0 ?(
                        <Typography color="text.secondary" sx={{p:3}}>
                            Aun no hay registros
                        </Typography>
                    ) : (
                        <List disablePadding>
                            {Registros.map((r,i) => (
                                // Hora nombre y tipo 
                                <ListItem key={r.Id} divider={i< Registros.length -1} sx={{py:2}}>
                                    // hora a la izquierda con el ancho fijo pa que se vea bonito
                                    <Typography fontWeight={700} sx={{width:64}}>
                                        {r.Hora}
                                    </Typography>
                                    <ListItemText primary={r.Nombre}/>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color:"text.secondary" }}>
                                        {r.tipo === "Ingreso"?(
                                            <LoginIcon fontSize="small"/>
                                        ) : (
                                            <LogoutIcon fontSize = "small"/>
                                        )}
                                        <Typography variant="body2" fontWeight={600}>
                                            {r.tipo}
                                        </Typography>
                                    </Box>
                                </ListItem>
                            ))}
                        </List>
                    )
                }
                </Card>
            </Box>
        </Grid>
    );
};