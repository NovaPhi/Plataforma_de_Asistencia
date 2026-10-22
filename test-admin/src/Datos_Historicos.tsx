import { useEffect, useState } from "react";
import {Box, Button, Card, CardActionArea, CardContent, CardHeader, Chip, Dialog,DialogActions, DialogContent, DialogTitle, MenuItem, Tab, Tabs, TextField, Typography,} from "@mui/material";
import { API_URL } from "./config";

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
// el nombre y la sala los saca la API del infante con esa matricula
type NuevaIncidencia = {matricula: string; tipo: string; gravedad: Gravedad; descripcion: string;};

// lo que se captura en el menu de "Registrar accion" y se manda a la API
type DatosAccion = { tipo: string; notas: string };

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

// fecha y hora en formato de mexico, si viene vacia o mala devuelve un guion
const fechaTexto = (iso: string) => {
  const d = new Date(iso);
  return isNaN(d.getTime()) //saca los milisegundos
    ? "—"
    // dateStyle short 21/10/26, timeStyle short hora y minuto, hour12 false 24 horas
    : d.toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short", hour12: false });
};

// Headers es la clase del navegador que guarda los encabezados de una peticion http
// "Content-Type" avisa que se manda json, "Authentication" lleva el token del login
const encabezados = () => new Headers({"Content-Type": "application/json","Authentication": sessionStorage.getItem("auth") ?? "",});

// manda una peticion que regresa una incidencia (crear, registrar accion, notificar y resolver)
// la API siempre regresa la incidencia ya actualizada
// ruta: lo que va despues de /incidencias, metodo: POST o PATCH, body: lo que se manda, o undefined si no lleva
const enviar = async (ruta: string, metodo: "POST" | "PATCH", body: object | undefined, mensajeError: string) => {
  // Request arma la peticion con direccion, metodo, cuerpo y encabezados
  const request = new Request(`${API_URL}/incidencias${ruta}`, {
    method: metodo,
    // si hay body lo convierte a texto json con JSON.stringify, si no (undefined) no manda nada
    body: body ? JSON.stringify(body) : undefined,
    headers: encabezados(),
  });
  try {
    // fetch manda la peticion, await espera la respuesta antes de seguir
    const res = await fetch(request);
    if (res.status < 200 || res.status >= 300) {
      throw new Error(res.statusText);
    }
    return (await res.json()) as Incidencia;
  } catch {
    throw new Error(mensajeError);
  }
};

// chip de color segun la gravedad (rojo, amarillo, azul)
const ChipGravedad = ({ gravedad }: { gravedad: Gravedad }) => {
  // busca en GRAVEDADES los datos de esa gravedad (texto y colores)
  const g = GRAVEDADES[gravedad];
  return <Chip size="small" label={g.label} sx={{ bgcolor: g.bg, color: g.color, fontWeight: 700 }} />;
};

// los tres filtros que se pueden aplicar
type Filtro = { sala: string; tipo: string; gravedad: string };

// filtros de sala, tipo y gravedad, estos si filtran la lista
const Filtros = ({ filtro, salas, onChange }: {filtro: Filtro; salas: string[]; onChange: (f: Filtro) => void;}) => (
  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", my: 2 }}>
    {/* native usa el select del navegador, asi la etiqueta si queda unida al campo y WAVE no marca error */}
    {/* shrink deja la etiqueta arriba siempre, si no se encima con "Todas las salas" */}
    <TextField
      select // lo hace menu desplegable
      id="filtro-sala" // une la etiqueta con el campo
      size="small"
      label="Sala"
      value={filtro.sala}
      sx={{ minWidth: 200 }}
      slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}
      //...filtro copia los otros dos filtros y solo cambia el campo que se toco 
      onChange={(e) => onChange({ ...filtro, sala: e.target.value })}> // 
      <option value="">Todas las salas</option>
      {/* map recorre la lista de salas y por cada una crea una option, key ayuda a react a distinguirlas */}
      {salas.map((s) => <option key={s} value={s}>{s}</option>)}
    </TextField>
    <TextField
      select
      id="filtro-tipo"
      size="small"
      label="Tipo"
      value={filtro.tipo}
      sx={{ minWidth: 200 }}
      slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}
      // copia los otros ...filtros y cambia solo tipo
      onChange={(e) => onChange({ ...filtro, tipo: e.target.value })}>
      <option value="">Todos los tipos</option>
      {/* map recorre TIPOS (Accidente, Enfermedad, Conducta) y crea una option por cada uno */}
      {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
    </TextField>
    <TextField
      select
      id="filtro-gravedad"
      size="small"
      label="Gravedad"
      value={filtro.gravedad}
      sx={{ minWidth: 200 }}
      slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}
      onChange={(e) => onChange({ ...filtro, gravedad: e.target.value })}>
      <option value="">Todas</option>
      {/* Object.keys saca las llaves del objeto GRAVEDADES como lista de textos y "as Gravedad[]" dice si esos textos son gravedades validas */}
      {/* map crea una option por cada gravedad, el texto visible sale de GRAVEDADES[g].label */}
      {(Object.keys(GRAVEDADES) as Gravedad[]).map((g) => (
        <option key={g} value={g}>{GRAVEDADES[g].label}</option>
      ))}
    </TextField>
  </Box>
);

// tarjeta de la lista de la izquierda, un resumen de la incidencia
// inc: los datos que dibuja
const IncidenciaCard = ({ inc, activo, onSelect }: {inc: Incidencia; activo: boolean; onSelect: () => void;}) => (
  // el borde es de color primario si es la seleccionada, si no es gris
  <Card variant="outlined" sx={{ borderWidth: 2, borderColor: activo ? "primary.main" : "divider" }}>
    {/* CardActionArea hace que toda la tarjeta sea clickeable y onClick corre onSelect al picar en cualquier parte de la tarjeta */}
    <CardActionArea onClick={onSelect}>
      {/* CardContent es el espacio interior */}
      <CardContent sx={{ display: "grid", gap: 1 }}>
        <Box sx={{ display: "flex", gap: 1 }}>
          {/* chip de color de la gravedad */}
          <ChipGravedad gravedad={inc.gravedad} />
          {/* chip solo con borde con el tipo (Accidente, etc) */}
          <Chip size="small" variant="outlined" label={inc.tipo} />
        </Box>
        <Typography sx={{ fontWeight: 700 }}>{inc.nombre}</Typography>
        <Typography variant="caption">
          {/* fechaTexto convierte la fecha iso en fecha y hora legible */}
          {inc.sala} · {fechaTexto(inc.fechaHora)} · Folio {inc.folio}
        </Typography>
        {/* <b> pone el estado en negritas y ETIQUETA_ESTADO busca el texto bonito */}
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
// inc significa que puede ser undefined (cuando no hay ninguna elegida)
const Detalle = ({ inc, guardando, onRegistrarAccion, onResolver }: {inc?: Incidencia; guardando: boolean; onRegistrarAccion: () => void; onResolver: () => void;}) => {
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
      {/* titulo con el folio, los backticks arman el texto con el folio adentro */}
      <CardHeader title={`Incidencia ${inc.folio}`} />
      <CardContent sx={{ display: "grid", gap: 3 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
          <Dato etiqueta="Niña o niño" valor={inc.nombre} />
          <Dato etiqueta="Sala" valor={inc.sala} />
          <Dato etiqueta="Tipo" valor={inc.tipo} />
          {/* fechaTexto convierte la fecha iso en fecha y hora */}
          <Dato etiqueta="Fecha y hora" valor={fechaTexto(inc.fechaHora)} />
          <Dato etiqueta="Reportó" valor={inc.reporto} />
          {/* busca el texto bonito del estado */}
          <Dato etiqueta="Estado" valor={ETIQUETA_ESTADO[inc.estado]} />
          {/* estos dos solo aparecen cuando ya fue resuelta */}
          {inc.resolucion && <Dato etiqueta="Resuelta el" valor={fechaTexto(inc.resolucion.fecha)} />}
          {inc.resolucion && <Dato etiqueta="Resuelta por" valor={inc.resolucion.por} />}
        </Box>

        {/* bloque de descripcion */}
        <Box>
          {/* gutterBottom le deja un margen abajo al texto */}
          <Typography sx={{ fontWeight: 700 }} gutterBottom>Descripción</Typography>
          <Typography variant="body2">{inc.descripcion}</Typography>
        </Box>

        {/* historial de lo que se ha hecho, en orden de la mas vieja a la mas nueva */}
        <Box>
          <Typography sx={{ fontWeight: 700 }} gutterBottom>Acciones realizadas</Typography>
          {/* si no hay acciones se avisa en lugar de dejar el espacio vacio */}
          {inc.acciones.length === 0 && <Typography variant="body2">Sin acciones registradas.</Typography>}
          {/* i se usa como key porque las acciones todavia no tienen id propio */}
          {/* map recorre las acciones, a es cada accion e i su numero de posicion (0, 1, 2...) */}
          {inc.acciones.map((a, i) => (
            <Typography key={i} variant="body2" sx={{ mb: 0.5 }}>
              {/* <b> pone la fecha en negritas, luego el texto de la accion y quien la hizo */}
              <b>{fechaTexto(a.hora)}</b> · {a.texto} · {a.responsable}
            </Typography>
          ))}
        </Box>

        {/* los botones solo existen mientras la incidencia siga activa, en historicas no se puede editar */}
        {!resuelta && (
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button variant="contained" onClick={onRegistrarAccion} disabled={guardando}>Registrar acción</Button>
            {/* ml auto lo empuja a la derecha, color error lo pone rojo */}
            {/* onClick={onResolver} corre la funcion del padre que manda el PATCH de resolver */}
            <Button variant="outlined" color="error" sx={{ ml: "auto" }} onClick={onResolver} disabled={guardando}>
              Resolver incidencia
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
 
// menu que sale al picar "Registrar accion"
const RegistrarAccionDialog = ({ inc, guardando, onClose, onGuardar }: {inc: Incidencia; guardando: boolean; onClose: () => void; onGuardar: (d: DatosAccion) => void;}) => {
  // la accion elegida, empieza vacia para obligar a elegir una
  const [tipo, setTipo] = useState("");
  const [notas, setNotas] = useState("");
  return (
    // onClose se dispara tambien al picar fuera del menu o con la tecla Esc
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Registrar acción</DialogTitle>
      <DialogContent sx={{ display: "grid", gap: 2 }}>
        {/* resumen para que se sepa a cual incidencia se le esta registrando la accion */}
        <Typography variant="body2" color="text.secondary">
          {inc.nombre} · Folio {inc.folio} · La hora se registra sola
        </Typography>
        <TextField select label="Acción realizada" value={tipo} onChange={(e) => setTipo(e.target.value)}>
          {/* map recorre las acciones posibles y crea un MenuItem por cada una */}
          {TIPOS_ACCION.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
        </TextField>
        <TextField label="Notas de la acción" multiline minRows={3} value={notas}
          // guarda lo que se escriba
          onChange={(e) => setNotas(e.target.value)} />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        {/* no deja guardar hasta que se elija la accion, las notas son opcionales */}
        <Button variant="contained" disabled={!tipo || guardando} onClick={() => onGuardar({ tipo, notas })}>
          {guardando ? "Guardando..." : "Guardar acción"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};


// menu que sale al picar "Registrar incidencia"
const RegistrarIncidenciaDialog = ({ guardando, onClose, onGuardar }: {guardando: boolean; onClose: () => void; onGuardar: (n: NuevaIncidencia) => void;}) => {
  // todos los campos del formulario viven juntos en un solo objeto
  // arranca con gravedad "leve" para que ya haya una elegida
  const [datos, setDatos] = useState<NuevaIncidencia>({matricula: "", tipo: "", gravedad: "leve", descripcion: "",});
  // ...d copia lo que ya estaba y [campo] reemplaza solo el que se escribio
  const cambiar = (campo: keyof NuevaIncidencia) => (e: { target: { value: string } }) => setDatos((d) => ({ ...d, [campo]: e.target.value }));
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Registrar incidencia</DialogTitle>
      {/* el pt con !important evita que la etiqueta del primer campo quede cortada debajo del titulo */}
      <DialogContent sx={{ display: "grid", gap: 2, pt: "8px !important" }}>
        <TextField label="Matrícula de la niña o niño" value={datos.matricula} onChange={cambiar("matricula")} />
        {/* select de tipo con MenuItem por cada elemento de TIPOS */}
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
        {/* no deja guardar si falta la matricula o el tipo, lo demas es opcional */}
        <Button variant="contained" disabled={!datos.matricula || !datos.tipo || guardando} onClick={() => onGuardar(datos)}>
          {guardando ? "Guardando..." : "Guardar incidencia"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// pantalla principal, aqui se conectan los demas componentes
export const HistorialList = () => {
  // lista de incidencias en estado para poder modificarlas
  // useState<Incidencia[]>([]) crea una lista de incidencias que empieza vacia ([])
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [cargando, setCargando] = useState(true); // true mientras llega el GET
  const [guardando, setGuardando] = useState(false); // true mientras se espera un POST o PATCH
  // pestaña activa: activas o historicas
  const [vista, setVista] = useState<Vista>("activas");
  // filtros elegidos, "" en todos al inicio para que no filtre nada
  const [filtro, setFiltro] = useState<Filtro>({ sala: "", tipo: "", gravedad: "" });
  // id de la incidencia abierta en el detalle, undefined mientras no se elija ninguna
  const [seleccionada, setSeleccionada] = useState<string | undefined>();
  // si el menu de "Registrar incidencia" esta abierto o cerrado
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  // si el menu de "Registrar accion" esta abierto o cerrado
  const [accionAbierta, setAccionAbierta] = useState(false);

  // pedir incidencias a API
  const handleGetData = async () => {
    const request = new Request(`${API_URL}/incidencias`, {
      method: "GET",
      headers: encabezados(),
    });
    try {
      const res = await fetch(request);
      if (res.status < 200 || res.status >= 300) {
        throw new Error(res.statusText);
      }
      setIncidencias(await res.json());
    } catch {
      throw new Error("No se pudieron cargar las incidencias");
    }
  };

  // useEffect corre el codigo al abrir la pantalla, el [] del final significa "solo una vez"
  useEffect(() => {
    handleGetData().catch((error) => {
      console.error(error);
      alert(error.message);
    }).finally(() => setCargando(false));
  }, []);

  // una incidencia es activa mientras no este resuelta
  const esActiva = (i: Incidencia) => i.estado !== "resuelta";
  // conteos que se muestran en las pestañas, no se ven afectados por los filtros
  // .filter(esActiva) deja solo las activas y .length las cuenta
  const totalActivas = incidencias.filter(esActiva).length;
  // las historicas son el total menos las activas
  const totalHistoricas = incidencias.length - totalActivas;
  // lista de salas sin repetir para llenar el filtro (Set quita los duplicados)
  const salas = Array.from(new Set(incidencias.map((i) => i.sala)));

  // un filtro vacio ("") deja pasar todo, por eso el !filtro.algo
  const visibles = incidencias
    .filter((i) => (vista === "activas" ? esActiva(i) : !esActiva(i))) // segun la pestaña, activas en activas y no activas en historicas
    .filter((i) => !filtro.sala || i.sala === filtro.sala)
    .filter((i) => !filtro.tipo || i.tipo === filtro.tipo)
    .filter((i) => !filtro.gravedad || i.gravedad === filtro.gravedad)
    // sort ordena la lista comparando de dos en dos (a y b): si el resultado es negativo a va antes, si es positivo b va antes, si es 0 quedan igual
    .sort((a, b) => (vista === "activas" ? GRAVEDADES[a.gravedad].orden - GRAVEDADES[b.gravedad].orden : 0));

  // busca la incidencia completa a partir del id para mostrarla en el detalle
  // .find regresa la primera incidencia cuyo id coincide, o undefined si no hay ninguna
  const actual = incidencias.find((i) => i.id === seleccionada);

  // cambia una sola incidencia por la version nueva que mando la API y deja todas las demas igual
   // prev es la lista anterior, map recorre cada incidencia: si el id coincide pone la nueva, si no deja la misma
  const reemplazar = (nueva: Incidencia) => setIncidencias((prev) => prev.map((i) => (i.id === nueva.id ? nueva : i)));

  // se ejecuta cuando se da "Guardar accion" en el menu
  const guardarAccion = async (d: DatosAccion) => {
    if (!actual) return;
    // prende "Guardando..." para apagar los botones
    setGuardando(true);
    try {
      reemplazar(await enviar(`/${actual.id}/acciones`, "POST", d, "No se pudo guardar la acción"));
      // el menu solo se cierra si salio bien, si falla se queda abierto para no perder lo escrito
      setAccionAbierta(false);
    } catch (error) {
      console.error(error);
      alert((error as Error).message);
    } finally {
      setGuardando(false);
    }
  };
  
  // se ejecuta al picar "Resolver incidencia", la pasa a Historicas
  // la API pone estado "resuelta" y guarda quien y cuando la resolvio
  const resolver = async () => {
    if (!actual) return;
    setGuardando(true);
    try {
      reemplazar(await enviar(`/${actual.id}/resolver`, "PATCH", undefined, "No se pudo resolver la incidencia"));
      // se deselecciona porque ya no pertenece a la pestaña Activas y el detalle quedaria huerfano
      setSeleccionada(undefined);
    } catch (error) {
      console.error(error);
      alert((error as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  // se ejecuta cuando se da "Registrar incidencia" en el menu
  // la API asigna folio, fecha, estado "abierta" y quien reporto (sale del token) y regresa la incidencia creada
  const guardar = async (n: NuevaIncidencia) => {
    setGuardando(true);
    try {
      const nueva = await enviar("", "POST", n, "No se pudo guardar la incidencia");
      // la pone al inicio de la lista
      setIncidencias((prev) => [nueva, ...prev]);
      // se cambia a Activas y se selecciona para que se vea de inmediato aunque estuviera en Historicas
      setVista("activas");
      setSeleccionada(nueva.id);
      // cierra el menu
      setDialogoAbierto(false);
    } catch (error) {
      console.error(error);
      alert((error as Error).message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Card>
      {/* el boton de registrar va en la esquina del titulo (action) */}
      <CardHeader
        title="Incidencias"
        action={<Button variant="contained" onClick={() => setDialogoAbierto(true)}>Registrar incidencia</Button>}
      />
      <CardContent>
        {/* al cambiar de pestaña tambien se deselecciona para no dejar abierto un detalle que ya no esta en la lista */}
        <Tabs value={vista} onChange={(_, v: Vista) => { setVista(v); setSeleccionada(undefined); }}>
          {/* cada pestaña muestra su conteo, los backticks arman el texto con el numero adentro */}
          <Tab value="activas" label={`Activas · ${totalActivas}`} />
          <Tab value="historicas" label={`Históricas · ${totalHistoricas}`} />
        </Tabs>
 
        <Filtros filtro={filtro} salas={salas} onChange={setFiltro} />
 
        {/* mensaje de carga, solo se dibuja mientras cargando sea true */}
        {cargando && (
          <Typography color="text.secondary" sx={{ pb: 2 }}>
            Cargando incidencias...
          </Typography>
        )}
 
        {/* en celular una columna, en pantalla grande lista a la izquierda y detalle a la derecha */}
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "2fr 3fr" }, alignItems: "start" }}>
          {/* la lista tiene altura maxima y scroll propio para que el detalle no se mueva */}
          {/* maxHeight es el maximo del alto de la pantalla, overflowY auto pone scroll si se pasa, pr 1 deja espacio para la barra */}
          <Box sx={{ display: "grid", gap: 2, maxHeight: "65vh", overflowY: "auto", pr: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              {visibles.length} {vista === "activas" ? "incidencias activas · ordenadas por gravedad" : "incidencias históricas"}
            </Typography>
            {/* una tarjeta por cada incidencia visible, la seleccionada se marca con activo */}
            {/* map recorre las visibles y por cada una dibuja una IncidenciaCard */}
            {visibles.map((i) => (
              <IncidenciaCard key={i.id} inc={i} activo={i.id === seleccionada} onSelect={() => setSeleccionada(i.id)} />
            ))}
          </Box>
          {/* los botones del detalle solo avisan, aqui se decide que hace cada uno */}
          <Detalle inc={actual} guardando={guardando} onRegistrarAccion={() => setAccionAbierta(true)} onResolver={resolver}/>
        </Box>
 
        {/* los menus solo existen mientras estan abiertos, asi cada vez que se abren empiezan limpios */}
        {actual && accionAbierta && (
          <RegistrarAccionDialog inc={actual} guardando={guardando} onClose={() => setAccionAbierta(false)} onGuardar={guardarAccion} />
        )}
 
        {/* el menu de nueva incidencia solo necesita que dialogoAbierto sea true */}
        {dialogoAbierto && (
          <RegistrarIncidenciaDialog guardando={guardando} onClose={() => setDialogoAbierto(false)} onGuardar={guardar} />
        )}
      </CardContent>
    </Card>
  );
};