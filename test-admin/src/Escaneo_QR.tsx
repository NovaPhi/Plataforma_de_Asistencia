import { Button } from "react-admin"

import { Card, CardHeader, Stack } from "@mui/material";

export const Escaneo_Credencial = () =>{
    return(
        <Card>
            <CardHeader
                title = "Escaneo de Codigo QR"
                subheader = "Usa la camara para escanear el QR"
                action={
                    <Stack direction={"row"} spacing={1}>
                        <Button variant="outlined">Ingreso</Button>
                        <Button variant="contained">Egreso</Button>
                    </Stack>
                }
                    
            />
        </Card>
    )
}