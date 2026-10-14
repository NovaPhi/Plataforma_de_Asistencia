import { useState } from "react";
import { useGetIdentity } from "react-admin";
import {Alert, Box, Button, Card, CardActionArea, CardContent, CardHeader, Chip, Dialog,DialogActions, DialogContent, DialogTitle, MenuItem, Tab, Tabs, TextField, Typography,} from "@mui/material";

type Gravedad = "grave" | "moderada" | "leve";
type EstadoInc = "abierta" | "en_atencion" | "resuelta";
type Vista = "activas" | "historicas";

// lo que se hace para atender una incidencia
type Accion = { hora: string; texto: string; responsable: string };

// lo que contiene una incidencia completa
type Incidencia = {
  id: string;
  folio: string;
  nombre: string;
  sala: string;
  tipo: string;
  gravedad: Gravedad;
  fechaHora: string;
  reporto: string;
  estado: EstadoInc;
  descripcion: string;
  tutorNotificado: boolean;
  acciones: Accion[];
  resolucion?: { fecha: string; por: string };
};

// lo que se captura en el formulario de "Registrar incidencia"
type NuevaIncidencia = {nombre: string; sala: string; tipo: string; gravedad: Gravedad; descripcion: string;};

const TIPOS = ["Accidente", "Enfermedad", "Conducta"];

// opciones del menu de "Registrar accion"
const TIPOS_ACCION = [
  "Primeros auxilios",
  "Llamada al tutor",
  "Traslado a servicio médico",
  "Observación",
  "Otra",
];

// datos de cada gravedad: texto, orden de la lista y colores. Los colores fueron dados por CLOUD
const GRAVEDADES: Record<Gravedad, { label: string; orden: number; bg: string; color: string }> = {
  grave: { label: "Grave", orden: 0, bg: "#fde8e6", color: "#8c1d18" },
  moderada: { label: "Moderada", orden: 1, bg: "#fff3cd", color: "#6b4e00" },
  leve: { label: "Leve", orden: 2, bg: "#e6eef4", color: "#0b5a8a" },
};

// traduce el estado interno al texto que ve el usuario
const ETIQUETA_ESTADO: Record<EstadoInc, string> = {
  abierta: "Abierta",
  en_atencion: "En atención",
  resuelta: "Resuelta",
};

// datos temporales dados por CLOUD para ver el diseño
const INCIDENCIAS_EJEMPLO: Incidencia[] = [
  {
    id: "1", folio: "INC-0000-0003", nombre: "Niño/a de ejemplo 1", sala: "Sala A", tipo: "Accidente",
    gravedad: "grave", fechaHora: "00/00/0000 00:00", reporto: "Responsable de sala",
    estado: "abierta", descripcion: "[Descripción de lo ocurrido]", tutorNotificado: false,
    acciones: [{ hora: "00:00", texto: "Primeros auxilios aplicados", responsable: "Responsable de sala" }],
  },
  {
    id: "2", folio: "INC-0000-0002", nombre: "Niño/a de ejemplo 2", sala: "Sala B", tipo: "Enfermedad",
    gravedad: "moderada", fechaHora: "00/00/0000 00:00", reporto: "Responsable de sala",
    estado: "en_atencion", descripcion: "[Descripción de lo ocurrido]", tutorNotificado: true, acciones: [],
  },
  {
    id: "3", folio: "INC-0000-0001", nombre: "Niño/a de ejemplo 3", sala: "Sala A", tipo: "Conducta",
    gravedad: "leve", fechaHora: "00/00/0000 00:00", reporto: "Responsable de sala",
    estado: "resuelta", descripcion: "[Descripción de lo ocurrido]", tutorNotificado: true, acciones: [],
    resolucion: { fecha: "00/00/0000 00:00", por: "Responsable" },
  },
];

// devuelve la fecha, la hora al momento actual del dispositivo
const ahora = () => {
  const d = new Date();
  const fecha = d.toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "numeric" });
  const hora = d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: false });
  return { fecha, hora, completa: `${fecha} ${hora}` };
};

// chip de color segun la gravedad (rojo, amarillo, azul)
const ChipGravedad = ({ gravedad }: { gravedad: Gravedad }) => {
  const g = GRAVEDADES[gravedad];
  return <Chip size="small" label={g.label} sx={{ bgcolor: g.bg, color: g.color, fontWeight: 700 }} />;
};

// los tres filtros que se pueden aplicar
type Filtro = { sala: string; tipo: string; gravedad: string };

// filtros de sala, tipo y gravedad, estos si filtran la lista
const Filtros = ({ filtro, salas, onChange }: {filtro: Filtro; salas: string[]; onChange: (f: Filtro) => void;}) => (
  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", my: 2 }}>
    <TextField select size="small" label="Sala" value={filtro.sala} sx={{ minWidth: 200 }}
      {/* ...filtro copia los otros dos filtros y solo cambia el campo que se toco */}
      onChange={(e) => onChange({ ...filtro, sala: e.target.value })}>
      <MenuItem value="">Todas las salas</MenuItem>
      {salas.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
    </TextField>
    <TextField select size="small" label="Tipo" value={filtro.tipo} sx={{ minWidth: 200 }}
      onChange={(e) => onChange({ ...filtro, tipo: e.target.value })}>
      <MenuItem value="">Todos los tipos</MenuItem>
      {TIPOS.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
    </TextField>
    <TextField select size="small" label="Gravedad" value={filtro.gravedad} sx={{ minWidth: 200 }}
      onChange={(e) => onChange({ ...filtro, gravedad: e.target.value })}>
      <MenuItem value="">Todas</MenuItem>
      {(Object.keys(GRAVEDADES) as Gravedad[]).map((g) => (
        <MenuItem key={g} value={g}>{GRAVEDADES[g].label}</MenuItem>
      ))}
    </TextField>
  </Box>
);

// tarjeta de la lista de la izquierda, un resumen de la incidencia
// inc: los datos que dibuja
const IncidenciaCard = ({ inc, activo, onSelect }: {inc: Incidencia; activo: boolean; onSelect: () => void;}) => (
  // el borde es de color primario si es la seleccionada, si no es gris
  <Card variant="outlined" sx={{ borderWidth: 2, borderColor: activo ? "primary.main" : "divider" }}>
    {/* CardActionArea hace que toda la tarjeta sea clickeable */}
    <CardActionArea onClick={onSelect}>
      <CardContent sx={{ display: "grid", gap: 1 }}>
        <Box sx={{ display: "flex", gap: 1 }}>
          <ChipGravedad gravedad={inc.gravedad} />
          <Chip size="small" variant="outlined" label={inc.tipo} />
        </Box>
        <Typography sx={{ fontWeight: 700 }}>{inc.nombre}</Typography>
        <Typography variant="caption">
          {inc.sala} · {inc.fechaHora} · Folio {inc.folio}
        </Typography>
        {/* el aviso amarillo solo sale si sigue activa y todavia no se avisa al tutor */}
        {inc.estado !== "resuelta" && !inc.tutorNotificado && (
          <Alert severity="warning" sx={{ py: 0 }}>Pendiente de notificar al tutor</Alert>
        )}
        <Typography variant="caption">Estado: <b>{ETIQUETA_ESTADO[inc.estado]}</b></Typography>
      </CardContent>
    </CardActionArea>
  </Card>
);

// par de etiquetas que se usan en los datos del detalle
const Dato = ({ etiqueta, valor }: { etiqueta: string; valor: string }) => (
  <Box>
    <Typography variant="caption" color="text.secondary">{etiqueta}</Typography>
    <Typography variant="body2" sx={{ fontWeight: 600 }}>{valor}</Typography>
  </Box>
);

// panel de la derecha con todo el detalle de la incidencia seleccionada
const Detalle = ({ inc, onRegistrarAccion, onNotificar, onResolver }: {inc?: Incidencia; onRegistrarAccion: () => void; onNotificar: () => void; onResolver: () => void;}) => {
  // si no hay incidencia elegida solo se muestra el mensaje
  if (!inc) {
    return (
      <Card variant="outlined">
        <CardContent><Typography>Selecciona una incidencia para ver su detalle.</Typography></CardContent>
      </Card>
    );
  }
  // atajo para no repetir la comparacion, se usa para ocultar botones y avisos
  const resuelta = inc.estado === "resuelta";
  return (
    <Card variant="outlined">
      <CardHeader title={`Incidencia ${inc.folio}`} />
      <CardContent sx={{ display: "grid", gap: 3 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
          <Dato etiqueta="Niña o niño" valor={inc.nombre} />
          <Dato etiqueta="Sala" valor={inc.sala} />
          <Dato etiqueta="Tipo" valor={inc.tipo} />
          <Dato etiqueta="Fecha y hora" valor={inc.fechaHora} />
          <Dato etiqueta="Reportó" valor={inc.reporto} />
          <Dato etiqueta="Estado" valor={ETIQUETA_ESTADO[inc.estado]} />
          {/* estos dos solo aparecen cuando ya fue resuelta */}
          {inc.resolucion && <Dato etiqueta="Resuelta el" valor={inc.resolucion.fecha} />}
          {inc.resolucion && <Dato etiqueta="Resuelta por" valor={inc.resolucion.por} />}
        </Box>

        <Box>
          <Typography sx={{ fontWeight: 700 }} gutterBottom>Descripción</Typography>
          <Typography variant="body2">{inc.descripcion}</Typography>
        </Box>

        {/* historial de lo que se ha hecho, en orden de la mas vieja a la mas nueva */}
        <Box>
          <Typography sx={{ fontWeight: 700 }} gutterBottom>Acciones realizadas</Typography>
          {/* si no hay acciones se avisa en lugar de dejar el espacio vacio */}
          {inc.acciones.length === 0 && <Typography variant="body2">Sin acciones registradas.</Typography>}
          {/* i se usa como key porque las acciones todavia no tienen id propio */}
          {inc.acciones.map((a, i) => (
            <Typography key={i} variant="body2" sx={{ mb: 0.5 }}>
              <b>{a.hora}</b> · {a.texto} · {a.responsable}
            </Typography>
          ))}
          {/* recordatorio de que falta avisar al tutor, desaparece al notificar o al resolver */}
          {!inc.tutorNotificado && !resuelta && (
            <Typography variant="body2"><b>—</b> · Tutor aún sin notificar</Typography>
          )}
        </Box>

        {/* los botones solo existen mientras la incidencia siga activa, en historicas no se puede editar */}
        {!resuelta && (
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button variant="contained" onClick={onRegistrarAccion}>Registrar acción</Button>
            <Button variant="outlined" onClick={onNotificar} disabled={inc.tutorNotificado}>
              Notificar al tutor
            </Button>
            {/* ml auto lo empuja a la derecha, color error lo pone rojo */}
            <Button variant="outlined" color="error" sx={{ ml: "auto" }} onClick={onResolver}>
              Resolver incidencia
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// lo que devuelve el menu de accion al darle guardar
type DatosAccion = { tipo: string; notas: string; hora: string };
 
// menu que sale al picar "Registrar accion"
const RegistrarAccionDialog = ({ inc, onClose, onGuardar }: {inc: Incidencia; onClose: () => void; onGuardar: (d: DatosAccion) => void;}) => {
  const [hora] = useState(() => ahora().hora); // se calcula al abrir
  const [tipo, setTipo] = useState(""); // la accion elegida, empieza vacia para obligar a elegir una
  const [notas, setNotas] = useState("");
 
  return (
    // onClose se dispara tambien al picar fuera del menu o con la tecla Esc
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Registrar acción</DialogTitle>
      <DialogContent sx={{ display: "grid", gap: 2 }}>
        {/* resumen para que se sepa a cual incidencia se le esta registrando la accion */}
        <Typography variant="body2" color="text.secondary">
          {inc.nombre} · Folio {inc.folio} · Hora de la acción: <b>{hora}</b> (se registra sola)
        </Typography>
        <TextField select label="Acción realizada" value={tipo} onChange={(e) => setTipo(e.target.value)}>
          {TIPOS_ACCION.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
        </TextField>
        <TextField label="Notas de la acción" multiline minRows={3} value={notas}
          onChange={(e) => setNotas(e.target.value)} />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        {/* no deja guardar hasta que se elija la accion */}
        <Button variant="contained" disabled={!tipo} onClick={() => onGuardar({ tipo, notas, hora })}>
          Guardar acción
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// menu que sale al picar "Registrar incidencia"
const RegistrarIncidenciaDialog = ({ onClose, onGuardar }: {onClose: () => void; onGuardar: (n: NuevaIncidencia) => void;}) => {
  // todos los campos del formulario viven en un solo objeto
  // arranca con gravedad "leve" para que ya haya una elegida
  const [datos, setDatos] = useState<NuevaIncidencia>({
    nombre: "", sala: "", tipo: "", gravedad: "leve", descripcion: "",
  });
  // funcion para todos los campos que recibe el nombre del campo y devuelve el onChange, asi no hace falta escribir un setState distinto por cada TextField
  // ...d copia lo que ya estaba y [campo] reemplaza solo el que se escribio
  const cambiar = (campo: keyof NuevaIncidencia) => (e: { target: { value: string } }) =>setDatos((d) => ({ ...d, [campo]: e.target.value }));

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Registrar incidencia</DialogTitle>
      {/* !important evita que la etiqueta del primer campo quede cortada debajo del titulo */}
      <DialogContent sx={{ display: "grid", gap: 2, pt: "8px !important" }}>
        <TextField label="Niña o niño" value={datos.nombre} onChange={cambiar("nombre")} />
        <TextField label="Sala" value={datos.sala} onChange={cambiar("sala")} />
        <TextField select label="Tipo" value={datos.tipo} onChange={cambiar("tipo")}>
          {TIPOS.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
        </TextField>
        <TextField select label="Gravedad" value={datos.gravedad} onChange={cambiar("gravedad")}>
          {(Object.keys(GRAVEDADES) as Gravedad[]).map((g) => (
            <MenuItem key={g} value={g}>{GRAVEDADES[g].label}</MenuItem>
          ))}
        </TextField>
        <TextField label="Descripción" multiline minRows={3} value={datos.descripcion}
          onChange={cambiar("descripcion")} />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        {/* no deja guardar si falta el nombre o el tipo */}
        <Button variant="contained" disabled={!datos.nombre || !datos.tipo} onClick={() => onGuardar(datos)}>
          Guardar incidencia
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// pantalla principal, aqui se conectan los demas componentes
export const HistorialList = () => {
  // datos del usuario logueado, su nombre se usa como responsable de cada accion
  const { identity } = useGetIdentity();
  // ?? "" evita que salga undefined mientras carga la identidad
  const usuario = identity?.fullName ?? "";

  // lista de incidencias en estado para poder modificarlas
  const [incidencias, setIncidencias] = useState<Incidencia[]>(INCIDENCIAS_EJEMPLO);
  const [vista, setVista] = useState<Vista>("activas");
  const [filtro, setFiltro] = useState<Filtro>({ sala: "", tipo: "", gravedad: "" });
  const [seleccionada, setSeleccionada] = useState<string | undefined>();
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [accionAbierta, setAccionAbierta] = useState(false);

  // una incidencia es activa mientras no este resuelta
  const esActiva = (i: Incidencia) => i.estado !== "resuelta";
  const totalActivas = incidencias.filter(esActiva).length;
  const totalHistoricas = incidencias.length - totalActivas;
  // lista de salas sin repetir para llenar el filtro (Set quita los duplicados)
  const salas = Array.from(new Set(incidencias.map((i) => i.sala)));

  // lo que se ve en la lista: primero se queda con las de la pestaña y luego aplica cada filtro
  // un filtro vacio ("") deja pasar todo, por eso el !filtro
  const visibles = incidencias
    .filter((i) => (vista === "activas" ? esActiva(i) : !esActiva(i)))
    .filter((i) => !filtro.sala || i.sala === filtro.sala)
    .filter((i) => !filtro.tipo || i.tipo === filtro.tipo)
    .filter((i) => !filtro.gravedad || i.gravedad === filtro.gravedad)
    .sort((a, b) => (vista === "activas" ? GRAVEDADES[a.gravedad].orden - GRAVEDADES[b.gravedad].orden : 0));

  // busca la incidencia completa a partir del id
  const actual = incidencias.find((i) => i.id === seleccionada);

  // cambia una sola incidencia (la del id) y deja todas las demas igual
  const actualizar = (id: string, cambios: (i: Incidencia) => Incidencia) =>setIncidencias((prev) => prev.map((i) => (i.id === id ? cambios(i) : i)));

  // por ahora el notificar tutor solo deja un mensaje en pantalla, no manda ningun aviso real
  const notificar = () => {
  // si no hay incidencia seleccionada no hace nada
  if (!actual) return;
  const { hora } = ahora();actualizar(actual.id, (i) => ({...i,tutorNotificado: true,acciones: [...i.acciones, { hora, texto: "Tutor notificado", responsable: usuario }],}));
  };

  // se ejecuta cuando se da "Guardar accion" en el menu
  const guardarAccion = (d: DatosAccion) => {
    if (!actual) return;
    // si estaba "abierta" pasa a "en atencion" porque ya se empezo a atender, si no se queda igual
    actualizar(actual.id, (i) => ({...i,estado: i.estado === "abierta" ? "en_atencion" : i.estado,acciones: [...i.acciones,{ hora: d.hora, texto: d.notas ? `${d.tipo}: ${d.notas}` : d.tipo, responsable: usuario },],}));
    // cierra el menu al terminar
    setAccionAbierta(false);
  };

  // se ejecuta al picar "Resolver incidencia", la pasa a Historicas y guarda quien y cuando
  const resolver = () => {
    if (!actual) return;
    actualizar(actual.id, (i) => ({...i, estado: "resuelta", resolucion: { fecha: ahora().completa, por: usuario },}));
    // se deselecciona porque ya no pertenece a la pestaña Activas y el detalle quedaria huerfano
    setSeleccionada(undefined);
  };

  // se ejecuta cuando se da "Guardar incidencia" en el menu
  const guardar = (n: NuevaIncidencia) => {
    const nueva: Incidencia = {
      id: Date.now().toString(),
      // padStart rellena con ceros para que quede INC-0004 y no INC-4
      folio: `INC-${String(incidencias.length + 1).padStart(4, "0")}`, // TODO: lo asigna el backend
      nombre: n.nombre, sala: n.sala, tipo: n.tipo, gravedad: n.gravedad,
      fechaHora: ahora().completa, reporto: usuario, estado: "abierta",
      descripcion: n.descripcion, tutorNotificado: false, acciones: [],
    };
    // la pone al inicio de la lista
    setIncidencias((prev) => [nueva, ...prev]);
    // se cambia a Activas y se selecciona para que se vea de inmediato aunque estuviera en Historicas
    setVista("activas");
    setSeleccionada(nueva.id);
    setDialogoAbierto(false);
  };

  return (
    <Card>
      <CardHeader
        title="Incidencias"
        action={<Button variant="contained" onClick={() => setDialogoAbierto(true)}>Registrar incidencia</Button>}
      />
      <CardContent>
        {/* al cambiar de pestaña tambien se deselecciona para no dejar abierto un detalle que ya no esta en la lista */}
        <Tabs value={vista} onChange={(_, v: Vista) => { setVista(v); setSeleccionada(undefined); }}>
          <Tab value="activas" label={`Activas · ${totalActivas}`} />
          <Tab value="historicas" label={`Históricas · ${totalHistoricas}`} />
        </Tabs>

        <Filtros filtro={filtro} salas={salas} onChange={setFiltro} />

        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "2fr 3fr" }, alignItems: "start" }}>
          <Box sx={{ display: "grid", gap: 2, maxHeight: "65vh", overflowY: "auto", pr: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              {visibles.length} {vista === "activas" ? "incidencias activas · ordenadas por gravedad" : "incidencias históricas"}
            </Typography>
            {/* una tarjeta por cada incidencia visible, la seleccionada se marca con activo */}
            {visibles.map((i) => (
              <IncidenciaCard key={i.id} inc={i} activo={i.id === seleccionada} onSelect={() => setSeleccionada(i.id)} />
            ))}
          </Box>
          <Detalle inc={actual} onRegistrarAccion={() => setAccionAbierta(true)} onNotificar={notificar} onResolver={resolver} />
        </Box>

        {/* los menus solo existen mientras estan abiertos, asi cada vez que se abren empiezan limpios y con la hora nueva */}
        {actual && accionAbierta && (
          <RegistrarAccionDialog inc={actual} onClose={() => setAccionAbierta(false)} onGuardar={guardarAccion} />
        )}

        {dialogoAbierto && (
          <RegistrarIncidenciaDialog onClose={() => setDialogoAbierto(false)} onGuardar={guardar} />
        )}
      </CardContent>
    </Card>
  );
};