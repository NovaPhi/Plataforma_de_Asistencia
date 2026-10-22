import { Admin, Resource,CustomRoutes } from "react-admin";
import { Layout } from "./Layout";
import { theme } from "./Theme";
import { Escaneo_Credencial } from "./Escaneo_QR";
import { SeguimientoList } from "./Seguimiento"
import { PasaLista } from "./Pase_de_Lista";
import { Bitacora } from "./Historial";
import { HistorialList } from "./Datos_Historicos";
import { EstadisticasList } from "./Estadisticas";
import { VBD } from "./VistaBD";
import { dataProvider } from "./dataProvider";
import authProvider from "./AuthProvider";
import { i18nProvider } from "./i18nProvider";
import { Dashboard } from "./Dashboard";
import PostIcon from "@mui/icons-material/Book";
import Registrarse from "./registrarse";
import {Route} from "react-router-dom";


 
export const App = () => (
  <Admin authProvider={authProvider} i18nProvider={i18nProvider} dataProvider={dataProvider} dashboard={Dashboard} layout={Layout} theme={theme}>
    {(permissions: string[] = []) =>{ 
    const has = (...roles: string[]) => roles.some((r) => permissions.includes(r));
      return (
      <>
        <Resource 
          name="pase-lista" 
          list={has('CAPTURISTA_DOCENTE') ? PasaLista : undefined} 
          icon={PostIcon}
        />
        <Resource 
          name="Escanear Credencial" 
          list={has('CAPTURISTA_DOCENTE') ? Escaneo_Credencial: undefined}
        />
        <Resource 
          name="Bitacora" 
          list={has('ADMINISTRADOR_CENTRAL') ? Bitacora: undefined}
        />
        <Resource 
          name="Incidencias" 
          list={has('TRABAJO_SOCIAL','MEDICO_ESTANCIA')  ? HistorialList: undefined}
        />

        <Resource 
          name="Seguimiento" 
          list={has('TRABAJO_SOCIAL' , 'MEDICO_ESTANCIA')  ? SeguimientoList: undefined}
        />

        <Resource
          name="Estadisticas"
          list={has('ADMINISTRADOR_CENTRAL','SUPERVISOR_CENTRAL','SUPERVISOR_REGIONAL') ? EstadisticasList : undefined}
        />
        
        <Resource 
          name="Vistas de Base de Datos" 
          list={has('ADMINISTRADOR_CENTRAL') ? VBD: undefined}
        />
        <CustomRoutes>
                <Route path="/registrarse" element={<Registrarse />}/>
            </CustomRoutes>
      </>
    )}}
  </Admin>

);