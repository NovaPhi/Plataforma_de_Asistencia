import { useEffect, useState, type ReactNode } from "react"; // "type ReactNode" es un tipo solo para el editor que significa "cualquier cosa que react pueda dibujar"
import { usePermissions } from "react-admin"; // los saca de authProvider.getPermissions
import {Box, Card, CardContent, CardHeader, Chip, Tab, Table, TableBody, TableCell, TableHead, TableRow, Tabs, TextField, ToggleButton, ToggleButtonGroup, Typography,} from "@mui/material";
import { API_URL } from "./config";

// rango de las estadisticas, la API calcula todo con este rango
type Periodo = "hoy" | "mes" | "trimestre";

// color del semaforo de una estancia
type Semaforo = "verde" | "amarillo" | "rojo";

// un numero que la API puede mandar como null cuando el grupo es muy chico (menos de 5 niños), de esta forma no se puede identificar a un niño, en pantalla se muestra "< 5"
type Suprimible = number | null;

// una fila de la tabla de estancias, un renglon por estancia
type FilaEstancia = {
  estancia: string; // clave de la estancia
  region: string;
  tasa: number; // asistencia en porcentaje 
  sinCaptura: boolean; // true si ese dia no se capturo asistencia
};

// un conteo por estancia o por causa, puede venir suprimido
type ConteoEtiqueta = { etiqueta: string; total: Suprimible };

// lo que regresa la API en GET /estadisticas, ya agregado sin nombres ni matriculas
type Estadisticas = {
  alcance: string; //texto del encabezado
  regiones: string[]; // regiones que el usuario puede elegir en el filtro, el supervisor regional recibe solo la suya (y no se muestra el filtro)
  asistencia: {
    tasaAsistencia: number; // porcentaje
    tasaAusencia: number; // porcentaje
    // diferencia en puntos porcentuales contra el periodo anterior, positivo es que subio el ausencia
    tendencia: { dia: number; semana: number; mes: number };
    porGrupo: { grupo: string; tasa: Suprimible }[];
    estancias: FilaEstancia[];
  };
  seguimiento: {
    casosPorCausa: ConteoEtiqueta[]; // codigo de la causa (ENF_CASA, ACC_EXT, PER_TUT, NO_LOC)
    abiertos: number;
    cerrados: number;
    diasPromedioCierre: number;
    conBloqueo: number; // casos con "Requiere alta"
    diasPromedioAlta: number;
  };
  // solo la manda la API si el usuario es administrador, si no viene undefined
  auditoria?: { accesosNotas: number; cambiosEstatus: number };
};

// roles que pueden entrar a esta pantalla (oculta cosas)
const ROLES_ESTADISTICAS = ["ADMINISTRADOR_CENTRAL", "SUPERVISOR_CENTRAL", "SUPERVISOR_REGIONAL"];

// limites del semaforo por estancia
const VERDE_MIN = 90; // de 90% para arriba es verde
const AMARILLO_MIN = 80; // de 80 a 89% es amarillo y menos de 80% es rojo

// colores y texto de cada semaforo, mismo estilo que los chips de gravedad de Incidencias
// Record<Semaforo significa que es un objeto cuyas llaves son los 3 colores de Semaforo
const SEMAFORO: Record<Semaforo, { label: string; bg: string; color: string }> = {
  verde: { label: "Verde", bg: "#e3f4e6", color: "#14532d" },
  amarillo: { label: "Amarillo", bg: "#fff3cd", color: "#6b4e00" },
  rojo: { label: "Rojo", bg: "#fde8e6", color: "#8c1d18" },
};

// opciones del filtro de periodo arreglo de objetos con esas dos llaves
const PERIODOS: { value: Periodo; label: string }[] = [
  { value: "hoy", label: "hoy" },
  { value: "mes", label: "Mes" },
  { value: "trimestre", label: "Trimestre" },
];

// codigo de causa -> texto que ve el usuario
const CAUSA_TEXTO: Record<string, string> = {
  ENF_CASA: "Enfermedad en casa",
  ACC_EXT: "Accidente fuera del plantel",
  PER_TUT: "Permiso del tutor",
  NO_LOC: "No localizado",
};

// de la tasa de asistencia saca el color del semaforo
const semaforoDe = (tasa: number): Semaforo => tasa >= VERDE_MIN ? "verde" : tasa >= AMARILLO_MIN ? "amarillo" : "rojo";

// numero entero o "< 5" si la API lo suprimio // propuesto por Claude
const num = (v: Suprimible) => (v === null ? "< 5" : String(v));

// porcentaje con un decimal, o "< 5" si esta suprimido // propuesto por Claude
const pct = (v: Suprimible) => (v === null ? "< 5" : `${v.toFixed(1)}%`);

// headers de todas las peticiones, el token va en "Authentication" 
const encabezados = () => new Headers({"Content-Type": "application/json","Authentication": sessionStorage.getItem("auth") ?? "",});

// cuadro con un numero grande y una etiqueta, se usa para los indicadores de arriba
// detalle: texto chico opcional debajo del numero (ej. la tendencia), colorDetalle: color opcional del detalle (ej. verde cuando esta dentro de la meta)
const Indicador = ({ etiqueta, valor, detalle }: { etiqueta: string; valor: string; detalle?: string }) => (
  <Card variant="outlined">
    <CardContent sx={{ display: "grid", gap: 0.5 }}>
      {/* text.secondary es el gris del tema */}
      <Typography variant="caption" color="text.secondary">{etiqueta}</Typography>
      {/* numero grande (h5) y en negritas (700) (span dado por Claude)*/}
      <Typography variant="h5" component="span" display="block" fontWeight={700}>{valor}</Typography>
      {/* el detalle solo se dibuja si viene (&& no dibuja nada si es undefined) */}
      {detalle && <Typography variant="caption" color= "text.secondary">{detalle}</Typography>}
    </CardContent>
  </Card>
);

// rejilla para acomodar los cuadros de numeros en filas y columnas
// children es lo que se escribe entre las etiquetas del componente, de tipo ReactNode (cualquier cosa dibujable) / Ayudado or Claude
const RejillaIndicadores = ({ children }: { children: ReactNode }) => (<Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" } }}>{children}</Box>);

// chip de color segun el semaforo (verde, amarillo, rojo)
const ChipSemaforo = ({ semaforo }: { semaforo: Semaforo }) => {
  // busca los colores y el texto en la configuracion de arriba
  const s = SEMAFORO[semaforo];
  // Chip es una etiqueta redonda de size small
  return <Chip size="small" label={s.label} sx={{ bgcolor: s.bg, color: s.color, fontWeight: 700 }} />;
};

// titulo de una seccion dentro de una pestaña
const Seccion = ({ titulo, children }: { titulo: string; children: ReactNode }) => (
  <Box sx={{ display: "grid", gap: 1 }}>
    <Typography fontWeight={700}>{titulo}</Typography>
    {children}
  </Box>
);

// tabla sencilla de etiqueta y valor, se usa para los conteos (turnos, grupos, causas, etc.)
const TablaConteo = ({ columnas, filas }: { columnas: [string, string]; filas: [string, string][] }) => (
  <Table size="small">
    <TableHead>
      {/* TableRow es un renglon */}
      <TableRow>
        <TableCell>{columnas[0]}</TableCell>
        <TableCell align="right">{columnas[1]}</TableCell>
      </TableRow>
    </TableHead>
    {/* TableBody es el cuerpo con los datos */}
    <TableBody>
      {/* si no hay datos se avisa en lugar de dejar la tabla vacia */}
      {filas.length === 0 && (
        <TableRow><TableCell colSpan={2}>Sin datos.</TableCell></TableRow>
      )}
      {/* map crea una fila por cada par, key ayuda a react a distinguirlas */}
      {/* ([a, b]) saca los dos elementos del par: a es la etiqueta y b el valor */}
      {filas.map(([a, b]) => (
        <TableRow key={a}>
          <TableCell>{a}</TableCell>
          <TableCell align="right">{b}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

// pestaña de asistencia
const PestanaAsistencia = ({ datos }: { datos: Estadisticas["asistencia"] }) => {
  // ranking de la tabla: "menor" muestra primero las de peor asistencia, <"menor" | "mayor"> limita los valores posibles
  const [orden, setOrden] = useState<"menor" | "mayor">("menor");
  // copia del arreglo ordenada, [...] evita ordenar el original
  const estancias = [...datos.estancias].sort((a, b) => (orden === "menor" ? a.tasa - b.tasa : b.tasa - a.tasa));
  // cuantas estancias no capturaron nada
  const sinCaptura = datos.estancias.filter((e) => e.sinCaptura).length;

  return (
    <Box sx={{ display: "grid", gap: 3 }}>
      {/* los 3 indicadores de arriba */}
      <RejillaIndicadores>
        {/* pct convierte el numero en texto con %, detalle es el texto chico de abajo */}
        <Indicador etiqueta="Tasa de asistencia" valor={pct(datos.tasaAsistencia)} detalle="Presentes entre inscritos" />
        <Indicador etiqueta="Tasa de ausencia" valor={pct(datos.tasaAusencia)} />
        {/* String convierte el numero a texto porque valor espera texto */}
        <Indicador etiqueta="Sin asistencia capturada" valor={String(sinCaptura)} detalle="Estancias sin captura"/>
      </RejillaIndicadores>

      <Seccion titulo="Por sala o grupo">
        {/* maxWidth para que la tabla no se estire sola */}
        <Box sx={{ maxWidth: 480 }}>
          <TablaConteo columnas={["Sala", "Asistencia"]} filas={datos.porGrupo.map((g) => [g.grupo, pct(g.tasa)])} />
        </Box>
      </Seccion>

      <Seccion titulo="Estancias">
        {/* select para elegir el orden, value es lo elegido y onChange lo guarda */}
        {/* e.target.value es el texto elegido y as le dice es "menor" o "mayor" */}
        <TextField 
          select 
          id="ranking-estancias"
          size="small" 
          label="Ranking" 
          value={orden} 
          sx={{ maxWidth: 240 }}
          slotProps={{ select: { native: true }, inputLabel: { shrink: true } }} // Propuesta de Claude
          onChange={(e) => setOrden(e.target.value as "menor" | "mayor")}>
          {/* MenuItem es una opcion del menu, value es lo que se guarda */}
          <option value="menor">Menor asistencia primero</option>
          <option value="mayor">Mayor asistencia primero</option>
        </TextField>
        {/* overflowX deja hacer scroll de lado en celular para que la tabla no se aplaste */}
        <Box sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {/* Encabezados */}
                <TableCell>Estancia</TableCell>
                <TableCell>Región</TableCell>
                <TableCell align="right">Asistencia</TableCell>
                <TableCell>Semáforo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* map recorre la lista ya ordenada y crea una fila por estancia, e es cada estancia */}
              {estancias.map((e) => (
                <TableRow key={e.estancia}>
                  <TableCell>{e.estancia}</TableCell>
                  <TableCell>{e.region}</TableCell>
                  {/* pct convierte la tasa en texto con % */}
                  <TableCell align="right">{pct(e.tasa)}</TableCell>
                  {/* semaforoDe saca el color segun la tasa y ChipSemaforo dibuja la etiqueta */}
                  <TableCell><ChipSemaforo semaforo={semaforoDe(e.tasa)} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
        <Typography variant="caption" color="text.secondary">
          {/* &lt; es el simbolo < */}
          Semáforo: verde de {VERDE_MIN}% para arriba, amarillo de {AMARILLO_MIN}% a {VERDE_MIN - 1}%, rojo menos de {AMARILLO_MIN}%. Los conteos de menos de 5 niños se muestran como "&lt; 5".
        </Typography>
      </Seccion>
    </Box>
  );
};

// pestaña de seguimiento de faltas solo la parte "seguimiento" de lo que mando la API
const PestanaSeguimiento = ({ datos }: { datos: Estadisticas["seguimiento"] }) => (
  <Box sx={{ display: "grid", gap: 3 }}>
    <RejillaIndicadores>
      {/* String convierte el numero a texto */}
      <Indicador etiqueta="Casos abiertos" valor={String(datos.abiertos)} detalle="Pendientes de cerrar" />
      <Indicador etiqueta="Casos cerrados" valor={String(datos.cerrados)} />
      <Indicador etiqueta="Con bloqueo (requiere alta)" valor={String(datos.conBloqueo)} />
    </RejillaIndicadores>

    <Seccion titulo="Casos abiertos por causa">
      {/* la causa llega como codigo, CAUSA_TEXTO la traduce y si no la conoce deja el codigo */}
      <Box sx={{ maxWidth: 480 }}>
        {/* map convierte cada causa en un par [texto bonito, total], ?? usa el codigo tal cual si no esta en CAUSA_TEXTO, num pone "< 5" si el total es null */}
        <TablaConteo columnas={["Causa", "Casos"]} filas={datos.casosPorCausa.map((c) => [CAUSA_TEXTO[c.etiqueta] ?? c.etiqueta, num(c.total)])} />
      </Box>
    </Seccion>
 
    {/* &lt; es el simbolo < */}
    <Typography variant="caption" color="text.secondary">
      Solo números agregados: no se muestran nombres, matrículas ni contenido de ningún caso. Los conteos de menos de 5 se muestran como "&lt; 5".
    </Typography>
  </Box>
);

// pestaña de auditoria, solo la ve el administrador, son conteos de accesos sin decir quien
// NonNullable quita el undefined del tipo
const PestanaAuditoria = ({ datos }: { datos: NonNullable<Estadisticas["auditoria"]> }) => (
  <Box sx={{ display: "grid", gap: 3 }}>
    <RejillaIndicadores>
      <Indicador etiqueta="Accesos a notas confidenciales" valor={String(datos.accesosNotas)} detalle="En el periodo seleccionado" />
      <Indicador etiqueta="Cambios de estatus" valor={String(datos.cambiosEstatus)} detalle="En el periodo seleccionado" />
    </RejillaIndicadores>
    <Typography variant="caption" color="text.secondary">
      Solo conteos, sin decir quién consultó o cambió cada cosa. El detalle por usuario sigue en Bitácora.
    </Typography>
  </Box>
);

// pestañas posibles, la de auditoria se agrega solo para el administrador
type Vista = "asistencia" | "seguimiento" | "auditoria";

// pantalla principal, aqui se conectan los demas componentes
export const EstadisticasList = () => {
  // roles del usuario, permissions es undefined mientras react-admin los esta leyendo
  const { permissions, isLoading } = usePermissions();
  // ?? [] significa que si permissions es undefined usa una lista vacia, asi no truena
  const roles: string[] = permissions ?? [];
  // .some revisa si AL MENOS UN rol del usuario cumple la condicion. r => ROLES_ESTADISTICAS.includes(r) (el rol esta en la lista de permitidos
  const puedeVer = roles.some((r) => ROLES_ESTADISTICAS.includes(r));
  const esAdmin = roles.includes("ADMINISTRADOR_CENTRAL");

  // estadisticas que mando la API, undefined mientras no lleguen
  const [datos, setDatos] = useState<Estadisticas | undefined>();
  const [cargando, setCargando] = useState(true); // true mientras llega el GET
  // filtros de el rango (dia, mes o trimestre) y la region 
  const [periodo, setPeriodo] = useState<Periodo>("hoy");
  const [region, setRegion] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [estancia, setEstancia] = useState("");
  // pestaña activa
  const [vista, setVista] = useState<Vista>("asistencia");

  // espera 400 ms despues de la ultima tecla para pasar lo escrito a estancia
  useEffect(() => {
    const t = setTimeout(() => setEstancia(busqueda.trim()), 400); // trim quita espacios sobrantes
    return () => clearTimeout(t);
  }, [busqueda]);

  // los filtros ya armados para la URL
  // URLSearchParams convierte el objeto en texto de url / Ayudado por Claude
  const consulta = new URLSearchParams({ periodo, region, estancia }).toString();

  // pide estadisticas de API 
  const handleGetData = async () => {
    const request = new Request(`${API_URL}/estadisticas?${consulta}`, { // Ayudado por Claude (consulta)
      method: "GET",
      headers: encabezados(),
    });
    try {
      const res = await fetch(request);
      if (res.status < 200 || res.status >= 300) {
        throw new Error(res.statusText);
      }
      setDatos(await res.json());
    } catch {
      throw new Error("No se pudieron cargar las estadísticas");
    }
  };

  // corre al abrir la vista y otra vez cada vez que cambia el periodo o la fecha
  // solo pide datos si el rol puede verlas, la API de todos modos responde 403 si no
  useEffect(() => {
    if (!puedeVer) return;
    setCargando(true);
    handleGetData().catch((error) => {console.error(error);alert(error.message);}).finally(() => setCargando(false));
  }, [periodo, region, estancia, puedeVer]); // vuelve a correr cuando cambie uno de estos

  // mientras react-admin lee los roles no se dibuja nada
  if (isLoading) return null;

  return (
    // Card es la tarjeta grande que envuelve toda la pantalla
    <Card>
      {/* el alcance lo manda la API, asi el supervisor regional ve su region y no "Nacional" // Propuesta de Claude*/}
      <CardHeader title="Estadísticas" subheader={datos ? `Alcance: ${datos.alcance}` : undefined} slotProps={{ title: { variant: "h2", component: "h1" } }} />
      <CardContent>
        {/* al cambiar de pestaña solo cambia vista, los datos ya estan cargados */}
        <Tabs value={vista} onChange={(_, v: Vista) => setVista(v)}>
          <Tab value="asistencia" label="Asistencia" />
          <Tab value="seguimiento" label="Seguimiento de faltas" />
          {/* solo el administrador ve esta pestaña */}
          {esAdmin && <Tab value="auditoria" label="Auditoría" />}
        </Tabs>

        {/* filtros que al cambiar uno, useEffect vuelve a pedir los datos */}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", my: 2 }}>
          {/* el filtro de region solo sale si el usuario puede elegir entre varias, el regional solo tiene la suya */}
          {datos && datos.regiones.length > 1 && (
            <TextField 
              select 
              id="filtro-region"
              size="small" 
              label="Región" 
              value={region} 
              sx={{ minWidth: 200 }}
              // native usa el select del navegador y shrink deja la etiqueta arriba para que no se encime
              slotProps={{ select: { native: true }, inputLabel: { shrink: true } }} // Propuesta de Claude
              onChange={(e) => setRegion(e.target.value)}>
              <option value="">Todas</option>
              {/* map crea un MenuItem por cada region que mando la API, key ayuda a react a distinguirlos */}
              {datos.regiones.map((r) => <option key={r} value={r}>{r}</option>)}
            </TextField>
          )}
          {/* cuadro de texto para buscar estancia */}
          <TextField size="small" label="Estancia" value={busqueda} sx={{ minWidth: 200 }}
            onChange={(e) => setBusqueda(e.target.value)} />
          {/* exclusive solo deja uno elegido, el v && evita que quede sin ninguno al picar el que ya estaba elegido */}
          <ToggleButtonGroup size="small" exclusive value={periodo} onChange={(_, v: Periodo | null) => v && setPeriodo(v)}>
            {/* map crea un boton por cada periodo, p es cada uno */}
            {PERIODOS.map((p) => (
              <ToggleButton key={p.value} value={p.value}>{p.label}</ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
 
        {cargando && (
          <Typography color="text.secondary" sx={{ pb: 2 }}>
            Cargando estadísticas...
          </Typography>
        )}
 
        {/* solo se dibuja la pestaña elegida y cuando ya llegaron los datos */}
        {/* cada linea exige que datos exista Y que la pestaña sea esa */}
        {datos && vista === "asistencia" && <PestanaAsistencia datos={datos.asistencia} />}
        {datos && vista === "seguimiento" && <PestanaSeguimiento datos={datos.seguimiento} />}
        {/* la de auditoria ademas exige que se haya mandado datos.auditoria que solo llega para el administrador */}
        {datos && vista === "auditoria" && datos.auditoria && <PestanaAuditoria datos={datos.auditoria} />}
      </CardContent>
    </Card>
  );
};