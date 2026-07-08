# Auditoría Técnica TIBOX y Preparación Azure

**Proyecto auditado:** `C:\Users\maraneda\Downloads\Desarrollo\proyecto grc` (repo GitHub `MarceloAraneda26/grc_assessment`, rama `main`)
**Contexto:** GRC Assessment — herramienta de autodiagnóstico de madurez para clientes TIBOX (Ciberseguridad, Protección de Datos Ley 21.719, Levantamiento TI). Portado desde un prototipo HTML de un solo archivo a React (Vite) + Node/Express + SQL Server.
**Tipo de auditoría:** solo lectura, sin modificaciones al código auditado.

---

## 1. Resumen Ejecutivo

El proyecto tiene una **separación de capas backend correcta a nivel de nomenclatura** (routes → controllers → services → queries → database) y un **frontend React ordenado** (components/pages/hooks/context/services/utils), con seguridad HTTP razonable (Helmet + CSP) y documentación funcional decente para su etapa. Sin embargo, tiene **un problema arquitectónico central que bloquea cualquier despliegue en Azure**: la capa de base de datos no usa un driver real de SQL Server — abre PowerShell y ejecuta `sqlcmd.exe` contra una instancia local, parseando texto plano como si fuera un recordset. De ese mismo mecanismo se desprende el hallazgo más grave de la auditoría: **dos endpoints construyen SQL por concatenación de strings (inyección SQL real)**, y el resto de las queries usan una "parametrización" falsa (reemplazo de texto, no binding real).

No existe CI/CD (`.github/` está vacío), no hay pruebas automatizadas ejecutables pese a existir un archivo de test, no hay autenticación en la API, y no hay variables de entorno por ambiente ni `.env.example`. La estrategia de ramas es de una sola rama (`main`).

**Veredicto corto:** el proyecto está bien encaminado en organización de código, pero **no está listo para Azure** hasta resolver la capa de datos, la inyección SQL y la ausencia de CI/CD y autenticación.

---

## 2. Diagnóstico General

- El backend funciona hoy **solo porque corre en la misma máquina Windows que tiene instalado SQL Server Express y las herramientas cliente de `sqlcmd`**. No hay ninguna ruta de red/TCP hacia la base de datos.
- El frontend está desplegado como sitio estático en GitHub Pages (`docs/`), pero apunta a una URL relativa `/api/v1` que solo resuelve cuando el backend corre en el mismo origen (hoy, vía el proxy de Vite en desarrollo). En producción (GitHub Pages) esa llamada no tiene backend detrás.
- El repositorio ya tiene buenas prácticas parciales: `.gitignore` correcto (`.env`, `node_modules`, `dist`), `helmet` con CSP explícita, capas de backend nombradas según el estándar TIBOX.
- Hay artefactos residuales de exploración previa que conviene limpiar: dependencias `mssql`/`tedious` instaladas pero no usadas, una carpeta `frontend/src/modules/` vacía, y una carpeta con nombre literal `{database,queries,services,controllers,routes}` en `backend/backend/` (resto de una expansión de llaves de shell que no se ejecutó como se esperaba).

---

## 3. Nivel de Cumplimiento

| Categoría | Estado | Observación |
|---|---|---|
| Estructura TIBOX | Parcial | Nomenclatura de capas correcta, pero `backend/backend/` duplicado y sin `database/migrations`, `database/seeds` |
| Backend | Parcial | Capas y seguridad HTTP razonables; la capa de datos no es un driver real y dos endpoints tienen inyección SQL |
| Frontend | Parcial | Buena organización de carpetas; sin `VITE_API_URL`, sin router, sin tests ejecutables |
| Base de datos | No cumple | Sin migraciones versionadas, sin conexión compatible con Azure SQL, script de reseteo destructivo como único DDL |
| Seguridad | No cumple | Inyección SQL confirmada, sin autenticación en la API, sin `.env.example` |
| Azure readiness | No cumple | La capa de datos (PowerShell + sqlcmd local) es incompatible con App Service / Azure SQL tal como está |
| CI/CD | No cumple | `.github/` existe pero no contiene ningún workflow |

---

## 4. Estructura Detectada del Proyecto

```
proyecto grc/                          (git repo, rama única "main")
├── .github/                           ← existe, VACÍA (sin workflows)
├── .gitignore
├── GUIA_USO.md, MODULO_TI.md, RESUMEN.md,
│   TEST_README.md, VERIFICACION_RESULTADOS.md   ← documentación, sin README.md raíz
├── docs/                              ← bundle ESTÁTICO pre-compilado para GitHub Pages
│                                          (no es documentación técnica — colisión de nombre
│                                          con lo que TIBOX esperaría como docs/)
├── backend/
│   ├── .env (no versionado, correcto)  ├── .gitignore  ├── README.md
│   ├── config.js  ├── server.js  ├── package.json
│   ├── run-query.ps1
│   ├── setup-db.sql, setup-db-fresh.sql, setup-permissions.sql   ← sueltos, sin versionar
│   ├── test-db.js, test-tedious.js    ← experimentos con driver real, no usados por la app
│   └── backend/                       ← ⚠ NIVEL DUPLICADO, no "backend/controllers" directo
│       ├── controllers/  ├── database/ (connection.js, schema.sql)
│       ├── queries/  ├── routes/  ├── services/
│       └── {database,queries,services,controllers,routes}/   ← ⚠ carpeta literal, artefacto de shell, vacía
└── frontend/
    ├── package.json  ├── vite.config.js  ├── frontend.log (log suelto)
    ├── public/
    └── src/
        ├── assets/ (3)  ├── components/ (4)  ├── context/ (1)
        ├── data/ (3)    ├── hooks/ (2)        ├── modules/ (0, VACÍA — resto de plan no usado)
        ├── pages/ (3)   ├── services/ (1)     ├── styles/ (7)  ├── utils/ (8)
        (sin routes/, sin layout/)
```

---

## 5. Evaluación Contra Estructura TIBOX

- **Backend:** cumple el flujo `route → controller → service → query → database`, pero con dos desviaciones estructurales: (a) todo vive un nivel más abajo de lo esperado (`backend/backend/*` en vez de `backend/*`), y (b) existe la carpeta artefacto `{database,queries,services,controllers,routes}` sin uso (no versionada por git, pero presente en disco).
- **Frontend:** cumple gran parte de la lista (`components`, `context`, `hooks`, `pages`, `services`, `styles`, `utils`), pero faltan `routes/` y `layout/`, y `modules/` quedó como carpeta vacía sin eliminar del árbol original planificado.
- **Base de datos:** no existe `database/migrations/`, `database/seeds/` ni `database/docs/` como estructura propia — solo `backend/backend/database/schema.sql` (un único script de reset) más tres scripts sueltos (`setup-db.sql`, `setup-db-fresh.sql`, `setup-permissions.sql`) en la raíz de `backend/`, con propósitos que se superponen y sin numeración/orden de ejecución documentado.

---

## 6. Auditoría Backend Node.js/Express

**Fortalezas verificadas** (`backend/server.js`):
- `express.json()`, `helmet()` con CSP explícita (`default-src 'self'`, sin `unsafe-eval`, sin wildcards) y `Permissions-Policy` propia — mejor que el punto de partida típico de un primer backend.
- API versionada bajo `/api/v1` (`backend/server.js:37`).

**Brechas concretas:**

1. **La capa de datos no es un driver real de SQL Server.** `backend/backend/database/connection.js` implementa `getConnection()` como un objeto falso cuyo `.request().query(sql)` internamente: escribe `sql` a un archivo temporal, hace `spawn('powershell.exe', ...)` para invocar `sqlcmd.exe -S "(local)\SQLEXPRESS"`, y luego parsea el archivo de salida de texto separado por comas línea por línea (`connection.js:14-116`). No hay pool de conexiones TCP, no hay TLS, no hay reintentos, no hay tipado de parámetros.
2. **Inyección SQL confirmada** en `backend/backend/controllers/evaluacion.controller.js`:
   - `buscarEvaluacionesPorRazonSocialController` (líneas 190-219) y `verificarRazonSocialController` (líneas 221-240) arman el `WHERE` concatenando el input del usuario directamente en el string SQL (`WHERE c.RazonSocial = N'${razonSocial.replace(/'/g, "''")}'`). El escape manual de comillas no reemplaza la parametrización real y es el patrón exacto que la inyección SQL explota (ej. bypass vía comentarios `--`, `UNION SELECT`, etc., dependiendo de cómo `sqlcmd` interprete el batch).
3. **"Parametrización" falsa en el resto de las queries.** Los archivos en `backend/backend/queries/*.query.js` usan placeholders con pinta de parámetro real (`@evaluacionId`, `@nivel`), pero en la capa de servicio se reemplazan con `String.prototype.replace(/@x/g, valor)` antes de pasar el string final a `.query()` — no hay binding tipado en ningún punto. Ejemplo: `backend/backend/services/respuesta.service.js:6-9` inserta `evaluacionId` (que llega crudo desde `req.params.id` en `guardarRespuestaController`, sin validar que sea numérico) directamente en el texto de la query.
4. **Validación de entrada inconsistente.** `guardarRespuestaController` sí valida `nivel` (número 0-3, `evaluacion.controller.js:97`), pero **no valida que `:id` sea un entero** antes de usarlo para construir SQL. En cambio, `evaluacion.service.js:30` y `resultado.service.js` sí aplican `parseInt(id)` antes de interpolar. El criterio no es uniforme entre endpoints.
5. **Sin capa de validación de esquemas** (no hay `joi`, `zod`, ni `express-validator` en `package.json`) — toda validación es manual y ad hoc dentro de cada controller.
6. **Sin manejador de errores centralizado.** Cada controller repite su propio `try/catch`; varios devuelven `error.message` crudo al cliente (`evaluacion.controller.js:47,135,155,169,186,217`), lo que puede filtrar detalles internos (rutas, mensajes de PowerShell/SQL) a quien llame la API.
7. **CORS mal configurado para uso real cross-origin.** `server.js:9` solo define `app.options("*", cors())` (responde el preflight), pero no hay `app.use(cors())` aplicado a las respuestas reales de GET/POST/PUT. Si frontend y backend alguna vez corren en orígenes distintos (como ya ocurre hoy entre GitHub Pages y `localhost:3000`), las respuestas reales no llevarán el header `Access-Control-Allow-Origin` y el navegador las bloqueará.
8. **Sin endpoint de health check** (`/health` o similar) — no hay nada que un balanceador o Azure App Service pueda usar para verificar que el proceso está vivo.
9. **Sin autenticación ni autorización en ningún endpoint.** Cualquiera que alcance la API puede leer/escribir evaluaciones de cualquier cliente (`GET /evaluaciones`, `GET /evaluaciones/:id`, etc., sin ningún middleware de auth).
10. **Dependencias muertas:** `mssql` y `tedious` están declaradas en `backend/package.json` pero no se usan en ningún archivo de la app real — solo aparecen en `backend/test-db.js` y `backend/test-tedious.js`, que parecen ser el intento original (correcto) de conexión real, abandonado en favor del mecanismo de PowerShell.
11. **Configuración de conexión ignorada en la práctica:** `backend/config.js` lee `DB_USER`/`DB_PASSWORD`/`DB_HOST`/`DB_PORT`/`DB_WINDOWS_AUTH` desde `.env` (con defaults `sa`/`password`), pero `connection.js` nunca usa esas variables — el comando `sqlcmd` está hardcodeado a `(local)\SQLEXPRESS` sin flags `-U`/`-P`, confiando en autenticación integrada de Windows. Cambiar el `.env` hoy no tiene ningún efecto real; es configuración muerta y engañosa.
12. **Parsing frágil del recordset:** al partir el texto de salida de `sqlcmd` por comas (`connection.js:79-91`), cualquier columna de texto que contenga una coma (ej. una razón social "Empresa, S.A." o el `ResumenEjecutivo` de `Resultados`) desalinea silenciosamente las columnas siguientes. No hay mapeo tipado que lo detecte.
13. **Carrera de tiempo fija:** se usa `setTimeout(..., 500)` (`connection.js:110`) para "esperar" que el archivo de salida termine de escribirse, en vez de depender solo del evento `close` del proceso — funciona hoy por volumen bajo, pero es una condición de carrera latente.

---

## 7. Auditoría Frontend React/Vite

**Fortalezas verificadas:**
- Vite + React 19, estructura de carpetas mayormente alineada al estándar (`components`, `context`, `hooks`, `pages`, `services`, `styles`, `utils`).
- `vite.config.js` usa `base: '/grc_assessment/'` correctamente para el subpath de GitHub Pages, y los assets estáticos pasan por un helper (`src/utils/asset.js`) que respeta `import.meta.env.BASE_URL`.
- Build productivo (`npm run build`) funciona y se verificó en esta misma sesión.

**Brechas concretas:**

1. **Sin `VITE_API_URL` ni ninguna variable de entorno para la URL de la API.** `frontend/src/services/api.js:1` define `const API_BASE = '/api/v1'` como ruta relativa hardcodeada. Funciona solo si frontend y backend comparten origen (hoy, vía el proxy de `vite.config.js` en desarrollo). Es la causa técnica exacta de por qué la versión pública en GitHub Pages no puede guardar datos: no hay forma de apuntarla a un backend real sin tocar código fuente.
2. **Sin React Router.** No aparece `react-router-dom` en `package.json`. La navegación entre pantallas (selector, perfil, cuestionario, resultados, roadmap) se maneja por estado interno, no por rutas reales — sin deep-linking, sin back/forward del navegador, sin URL compartible a un paso específico.
3. **Sin React Query ni librería equivalente de manejo de datos remotos** — todas las llamadas pasan por `fetch` envuelto a mano en `services/api.js`, sin caché, sin reintentos, sin invalidación.
4. **Pruebas no ejecutables.** Existe `frontend/src/utils/ti-scoring.test.js` y `TEST_README.md` documenta cómo correrlo, pero `jest`/`@testing-library/*` **no están en `package.json`** (ni como dependencia ni como devDependency) y no hay script `test` (los scripts son solo `dev`, `build`, `lint`, `preview`). En un clon nuevo, `npm test` falla de inmediato.
5. **Carpeta `src/modules/` vacía** — resto del plan original (que preveía `modules/cyber/data/`, `modules/proteccion-datos/data/`) nunca usado; los datos terminaron en `src/data/` plano. Conviene eliminarla o documentar el cambio de decisión.
6. **`@types/react`/`@types/react-dom` instalados sin uso real** — el proyecto es `.jsx` puro, sin TypeScript, así que esos paquetes de tipos no aportan nada hoy.
7. **`frontend.log`** es un archivo de log suelto en la raíz de `frontend/` (verificar que esté cubierto por `.gitignore` — no aparece en `git ls-files`, así que no está versionado, pero conviene revisar por qué se genera ahí en primer lugar).

---

## 8. Auditoría Base de Datos SQL Server / Azure SQL

- **Esquema** (`backend/backend/database/schema.sql`): 4 tablas (`Clientes`, `Evaluaciones`, `Respuestas`, `Resultados`) con PK `IDENTITY`, FKs bien declaradas, y un `UNIQUE(EvaluacionId, PreguntaId)` en `Respuestas` que efectivamente previene duplicados (confirmado con datos reales en la sesión anterior). El T-SQL usado es estándar, sin dependencias de `SQLEXPRESS` — **la definición del esquema en sí migraría a Azure SQL sin cambios**.
- **El script es un "reset" destructivo, no una migración:** empieza con `DROP TABLE IF EXISTS` para las 4 tablas (líneas 4-7) antes de recrearlas. Ejecutarlo contra una base con datos reales borra todo sin respaldo ni confirmación. No hay versionado incremental (`001_...sql`, `002_...sql`), ni carpeta `seeds/` separada de `schema/`.
- **Scripts sueltos y redundantes:** `backend/setup-db.sql`, `backend/setup-db-fresh.sql` y `backend/setup-permissions.sql` conviven con `schema.sql` sin que quede claro cuál es la fuente de verdad ni el orden de ejecución.
- **Sin índices adicionales** más allá de PK/UNIQUE — invisible al volumen actual, pero `Respuestas.EvaluacionId` y `Evaluaciones.ClienteId` se consultan seguido y no tienen índice propio explícito.
- **Sin usuario de mínimo privilegio:** no hay evidencia de un login SQL dedicado a la app con permisos acotados; la conexión real (vía `sqlcmd`) corre con las credenciales/contexto de quien ejecuta el proceso Node, no con un usuario aplicativo controlado.
- **Incompatible con Azure SQL Database tal como está implementada la conexión** (ver punto 6.1) — Azure SQL requiere conexión TCP/TLS 1433 vía un driver real (`mssql`/`tedious`, ODBC o JDBC); no admite ni expone `sqlcmd.exe` local ni PowerShell del lado del servidor.

---

## 9. Seguridad, Secretos y Variables de Entorno

- `.env` (`backend/.env`) **correctamente excluido de git** — confirmado vía `git ls-files`, no aparece versionado; el `.gitignore` raíz cubre `.env`, `.env.local`, `.env.*.local`.
- **No existe ningún `.env.example`** en el repo (ni raíz ni `backend/`) — un desarrollador nuevo no tiene forma de saber qué variables son necesarias sin leer `backend/config.js` directamente.
- `backend/config.js:5-6` define defaults de `DB_USER = "sa"` y `DB_PASSWORD = "password"` directamente en el código fuente. Hoy no tienen efecto real (ver punto 6.11), pero es el tipo de default que termina copiado a un entorno real más adelante — debería eliminarse o reemplazarse por un error explícito si falta la variable.
- **Inyección SQL** (detallada en la sección 6) es el hallazgo de seguridad más grave del proyecto.
- **Sin autenticación/autorización** en ningún endpoint de la API — cualquiera con acceso de red al backend puede leer o modificar evaluaciones de cualquier cliente.
- **Sin límites de tasa (rate limiting)** ni protección explícita contra abuso — solo el límite por defecto de `express.json()` (~100kb).
- Headers de seguridad (Helmet + CSP + Permissions-Policy) están bien pensados y son una fortaleza real del proyecto.

---

## 10. Configuración por Ambiente

- No hay separación real dev/QA/prod: un único `.env` con un único juego de valores asumidos.
- `NODE_ENV` existe como variable en `backend/.env`, pero no se lee ni se ramifica en ningún lugar de `server.js` o `config.js` — está declarada pero no tiene efecto.
- El frontend no tiene variantes de build por ambiente (`.env.production`, `.env.qa`, `--mode`) — la URL de API es una constante fija en código fuente, no una variable de entorno inyectada en build time.

---

## 11. Control de Versiones y Ramas

- Una sola rama activa: `main`, sincronizada con `origin/main` (GitHub). No se observan `develop`, `feature/*`, `release/*` ni `hotfix/*`.
- El flujo de trabajo observado en la sesión (commits y push directos a `main`) sugiere que no hay protección de rama configurada, ni exigencia de Pull Request/revisión — aunque esto no se puede confirmar 100% sin acceso a la configuración del repositorio en GitHub.
- `docs/` (el bundle estático de GitHub Pages) se versiona directamente en `main` junto al código fuente — funciona para GitHub Pages, pero cada publicación depende de un paso manual (`build` → copiar `dist/*` a `docs/` → commit), sin ninguna validación automática de que el bundle publicado corresponda al último código fuente.

---

## 12. Pipeline CI/CD Propuesto

Hoy: **inexistente** — `.github/` existe como carpeta pero no contiene ningún archivo (`.github/workflows/` ni siquiera existe). No hay lint, test, build ni deploy automatizado.

Propuesta mínima (GitHub Actions, dado que el remoto ya es GitHub):

```yaml
# .github/workflows/ci.yml (propuesto, no existe hoy)
on: [pull_request, push]
jobs:
  build-and-test:
    steps:
      - checkout
      - setup-node
      - npm ci (frontend y backend por separado)
      - npm run lint (frontend: oxlint)
      - npm test (backend y frontend) — requiere primero resolver el punto 7.4
      - npm run build (frontend)
      - validar variables de entorno requeridas (fallar si falta alguna)
  deploy-qa:
    needs: build-and-test
    # despliegue a slot QA de Azure App Service + ejecución de migraciones SQL versionadas
  approve-prod:
    needs: deploy-qa
    # aprobación manual (GitHub Environments con reviewers requeridos)
  deploy-prod:
    needs: approve-prod
    # swap de slot / despliegue a producción, con posibilidad de rollback vía slot swap
```

Esto reemplazaría el actual proceso manual de "build local → copiar a `docs/` → commit" por un pipeline reproducible, y es un prerrequisito antes de cualquier despliegue a Azure serio.

---

## 13. Observabilidad y Monitoreo en Azure

- Hoy solo hay `console.log`/`console.error` esparcidos por controllers y servicios — sin logging estructurado, sin correlación de requests, sin `morgan` ni middleware de logging HTTP.
- No hay integración con Application Insights ni ningún APM.
- No hay endpoint `/health` que Azure App Service (o cualquier balanceador) pueda usar para health checks / auto-heal.
- No hay alertas, ni Diagnostic Settings, ni definición de qué métricas importan (latencia, tasa de error, etc.) — todo esto está por definir, no solo por configurar.

---

## 14. Documentación Técnica Requerida

**Lo que ya existe (fortaleza real):** `GUIA_USO.md`, `MODULO_TI.md`, `RESUMEN.md`, `TEST_README.md`, `VERIFICACION_RESULTADOS.md` en la raíz, más `backend/README.md` y `frontend/README.md` — documentación funcional/de uso bastante completa para la etapa del proyecto.

**Lo que falta:**
- Un `README.md` raíz que actúe como índice/entrada al proyecto (hoy no existe ninguno en la raíz de `proyecto grc/`).
- Documentación de arquitectura (diagrama simple de frontend/backend/DB, decisiones tomadas) — en particular, no hay ningún documento que explique *por qué* la capa de datos usa PowerShell+sqlcmd en vez de un driver real; dado que es el mayor riesgo técnico del proyecto, debería estar documentado explícitamente como decisión temporal/deuda técnica conocida.
- Documentación de esquema de base de datos (`database/docs/`) más allá de los comentarios dentro de `schema.sql`.
- `.env.example` documentando variables requeridas (ver sección 9).

---

## 15. Brechas Detectadas

| Prioridad | Brecha | Impacto | Recomendación |
|---|---|---|---|
| Alta | Inyección SQL por concatenación de strings en `evaluacion.controller.js` (`buscarEvaluacionesPorRazonSocialController`, `verificarRazonSocialController`) | Lectura/manipulación no autorizada de datos de clientes | Reemplazar por parametrización real con un driver con `.input()` tipado |
| Alta | Capa de datos vía PowerShell+`sqlcmd` (`connection.js`) en vez de driver real (`mssql`/`tedious`, ya instalados pero sin usar) | Bloquea cualquier despliegue a Azure App Service/Azure SQL; parsing frágil; condición de carrera | Migrar a `mssql`/`tedious` con pool de conexiones TCP real |
| Alta | "Parametrización" por `String.replace()` en todas las demás queries (`respuesta.service.js`, `cliente.service.js`, `evaluacion.service.js`, `resultado.service.js`) | Mismo vector de inyección que el hallazgo anterior, latente en todo el CRUD | Mismo fix que el anterior — resolver junto con el driver real |
| Alta | Sin autenticación/autorización en la API | Cualquiera con acceso de red lee/escribe datos de cualquier cliente | Agregar autenticación (API key mínimo, idealmente OAuth/Azure AD) antes de exponer fuera de localhost |
| Alta | Sin CI/CD (`.github/` vacío) | Cada despliegue es manual y propenso a error humano (bundle desactualizado, sin tests corridos) | Implementar pipeline (sección 12) antes de cualquier despliegue compartido |
| Media | `VITE_API_URL` inexistente, `API_BASE` hardcodeado a ruta relativa (`frontend/src/services/api.js:1`) | La versión pública en GitHub Pages no puede conectar a ningún backend real | Introducir variable de entorno de build para la URL de API |
| Media | CORS solo configurado para preflight (`app.options("*", cors())`), sin `app.use(cors())` real | Llamadas reales cross-origin serán bloqueadas por el navegador | Aplicar `cors()` a todas las rutas con origin(es) explícitos |
| Media | Sin migraciones versionadas — un solo `schema.sql` con `DROP TABLE` destructivo, más 3 scripts sueltos redundantes | Riesgo de pérdida de datos al re-ejecutar contra un ambiente con datos reales | Adoptar herramienta de migraciones (ej. `node-mssql` + scripts numerados, o Flyway/DbUp) |
| Media | Pruebas no ejecutables (`jest` no instalado, sin script `test`) pese a existir `ti-scoring.test.js` y `TEST_README.md` | Falsa sensación de cobertura; nadie corre el test en la práctica | Instalar Jest y agregar `"test"` a `package.json`, o eliminar el archivo/documentación si no se va a mantener |
| Media | Configuración de conexión (`DB_USER`/`DB_PASSWORD`/etc. en `config.js`) sin efecto real sobre `connection.js` | Confusión para cualquier desarrollador nuevo; falsa sensación de que el `.env` controla la conexión | Alinear config real con lo que efectivamente se usa, o eliminar variables muertas |
| Baja | Estructura duplicada `backend/backend/*` en vez de `backend/*` | Solo confusión de navegación, sin impacto funcional | Aplanar la estructura en una futura refactorización |
| Baja | Carpeta artefacto `{database,queries,services,controllers,routes}` (vacía, no versionada) | Ruido en el árbol de archivos | Eliminarla |
| Baja | `frontend/src/modules/` vacía | Ruido, desalineado con el plan original documentado | Eliminarla o documentar el cambio de decisión |
| Baja | Dependencias muertas `mssql`/`tedious` en `backend/package.json` sin uso en la app real | Falsa sensación de que ya se usa un driver real | Usarlas de verdad (fix de la brecha Alta) o quitarlas si se decide no migrar aún |
| Baja | Sin `.env.example` en el repo | Fricción para nuevos desarrolladores | Agregar `.env.example` con las variables documentadas |
| Baja | Sin `README.md` raíz | Falta un punto de entrada a la documentación existente | Agregar uno corto que enlace a los demás `.md` |

---

## 16. Riesgos Técnicos

1. **Riesgo de continuidad de datos:** el único DDL disponible (`schema.sql`) borra las 4 tablas antes de crearlas. Si alguien lo corre pensando que es idempotente/seguro contra una base con datos de clientes reales, se pierden todos los datos sin aviso.
2. **Riesgo de seguridad activo, no solo teórico:** la inyección SQL en los dos endpoints de búsqueda es explotable hoy mismo si el backend queda expuesto a cualquier red no confiable (aunque hoy solo corre en `localhost`, es el tipo de brecha que se vuelve crítica en el momento exacto en que alguien decide exponerlo, sin que nadie recuerde revisarla primero).
3. **Riesgo de escalamiento del mecanismo PowerShell+sqlcmd:** cada operación de base de datos crea un archivo temporal, lanza un proceso PowerShell y otro `sqlcmd`, y espera 500ms fijos. Bajo carga concurrente (más de un usuario respondiendo el cuestionario a la vez) esto puede generar archivos temporales colisionando por timestamp, lentitud severa, o respuestas mezcladas entre requests concurrentes.
4. **Riesgo de bloqueo total para Azure:** mientras la capa de datos dependa de `sqlcmd.exe` y PowerShell instalados localmente, **no hay ruta de migración incremental hacia Azure App Service** — es un rediseño de esa capa, no un ajuste de configuración.
5. **Riesgo de despliegues inconsistentes:** sin CI/CD, la publicación de `docs/` depende 100% de que la persona que hace el build recuerde copiar y comprometer los archivos correctos — ya se observó en esta misma sesión el proceso manual completo (build → borrar `docs/assets` viejo → copiar `dist/*` → commit).

---

## 17. Recomendaciones Priorizadas

### Alta Prioridad
- Reemplazar la capa de conexión (`backend/backend/database/connection.js`) por el driver `mssql`/`tedious` ya instalado, con pool de conexiones real y `.input()` tipado en cada query.
- Eliminar toda concatenación de SQL con datos de usuario — en particular `buscarEvaluacionesPorRazonSocialController` y `verificarRazonSocialController`.
- Agregar autenticación mínima a la API antes de exponerla fuera de `localhost`.
- Crear el pipeline CI/CD mínimo (lint + build, luego test cuando exista, luego deploy) en `.github/workflows/`.

### Media Prioridad
- Introducir `VITE_API_URL` (u equivalente) para que el frontend pueda apuntar a un backend real en cualquier ambiente.
- Corregir CORS para aplicar a las respuestas reales, no solo al preflight.
- Convertir `schema.sql` en migraciones versionadas e idempotentes, separadas de datos de prueba/seed.
- Instalar Jest realmente (o retirar el test/documentación si no se va a mantener) para que `TEST_README.md` refleje la realidad.
- Limpiar la configuración muerta de conexión en `config.js` para que coincida con lo que el driver real necesite.

### Baja Prioridad
- Aplanar `backend/backend/*` a `backend/*`.
- Eliminar la carpeta artefacto `{database,queries,services,controllers,routes}` y la carpeta vacía `frontend/src/modules/`.
- Retirar `mssql`/`tedious` de `package.json` si no se migran de inmediato (o priorizar la migración para poder usarlas).
- Agregar `.env.example` y un `README.md` raíz.

---

## 18. Checklist de Preparación para Azure

- [x] Repositorio ordenado (parcialmente — ver duplicación `backend/backend`).
- [x] `.env` fuera del repositorio.
- [ ] `.env.example` documentado.
- [ ] Secrets fuera del código (defaults `sa`/`password` siguen en `config.js`).
- [ ] Ramas protegidas (no verificable desde CLI, pero solo existe `main`).
- [ ] Pipeline funcionando (`.github/` vacío).
- [x] Build frontend validado (`npm run build` funciona, verificado esta sesión).
- [ ] Build backend validado (no hay pipeline que lo corra automáticamente).
- [ ] Migraciones SQL versionadas.
- [ ] Azure SQL preparado (bloqueado por el mecanismo de conexión actual).
- [ ] App Service configurado.
- [ ] Variables por ambiente configuradas.
- [ ] Application Insights activo.
- [ ] Health check disponible.
- [ ] Backups configurados.
- [ ] Rollback definido.
- [ ] Producción protegida con aprobación manual.

---

## 19. Conclusión

**El proyecto está parcialmente listo.** La organización de código, la seguridad HTTP (Helmet/CSP) y la documentación funcional ya están en un nivel razonable para la etapa del proyecto. Pero hay tres cosas que deben corregirse **antes** de pensar en un despliegue Azure real, no después:

1. Reemplazar la capa de datos (PowerShell + `sqlcmd`) por un driver real de SQL Server — sin esto, Azure App Service/Azure SQL directamente no son viables.
2. Eliminar la inyección SQL confirmada en los dos endpoints de búsqueda, y la "parametrización" falsa del resto de las queries.
3. Agregar CI/CD mínimo y autenticación en la API antes de exponer el backend fuera de `localhost`.

Todo lo demás (migraciones versionadas, `.env.example`, limpieza de carpetas artefacto, tests ejecutables, CORS real, variable de entorno para la URL de API) es importante pero no bloqueante de forma inmediata — puede abordarse en paralelo o inmediatamente después de resolver los tres puntos anteriores.
