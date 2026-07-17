# Iglesia Registro

Aplicación web ligera para registrar personas interesadas en iglesias y darles seguimiento desde un panel interno.

## Requisitos

- Node.js 18+
- MySQL 8+

## Instalación

```bash
npm install
cp .env.example .env
```

Edite el archivo `.env` con tus credenciales de MySQL y un `JWT_SECRET` fuerte.

## Base de datos

Puedes crear las tablas desde el proyecto con:

```bash
npm run db:init
```

Y sembrar datos de prueba mínimos con:

```bash
npm run db:seed
```

O importar el esquema y el seed manualmente:

```bash
mysql -u <usuario> -p < server/db/schema.sql
mysql -u <usuario> -p < server/db/seed.sql
```

## Generar hash de contraseña para un usuario de prueba

```bash
node -e "const bcrypt=require('bcryptjs'); const password='Admin123!'; bcrypt.hash(password, 10).then(hash => console.log(hash));"
```

Luego reemplaza el valor del hash en `server/db/seed.sql` si deseas usar otra contraseña.

## Ejecutar la app

```bash
npm start
```

La app servirá:

- `http://localhost:3000/registro.html` para el formulario público
- `http://localhost:3000/login.html` para autenticación 
- `http://localhost:3000/dashboard.html` para el panel interno
