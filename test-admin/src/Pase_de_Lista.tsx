
import {
  Card, CardHeader, Menu, MenuItem, Button, Stack, CardContent, Box,
  Typography, Chip, List, ListItem, ListItemText, TextField,
} from "@mui/material";
import { useState } from 'react';
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";



const salas = ["A1", "A2"]; //este valor venga de BD despues


type Estado = 
    | "Presente"
    | "Falta"
// Objeto con la cantidad de estudiantes
    type Conteos = Record<Estado,number>;



//Catalogo de estados donde key es el valor interno y label es el texto visible
//Usado para generar los pedasos del resumen y los botones de cada estudiante
const Estados: {key: Estado; label: string}[] = [
    {key: "Presente", label: "Presente"},
    {key: "Falta", label: "Falta"},
];

//Forma de cada estudiante que llega de la api
type Estudiante = {
    Id: string;
    Nombre: string;
    Matricula: string;
    HoraIngreso?: string;
};


//Dummy Data generada por claude mientras se crean las conexiones del api
const EstudiantesTemporales: Estudiante[] = [
  { Id: "1", Nombre: "Camila Aguilar Soto", Matricula: "20230112", HoraIngreso: "07:40" },
  { Id: "2", Nombre: "Diego Castillo Mora", Matricula: "20230135" },
  { Id: "3", Nombre: "Valeria Núñez Pérez", Matricula: "20230148" },
  { Id: "4", Nombre: "Mateo Hernández Ruiz", Matricula: "20230151", HoraIngreso: "07:45" },
  { Id: "5", Nombre: "Sofía Ramírez Torres", Matricula: "20230153" },
  { Id: "6", Nombre: "Santiago López Vega", Matricula: "20230157", HoraIngreso: "07:52" },
  { Id: "7", Nombre: "Isabella García Cruz", Matricula: "20230160" },
  { Id: "8", Nombre: "Emiliano Martínez Flores", Matricula: "20230162", HoraIngreso: "07:38" },
  { Id: "9", Nombre: "Regina Morales Díaz", Matricula: "20230165" },
  { Id: "10", Nombre: "Sebastián Jiménez Ortega", Matricula: "20230168", HoraIngreso: "08:01" },
  { Id: "11", Nombre: "Ximena Vázquez Luna", Matricula: "20230171" },
  { Id: "12", Nombre: "Leonardo Reyes Salazar", Matricula: "20230174", HoraIngreso: "07:42" },
  { Id: "13", Nombre: "Renata Gutiérrez Ibarra", Matricula: "20230177" },
  { Id: "14", Nombre: "Daniel Mendoza Rojas", Matricula: "20230179", HoraIngreso: "07:55" },
  { Id: "15", Nombre: "Fernanda Cortés Medina", Matricula: "20230182" },
  { Id: "16", Nombre: "Adrián Ríos Navarro", Matricula: "20230185", HoraIngreso: "07:47" },
  { Id: "17", Nombre: "Daniela Ortiz Campos", Matricula: "20230188" },
  { Id: "18", Nombre: "Joaquín Silva Herrera", Matricula: "20230190", HoraIngreso: "07:50" },
  { Id: "19", Nombre: "Paulina Guerrero Domínguez", Matricula: "20230193" },
  { Id: "20", Nombre: "Andrés Peña Acosta", Matricula: "20230196", HoraIngreso: "08:05" },
  { Id: "21", Nombre: "Mariana Soto Fuentes", Matricula: "20230199" },
  { Id: "22", Nombre: "Gael Cabrera Pineda", Matricula: "20230202", HoraIngreso: "07:41" },
  { Id: "23", Nombre: "Natalia Rangel Montes", Matricula: "20230205" },
  { Id: "24", Nombre: "Ángel Espinoza Lara", Matricula: "20230207", HoraIngreso: "07:58" },
  { Id: "25", Nombre: "Julieta Carrillo Ponce", Matricula: "20230210" },
  { Id: "26", Nombre: "Bruno Maldonado Estrada", Matricula: "20230213", HoraIngreso: "07:36" },
  { Id: "27", Nombre: "Alexa Valdez Aguirre", Matricula: "20230216" },
  { Id: "28", Nombre: "Rodrigo Padilla Bravo", Matricula: "20230219", HoraIngreso: "07:49" },
  { Id: "29", Nombre: "Montserrat Delgado Rivas", Matricula: "20230221" },
  { Id: "30", Nombre: "Iker Santana Cervantes", Matricula: "20230224", HoraIngreso: "08:03" },
  { Id: "31", Nombre: "Camila Ávila Beltrán", Matricula: "20230227" },
  { Id: "32", Nombre: "Tadeo Escobar Villalobos", Matricula: "20230230", HoraIngreso: "07:44" },
  { Id: "33", Nombre: "Abril Contreras Méndez", Matricula: "20230233" },
  { Id: "34", Nombre: "Maximiliano Solís Cano", Matricula: "20230235", HoraIngreso: "07:53" },
  { Id: "35", Nombre: "Luciana Zamora Trejo", Matricula: "20230238" },
  { Id: "36", Nombre: "Dante Figueroa Robles", Matricula: "20230241", HoraIngreso: "07:39" },
  { Id: "37", Nombre: "Victoria Nava Cisneros", Matricula: "20230244" },
  { Id: "38", Nombre: "Ian Galván Serrano", Matricula: "20230247", HoraIngreso: "07:57" },
  { Id: "39", Nombre: "Constanza Bautista Rosales", Matricula: "20230250" },
  { Id: "40", Nombre: "Axel Quintero Muñoz", Matricula: "20230252", HoraIngreso: "07:46" },
  { Id: "41", Nombre: "Elena Palacios Barrera", Matricula: "20230255" },
  { Id: "42", Nombre: "Thiago Meza Olvera", Matricula: "20230258", HoraIngreso: "08:00" },
  { Id: "43", Nombre: "Camille Lozano Mejía", Matricula: "20230261" },
  { Id: "44", Nombre: "Nicolás Becerra Orozco", Matricula: "20230264", HoraIngreso: "07:43" },
  { Id: "45", Nombre: "Samantha Ayala Cordero", Matricula: "20230267" },
  { Id: "46", Nombre: "Julián Arroyo Valencia", Matricula: "20230270", HoraIngreso: "07:51" },
  { Id: "47", Nombre: "Romina Paredes Zúñiga", Matricula: "20230273" },
  { Id: "48", Nombre: "Elías Salinas Miranda", Matricula: "20230276", HoraIngreso: "07:48" },
  { Id: "49", Nombre: "Frida Caballero Ochoa", Matricula: "20230279" },
  { Id: "50", Nombre: "Vicente Aranda Cuevas", Matricula: "20230282", HoraIngreso: "08:04" },
];


export const PasaLista = () => {
    const [sala, setSala] = useState("A1");
    //cosa que hace que el menu se quede donde le picaste
    const [anchor, setAnchor] = useState<null | HTMLElement>(null);    
    //cuando el menu esta abierto y hay algo paraa que se ancle
    const open = Boolean(anchor);

    //Valores temporales 
    const dia = "Miercoles";
    const fecha = "7/OCT/26";
    const hora = "9:00";
    
    const estudiantes = EstudiantesTemporales;
    
    // Marca de cada estudiante que es guardado por ID donde todos empiezan como presente
    // la funcion es un constructor
    const [marcas, setMarcas] = useState<Record<string, Estado>>(() =>
        Object.fromEntries(estudiantes.map((e) => [e.Id, "Presente" as Estado]))
    );
    
    const marcar = (id: string, estado: Estado) => {
    setMarcas((prev) => ({ ...prev, [id]: estado }));
    };

    const[busqueda, setBusqueda] = useState("");

    //Bloque para contar los estudiantes presentes y faltantes
    const presentes = Object.values(marcas).filter((m) => m === "Presente").length;
    const faltas = Object.values(marcas).filter((m) => m === "Falta").length; 

    const conteos: Conteos = { Presente: presentes, Falta: faltas};
    const total = estudiantes.length;


    // cuantos ya tienen marca osea ya se les tomo asistencia
    const visibles = estudiantes.filter((e) => 
        `${e.Nombre} ${e.Matricula}`.toLowerCase().includes(busqueda.toLowerCase())
    );

    const guardar = () => {
        //logica de la API para guardar los chamacos que si vinieron y los que faltaron
        console.log({ sala, marcas });
    };

    return (
        // lo que pone las cartas de forma vertical
        <Stack spacing={2}>
            <Card>
                <CardHeader 
                    title="Pase de Lista" 
                    subheader={`Sala ${sala}, ${dia} ${fecha}, Cierre a las ${hora}`} 
                    sx={{
                        "& .MuiCardHeader-action":{
                            alignSelf: "center",
                            marginTop:0,
                            marginRight: 0,
                        },
                    }}
                    action={
                        <>
                            {/*Boton que abre el menu de las salas*/}
                            <Button
                                variant='outlined'
                                size='large'
                                startIcon={<GroupsOutlinedIcon/>}
                                endIcon={<KeyboardArrowDownIcon/>}
                                onClick={(e) => setAnchor(e.currentTarget)}
                                aria-haspopup="true"
                                aria-expanded={open}
                            >
                            Cambiar de Sala
                            </Button>
                            <Menu
                                // menu con la lista de salas
                                anchorEl={anchor}
                                open={open}
                                onClose={() => setAnchor(null)}
                            >
                                {salas.map((s) =>(
                                    // muestra la sala actual y al elegir otra la guarda como ancla
                                    <MenuItem
                                        key={s}
                                        selected={s===sala}
                                        onClick={()=>{
                                            setSala(s);
                                            setAnchor(null);
                                        }}
                                    >
                                        Sala {s}
                                    </MenuItem>
                                ))}
                            </Menu>
                        </>
                    }

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
                {/*Lista con el scroll propio*/}
                <List sx={{maxHeight: "60vh", overflowY: 'auto'}}>
                    {visibles.map((e)=>(
                        <ListItem
                            key={e.Id}
                            divider
                            secondaryAction={
                                // boton de presente y falta y hace que el boton seleccionado se vea relleno los botones se pueden cambiar a estados despues depende del equipo
                                <Stack direction="row" spacing={1}>
                                    {Estados.map((s)=>(
                                        <Button
                                        key={s.key}
                                        size="small"
                                        variant={marcas[e.Id] === s.key ? "contained" : "outlined"}
                                        onClick={() => marcar(e.Id, s.key)} 
                                        >
                                        {s.label}
                                        </Button>
                                    ))}
                                </Stack>
                            }
                        >
                            {/*nombre y matricula*/}
                            <ListItemText
                                primary={e.Nombre}
                                secondary={`${e.Matricula}${e.HoraIngreso ? ` · Ingreso ${e.HoraIngreso}` : ""}`}
                            />
                        </ListItem>
                    ))}
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
                  {presentes} presentes · {faltas} faltas
                </Typography>
                
                {/*manda el pase de lista a la BD*/}
                <Button
                  variant="contained"
                  size="large"
                  onClick={guardar}
                >
                  Guardar pase de lista
                </Button>
              </CardContent>
            </Card>
        </Stack>
    );
};