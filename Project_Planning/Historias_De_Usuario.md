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
Como Capturista 
