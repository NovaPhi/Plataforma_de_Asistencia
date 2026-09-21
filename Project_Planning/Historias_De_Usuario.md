# Historias de Usuario

## Modulo Autenticacion y Control de Accesos

### HU 1 -  Inicio de Sesion por Rol Institucional
Como Usuario del sistema quiero iniciar sesion validado contra mi perfil FUAP (Directora de Estancia, Capturista/Docente,
Supervisor Regional, Administrador Central) para acceder solo a las funciones de rol

RBAC (roll based access control) aplicado a todos los tipos de usuario

### HU 2 - Restriccion de sesion por estancia
Como Administrador Central quiero que cada sesion quede ligada a una estancia por IP o token institucional, para evitar accessos cruzados entre estancias

Estancia A no puede operar datos de Estancia B


### HU 3 - Administracion de usuarios y catalogos
Como Administrador Central, quiero gestionar ususarios, estancias, grupos, salas, infantes y tutores, para mantener actualizado el padron de las 212 estncias

CRUD completo, validacion de duplicados, historial de cambios

## Modulo Asistencia Rapida

### HU 4 - Pase de Lista Masivo
Como Capturista/Docente, quiero marcar la asistencia de toda un grupo en menos de 3 clics para agilizar el registro matutino.

"presente" debera de ser el estatus por defecto

### HU 5 - Lectura de Credencial QR y/o Codigo de Barras
Como Capturista/Docente, quiero escanear la credencial del infante o tutor, para registrar ingreso y egreso sin errores de captura manual

Valida automaticamente al tutor autorizado antes del egreso

### HU 6 - Marcado de Incidencias
Como Capturista/Docente, quiero clasificar cada registro (Presente, Ausente justificado, Falta injustificada, Comision medica, Filtro Sanitario), para reflejar la situacion real del infante.

los 5 estatus deberan estar disponible en un toque, queda fecha/hora/turno

### HU 7 - Registro de Ingreso y Egreso Individual
Como Capturista/Docente, quiero registrar hora exacta de ingerso y egreso, para dar trazabilidad operativa.

indexado por (estancia_id, infante_id, fecha,turna), no permita egreso sin ingreso previo.

## Modulo Reportes y Monitoreo Cenral

### HU 8 - Tablero Ejecutivo con Semaforizacion
Como Supervisor Regional/Central, quiero ver un tablero en tiempo real con semaforizacion de las 212 estancias, para detectar de inmediato problas de asistencia.

La pagina debera refrescar en tiempo real y el color calculado por reglas de umbral

### HU 9 - Exportacion de Cortes de Asistencia
Como Directora o Supervisor Regional, quiero exportar cortes diarios, mensuales y trimestrales en Excel y PDF, para reportes institucionales y de auditoria

### HU 10 - Consultra Filtrada por Estancia y/o Region
Como Supervisor Regional, quiero filtrar el tablero por region o estancia, par monitorear solo mi ambito

No debera exponer estancias fuera del alcance

## Modulo Modo Desconectado / Resiliencia Operativa

### HU 11 - Captura Offline
Como Capturista/Docente en estancia remota, quuiero seguir registrando asistencia sin conexion, para no interrumpir la operacion diaria

Debera ser guardado local

### HU 12 - Sincronizacion Automatica 
Como Capturista/Docente, quiero que los registros offline se sincronicen solos al recuperar el enlace, parano hacer pasos manuales

Debera funcionar sin intervencion del usuario, Debera resolver duplicados y conflictos

## Modulo Gestion Reactiva de Inasistencias

### HU 13 - Generacion automatica de ticket de seguimiento
Como Trabajador@ Social quiero que se cree un ticket automatico cuando un infante es maarcado Ausente/Falta para iniciar el protocolo sin aviso manual

Se generara al cierre del pase de lista

### HU 14 - Contacto telefonico obligatorio
Como Trabajador@ Social quiero registrar el intento de contacto al tutor para dejar constancia de la gestion

No se debera cerrar el ticket sin al menos un intento documentado

### HU 15 - Clasificacion de la Causa de Inasistencia
Como Trabajador@ Social, quiere clasificar la causa para aplicar la asesoria correspondiente

Las clasificaciones son "Enfermo en casa, Accidente externo, Permiso Particular/Tramite y No Localizado"

Catalogo cerrado de 4 clasificacion, disparara la accion definida en la matriz

### HU 16 - Plan de Asesoria y Fecha Probable de Retorno
Como Trabajador@Social o Medico de Estancia, quiero registrar la asesoria y agendar fecha estimada de reingreso para dar seguimiento al retorno seguro

### HU 17 - Bloqueo Requiere Alta Medica
Como Medico de estancia quiero que se active un candado de ingreso cuando la causa fue medica y/o accidente para evitar reingreso sin autorizacion clinica

### HU 18 - Alerta por Falta de Respuesta del Tutor
Como Trabajador@ Social, quiero una alerta amarilla si no se contacto al tutor para forzar un segundo intento obligado en 4h

Si no llega a haber un segundo intento la alerta escala

### HU 19 - Notificacion a Contactos de Emergencia 
Como Trabajador@ Social, quiero notificar a los contactos de emergencia cuando el caso es "No Localizado" para activar la busqueda del infante

## Modulo Roles Privilegios y Separacion de Funciones

### HU 20 - Acceso Diferenciado a Notas Medicas/Familiares
Como Administrador Central, quiero que solo Trabajador@ Social, Medico y Directora vean notaas confidenciales, para proteger la privacidad confomre al menor privilegio

Docente/Educador@ nunca las puede ver, accesos no autorizados quedan bloqueados y registrados

### HU 21 - Cierre o Alta de Caso Restringido
Como Trabajador@ Social, Medico y/o Directora, quiero ser el unico perfil que puede cerrar y dar de alta un caso para asegurar validacion por personal autorizado

Docente y Supervisor Central no tendran esa opcion disponible

### HU 22 - Vista de Solo Estadisticas para Supervisor Central
Como Supervisor Central, quiero ver solo estadisticas agregadas sin llamadas, notas ni cierre de casos para monitorear sin exponer datos sensibles

## Modulo Proteccion de Datos Sensibles de Menores

### HU 23 - Consentimiento y aviso de privacidad
Como Directora quiero registrar que el tutor acepto el aviso de privacidad para cumplir con el marco legal antes de activar el seguimiento

Sin consentimiento registrado no se activara el seguimiento

### HU 24 - Cifrado de Datos Sensibles
Como Administraador Central, quiero que diagnosticos telefonos y notas familiares esten cifrados con AES-256, para proteger la confidencialidad

Los campos no podran ser legibles directamente en BD, el cifrado y descifrado solo para el rol autorizado

### HU 25 - Anonimizacion en Reportes Ejecutivos
Como supervisor Regional/Central quiero que los tableros consolidados muestren metricas agregadas sin nombres ni matriculs para respetar la privacidad de los infantes

## Modulo Auditoria y Trazabilidad Transaccional

### HU 26 - Bitacora de auditoria inmutable
Como Administrador Central quiero que cada llamada, cambio de estatus o vizualizacion de nota confidencial quede en un log con usuario, rol, IP, User-Agent, fecha/hora y los cambios realizados (informaacion anterior vs informacion nueva)

El log no puede ser editable desde la app

### HU 27 - Borrado Logico
Como Administrador Central quiero que ningun registro pueda eliminarse fisicamente para preservar evidencia ante auditorias o casos legales

Utilizara deleted_at y los registros marcados no aparecen en vistas operativas per si en auditoria

## Modulo gestion y Caducidad de Expedientes Digitales

### HU 28 - Politica de Retencion Documental
Como Administrador Central quiero que las notas de seguimiento siguan un ciclo de vida (activas durante el ciclo escolar, archivo historico de 5 anos y depuracion controlada) para cumplir la politica de retencion

### HU 29 - Exportacion de Expediente para Traslado
Como Directora quiero exportar el expediente integral de un infante en PDF foliado y sellado digitalmente, para facilitar traslados enter las estancias sin perder historial.

## Modulo Calidad de Producto Software (ISO/IEC 25010)

### HU 30 - Tiempo de Respuesta Bajo Concurrencia
Como Capturista/Docente quiero que el pase de lista responda en menos de 1.5 segundos con las 212 estanciasoperando simultaniamente para no perder tiempo operativo

### HU 31 - Tolerancia a Fallos con Cola Local
Como Trabajadora Social, quiero que las llamadas y seguimientos no se pierdan si cae la base de datos o la red para no repetir gestiones ya hechas

### HU 32 - Cobertura de Pruebas Automatizadas
Como Lider Tecnico quiero al menos 80% de cobertura en controladores y servicios de negocio con complejidad ciclomatica <10 para asegurar mantenibilidad

## Modulo Gestion de Riesgos y Contingencia Operativa

### HU 33 - Protocolo de Contingencia por Caida de Enlace
Como Directora quiero un manual de captura en formatos fisicos de respaldo y su reconciliacion al restablecerse el servicio para no detener la operacion ante fallas prolongadas

### HU 34 - Plan de Pruebas Piloto
Como Administrador Central quiero ejecutar pruebas piloto en 3 a 5 estancias reales antes del despliegue masivo para validar el sistema en condiciones reales y firmar actas de aceptacion
