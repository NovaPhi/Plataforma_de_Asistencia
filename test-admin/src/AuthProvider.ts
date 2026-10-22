import { AuthProvider } from "react-admin";
import { API_URL } from "./config";




//funcion para hacer clean el logout
const clearSession = () => {
    sessionStorage.removeItem("auth");
    sessionStorage.removeItem("identity");
    sessionStorage.removeItem("rol");
}

const authProvider:AuthProvider={
    login: async({username, password})=>{
    
        const request=new Request(`${API_URL}/login`, {
            method:"POST",
            body:JSON.stringify({"username":username, "password":password}),
            headers: new Headers({"Content-Type":"application/json"})
        });
        try{
            const res=await fetch(request);
            if(res.status<200 || res.status>=300){
                throw new Error(res.statusText);
            }
            const auth=await res.json();
            sessionStorage.setItem("auth", auth.token);
            sessionStorage.setItem("identity", JSON.stringify({"id": auth.id}));
            // se agrego el get de rol para que ya lo ponga como session storage y se pudea usar 
            // para el rol en app
            sessionStorage.setItem("rol", JSON.stringify(auth.rol));
            return Promise.resolve();
        }catch{
            throw new Error("Error en usuario o password");
        }
    },
    logout: ()=>{
        clearSession();
        return Promise.resolve();
    },
    checkAuth:  ()=>{return sessionStorage.getItem("auth")?Promise.resolve():Promise.reject()},
    checkError: (error)=>{
        const status=error.status;
        if(status==401 || status==403){
            sessionStorage.removeItem("auth");
            sessionStorage.removeItem("identity");
            return Promise.reject();
        }
        return Promise.resolve();
    },
    // este es el endpoint que tiene que hacer la funcion de parsed es porque el api lo mnda como array y se tiene
    // que convertir en valor de javascript osea string porque lo manda como '"rol"' y lo convierte a string normalizado
    getPermissions: () => {
        const rol = sessionStorage.getItem("rol");
        if (!rol) return Promise.reject();
        try{
            const parsed = JSON.parse(rol);
            return Promise.resolve(Array.isArray(parsed) ? parsed : [parsed]);
        } catch{
            return Promise.reject();
        }
        
    }
};

export default authProvider;