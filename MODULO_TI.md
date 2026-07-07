# Módulo Levantamiento TI — GRC Assessment

## 📋 Descripción

El módulo **Levantamiento TI** (titrack) es un cuestionario de diagnóstico que mapea la infraestructura tecnológica, sistemas, controles de acceso, respaldos y seguridad de una organización. Genera un score de madurez automatizado y un roadmap de mejora con tareas prioritizadas.

## 🎯 Objetivo

Proporcionar un diagnóstico rápido y estructurado del estado de la infraestructura TI para:
- Identificar brechas en inventario, acceso y seguridad
- Priorizar mejoras basadas en dominios débiles
- Generar roadmaps contextualizados de 12 meses
- Integrar con evaluaciones de Ciberseguridad y Protección de Datos

## 📊 Estructura

### Dominios (7 áreas)

| Dominio | Preguntas | Peso | Objetivo |
|---------|-----------|------|----------|
| **Inventario** | 5 | 10% | Documentar sistemas, servidores y equipos |
| **Acceso e Identidad** | 7 | 20% | Garantizar cuentas individuales y MFA |
| **Datos Personales** | 6 | 15% | Proteger información sensible |
| **Seguridad Perimetral** | 6 | 15% | Firewall, VPN, segmentación |
| **Respaldos** | 6 | 20% | Recuperación ante desastres |
| **Monitoreo** | 6 | 15% | Vigilancia de infraestructura |
| **Proveedores** | 4 | 5% | Gestión de proveedores críticos |

**Total: 40 preguntas**

### Tipos de Respuesta

- **Si/No** — Sí=100%, No=0%
- **Si/No/Parcial** — Sí=100%, Parcial=50%, No=0%
- **Si/No/Desconoce** — Sí=100%, Desconoce=0%, No=0%

### Preguntas Inversas

Algunas preguntas tienen semántica inversa (lo malo es "Sí"):
- `ti-id-3`: ¿Existen usuarios compartidos? → Sí=0, No=100
- `ti-id-7`: ¿Hay cuentas administrativas compartidas? → Sí=0, No=100
- `ti-mon-4`: ¿Ha sufrido incidentes de seguridad? → Sí=0, No=100

## 📈 Scoring

```
Madurez TI = Σ (Score Dominio × Peso)
```

### Ejemplo

```
Inventario:        80% × 0.10 = 8.0
Acceso:            60% × 0.20 = 12.0
Datos:             70% × 0.15 = 10.5
Seguridad:         50% × 0.15 = 7.5
Respaldos:         90% × 0.20 = 18.0
Monitoreo:         40% × 0.15 = 6.0
Proveedores:       75% × 0.05 = 3.75
─────────────────────────────────
Total Madurez:              65.75% ✅ "Satisfactorio"
```

### Niveles de Madurez

| Rango | Nivel | Color | Descripción |
|-------|-------|-------|-------------|
| 0-25% | 🔴 Crítico | Rojo | Ausencia de controles fundamentales |
| 25-50% | 🟠 En Riesgo | Naranja | Infraestructura sin controles |
| 50-75% | 🟡 Satisfactorio | Azul | Controles básicos implementados |
| 75-100% | 🟢 Optimizado | Verde | Controles maduros y documentados |

## 🛣️ Roadmap Automático

### Generación de Tareas

El sistema genera tareas de mejora basadas en:
1. **Dominios débiles** — Los 3 con scores más bajos
2. **Tareas predefinidas** — Asociadas a cada dominio
3. **Ordenamiento cronológico** — Distribuidas en 12 meses

### Ejemplo: Si Inventario=60% (débil)

Se generan tareas como:
- M1-2: Crear inventario formal de sistemas
- M2-4: Documentar servidores y equipos
- M4-5: Establecer proceso de actualización

### Fases de Implementación

**Fase 1 (Meses 1-3):** Gobernanza
- Inventario formal de sistemas, servidores y equipos
- Mapeo de datos personales
- Política de respaldos

**Fase 2 (Meses 4-6):** Seguridad
- Cuentas individuales e identidad
- MFA en sistemas críticos
- Firewall y VPN

**Fase 3 (Meses 7-12):** Operación
- Respaldos probados
- Monitoreo centralizado
- Procedimientos de incidentes

## 📐 Arquitectura Técnica

### Archivos Clave

```
frontend/src/
├── data/
│   └── ti-questions.js          # 40 preguntas, 7 dominios
├── utils/
│   ├── ti-scoring.js            # Cálculo de madurez (ponderado)
│   └── ti-roadmap.js            # Generación de tareas y fases
├── pages/
│   ├── CuestionarioPage.jsx     # Wizard dinámico (Si/No/Parcial)
│   ├── ResultadosPage.jsx       # Dashboard con gauge y dominios
│   └── RoadmapPage.jsx          # Timeline de tareas + fases
└── styles/
    ├── CuestionarioPage.css     # Opciones simples
    ├── ResultadosPage.css       # Drill-down por dominio
    └── RoadmapPage.css          # Gantt chart + fase-card
```

### Flujo de Datos

```
1. Seleccionar "Levantamiento TI" en ModuloSelect
2. Completar 40 preguntas (Si/No/Parcial) → 2-3 minutos
3. Guardar respuestas en backend por evaluacion_id
4. Calcular madurez con ponderación por dominio
5. Mostrar dashboard con gauge SVG y drill-down
6. Generar roadmap automático con tareas contextualizadas
7. Mostrar 3 fases de implementación
```

## 🎨 Visualización

### Dashboard Resultados

- **Gauge SVG**: Puntaje global (0-100%)
- **Dominios**: 7 cards con barras de progreso
- **Drill-down**: Detalle pregunta-por-pregunta
- **Nivel**: Crítico/En Riesgo/Satisfactorio/Optimizado

### Roadmap

- **Gantt Chart**: Tareas distribuidas en 12 meses (2 colores de prioridad)
- **Hitos**: 3 milestones principales
- **Resumen Ejecutivo**: Dinámico según puntuación
- **Fase Cards**: 3 fases de implementación con entregables

## 🔄 Integración con Otros Módulos

### Datos Compartidos

```javascript
// Mismo contexto EvaluacionContext
{
  evaluacion: {
    modulo: 'ti',              // o 'cyber', 'ley'
    perfil: { ... },           // Datos del cliente
    respuestas: {
      'ti-inv-1': 'Si',
      'ti-id-2': 'Parcial',
      'ti-seg-1': 'No'
    }
  }
}
```

### Backend (MSSQL)

```sql
-- Tabla Respuestas (compartida)
INSERT INTO Respuestas (EvaluacionId, PreguntaId, Nivel)
VALUES (123, 'ti-inv-1', 'Si')

-- PreguntaId = 'ti-XXX' para TI
-- PreguntaId = 'q1' a 'q5' para Cyber/Ley (demo)
```

## 🚀 Próximos Pasos

- [ ] Agregar fichas dinámicas por sistema (formulario repetible)
- [ ] Implementar validaciones cruzadas (ej: "¿Cómo respaldas si no tienes infra?")
- [ ] Crear view de "Comparar TI vs Cyber" (brechas)
- [ ] Exportar roadmap a PDF/Excel
- [ ] Integrar con herramientas de project management

## 📝 Notas

- Las 40 preguntas son versión simplificada del documento original (80+ preguntas)
- El scoring es automático y ponderado (no simplista)
- Las tareas se generan dinámicamente según dominios débiles
- Todas las respuestas se guardan en backend para auditoría

---

**Versión:** 1.0  
**Fecha:** 2026-07-07  
**Estado:** ✅ Completado
