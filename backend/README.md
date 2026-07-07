# GRC Assessment Backend

Backend Node.js/Express para GRC Assessment - TIBOX

## Setup

### 1. Instalar dependencias

```bash
npm install
```

### 2. Crear la BD en SSMS

1. Abrí SQL Server Management Studio
2. Conectate a `localhost\SQLEXPRESS`
3. Abrí el archivo `backend/database/schema.sql`
4. Ejecutá el script (F5)

### 3. Configurar variables de entorno

El archivo `.env` ya está configurado para Windows Auth en `localhost\SQLEXPRESS`:

```env
DB_SERVER=.\SQLEXPRESS
DB_PORT=1433
DB_DATABASE=GRC_Assessment
DB_WINDOWS_AUTH=true
NODE_ENV=development
PORT=3000
```

Si necesitás cambiar la conexión, editá el `.env`.

## Ejecutar

```bash
npm start        # producción
npm run dev      # desarrollo con --watch
```

El servidor corre en `http://localhost:3000`

API disponible en `http://localhost:3000/api/v1`

## Endpoints

- `GET /api/v1/evaluaciones` — Listar todas las evaluaciones
- `POST /api/v1/evaluaciones` — Crear nueva evaluación
- `GET /api/v1/evaluaciones/:id` — Obtener evaluación con perfil y respuestas
- `PUT /api/v1/evaluaciones/:id/respuestas/:preguntaId` — Guardar respuesta

## Estructura

```
backend/
├── server.js                 — Entrada principal
├── config.js                 — Variables de entorno
├── package.json
├── .env
└── backend/
    ├── database/
    │   ├── connection.js     — Pool MSSQL
    │   └── schema.sql        — DDL tablas
    ├── queries/
    │   ├── cliente.query.js
    │   ├── evaluacion.query.js
    │   └── respuesta.query.js
    ├── services/
    │   ├── cliente.service.js
    │   ├── evaluacion.service.js
    │   └── respuesta.service.js
    ├── controllers/
    │   └── evaluacion.controller.js
    └── routes/
        └── evaluacion.route.js
```
