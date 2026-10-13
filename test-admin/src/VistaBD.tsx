//BOTON QUE COLAPSE LA LISTA DE EL ESQUEMA  
//LA API MANDA OBJETOS USA NOTACION PUNTO
// recibe todos los bloques de la api y regresa cualquier cambio hecho en front

import { Box, Card, CardContent, CardHeader, Stack } from "@mui/material"
import {DataTable,ListContextProvider,ResourceContextProvider,useList,BooleanField,DateField, EmailField, Labeled, email,} from "react-admin"

// ---- TEMP TEST DATA (remove later) ----
const mockInfantes = Array.from({ length: 30 }, (_, i) => {
    const n = i + 1
    return {
        id: n, // required by react-admin
        Id: n,
        Matricula: `MAT-2024-${String(n).padStart(3, "0")}`,
        Ur: `UR-0${(i % 3) + 1}`,
        EBDI: ["EBDI-A", "EBDI-B", "EBDI-C"][i % 3],
        Nombre: [
            "Sofía", "Mateo", "Valentina", "Santiago", "Camila", "Diego", "Regina", "Emiliano", "Ximena", "Leonardo",
            "Renata", "Sebastián", "Isabella", "Daniel", "Fernanda", "Alejandro", "Mariana", "Emilio", "Paulina", "Gael",
            "Julieta", "Andrés", "Victoria", "Iker", "Natalia", "Ángel", "Romina", "Thiago", "Luciana", "Bruno",
        ][i],
        Paterno: [
            "García", "Hernández", "Martínez", "Pérez", "Ramírez", "Flores", "Castillo", "Gómez", "Sánchez", "Rodríguez",
            "Jiménez", "Navarro", "Reyes", "Aguilar", "Medina", "Guerrero", "Ríos", "Salazar", "Cabrera", "Domínguez",
            "Herrera", "Ortiz", "Silva", "Rojas", "Campos", "Vázquez", "Núñez", "Peña", "Luna", "Ibarra",
        ][i],
        Materno: [
            "López", "Ruiz", "Soto", "Díaz", "Torres", "Vargas", "Mendoza", "Cruz", "Morales", "Ortega",
            "Delgado", "Fuentes", "Cortés", "Estrada", "Montes", "Paredes", "Lara", "Cano", "Valdez", "Barrera",
            "Acosta", "Rivera", "Sandoval", "Pineda", "Zamora", "Bautista", "Ponce", "Villanueva", "Ayala", "León",
        ][(i + 7) % 30],
        Genero: i % 2 ? "M" : "F",
        Curp: `CURP${String(n).padStart(14, "0")}`,
        Fnac: new Date(2019 + (i % 3), i % 12, (i % 27) + 1),
        Freg: new Date(2024, 0, (i % 27) + 1),
        Activo: i % 4 !== 0,
        Inscripcion: new Date(2024, 1, (i % 27) + 1),
    }
})
const roles = [
    "Administrador Central", "Supervisor Central", "Supervisor Regional",
    "Director de Estancia", "Medico de Estancia", "Trabajador Social", "Capturista Docente",
]
const nombres = ["Ana", "Luis", "Marta", "Carlos", "Elena", "Jorge", "Laura", "Pedro"]
const paternos = ["García", "Hernández", "Martínez", "López", "Ramírez", "Soto", "Cruz"]
const maternos = ["Ruiz", "Díaz", "Torres", "Vega", "Flores", "Mendoza", "Ortega"]

const mockUsuarios = Array.from({ length: 30 }, (_, i) => {
    const n = i + 1
    const nombre = nombres[i % nombres.length]
    const paterno = paternos[i % paternos.length]
    const usuario = `${nombre}.${paterno}${n}`.toLowerCase()
    return {
        id: n,
        NumEmpleado: `EMP-${String(n).padStart(5, "0")}`,
        Usuario: usuario,
        Pssword: "$2b$10$FAKEHASHFORTESTINGONLY",
        Nombre: nombre,
        Paterno: paterno,
        Materno: maternos[i % maternos.length],
        Correo: `${usuario}@ejemplo.mx`,
        Telefono: `55${String(10000000 + n * 137).slice(0, 8)}`,
        Activo: n % 7 !== 0,
        Rol: roles[i % roles.length],
    }
})

export const VBD = () => {
    const listContext = useList({ data: mockInfantes, perPage: mockInfantes.length })
    const listUsuarios = useList({ data: mockUsuarios, perPage: mockUsuarios.length })

    return (
        <Stack spacing={2}>
            <Card>
                <CardHeader title="Vista de Base de datos" />
            </Card>
            <Card sx={{ minWidth: 0, maxWidth: "100%" }}>
                <CardHeader title="Usuarios"/>
                <ResourceContextProvider value="Usuarios">
                    <ListContextProvider value={listUsuarios}>
                        <CardContent sx={{pt: 0}}>
                            <Box>
                                <DataTable
                                    bulkActionButtons={false}
                                    sx={{
                                        maxHeight: "50vh",
                                        "& .RaDataTable-tableWrapper": { maxHeight: "50vh", overflow: "auto" },
                                        "& .MuiTableCell-head": {
                                            position: "sticky",
                                            top: 0,
                                            zIndex: 1,
                                            backgroundColor: "background.paper",
                                        },
                                    }}
                                > 
                                    <DataTable.Col source="NumEmpleado"/>
                                    <DataTable.Col source="Usuario"/>
                                    <DataTable.Col source="Pssword"/>
                                    <DataTable.Col source="Nombre"/>
                                    <DataTable.Col source="Paterno"/>
                                    <DataTable.Col source="Materno"/>
                                    <DataTable.Col source="Correo" field={EmailField}>
                                    </DataTable.Col>
                                    <DataTable.Col source="Telefono"/>
                                    <DataTable.Col source="Activo" field={BooleanField}/>
                                    <DataTable.Col source="Rol"/>
                                </DataTable>
                            </Box>
                        </CardContent>
                    </ListContextProvider>
                </ResourceContextProvider>
            </Card>
            <Card>
                <CardHeader title="Estancias"/>
                
            </Card>
            <Card>
                <CardHeader title="Grupos"/>
            </Card> 
            <Card>
                <CardHeader title="Salas"/>
            </Card>
            <Card sx={{ minWidth: 0, maxWidth: "100%" }}>
                <CardHeader title="Infantes" />
                <ResourceContextProvider value="infantes">
                    <ListContextProvider value={listContext}>
                        <CardContent sx={{ pt: 0 }}>
                            <Box>
                                <DataTable                                     
                                    bulkActionButtons={false}
                                    sx={{
                                        maxHeight: "50vh",
                                        "& .RaDataTable-tableWrapper": { maxHeight: "50vh", overflow: "auto" },
                                        "& .MuiTableCell-head": {
                                            position: "sticky",
                                            top: 0,
                                            zIndex: 1,
                                            backgroundColor: "background.paper",
                                        },
                                    }}
                                >
                                    <DataTable.Col source="Id"/>
                                    <DataTable.Col source="Matricula"/>
                                    <DataTable.Col source="Ur"/>
                                    <DataTable.Col source="EBDI"/>
                                    <DataTable.Col source="Nombre"/>
                                    <DataTable.Col source="Paterno"/>
                                    <DataTable.Col source="Materno"/>
                                    <DataTable.Col source="Genero"/>
                                    <DataTable.Col source="Curp"/>
                                    <DataTable.Col source="Fnac" field={DateField}/>
                                    <DataTable.Col source="Freg" field={DateField}/>
                                    <DataTable.Col source="Activo" field={BooleanField}/>
                                    <DataTable.Col source="Inscripcion" field={DateField}/>
                                </DataTable>
                            </Box>
                        </CardContent>
                    </ListContextProvider>
                </ResourceContextProvider>
                
            </Card>
            <Card>
                <CardHeader title="tutores"/>
            </Card>
        </Stack>
    )
}