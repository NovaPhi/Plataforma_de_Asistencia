import { useEffect, useState } from "react";
import {Alert, Box, Button, Card, CardContent, CardHeader, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, MenuItem, Radio, RadioGroup, Tab, Tabs, TextField, Typography,} from "@mui/material";
import { API_URL } from "./config";

// los 4 estados por los que pasa un caso, cada uno es una pestaña
type Estado = "abierto" | "seguimiento" | "alta_medica" | "cerrado";
 
// una llamada que se hizo al tutor (cada vez que se guarda "Registrar llamada" se crea una)
type Intento = { fecha: string; resultado: string; responsable: string; notas?: string };
 
// un caso de inasistencia, es lo que se muestra en la tarjeta y en el expediente
type Caso = {
  id: string;
  nombre: string;
  sala: string;
  fechaFalta: string;
  folio: string;
  estado: Estado;
  alerta?: string;
  causa?: string;
  intentos: Intento[];
};

// lo que se captura en el menu de "Registrar llamada" y se manda a la API
type DatosLlamada = { resultado: string; causa: string; notas: string };

// pestañas de arriba, el value tiene que coincidir con el estado del caso para filtrar
const TABS: { value: Estado; label: string }[] = [
  { value: "abierto", label: "Abiertos" },
  { value: "seguimiento", label: "En seguimiento" },
  { value: "alta_medica", label: "Requiere alta médica" },
  { value: "cerrado", label: "Cerrados" },
];
 
// traduce el estado interno al texto que ve el usuario (chip de la tarjeta y expediente)
// Record obliga a tener una etiqueta por cada estado, si falta una marca error
const ETIQUETA_ESTADO: Record<Estado, string> = {
  abierto: "Abierto",
  seguimiento: "En seguimiento",
  alta_medica: "Requiere alta médica",
  cerrado: "Cerrado",
};

// opciones de causa, las usan el formulario del expediente y el dialogo de llamada
const CAUSAS = ["Enfermedad en casa", "Accidente fuera del plantel", "Permiso particular o tramite", "Sin respuesta del tutor"];
 
// opciones de como termino la llamada
const RESULTADOS = ["Contestó", "No contestó", "Número equivocado"];

// fecha y hora en formato de mexico, si viene vacia o mala devuelve un guion
const fechaTexto = (iso: string) => {
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? "—"
    : d.toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short", hour12: false });
};

// solo la fecha, sin hora, para el dia de la falta
const soloFecha = (iso: string) => {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("es-MX", { dateStyle: "short" });
};
 
const encabezados = () => new Headers({"Content-Type": "application/json","Authentication": sessionStorage.getItem("auth") ?? "",});

// manda una peticion que regresa un caso ya actualizado, asi el front no tiene que adivinar nada
// ruta: lo que va despues de /seguimientos, metodo: POST o PATCH, body: lo que se manda
const enviar = async (ruta: string, metodo: "POST" | "PATCH", body: object | undefined, mensajeError: string) => {
  const request = new Request(`${API_URL}/seguimiento${ruta}`, {
    method: metodo,
    body: body ? JSON.stringify(body) : undefined,
    headers: encabezados(),
  });
  try {
    const res = await fetch(request);
    if (res.status < 200 || res.status >= 300) {
      throw new Error(res.statusText);
    }
    return (await res.json()) as Caso;
  } catch {
    throw new Error(mensajeError);
  }
};

// filtros de sala y fecha, por ahora solo son visuales (no filtran la lista)
const Filtros = () => (
  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", my: 2 }}>
    {/* select de sala, solo tiene la opcion "todas" mientras no haya salas reales */}
    <TextField select size="small" label="Sala" defaultValue="" sx={{ minWidth: 200 }}>
      <MenuItem value="">Todas las salas</MenuItem>
    </TextField>
    <TextField select size="small" label="Fecha de la falta" defaultValue="7" sx={{ minWidth: 200 }}>
      <MenuItem value="7">Últimos 7 días</MenuItem>
      <MenuItem value="30">Últimos 30 días</MenuItem>
    </TextField>
  </Box>
);
 
// tarjeta de la lista de la izquierda, un resumen del caso
// activo: es true si es el caso que esta abierto en el expediente, le pone el borde de color
// onSelect: avisa al padre que se pico "Abrir expediente" para que lo muestre a la derecha
const CasoCard = ({ caso, activo, onSelect }: {caso: Caso; activo: boolean; onSelect: () => void;}) => (
  // el borde es de color primario si es el caso seleccionado, si no es gris
  <Card variant="outlined" sx={{ borderWidth: 2, borderColor: activo ? "primary.main" : "divider" }}>
    <CardContent sx={{ display: "grid", gap: 1 }}>
      <Typography fontWeight={700}>{caso.nombre}</Typography>
      <Typography variant="caption">
        {caso.sala} · Falta del {soloFecha(caso.fechaFalta)} · Folio {caso.folio}
      </Typography>
      <Box><Chip size="small" variant="outlined" color="primary" label={ETIQUETA_ESTADO[caso.estado]} /></Box>
      {/* el aviso amarillo solo sale si el caso trae una alerta */}
      {caso.alerta && <Alert severity="warning" sx={{ py: 0 }}>{caso.alerta}</Alert>}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
        <Box>
          <Typography variant="caption">Causa</Typography>
          {/* ?? pone "Sin definir" cuando el caso todavia no tiene causa */}
          <Typography variant="body2">{caso.causa ?? "Sin definir"}</Typography>
        </Box>
        <Box>
          <Typography variant="caption">Intentos de contacto</Typography>
          <Typography variant="body2">
            {/* muestra solo la ultima llamada (la primera del arreglo), si no hay ninguna dice "Ninguno" */}
            {caso.intentos[0] ? `${fechaTexto(caso.intentos[0].fecha)} ·${caso.intentos[0].resultado}` : "Ninguno"}
          </Typography>
        </Box>
      </Box>
      <Box>
        <Button variant="outlined" onClick={onSelect}>Abrir expediente</Button>
      </Box>
    </CardContent>
  </Card>
);
 

// par de etiqueta chiquita arriba y valor en negritas abajo, se usa en los datos del expediente
const Dato = ({ etiqueta, valor }: { etiqueta: string; valor: string }) => (
  <Box>
    <Typography variant="caption" color="text.secondary">{etiqueta}</Typography>
    <Typography variant="body2" fontWeight={600}>{valor}</Typography>
  </Box>
);

// opciones en forma de tarjeta (radio con borde), solo se puede elegir una
// valor: la opcion elegida, onChange: avisa cual eligio, columnas: cuantas por fila en pantalla grande
// se usa en el dialogo de llamada (resultado y causa)
const OpcionesTarjeta = ({ valor, onChange, opciones, columnas }: {valor: string; onChange: (v: string) => void; opciones: string[]; columnas: number;}) => (
  // RadioGroup junta los radios para que solo uno pueda estar marcado
  <RadioGroup
    value={valor}
    onChange={(e) => onChange(e.target.value)}
    sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: `repeat(${columnas}, 1fr)` }, gap: 1.5 }}
  >
    {/* map crea una tarjeta por cada opcion, key ayuda a react a distinguirlas */}
    {opciones.map((o) => (
      <FormControlLabel
        key={o}
        value={o}
        control={<Radio />}
        label={o}
        // la opcion elegida se resalta con borde y fondo de color
        sx={{
          m: 0, px: 1, py: 0.5, border: 2, borderRadius: 1,
          borderColor: valor === o ? "primary.main" : "divider",
          bgcolor: valor === o ? "action.selected" : "transparent",
          "& .MuiFormControlLabel-label": { fontWeight: 600 },
        }}
      />
    ))}
  </RadioGroup>
);

// formulario que va dentro del expediente: causa, asesoria, fecha de retorno y notas
const FormularioCausa = ({ caso }: { caso: Caso }) => {
  // emmpieza con la causa que ya tenga el caso, si no tiene queda vacio
  const [causa, setCausa] = useState(caso.causa ?? "");
  // lo que se escribe en "Asesoria brindada"
  const [asesoria, setAsesoria] = useState("");
  // fecha del calendario, guarda el texto en formato aaaa-mm-dd
  const [fechaRetorno, setFechaRetorno] = useState("");
  // notas privadas del expediente
  const [notas, setNotas] = useState("");
  return (
    <Box sx={{ display: "grid", gap: 2 }}>
      <Typography fontWeight={700}>Causa de la inasistencia</Typography>
      {/* mismo estilo de tarjetas que OpcionesTarjeta pero con las causas directo */}
      <OpcionesTarjeta valor={causa} onChange={setCausa} opciones={CAUSAS} columnas={2} />

      {/* asesoria y fecha lado a lado en pantalla grande, una abajo de otra en celular */}
      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "3fr 2fr" } }}>
        <TextField
          label="Asesoría brindada"
          placeholder="Qué orientación diste a la persona tutora"
          multiline minRows={3}
          value={asesoria}
          onChange={(e) => setAsesoria(e.target.value)}
        />
        {/* type="date" hace que salga el calendario, el shrink evita que la etiqueta se encime con el formato */}
        <TextField
          label="Fecha probable de retorno"
          type="date"
          InputLabelProps={{ shrink: true }}
          helperText="Formato dd/mm/aaaa"
          value={fechaRetorno}
          onChange={(e) => setFechaRetorno(e.target.value)}
        />
      </Box>
      {/* multiline hace que sea un cuadro de texto grande, minRows es el alto minimo */}
      <TextField
        label="Notas confidenciales"
        multiline minRows={3} fullWidth
        value={notas}
        onChange={(e) => setNotas(e.target.value)}
      />
    </Box>
  );
};

// menu que sale al picar "Registrar llamada"
// caso: el caso al que se le registra la llamada, onClose: cierra el menu sin guardar nada, onGuardar: manda los datos capturados al padre (SeguimientoList) para que los agregue al caso
const RegistrarLlamadaDialog = ({ caso, guardando, onClose, onGuardar }: {caso: Caso; guardando: boolean; onClose: () => void; onGuardar: (d: DatosLlamada) => void;}) => {
  const [resultado, setResultado] = useState("");
  const [causa, setCausa] = useState(caso.causa ?? "");
  const [notas, setNotas] = useState("");
 
  return (
    // onClose se dispara tambien al picar fuera del menu o con la tecla Esc
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        Registrar llamada
        {/* la tecla Esc tambien cierra el menu, el chip solo lo avisa */}
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Cerrar&nbsp;<Chip size="small" variant="outlined" label="Esc" />
        </Button>
      </DialogTitle>
 
      <DialogContent sx={{ display: "grid", gap: 2 }}>
        {/* resumen del caso para que se sepa a quien se le esta registrando la llamada */}
        <Typography variant="body2" color="text.secondary">
          {caso.nombre} · Folio {caso.folio} · La hora se registra sola
        </Typography>
 
        <Typography fontWeight={700}>Resultado</Typography>
        <OpcionesTarjeta valor={resultado} onChange={setResultado} opciones={RESULTADOS} columnas={3} />
 
        <Typography fontWeight={700}>Causa</Typography>
        <OpcionesTarjeta valor={causa} onChange={setCausa} opciones={CAUSAS} columnas={2} />
 
        <TextField
          label="Notas de la llamada"
          multiline minRows={3} fullWidth
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
        />
      </DialogContent>
 
      <DialogActions sx={{ p: 2 }}>
        <Button
          // no deja guardar hasta que se elija el resultado, la causa y las notas son opcionales 
          variant="contained"
          disabled={!resultado || guardando}
          onClick={() => onGuardar({ resultado, causa, notas })}
        >
          {guardando ? "Guardando..." : "Guardar llamada"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
 

 
// panel de la derecha con todo el detalle del caso seleccionado
// onRegistrarLlamada: abre el menu de llamada
const Expediente = ({ caso, guardando, onRegistrarLlamada  }: { caso?: Caso; guardando: boolean; onRegistrarLlamada: () => void }) => {
  // si no hay caso elegido solo se muestra el mensaje y no se dibuja nada mas
  if (!caso) {
    return (
      <Card variant="outlined">
        <CardContent><Typography>Selecciona un caso para ver su expediente.</Typography></CardContent>
      </Card>
    );
  }
  return (
    <Card variant="outlined">
      <CardHeader title={`Expediente de ${caso.nombre}`} />
      <CardContent sx={{ display: "grid", gap: 3 }}>
        {/* datos generales del caso en 3 columnas */}
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
          <Dato etiqueta="Niña o niño" valor={caso.nombre} />
          <Dato etiqueta="Sala" valor={caso.sala} />
          <Dato etiqueta="Folio" valor={caso.folio} />
          <Dato etiqueta="Fecha de la falta" valor={soloFecha(caso.fechaFalta)} />
          <Dato etiqueta="Estado" valor={ETIQUETA_ESTADO[caso.estado]} />
        </Box>
        {/* lista de todas las llamadas hechas, la mas reciente arriba */}
        <Box>
          <Typography fontWeight={700} gutterBottom>Historial de llamadas</Typography>
          {/* si no hay llamadas se avisa en lugar de dejar el espacio vacio */}
          {caso.intentos.length === 0 && <Typography variant="body2">Sin llamadas registradas.</Typography>}
          {/* idx se usa como key porque los intentos todavia no tienen id propio */}
          {caso.intentos.map((i, idx) => (
            <Box key={idx} sx={{ mb: 1 }}>
              <Typography variant="body2" fontWeight={600}>{fechaTexto(i.fecha)} · {i.resultado}</Typography>
              <Typography variant="caption">{i.responsable}</Typography>
            </Box>
          ))}
        </Box>
 
        {/* el key hace que el formulario se reinicie al cambiar de caso y no arrastre lo escrito del anterior */}
        <FormularioCausa key={caso.id} caso={caso} />
 
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button variant="contained" onClick={onRegistrarLlamada} disabled={guardando}>Registrar llamada</Button>
          <Button variant="outlined">
            Notificar a contactos de emergencia
          </Button>
          {/* ml auto lo empuja a la derecha, color error lo pone rojo */}
          <Button variant="outlined" color="error" sx={{ ml: "auto" }}>
            Cerrar caso
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};
 
// pantalla principal, aqui vive todo el estado y se conectan los demas componentes
export const SeguimientoList = () => {
  // datos del usuario logueado, se usa su nombre como responsable de la llamada
  const [casos, setCasos] = useState<Caso[]>([]);
  const [cargando, setCargando] = useState(true); // true mientras llega el GET
  const [guardando, setGuardando] = useState(false); // true mientras se espera el POST
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [tab, setTab] = useState<Estado>("abierto");
  const [seleccionado, setSeleccionado] = useState<string | undefined>();

  const handleGetData = async () => {
    const request = new Request(`${API_URL}/seguimiento`, {
      method: "GET",
      headers: encabezados(),
    });
    try {
      const res = await fetch(request);
      if (res.status < 200 || res.status >= 300) {
        throw new Error(res.statusText);
      }
      setCasos(await res.json());
    } catch {
      throw new Error("No se pudieron cargar los casos de seguimiento");
    }
  };
  
  useEffect(() => {handleGetData().catch((error) => {console.error(error);alert(error.message);}).finally(() => setCargando(false));}, []);

  const visibles = casos.filter((c) => c.estado === tab);
  // busca el caso completo a partir del id para mostrarlo en el expediente
  const actual = casos.find((c) => c.id === seleccionado);

  // se ejecuta cuando se da "Guardar llamada" en el menu
  // la API agrega la llamada con la fecha y el usuario, actualiza la causa si se cambio y regresa el caso actualizado
  const guardarLlamada = async (d: DatosLlamada) => {
    if (!actual) return;
    setGuardando(true);
    try {
      const actualizado = await enviar(`/${actual.id}/llamadas`, "POST", d, "No se pudo guardar la llamada");
      // cambia solo ese caso por la version nueva y deja los demas igual
      setCasos((prev) => prev.map((c) => (c.id === actualizado.id ? actualizado : c)));
      // el menu solo se cierra si salio bien, si falla se queda abierto para no perder lo escrito
      setDialogoAbierto(false);
    } catch (error) {
      console.error(error);
      alert((error as Error).message);
    } finally {
      setGuardando(false); // siempre se activa, con error o sin error
    }
  };
  
  return (
    <Card>
      <CardHeader title="Seguimiento de inasistencias" />
      <CardContent>
        {/* cada pestaña muestra cuantos casos tiene ese estado, al cambiar de pestaña se actualiza la lista */}
        <Tabs value={tab} onChange={(_, v: Estado) => setTab(v)}>
          {TABS.map((t) => (
            <Tab
              key={t.value}
              value={t.value}
              label={`${t.label} · ${casos.filter((c) => c.estado === t.value).length}`}
            />
          ))}
        </Tabs>
 
        <Filtros />
 
        {cargando && (
          <Typography color="text.secondary" sx={{ pb: 2 }}>
            Cargando casos...
          </Typography>
        )}
 
        {/* en celular una columna, en pantalla grande lista a la izquierda y expediente a la derecha */}
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "2fr 3fr" }, alignItems: "start" }}>
          {/* la lista tiene altura maxima y scroll propio para que el expediente no se mueva */}
          <Box sx={{ display: "grid", gap: 2, maxHeight: "65vh", overflowY: "auto", pr: 1 }}>
            <Typography variant="caption" fontWeight={700}>
              {visibles.length} casos · ordenados por urgencia
            </Typography>
            {/* una tarjeta por cada caso de la pestaña, la seleccionada se marca con activo */}
            {visibles.map((c) => (
              <CasoCard key={c.id} caso={c} activo={c.id === seleccionado} onSelect={() => setSeleccionado(c.id)} />
            ))}
          </Box>
          {/* al picar "Registrar llamada" solo se cambia dialogoAbierto, el menu lo dibuja mas abajo */}
          <Expediente caso={actual} guardando={guardando} onRegistrarLlamada={() => setDialogoAbierto(true)} />
        </Box>
        {/* el menu solo existe mientras esta abierto, asi cada vez que se abre empieza limpio */}
        {actual && dialogoAbierto && (
          <RegistrarLlamadaDialog caso={actual} guardando={guardando} onClose={() => setDialogoAbierto(false)} onGuardar={guardarLlamada} />
        )}
      </CardContent>
    </Card>
  );
};