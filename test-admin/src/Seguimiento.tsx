import { useState } from "react";
import { useGetIdentity } from "react-admin";
import {Alert, Box, Button, Card, CardContent, CardHeader, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, MenuItem, Radio, RadioGroup, Tab, Tabs, TextField, Typography,} from "@mui/material";


type Estado = "abierto" | "seguimiento" | "alta_medica" | "cerrado";
 
type Intento = { fecha: string; resultado: string; responsable: string };
 
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
 
const TABS: { value: Estado; label: string }[] = [
  { value: "abierto", label: "Abiertos" },
  { value: "seguimiento", label: "En seguimiento" },
  { value: "alta_medica", label: "Requiere alta médica" },
  { value: "cerrado", label: "Cerrados" },
];
 
const ETIQUETA_ESTADO: Record<Estado, string> = {
  abierto: "Abierto",
  seguimiento: "En seguimiento",
  alta_medica: "Requiere alta médica",
  cerrado: "Cerrado",
};
 
const CAUSAS = ["Enfermedad en casa", "Accidente fuera del plantel", "Permiso particular o tramite", "Sin respuesta del tutor"];
 
const CASOS_EJEMPLO: Caso[] = [
  {
    id: "1", nombre: "Niño/a de ejemplo 1", sala: "Sala A", fechaFalta: "00/00/0000",
    folio: "SEG-0000-0001", estado: "seguimiento",
    alerta: "Texto de alerta o acción pendiente",
    intentos: [{ fecha: "00/00/0000 00:00", resultado: "Sin respuesta", responsable: "Responsable" }],
  },
  {
    id: "2", nombre: "Niño/a de ejemplo 2", sala: "Sala B", fechaFalta: "00/00/0000",
    folio: "SEG-0000-0002", estado: "abierto", intentos: [],
  },
];
 
const Filtros = () => (
  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", my: 2 }}>
    <TextField select size="small" label="Sala" defaultValue="" sx={{ minWidth: 200 }}>
      <MenuItem value="">Todas las salas</MenuItem>
    </TextField>
    <TextField select size="small" label="Fecha de la falta" defaultValue="7" sx={{ minWidth: 200 }}>
      <MenuItem value="7">Últimos 7 días</MenuItem>
      <MenuItem value="30">Últimos 30 días</MenuItem>
    </TextField>
  </Box>
);
 
const CasoCard = ({ caso, activo, onSelect }: {
  caso: Caso; activo: boolean; onSelect: () => void;
}) => (
  <Card variant="outlined" sx={{ borderWidth: 2, borderColor: activo ? "primary.main" : "divider" }}>
    <CardContent sx={{ display: "grid", gap: 1 }}>
      <Typography fontWeight={700}>{caso.nombre}</Typography>
      <Typography variant="caption">
        {caso.sala} · Falta del {caso.fechaFalta} · Folio {caso.folio}
      </Typography>
      <Box><Chip size="small" variant="outlined" color="primary" label={ETIQUETA_ESTADO[caso.estado]} /></Box>
      {caso.alerta && <Alert severity="warning" sx={{ py: 0 }}>{caso.alerta}</Alert>}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
        <Box>
          <Typography variant="caption">Causa</Typography>
          <Typography variant="body2">{caso.causa ?? "Sin definir"}</Typography>
        </Box>
        <Box>
          <Typography variant="caption">Intentos de contacto</Typography>
          <Typography variant="body2">
            {caso.intentos[0] ? `${caso.intentos[0].fecha} · ${caso.intentos[0].resultado}` : "Ninguno"}
          </Typography>
        </Box>
      </Box>
      <Box>
        <Button variant="outlined" onClick={onSelect}>Abrir expediente</Button>
      </Box>
    </CardContent>
  </Card>
);
 
const Dato = ({ etiqueta, valor }: { etiqueta: string; valor: string }) => (
  <Box>
    <Typography variant="caption" color="text.secondary">{etiqueta}</Typography>
    <Typography variant="body2" fontWeight={600}>{valor}</Typography>
  </Box>
);

const OpcionesTarjeta = ({ valor, onChange, opciones, columnas }: {valor: string; onChange: (v: string) => void; opciones: string[]; columnas: number;}) => (
  <RadioGroup
    value={valor}
    onChange={(e) => onChange(e.target.value)}
    sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: `repeat(${columnas}, 1fr)` }, gap: 1.5 }}
  >
    {opciones.map((o) => (
      <FormControlLabel
        key={o}
        value={o}
        control={<Radio />}
        label={o}
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

const FormularioCausa = ({ caso }: { caso: Caso }) => {
  const [causa, setCausa] = useState(caso.causa ?? "");
  const [asesoria, setAsesoria] = useState("");
  const [fechaRetorno, setFechaRetorno] = useState("");
  const [notas, setNotas] = useState("");
  return (
    <Box sx={{ display: "grid", gap: 2 }}>
      <Typography fontWeight={700}>Causa de la inasistencia</Typography>
      <RadioGroup
        value={causa}
        onChange={(e) => setCausa(e.target.value)}
        sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}
      >
        {CAUSAS.map((c) => (
          <FormControlLabel
            key={c}
            value={c}
            control={<Radio />}
            label={c}
            sx={{
              m: 0, px: 1, py: 0.5, border: 2, borderRadius: 1,
              borderColor: causa === c ? "primary.main" : "divider",
              bgcolor: causa === c ? "action.selected" : "transparent",
              "& .MuiFormControlLabel-label": { fontWeight: 600 },
            }}
          />
        ))}
      </RadioGroup>
 
      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "3fr 2fr" } }}>
        <TextField
          label="Asesoría brindada"
          placeholder="Qué orientación diste a la persona tutora"
          multiline minRows={3}
          value={asesoria}
          onChange={(e) => setAsesoria(e.target.value)}
        />
        <TextField
          label="Fecha probable de retorno"
          type="date"
          InputLabelProps={{ shrink: true }}
          helperText="Formato dd/mm/aaaa"
          value={fechaRetorno}
          onChange={(e) => setFechaRetorno(e.target.value)}
        />
      </Box>
      <TextField
        label="Notas confidenciales"
        multiline minRows={3} fullWidth
        value={notas}
        onChange={(e) => setNotas(e.target.value)}
      />
    </Box>
  );
};

type DatosLlamada = { resultado: string; causa: string; notas: string; hora: string };
 
const RESULTADOS = ["Contestó", "No contestó", "Número equivocado"];
 
const horaActual = () =>
  new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: false });
 
const RegistrarLlamadaDialog = ({ caso, onClose, onGuardar }: {caso: Caso; onClose: () => void; onGuardar: (d: DatosLlamada) => void;}) => {
  const [hora] = useState(horaActual); 
  const [resultado, setResultado] = useState("");
  const [causa, setCausa] = useState(caso.causa ?? "");
  const [notas, setNotas] = useState("");
 
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        Registrar llamada
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Cerrar&nbsp;<Chip size="small" variant="outlined" label="Esc" />
        </Button>
      </DialogTitle>
 
      <DialogContent sx={{ display: "grid", gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {caso.nombre} · Folio {caso.folio} · Hora de la llamada: <b>{hora}</b> (se registra sola)
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
          variant="contained"
          disabled={!resultado}
          onClick={() => onGuardar({ resultado, causa, notas, hora })}
        >
          Guardar llamada
        </Button>
      </DialogActions>
    </Dialog>
  );
};
 

 
const Expediente = ({ caso, onRegistrarLlamada  }: { caso?: Caso; onRegistrarLlamada: () => void }) => {
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
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
          <Dato etiqueta="Niña o niño" valor={caso.nombre} />
          <Dato etiqueta="Sala" valor={caso.sala} />
          <Dato etiqueta="Folio" valor={caso.folio} />
          <Dato etiqueta="Fecha de la falta" valor={caso.fechaFalta} />
          <Dato etiqueta="Estado" valor={ETIQUETA_ESTADO[caso.estado]} />
        </Box>
 
        <Box>
          <Typography fontWeight={700} gutterBottom>Historial de llamadas</Typography>
          {caso.intentos.length === 0 && <Typography variant="body2">Sin llamadas registradas.</Typography>}
          {caso.intentos.map((i, idx) => (
            <Box key={idx} sx={{ display: "flex", gap: 1, alignItems: "flex-start", mb: 1 }}>
              <Box>
                <Typography variant="body2" fontWeight={600}>{i.fecha} · {i.resultado}</Typography>
                <Typography variant="caption">{i.responsable}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
 
        <FormularioCausa key={caso.id} caso={caso} />
 
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button variant="contained" onClick={onRegistrarLlamada}>Registrar llamada</Button>
          <Button variant="outlined">
            Notificar a contactos de emergencia
          </Button>
          <Button variant="outlined" color="error" sx={{ ml: "auto" }}>
            Cerrar caso
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};
 
export const SeguimientoList = () => {
  const { identity } = useGetIdentity();
  const [casos, setCasos] = useState<Caso[]>(CASOS_EJEMPLO);
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [tab, setTab] = useState<Estado>("abierto");
  const [seleccionado, setSeleccionado] = useState<string | undefined>();
 
  const visibles = casos.filter((c) => c.estado === tab);
  const actual = casos.find((c) => c.id === seleccionado);
 
const guardarLlamada = (d: DatosLlamada) => {
    const fecha = new Date().toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "numeric" });
    const intento: Intento = {
      fecha: `${fecha} ${d.hora}`,
      resultado: d.resultado,
      responsable: identity?.fullName ?? "",
      notas: d.notas,
    };
    setCasos((prev) =>
      prev.map((c) =>
        c.id === seleccionado
          ? { ...c, causa: d.causa || c.causa, intentos: [intento, ...c.intentos] }: c,
      ),
    );
    setDialogoAbierto(false);
  };


  return (
    <Card>
      <CardHeader title="Seguimiento de inasistencias" />
      <CardContent>
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
 
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "2fr 3fr" }, alignItems: "start" }}>
          <Box sx={{ display: "grid", gap: 2, maxHeight: "65vh", overflowY: "auto", pr: 1 }}>
            <Typography variant="caption" fontWeight={700}>
              {visibles.length} casos · ordenados por urgencia
            </Typography>
            {visibles.map((c) => (
              <CasoCard key={c.id} caso={c} activo={c.id === seleccionado} onSelect={() => setSeleccionado(c.id)} />
            ))}
          </Box>
          <Expediente caso={actual} onRegistrarLlamada={() => setDialogoAbierto(true)} />
        </Box>
        {actual && dialogoAbierto && (
          <RegistrarLlamadaDialog caso={actual} onClose={() => setDialogoAbierto(false)} onGuardar={guardarLlamada} />
        )}
      </CardContent>
    </Card>
  );
};
