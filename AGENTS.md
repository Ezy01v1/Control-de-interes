# AGENTS.md

## Proyecto

Aplicación web ligera para registrar personas interesadas en iglesias y hacer seguimiento desde un panel interno.

## Stack

- Backend: Node.js + Express
- Base de datos: MySQL con `mysql2` y pool de conexiones
- Auth: JWT + `bcrypt`
- Frontend: HTML/CSS/JavaScript vanilla servido por Express desde `public/`

## Comandos principales

```bash
npm install
npm start
npm run dev
```

## Convenciones

- Mantén la lógica de acceso a datos en `server/controllers/` y `server/config/`.
- Usa consultas con placeholders `?` en todas las queries SQL.
- El formulario público vive en `public/registro.html` y el panel en `public/dashboard.html`.
- No agregues build step ni frameworks al frontend.

## Documentación relevante

- Lee [README.md](README.md) para setup local y generación de hashes.
- Revisa [server/db/schema.sql](server/db/schema.sql) para el esquema base.
