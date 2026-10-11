import {Datagrid, List, TextField, Edit, SimpleForm, TextInput, Create} from "react-admin";

export const listarProductos = () =>(
    <List>
        <Datagrid>
            <TextField source="matricula" />
            <TextField source="nombre" />
            <TextField source="id" />
        </Datagrid>
    </List>
);

export const editarProductos = ()=>(
    <Edit>
        <SimpleForm>
            <TextInput source="matricula" />
            <TextInput source="nombre" />
        </SimpleForm>
    </Edit>
);

export const crearProductos = ()=>(
    <Create>
        <SimpleForm>
            <TextInput source="matricula" />
            <TextInput source="nombre" />
        </SimpleForm>
    </Create>
);