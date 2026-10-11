import { Admin, Resource, ListGuesser,CustomRoutes } from "react-admin";
import { Layout } from "./Layout";
import { theme } from "./Theme";
import { Escaneo_Credencial } from "./Escaneo_QR";
import { Seguimientos } from "./Seguimiento";
import { PasaLista } from "./Pase_de_Lista";
import { Bitacora } from "./Bitacora";
import { Historicos } from "./Datos_Historicos";
import { dataProvider } from "./dataProvider";
import authProvider from "./AuthProvider";
import { i18nProvider } from "./i18nProvider";
import { Dashboard } from "./Dashboard";
import { Route } from "react-router-dom";
import Registrarse from "./registrarse";
import { listarProductos, editarProductos, crearProductos } from "./pr";
import PostIcon from "@mui/icons-material/Book";
 
export const App = () => (
  <Admin authProvider={authProvider} i18nProvider={i18nProvider} dataProvider={dataProvider} dashboard={Dashboard} layout={Layout} theme={theme}>
    <Resource name="users" list={ListGuesser} />
    <Resource name="pase-lista" list={PasaLista} icon={PostIcon}/>
    <Resource name="Bitacora" list={Bitacora} />
    <Resource name="Incidencias" list={Historicos}/>
    <Resource name="Escaneo" list={Escaneo_Credencial}/> 
    <Resource name="Seguimiento" list={Seguimientos}/>
    <Resource name="productos" list={listarProductos} edit={editarProductos} create={crearProductos} />
    <CustomRoutes>
      <Route path="/registrarse" element={<Registrarse />}/>
    </CustomRoutes>
  </Admin>
);