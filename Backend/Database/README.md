# Instrucciones para poder correr los scripts de la base de datos

Primero necesitas cambiar tu directorio de trabajo a la carpeta `Backend/Database`.

## Desde la raíz del repositorio

Si tu terminal está en la carpeta `Plataforma_de_Asistencia`, el mismo comando funciona en Bash, CMD y PowerShell:

```
cd Backend/Database
```

## Desde cualquier carpeta dentro del repositorio

Estos comandos usan Git para encontrar la raíz del repositorio, así que funcionan sin importar en qué subcarpeta estés.

**Bash (Linux, macOS, Git Bash):**

```bash
cd "$(git rev-parse --show-toplevel)/Backend/Database"
```

**PowerShell:**

```powershell
cd "$(git rev-parse --show-toplevel)/Backend/Database"
```

**CMD:**

```bat
for /f "delims=" %i in ('git rev-parse --show-toplevel') do cd /d "%i/Backend/Database"
```
## Correr los scripts

Primero necesitas tener instalado `mongosh` y tenerlo en tu PATH. Puedes verificarlo ejecutando:

```
mongosh --version
```

Ahora abre una terminal y ejecuta el siguiente comando para correr el script de usuarios:

```
mongosh BaseDatos.js
```

Te va a preguntar si quieres borrar la colección de usuarios, si quieres borrarla para empezar de cero, escribe `y` y presiona Enter. Si no quieres borrarla, escribe `n` y presiona Enter.

Por cuestiones de como funciona mongodb te va a decir lo siguiente:

```
Iniciando la base de datos ISSTE...
¿Eliminar colecciones? (y/n):
Enter password
```
Es importante que escribas y o n y presiones Enter, no vas a poder ver que estas escribiendo porque lo toma como si fuera una contraseña, pero si estas escribiendo y o n y presionando Enter, va a funcionar.