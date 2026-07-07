# Proyecto GRC Assessment - TIBOX

## 📋 Descripción General

Sistema de evaluación de madurez en Ciberseguridad y Protección de Datos (Ley 21.719) para TIBOX.

**Arquitectura:** React (frontend) + Node.js/Express (backend) + MSSQL (base de datos)

**Estado:** Backend en construcción - Conexión a BD pendiente de resolver

---

## 📁 Estructura del Proyecto

```
proyecto grc/
├── backend/                          # Backend Node.js/Express
│   ├── server.js                     # Entrada Express
│   ├── config.js                     # Variables de entorno
│   ├── package.json                  # Dependencias
│   ├── .env                          # Configuración local (credenciales)
│   ├── .gitignore
│   ├── README.md                     # Documentación backend
│   └── backend/
│       ├── database/
│       │   ├── connection.js         # Pool MSSQL
│       │   └── schema.sql            # DDL tablas
│       ├── queries/                  # Templates SQL
│       ├── services/                 # Lógica de negocio
│       ├── controllers/              # Handlers HTTP
│       └── routes/                   # Endpoints /api/v1
└── frontend/                         # React (aún no en proyecto grc)
    └── (por construir)
```

---

## 🔧 Tecnologías

| Componente | Tecnología | Versión |
|-----------|-----------|---------|
| **Backend** | Node.js + Express | v18+ |
| **ORM/Cliente BD** | mssql | v9.x |
| **BD** | SQL Server Express | 2022 |
| **Frontend** | React + Vite | (próximamente) |

---

## 🗄️ Base de Datos

**Nombre:** `GRC_Assessment`

**Tablas:**
- `Clientes` — Perfil de la empresa (razón social, industria, contacto)
- `Evaluaciones` — Sesión de evaluación (módulo, fechas, respuestas)
- `Respuestas` — Respuestas por pregunta (upsert, UNIQUE constraint)

**Conexión configurada:**
- Host: `localhost`
- Port: `1433`
- Usuario: `sa`
- Base: `GRC_Assessment`

---

## 🚨 Principales Errores Encontrados

### 1. **Conexión MSSQL - TCP/IP No Habilitado**
**Problema:** SQL Server Express instalado pero TCP/IP no escucha en puerto 1433.

**Síntoma:**
```
Failed to connect to localhost:1433 - Could not connect (sequence)
netstat -ano | findstr ":1433"  → (sin resultados)
```

**Causa probable:**
- TCP/IP no habilitado en SQL Server Configuration Manager
- O no reiniciado el servicio después de habilitar

**Solución pendiente:**
- Habilitar TCP/IP desde registry (ver abajo)
- Reiniciar servicio `MSSQL$SQLEXPRESS`
- Verificar con `netstat` que escucha en :1433

### 2. **Sintaxis de Conexión - Escapes de Backslash**
**Problema:** Intenté múltiples sintaxis que no funcionaron:
```javascript
// ❌ Falló
server: '.\\SQLEXPRESS'           // → getaddrinfo ENOTFOUND .
server: '(local)\\SQLEXPRESS'     // → getaddrinfo ENOTFOUND (local)
server: 'localhost\\SQLEXPRESS'   // → timeout
```

**Causa:** mssql.js intenta resolver el string como nombre de host en lugar de Named Pipes.

**Solución:** Esperar a que TCP/IP funcione y usar `localhost:1433` con usuario/password.

### 3. **SQL Server Express - Instalación Incompleta**
**Problema:** Instalado pero configuración de red no iniciada correctamente.

**Síntoma:**
- Servicio `MSSQL$SQLEXPRESS` corre, pero no escucha en ningún puerto TCP
- TCP/IP aparece "Enabled" en GUI pero no actúa

**Causa:** Probablemente falta de reinicio después de instalación, o SQL Server Configuration Manager no sincroniza con registro.

**Solución:** Habilitar TCP/IP vía registry y reiniciar.

---

## ✅ Completado

- ✓ Estructura de carpetas backend
- ✓ `server.js`, `config.js`, `package.json`
- ✓ Schema SQL (tablas Clientes, Evaluaciones, Respuestas)
- ✓ Queries, services, controllers, routes
- ✓ `test-db.js` (script de prueba de conexión)
- ✓ `.env` con credenciales SQL Server
- ✓ Dependencias instaladas (`npm install`)
- ✓ BD `GRC_Assessment` creada en SSMS con tablas

---

## ⏳ Pendiente

- ⏳ **Conexión a BD** — Resolver problema TCP/IP
- ⏳ **Test de endpoints** — Una vez que BD conecte
- ⏳ **Frontend React** — Estructura, hooks, páginas
- ⏳ **Integración frontend-backend** — API calls, autoguardado

---

## 🔨 Próximos Pasos

### Inmediato (Hoy)
1. Habilitar TCP/IP en SQL Server:
   ```powershell
   # Como ADMIN
   reg add "HKLM\SOFTWARE\Microsoft\MSSQLServer\MSSQLServer\SuperSocketNetLib\Tcp" /v Enabled /t REG_DWORD /d 1 /f
   reg add "HKLM\SOFTWARE\Microsoft\MSSQLServer\MSSQLServer\SuperSocketNetLib\Tcp\IPAll" /v TcpPort /t REG_SZ /d 1433 /f
   Restart-Service -Name "MSSQL$SQLEXPRESS" -Force
   ```

2. Verificar que escucha:
   ```powershell
   netstat -ano | findstr ":1433"
   ```

3. Probar conexión:
   ```bash
   cd proyecto grc/backend
   node test-db.js
   ```

### Luego (Cuando BD conecte)
1. `npm start` para levantar backend en `http://localhost:3000`
2. Construir frontend React (`proyecto grc/frontend`)
3. Integrar ambos (proxy Vite + API calls)
4. Testing end-to-end

---

## 📝 Notas

- **Backend listo para producción** una vez que la conexión a BD funcione
- **SQL Server + Node.js** = Standard TIBOX (replicable en otros proyectos)
- **Frontend aún no iniciado** — Esperando backend funcional
- **Archivos sensibles:** `.env` no commitear (`.gitignore` ya activo)

---

## 🆘 Debugging

Si la conexión sigue fallando:

1. Verificar que SQL Server corre:
   ```powershell
   Get-Service -Name "MSSQL$SQLEXPRESS" | Select-Object Name, Status
   ```

2. Ver logs de SQL Server:
   ```
   C:\Program Files\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQL\LOG\ERRORLOG
   ```

3. Reinstalar/Reparar SQL Server Express desde Add/Remove Programs si nada funciona.

---

**Última actualización:** 2026-07-07  
**Responsable:** TIBOX Dev Team
