import { Admin, Resource,CustomRoutes } from "react-admin";
import {useMemo} from "react"
import { Layout } from "./Layout";
import { buildTheme, DyslexiaProvider, loadFonts, useDyslexia} from "./Theme";
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


// added the fonts for the theme
loadFonts("fonts");

const AppContent =() => {
  const {dyslexia} = useDyslexia();
  const lightTheme = useMemo(() => buildTheme("light", dyslexia), [dyslexia]);
  const darkTheme = useMemo(() => buildTheme("dark", dyslexia), [dyslexia]);



 
return(
// esta parte es donde se hace el usePermissions que esta diciendo si es este rol esta bien lo puede ver
// esta la funcion de permissions ya que puede tener mas de un rol puede ver por vista por lo que se le 
// asigno un has para que sea mas facil 
    <Admin lightTheme={lightTheme} darkTheme={darkTheme} defaultTheme="light"  authProvider={authProvider} i18nProvider={i18nProvider} dataProvider={dataProvider} layout={Layout} >
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
              name="Vistas de Base de Datos" 
              list={has('ADMINISTRADOR_CENTRAL') ? VBD: undefined}
            />
            <Resource
            name="Estadisticas"
            list={has('ADMINISTRADOR_CENTRAL','SUPERVISOR_CENTRAL','SUPERVISOR_REGIONAL') ? EstadisticasList : undefined}
        />
            <CustomRoutes>
                    <Route path="/registrarse" element={<Registrarse />}/>
                </CustomRoutes>
          </>    
      )}}
    </Admin>
);
};

export const App = () => (
  <DyslexiaProvider>
    <AppContent/>
  </DyslexiaProvider>
)
