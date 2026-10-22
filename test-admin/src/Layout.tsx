import type { ReactNode } from "react";
import {AppBar as RAAppBar,Layout as RALayout,Menu,CheckForApplicationUpdate,useGetIdentity,UserMenu,Logout, ToggleThemeButton,} from "react-admin";
import { Box, Typography, Button } from "@mui/material";
import DashboardIcon from "@mui/icons-material/SpaceDashboardOutlined";
import AccountCircleOutlined from "@mui/icons-material/AccountCircleOutlined";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import { useDyslexia } from "./Theme";

 

const Roles: Record<string,string> ={
  ADMINISTRADOR_CENTRAL: "Adiministrador Central",   
  SUPERVISOR_CENTRAL: "Supervisor Central",
  SUPERVISOR_REGIONAL: "Supervisor Regional",     
  DIRECTORA_ESTANCIA: "Director",
  MEDICO_ESTANCIA: "Medico de Estancia",         
  TRABAJO_SOCIAL: "Trabajador Social",          
  CAPTURISTA_DOCENTE: "Profesor",       
};

// agarra el rol de session storage y lo muestra en el appbar osea en la esquina derecha de la barrita de arriba
// la funcion es para que convierta de objeto a string
const getRolLabel =(): string => {
  try {
    const viene = sessionStorage.getItem("rol");
    if (!viene) return "";
    const parsed =JSON.parse(viene);
    const roles: string[] = Array.isArray(parsed) ? parsed : [parsed];
    return roles.map((r) => Roles[r] ?? r).join(", ");
  }catch{
    return "";
  }
};

const AppBar = () => {
  const { identity } = useGetIdentity();
  const {dyslexia, toggleDyslexia} = useDyslexia();
  const roleLabel = getRolLabel();
  return (
    // es la forma de dar el nombre al usuario en la parte de arriba
    <RAAppBar userMenu={<UserMenu icon={<AccountCircleOutlined fontSize="large"/>} >
      <Logout/>
      </UserMenu>} toolbar={false}>
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
          Registro de asistencia
        </Typography>
        <Typography variant="caption">Supervisión central</Typography>
      </Box>
      <Box sx={{ textAlign: "right", mr: 1 }}>
        <Typography variant="caption" fontWeight={700} display="block">
          {identity?.fullName}
        </Typography>
        <Typography variant="caption">{roleLabel}</Typography>
      </Box>
      <Button
        color="inherit"
        startIcon={<TextFieldsIcon/>}
        onClick={toggleDyslexia}
        aria-pressed={dyslexia}
      >
        Tipo de letra para dislexia
      </Button>
      {/*esto es para cambiar el tema de claro a obscuro */}
      <ToggleThemeButton/>
    </RAAppBar>
  );
};
 
const AppMenu = () => (
  <Menu>
    <Menu.Item to="/" primaryText="Tablero" leftIcon={<DashboardIcon />} />
    <Menu.ResourceItems/>
  </Menu>
);
 
export const Layout = ({ children }: { children: ReactNode }) => (
  <RALayout appBar={AppBar} menu={AppMenu}>
    {children}
    <CheckForApplicationUpdate />
  </RALayout>
);
