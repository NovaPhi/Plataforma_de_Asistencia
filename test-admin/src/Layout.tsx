import type { ReactNode } from "react";
import {
  AppBar as RAAppBar,
  Layout as RALayout,
  Menu,
  CheckForApplicationUpdate,
  useGetIdentity,
} from "react-admin";
import { Box, Typography } from "@mui/material";
import DashboardIcon from "@mui/icons-material/SpaceDashboardOutlined";
import AccountCircleOutlined from "@mui/icons-material/AccountCircleOutlined";
 
const AppBar = () => {
  const { identity } = useGetIdentity();
  return (
    <RAAppBar userMenu={false} toolbar={false}>
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
        {/* TODO: rol real del usuario */}
        <Typography variant="caption">Supervisor</Typography>
      </Box>
      <AccountCircleOutlined fontSize="large" />
    </RAAppBar>
  );
};
 
const AppMenu = () => (
  <Menu>
    <Menu.Item to="/" primaryText="Tablero" leftIcon={<DashboardIcon />} />
    {/* TODO: más opciones del menú */}
  </Menu>
);
 
export const Layout = ({ children }: { children: ReactNode }) => (
  <RALayout appBar={AppBar} menu={AppMenu}>
    {children}
    <CheckForApplicationUpdate />
  </RALayout>
);
