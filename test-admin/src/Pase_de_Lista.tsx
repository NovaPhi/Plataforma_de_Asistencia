
import { Card, CardHeader, Menu, MenuItem, useMediaQuery, Button} from '@mui/material';
import { useState } from 'react';
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";


const salas = ["A1", "A2"]; //este valor venga de BD despues


export const PasaLista = () => {
    const [sala, setSala] = useState("A1");
    const [anchor, setAnchor] = useState<null | HTMLElement>(null);    
    const open = Boolean(anchor);

    //Valores temporales 
    const dia = "Miercoles";
    const fecha = "7/OCT/26";
    const hora = "9:00";

    return (
        <Card>
            <CardHeader 
                title="Pase de Lista" 
                subheader={`Sala ${sala}, ${dia} ${fecha}, Cierre a las ${hora}`} 
                sx={{
                    "& .MuiCardHeader-action":{
                        alignSelf: "center",
                        marginTop:0,
                        marginRight: 0,
                    },
                }}
                action={
                    <>
                        <Button
                            variant='outlined'
                            size='large'
                            startIcon={<GroupsOutlinedIcon/>}
                            endIcon={<KeyboardArrowDownIcon/>}
                            onClick={(e) => setAnchor(e.currentTarget)}
                            aria-haspopup="true"
                            aria-expanded={true}
                        >
                        Cambiar de Sala
                        </Button>
                        <Menu
                            anchorEl={anchor}
                            open={open}
                            onClose={() => setAnchor(null)}
                        >
                            {salas.map((s) =>(
                                <MenuItem
                                    key={s}
                                    selected={s===sala}
                                    onClick={()=>{
                                        setSala(s);
                                        setAnchor(null);
                                    }}
                                >
                                    Sala {s}
                                </MenuItem>
                            ))}
                        </Menu>
                    </>
                }

            /> 

        </Card>
    )
}