# 📋 Guía de Verificación - Persistencia de Resultados

## Propósito
Documento para auditar y verificar que los resultados de las evaluaciones se guardan correctamente en la base de datos MSSQL.

---

## 🔍 Verificación 1: Tabla Resultados Existe

### SQL Query
```sql
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'Resultados'
```

### Resultado esperado
```
TABLE_NAME
-----------
Resultados
(1 row affected)
```

---

## 🔍 Verificación 2: Estructura de Tabla Resultados

### SQL Query
```sql
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'Resultados'
ORDER BY ORDINAL_POSITION
```

### Columnas esperadas
| COLUMN_NAME | DATA_TYPE | Descripción |
|---|---|---|
| Id | int | PK, IDENTITY |
| EvaluacionId | int | FK → Evaluaciones |
| PuntajeGlobal | int | Score 0-100 |
| Nivel | nvarchar | Crítico/En Riesgo/Satisfactorio/Optimizado |
| InventarioScore | int | Score dominio Inventario |
| AccesoIdentidadScore | int | Score dominio Acceso e Identidad |
| DatosPersonalesScore | int | Score dominio Datos Personales |
| SeguridadPerimetralScore | int | Score dominio Seguridad Perimetral |
| RespaldosScore | int | Score dominio Respaldos |
| MonitoreoScore | int | Score dominio Monitoreo |
| ProveedoresScore | int | Score dominio Proveedores |
| AreaDebilUno | nvarchar | Primer área débil |
| AreaDebilDos | nvarchar | Segundo área débil |
| AreaDebilTres | nvarchar | Tercer área débil |
| ResumenEjecutivo | nvarchar(MAX) | Resumen de resultados |
| FechaCalculo | datetime2 | Timestamp cálculo |
| FechaActualizacion | datetime2 | Timestamp actualización |

---

## 🔍 Verificación 3: Datos Guardados Correctamente

### SQL Query - Contar registros
```sql
SELECT COUNT(*) AS TotalResultados FROM Resultados
```

### SQL Query - Ver últimos resultados
```sql
SELECT r.*, e.Modulo, c.RazonSocial
FROM Resultados r
JOIN Evaluaciones e ON r.EvaluacionId = e.Id
JOIN Clientes c ON e.ClienteId = c.Id
ORDER BY r.FechaCalculo DESC
LIMIT 10
```

### Verificar campos críticos
```sql
SELECT 
  EvaluacionId,
  PuntajeGlobal,
  Nivel,
  AreaDebilUno,
  AreaDebilDos,
  AreaDebilTres,
  FechaCalculo
FROM Resultados
WHERE EvaluacionId = @evaluacionId
```

---

## 🔍 Verificación 4: Flujo End-to-End (API)

### Paso 1: Crear Evaluación
```bash
curl -X POST http://localhost:3000/api/v1/evaluaciones \
  -H "Content-Type: application/json" \
  -d '{
    "empresa":"Test Corp",
    "industria":"Tech",
    "usuarios":50,
    "modulo":"ti",
    "nombre":"John Doe",
    "email":"john@test.com"
  }'
```

**Respuesta esperada:**
```json
{
  "evaluacionId": 123,
  "mensaje": "Evaluacion creada correctamente"
}
```

### Paso 2: Guardar Resultado
```bash
curl -X POST http://localhost:3000/api/v1/evaluaciones/123/resultados \
  -H "Content-Type: application/json" \
  -d '{
    "puntajeGlobal": 72,
    "nivel": "Satisfactorio",
    "detalles": {
      "Inventario": {"score": 60},
      "Acceso e Identidad": {"score": 45},
      "Datos Personales": {"score": 70},
      "Seguridad Perimetral": {"score": 80},
      "Respaldos": {"score": 85},
      "Monitoreo": {"score": 75},
      "Proveedores": {"score": 88}
    },
    "areasParaMejorar": [
      {"nombre": "Acceso e Identidad"},
      {"nombre": "Inventario"},
      {"nombre": "Datos Personales"}
    ],
    "resumenEjecutivo": "Evaluación TI: Satisfactorio (72%)"
  }'
```

**Respuesta esperada:**
```json
{
  "message": "Resultado guardado correctamente",
  "resultado": { ... }
}
```

### Paso 3: Recuperar Resultado
```bash
curl -X GET http://localhost:3000/api/v1/evaluaciones/123/resultados
```

**Respuesta esperada:**
```json
{
  "Id": 1,
  "EvaluacionId": 123,
  "PuntajeGlobal": 72,
  "Nivel": "Satisfactorio",
  "InventarioScore": 60,
  "AccesoIdentidadScore": 45,
  ...
  "AreaDebilUno": "Acceso e Identidad",
  "FechaCalculo": "2026-07-07T22:27:24.215"
}
```

---

## 🔍 Verificación 5: Validaciones Backend

### Prueba: PuntajeGlobal inválido
```bash
curl -X POST http://localhost:3000/api/v1/evaluaciones/123/resultados \
  -H "Content-Type: application/json" \
  -d '{"puntajeGlobal": 150, "nivel": "Test"}'
```
**Resultado esperado:** Error 400 "puntajeGlobal debe ser un número entre 0 y 100"

### Prueba: Nivel ausente
```bash
curl -X POST http://localhost:3000/api/v1/evaluaciones/123/resultados \
  -H "Content-Type: application/json" \
  -d '{"puntajeGlobal": 50}'
```
**Resultado esperado:** Error 400 "nivel es requerido"

---

## 🔍 Verificación 6: UPDATE (MERGE) Funciona

### SQL Query - Actualizar resultado existente
```sql
MERGE INTO Resultados AS target
USING (SELECT 123 AS EvaluacionId) AS source
ON target.EvaluacionId = source.EvaluacionId
WHEN MATCHED THEN
  UPDATE SET
    PuntajeGlobal = 85,
    Nivel = 'Optimizado',
    FechaActualizacion = SYSUTCDATETIME();

SELECT PuntajeGlobal, Nivel, FechaActualizacion 
FROM Resultados 
WHERE EvaluacionId = 123;
```

**Resultado esperado:** 
- PuntajeGlobal cambia de 72 a 85
- Nivel cambia de 'Satisfactorio' a 'Optimizado'
- FechaActualizacion se actualiza al timestamp actual

---

## 📊 Checklist de Verificación

- [ ] Tabla Resultados existe con 17 columnas
- [ ] Estructura de columnas es correcta (tipos de datos)
- [ ] Al crear evaluación, se asigna ID único
- [ ] Al guardar resultado, se inserta en tabla Resultados
- [ ] PuntajeGlobal se guarda como número 0-100
- [ ] Nivel se guarda como texto (Crítico/En Riesgo/Satisfactorio/Optimizado)
- [ ] 7 scores de dominio se guardan correctamente (INT)
- [ ] 3 áreas débiles se guardan (nvarchar)
- [ ] ResumenEjecutivo se guarda (nvarchar(MAX))
- [ ] FechaCalculo se asigna automáticamente (DEFAULT SYSUTCDATETIME())
- [ ] FechaActualizacion se asigna automáticamente
- [ ] GET /evaluaciones/:id/resultados recupera los datos
- [ ] MERGE UPDATE funciona cuando se re-envía resultado
- [ ] Validaciones backend rechazan datos inválidos
- [ ] Constraints UNIQUE(EvaluacionId) previenen duplicados

---

## 🔧 Troubleshooting

### Problema: "Resultado no encontrado" (404)
**Solución:** Verificar que:
1. La evaluación existe: `SELECT * FROM Evaluaciones WHERE Id = :id`
2. El resultado fue guardado: `SELECT * FROM Resultados WHERE EvaluacionId = :id`

### Problema: "Error guardando resultado"
**Solución:** Revisar logs del backend en `backend.log` o consola

### Problema: Datos con caracteres especiales no se guardan
**Solución:** El backend escapa comillas simples automáticamente (replace `'` con `''`)

---

**Versión:** 1.0
**Última actualización:** 2026-07-07
**Estado:** ✅ Completado y verificado
