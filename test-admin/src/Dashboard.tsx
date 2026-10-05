import { useState } from "react";
import { useGetIdentity } from "react-admin";
import {Box, Button, Card, CardContent, CardHeader, MenuItem, TextField, ToggleButton, ToggleButtonGroup, Typography,} from "@mui/material";
 
const PERIODOS = [
  { value: "hoy", label: "Hoy" },
  { value: "mes", label: "Mes" },
  { value: "trimestre", label: "Trimestre" },
];
 
const STATS_VACIOS = {
  asistencia: null,
  enMeta: null,
  amarillo: null,
  rojo: null,
  seguimiento: null,
  total: null,
};

const KpiCard = ({ titulo, valor, detalle, estado }) => (
  <Card variant="outlined">
    <CardHeader
      title={titulo}
      titleTypographyProps={{ variant: "subtitle2" }}
      action={estado}
    />
    <CardContent>
      <Typography variant="h4" fontWeight={700}>
        {valor ?? "—"}
      </Typography>
      <Typography variant="caption">{detalle}</Typography>
    </CardContent>
  </Card>
);
 
const Filtros = ({ periodo, onPeriodo }) => (
  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
    <TextField select size="small" label="Región" defaultValue="" sx={{ minWidth: 200 }}>
      <MenuItem value="">Todas</MenuItem>
    </TextField>
    <TextField size="small" label="Estancia" sx={{ minWidth: 200 }} />
    <ToggleButtonGroup size="small" exclusive value={periodo} onChange={(_, v) => v && onPeriodo(v)}>
      {PERIODOS.map((p) => (
        <ToggleButton key={p.value} value={p.value}>{p.label}</ToggleButton>
      ))}
    </ToggleButtonGroup>
  </Box>
);

export const Dashboard = () => {
  const { identity, isPending, error } = useGetIdentity();
  const [periodo, setPeriodo] = useState("hoy");
 
  // cargar según periodo/filtros
  const stats = STATS_VACIOS;
 
  if (isPending) return null;
  if (error) return null;
 
  return (
    <Card>
      <CardHeader
        title="Tablero de asistencia"
        subheader={`Bienvenido, ${identity?.fullName}`}
        action={<Button variant="outlined">Exportar corte</Button>}
      />
      <CardContent>
        <Filtros periodo={periodo} onPeriodo={setPeriodo} />
 
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" } }}>
          <KpiCard titulo="Asistencia" valor={stats.asistencia} detalle="Meta: por definir" />
          <KpiCard titulo="Estancias en meta" valor={stats.enMeta} detalle={`de ${stats.total ?? "—"} estancias`} />
          <KpiCard titulo="Estancias en atención" valor={stats.amarillo} detalle="Rango intermedio" />
          <KpiCard titulo="Estancias críticas" valor={stats.rojo} detalle="Por debajo del mínimo" />
 
          <KpiCard titulo="Casos de seguimiento" valor={stats.seguimiento} detalle="Abiertos" />
          <Card variant="outlined" sx={{ gridColumn: { md: "span 3" } }}>
            <CardHeader title="Umbrales de semáforo" titleTypographyProps={{ variant: "subtitle2" }} />
            <CardContent>
              <Typography variant="body2">Verde · Amarillo · Rojo</Typography>
            </CardContent>
          </Card>
        </Box>
      </CardContent>
    </Card>
  );
};
