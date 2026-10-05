import { TranslationMessages } from 'ra-core';

const spanishMessages: TranslationMessages = {
    ra: {
        action: {
            add_filter: 'Agregar filtro',
            add: 'Agregar',
            back: 'Regresar',
            bulk_actions: '1 elemento seleccionado |||| %{smart_count} elementos seleccionados',
            cancel: 'Cancelar',
            clear_array_input: 'Limpiar la lista',
            clear_input_value: 'Limpiar valor',
            clone: 'Clonar',
            confirm: 'Confirmar',
            create: 'Crear',
            create_item: 'Crear %{item}',
            delete: 'Eliminar',
            edit: 'Editar',
            export: 'Exportar',
            list: 'Lista',
            refresh: 'Actualizar',
            remove_filter: 'Quitar este filtro',
            remove_all_filters: 'Quitar todos los filtros',
            remove: 'Quitar',
            reset: 'Restablecer',
            save: 'Guardar',
            search: 'Buscar',
            search_columns: 'Buscar columnas',
            select_all: 'Seleccionar todo',
            select_all_button: 'Seleccionar todo',
            select_row: 'Seleccionar esta fila',
            show: 'Mostrar',
            sort: 'Ordenar',
            undo: 'Deshacer',
            unselect: 'Deseleccionar',
            expand: 'Expandir',
            close: 'Cerrar',
            open_menu: 'Abrir menú',
            close_menu: 'Cerrar menú',
            update: 'Actualizar',
            move_up: 'Mover arriba',
            move_down: 'Mover abajo',
            open: 'Abrir',
            toggle_theme: 'Cambiar modo claro/oscuro',
            select_columns: 'Columnas',
            update_application: 'Recargar aplicación',
        },
        boolean: {
            true: 'Sí',
            false: 'No',
            null: ' ',
        },
        page: {
            create: 'Crear %{name}',
            dashboard: 'Panel principal',
            edit: '%{name} %{recordRepresentation}',
            error: 'Algo salió mal',
            list: '%{name}',
            loading: 'Cargando',
            not_found: 'No encontrado',
            show: '%{name} %{recordRepresentation}',
            empty: 'Aún no hay %{name}.',
            invite: '¿Deseas agregar uno?',
            access_denied: 'Acceso denegado',
            authentication_error: 'Error de autenticación',
        },
        input: {
            file: {
                upload_several:
                    'Suelta algunos archivos para subirlos, o haz clic para seleccionar uno.',
                upload_single: 'Suelta un archivo para subirlo, o haz clic para seleccionarlo.',
            },
            image: {
                upload_several:
                    'Suelta algunas imágenes para subirlas, o haz clic para seleccionar una.',
                upload_single:
                    'Suelta una imagen para subirla, o haz clic para seleccionarla.',
            },
            references: {
                all_missing: 'No se pudieron encontrar los datos de referencia.',
                many_missing:
                    'Al menos una de las referencias asociadas ya no parece estar disponible.',
                single_missing:
                    'La referencia asociada ya no parece estar disponible.',
            },
            password: {
                toggle_visible: 'Ocultar contraseña',
                toggle_hidden: 'Mostrar contraseña',
            },
        },
        message: {
            about: 'Acerca de',
            access_denied:
                'No tienes los permisos necesarios para acceder a esta página',
            are_you_sure: '¿Estás seguro?',
            authentication_error:
                'El servidor de autenticación devolvió un error y no se pudieron verificar tus credenciales.',
            auth_error:
                'Ocurrió un error al validar el token de autenticación.',
            bulk_delete_content:
                '¿Estás seguro de que quieres eliminar este %{name}? |||| ¿Estás seguro de que quieres eliminar estos %{smart_count} elementos?',
            bulk_delete_title:
                'Eliminar %{name} |||| Eliminar %{smart_count} %{name}',
            bulk_update_content:
                '¿Estás seguro de que quieres actualizar %{name} %{recordRepresentation}? |||| ¿Estás seguro de que quieres actualizar estos %{smart_count} elementos?',
            bulk_update_title:
                'Actualizar %{name} %{recordRepresentation} |||| Actualizar %{smart_count} %{name}',
            clear_array_input: '¿Estás seguro de que quieres limpiar toda la lista?',
            delete_content: '¿Estás seguro de que quieres eliminar este %{name}?',
            delete_title: 'Eliminar %{name} %{recordRepresentation}',
            details: 'Detalles',
            error: 'Ocurrió un error del cliente y tu solicitud no pudo completarse.',
            invalid_form: 'El formulario no es válido. Por favor revisa los errores',
            loading: 'Por favor espera',
            no: 'No',
            not_found:
                'Escribiste una URL incorrecta, o seguiste un enlace erróneo.',
            select_all_limit_reached:
                'Hay demasiados elementos para seleccionarlos todos. Solo se seleccionaron los primeros %{max} elementos.',
            unsaved_changes:
                'Algunos de tus cambios no se guardaron. ¿Estás seguro de que quieres ignorarlos?',
            yes: 'Sí',
            placeholder_data_warning: 'Problema de red: falló la actualización de datos.',
        },
        navigation: {
            clear_filters: 'Limpiar filtros',
            no_filtered_results: 'No se encontraron %{name} con los filtros actuales.',
            no_results: 'No se encontraron %{name}',
            no_more_results:
                'El número de página %{page} está fuera de los límites. Intenta la página anterior.',
            page_out_of_boundaries: 'El número de página %{page} está fuera de los límites',
            page_out_from_end: 'No se puede ir después de la última página',
            page_out_from_begin: 'No se puede ir antes de la página 1',
            page_range_info: '%{offsetBegin}-%{offsetEnd} de %{total}',
            partial_page_range_info:
                '%{offsetBegin}-%{offsetEnd} de más de %{offsetEnd}',
            current_page: 'Página %{page}',
            page: 'Ir a la página %{page}',
            first: 'Ir a la primera página',
            last: 'Ir a la última página',
            next: 'Ir a la página siguiente',
            previous: 'Ir a la página anterior',
            page_rows_per_page: 'Filas por página:',
            skip_nav: 'Saltar al contenido',
        },
        sort: {
            sort_by: 'Ordenar por %{field_lower_first} %{order}',
            ASC: 'ascendente',
            DESC: 'descendente',
        },
        auth: {
            auth_check_error: 'Por favor inicia sesión para continuar',
            user_menu: 'Perfil',
            username: 'Usuario',
            password: 'Contraseña',
            email: 'Correo electrónico',
            sign_in: 'Iniciar sesión',
            sign_in_error: 'Falló la autenticación, por favor intenta de nuevo',
            logout: 'Cerrar sesión',
        },
        notification: {
            updated: 'Elemento actualizado |||| %{smart_count} elementos actualizados',
            created: 'Elemento creado',
            deleted: 'Elemento eliminado |||| %{smart_count} elementos eliminados',
            bad_item: 'Elemento incorrecto',
            item_doesnt_exist: 'El elemento no existe',
            http_error: 'Error de comunicación con el servidor',
            data_provider_error:
                'Error del proveedor de datos. Revisa la consola para más detalles.',
            i18n_error:
                'No se pudieron cargar las traducciones para el idioma especificado',
            canceled: 'Acción cancelada',
            logged_out: 'Tu sesión ha terminado, por favor vuelve a conectarte.',
            not_authorized: 'No estás autorizado para acceder a este recurso.',
            application_update_available: 'Hay una nueva versión disponible.',
            offline: 'Sin conectividad. No se pudieron obtener los datos.',
        },
        validation: {
            required: 'Requerido',
            minLength: 'Debe tener al menos %{min} caracteres',
            maxLength: 'Debe tener %{max} caracteres o menos',
            minValue: 'Debe ser al menos %{min}',
            maxValue: 'Debe ser %{max} o menos',
            number: 'Debe ser un número',
            email: 'Debe ser un correo electrónico válido',
            oneOf: 'Debe ser uno de: %{options}',
            regex: 'Debe coincidir con un formato específico (regexp): %{pattern}',
            unique: 'Debe ser único',
        },
        saved_queries: {
            label: 'Consultas guardadas',
            query_name: 'Nombre de la consulta',
            new_label: 'Guardar consulta actual...',
            new_dialog_title: 'Guardar consulta actual como',
            remove_label: 'Eliminar consulta guardada',
            remove_label_with_name: 'Eliminar consulta "%{name}"',
            remove_dialog_title: '¿Eliminar consulta guardada?',
            remove_message:
                '¿Estás seguro de que quieres eliminar ese elemento de tu lista de consultas guardadas?',
            help: 'Filtra la lista y guarda esta consulta para más tarde',
        },
        guesser: {
            empty: {
                title: 'No hay datos para mostrar',
                message: 'Por favor revisa tu proveedor de datos',
            },
        },
        configurable: {
            customize: 'Personalizar',
            configureMode: 'Configurar esta página',
            inspector: {
                title: 'Inspector',
                content: 'Pasa el cursor sobre los elementos de la interfaz para configurarlos',
                reset: 'Restablecer configuración',
                hideAll: 'Ocultar todo',
                showAll: 'Mostrar todo',
            },
            Datagrid: {
                title: 'Tabla de datos',
                unlabeled: 'Columna sin etiqueta #%{column}',
            },
            SimpleForm: {
                title: 'Formulario',
                unlabeled: 'Campo sin etiqueta #%{input}',
            },
            SimpleList: {
                title: 'Lista',
                primaryText: 'Texto primario',
                secondaryText: 'Texto secundario',
                tertiaryText: 'Texto terciario',
            },
        },
    },
    resources: {
        posts: {
            name: 'Publicación |||| Publicaciones',
            fields: {
                title: 'Título',
                body: 'Contenido',
                userId: 'Usuario',
            },
        },
        users: {
            name: 'Usuario |||| Usuarios',
            fields: {
                name: 'Nombre',
                username: 'Usuario',
                email: 'Correo',
                address: {
                    street: 'Calle',
                    suite: 'Interior',
                    city: 'Ciudad',
                    zipcode: 'Código postal',
                },
                company: {
                    name: 'Empresa',
                },
                phone: 'Telefono',
                website: 'Pagina Web',
            },
        },
        albums: {
            name: 'Álbum |||| Álbumes',
            fields: {
                userId: 'Usuario',
                title: "Titulo",
            },
        },
        photos: {
            name: 'Foto |||| Fotos',
            fields: {
                userId: 'Usuario',
                thumbnailUrl: "Miniatura",
                title: "Titulo",
                album: "Album",
            },
        },
        comments: {
            name: 'Comentario |||| Comentarios',
            fields: {
                postId: 'Publicacion',
                name: 'Nombre',
                email: 'Correo',
                body: 'Cuerpo',
            },
        },
        todos: {
            name: 'Tarea |||| Tareas',
            fields: {
                userId: 'Usuario',
                title: 'Titulo',
                completed: 'Completado',
            },
        },
    },
};


export default spanishMessages;