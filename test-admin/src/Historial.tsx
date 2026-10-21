import{Card, CardHeader, Stack, CardContent, Typography, Chip, List, ListItem, ListItemText, TextField, Box} from "@mui/material";
import{ useEffect, useState } from 'react';
import { API_URL } from "./config";

// un renglon del historial, asi tiene que regresarlo la API
type Registro = {
  id: string;
  usuario: string; // quien hizo el cambio
  rol: string; // rol del usuario, ej. TRABAJO_SOCIAL
  accion: string; // que hizo: crear, editar o eliminar
  coleccion: string; // en que coleccion paso, ej. tickets
  fechaHora: string; // cuando, fecha ISO
};

// traduce el codigo de la accion al texto que ve el usuario, si llega una que no esta aqui se muestra el codigo tal cual
const ACCIONES: Record<string, string> = {
    CREAR: "Creó",
    ACTUALIZAR: "Editó",
    CAMBIO_ESTATUS: "Cambió estatus",
    CERRAR_TICKET: "Cerró ticket",
    LLAMADA: "Llamada",
    VER_NOTA: "Vio nota",
};

// fecha y hora en formato de mexico, si viene mala devuelve vacio
const fechaTexto = (iso: string) => {
    const d = new Date(iso);
    return isNaN(d.getTime()) ? "" : d.toLocaleString("es-MX", {
        dateStyle: "short",
        timeStyle: "short",
        hour12: false,
    });
};

export const Bitacora = () => {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true); // true mientras llega el GET
  
  // trae el historial y si falla manda mensaje de error
  const handleGetData = async () => {
    const request = new Request(`${API_URL}/Bitacora`, {
      method: "GET",
      headers: new Headers({ "Content-Type": "application/json","Authentication": sessionStorage.getItem("auth") ?? "",}),
    });
    try {
      const res = await fetch(request);
      if (res.status < 200 || res.status >= 300) {
        throw new Error(res.statusText);
        }
        setRegistros(await res.json());
    } catch {
      throw new Error("No se pudo cargar el historial");
    }
  };

  // el arreglo vacio hace que corra una vez cuando abren la vista y .finally ejecuta para quitar el mensaje cargando
  useEffect(() => {handleGetData().catch((error) => {console.error(error);alert(error.message);}).finally(() => setCargando(false));},[]);
 
  // busca por usuario, accion o modulo
  const visibles = registros.filter((r) =>`${r.usuario} ${r.rol} ${ACCIONES[r.accion] ?? r.accion} ${r.coleccion}`.toLowerCase().includes(busqueda.toLowerCase()));

  return (
    // lo que pone las cartas de forma vertical
    <Stack spacing={2}>
      <Card>
        <CardHeader
        title="Bitacora"
        slotProps={{title: {variant: "h2"}}}
        />
      </Card>
      <Card>
        <CardHeader
        subheader={`Total de cambios: ${registros.length}`}
        />
      </Card>
      <Card>
        {/*la zona fija que se pueda ver siempre*/}
        <Box sx={{p:2}}>
          <TextField
          fullWidth
          size='small'
          label="Buscar"
          placeholder='Usuario, accion o modulo'
          value={busqueda}
          onChange={(e)=> setBusqueda(e.target.value)}
          />
        </Box>
        {cargando && (
          <Typography color="text.secondary" sx={{p:2}}>
          Cargando historial...
          </Typography>
        )}
        {/*Lista con el scroll propio*/}
          <List sx={{ maxHeight: "60vh", overflowY: "auto" }}>
            {visibles.map((r) => (
              <ListItem
              key={r.id}
              divider
              // la accion que se hizo
              secondaryAction={
                <Chip label={ACCIONES[r.accion] ?? r.accion} variant="outlined" size="small" sx={{fontWeight: 600}} />
              }
            >
              {/* quien lo hizo, en que modulo y cuando */}
              <ListItemText
                primary={`${r.usuario} (${r.rol})`}
                secondary={`${r.coleccion} , ${fechaTexto(r.fechaHora)}`}
              />
            </ListItem>
          ))}
        </List>
      </Card>
     </Stack>
    );
};