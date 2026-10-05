import { Admin, Resource, ListGuesser } from "react-admin";
import { Layout } from "./Layout";
import { theme } from "./Theme";
import { dataProvider } from "./dataProvider";
import { authProvider } from "./AuthProvider";
import { i18nProvider } from "./i18nProvider";
import { Dashboard } from "./Dashboard";
 
export const App = () => (
  <Admin authProvider={authProvider} i18nProvider={i18nProvider} dataProvider={dataProvider} dashboard={Dashboard} layout={Layout} theme={theme}>
    <Resource name="users" list={ListGuesser} />
  </Admin>
);