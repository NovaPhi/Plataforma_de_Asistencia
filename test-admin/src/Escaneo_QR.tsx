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

//datos temporales
const estudiantes = [
  { Id: "1", Nombre: "Camila Aguilar Soto", Matricula: "20230112" },
  { Id: "2", Nombre: "Diego Castillo Mora", Matricula: "20230135" },
  { Id: "3", Nombre: "Valeria Núñez Pérez", Matricula: "20230148" },
];

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

    // se llama cuando encuentra el qr o se le da el texto manual
    const alEscanear = (texto: string) => {
        // limpia espacios
        const matricula = texto.trim();
        if (!matricula) return;
        // Busca al bro con la matricula que coincida
        const est = estudiantes.find((e) => e.Matricula === texto.trim());
        
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
        
        //limpia el error si es una buena lectura y lo muestra aqui va le post a la api con la regla de que no hay egreso sin ingreso lo valida con la backend
        //AGREGAR MENSAJE DE ERROR CUANDO INTENTA SALIR SIN ENTRAR
        setErrorScan("");
        setLeido({
            Nombre: est.Nombre,
            Matricula: est.Matricula,
            tipo,
            Hora:hora,
        });
        // agrega registro al inicio de la lista 
        setRegistros((prev) => 
            [{Id: `${est.Id}-${Date.now()}`, Hora: hora, Nombre: est.Nombre, tipo }, ...prev]
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
                        <LectorQR onScan={alEscanear}/>
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
                                // datos del estudiante con iniciales nombre y matricula
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
                                // confirmaacion con severity que pone color dependiendo y el tipo de movimiento y hora
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
                            onKeyDown={(e) => e.key === "Enter" && alEscanear(manual)}
                            sx={{ flex: 1, maxWidth: { sm: 420 } }}
                        />
                    </Box>
                    {/*boton que busca con el texto escrito que es la misma logica que qr pero el texto lo ingresamos manualmente*/}
                    <Button
                    variant="contained"
                    onClick={() => alEscanear(manual)}
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