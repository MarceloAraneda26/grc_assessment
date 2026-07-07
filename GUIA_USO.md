# 📖 **GUÍA DE USO — GRC Assessment (TIBOX)**

## 🎯 **Introducción**

GRC Assessment es una plataforma de evaluación de madurez para empresas que permite diagnosticar el estado de ciberseguridad, protección de datos e infraestructura tecnológica.

**URL:** https://marceloaraneda26.github.io/grc_assessment/

---

## 📱 **Interfaz Principal**

### **Topbar (Barra Superior)**
```
[TIBOX LOGO] | Export | Import | 🌙 Dark Mode | PERFIL | CUESTIONARIO | RESULTADOS | ROADMAP
```

- **Logo TIBOX** — Ir a inicio (selector de módulos)
- **Export** — Descargar evaluación actual como JSON
- **Import** — Cargar evaluación desde archivo JSON
- **🌙 Dark Mode** — Alternar tema claro/oscuro
- **Pasos** — Indicadores del flujo (gris = no visitado)

---

## 🎓 **Los 3 Módulos**

### **1️⃣ GRC CIBERSEGURIDAD** 🛡️

**Descripción:**
- Evaluación de madurez en gobernanza, identidad, acceso y seguridad
- Basado en **NIST CSF** y **Ley 21.663**
- **Respuesta:** Niveles 0-3 (No Implementado → Optimizado)

**Flujo:**
```
1. Seleccionar módulo
2. Completar perfil del cliente (obligatorio)
3. Responder 5 preguntas (~2 min)
4. Ver resultados con gauge y dominios
5. Revisar roadmap de 12 meses
```

**Dominios evaluados:**
- 🟦 Gobernanza (3 preguntas)
- 🟦 Acceso (2 preguntas)

**Niveles de Madurez:**
- 🔴 **0 - No Implementado** (0%)
- 🟡 **1 - Inicial** (33%)
- 🔵 **2 - Avanzado** (66%)
- 🟢 **3 - Optimizado** (100%)

**Ejemplo:**
- Si respondes: `[2, 1, 3, 2, 1]` → Promedio = 1.8 → **60% Satisfactorio**

---

### **2️⃣ GRC PROTECCIÓN DE DATOS** 📋

**Descripción:**
- Evaluación de cumplimiento con **Ley 21.719** (Chile)
- Enfocado en obligaciones de protección de datos personales
- **Respuesta:** Niveles 0-3 (igual que Cyber)

**Flujo:**
```
1. Seleccionar módulo
2. Completar perfil del cliente
3. Responder 5 preguntas (~2 min)
4. Responder preguntas preliminares sobre:
   - ¿Tratan datos sensibles a gran escala?
   - ¿Usan decisiones automatizadas?
   - ¿Transfieren datos fuera de Chile?
5. Ver resultados y roadmap
```

**Preguntas Preliminares (Ley 21.719):**
```
📌 Datos sensibles: salud, biometría, origen étnico, orientación sexual
📌 Decisiones automatizadas: scoring, IA, perfilamiento
📌 Transferencias: servidores extranjero, cloud internacional
```

**Diferencia vs Cyber:**
- Cyber = Gobernanza y técnica
- Ley 21.719 = Cumplimiento normativo y privacidad

---

### **3️⃣ LEVANTAMIENTO TI** 🖥️ ⭐ **NUEVO**

**Descripción:**
- Inventario y diagnóstico de infraestructura TI
- Mapeo de sistemas, acceso, respaldos y seguridad
- **Respuesta:** Si/No/Parcial/Desconoce
- **Scoring:** Ponderado por dominio (Acceso 20%, Respaldos 20%, etc)

**Flujo:**
```
1. Seleccionar "Levantamiento TI"
2. Completar perfil del cliente
3. Responder 40 preguntas (~5-10 min):
   - Seleccionar dominio o responder en orden
   - Presionar botón con respuesta (Si/No/Parcial/Desconoce)
   - Avanza automáticamente a siguiente pregunta
4. Ver dashboard con 7 dominios
5. Revisar roadmap con 3 fases
```

**7 Dominios Evaluados:**

| Dominio | Preguntas | Peso | Qué Evalúa |
|---------|-----------|------|-----------|
| 📊 Inventario | 5 | 10% | ¿Documentan sistemas, servidores, equipos? |
| 🔐 Acceso e Identidad | 7 | 20% | ¿MFA, cuentas individuales, sin usuarios compartidos? |
| 🔒 Datos Personales | 6 | 15% | ¿Protegen datos de clientes? ¿GDPR? |
| 🔥 Seguridad Perimetral | 6 | 15% | ¿Firewall, VPN, segmentación de red? |
| 💾 Respaldos | 6 | 20% | ¿Respaldos probados, fuera de infraestructura? |
| 👁️ Monitoreo | 6 | 15% | ¿SOC, logs centralizados, procedimiento de incidentes? |
| 👥 Proveedores | 4 | 5% | ¿Matriz de proveedores, contratos, auditoría? |

**Cálculo de Madurez:**
```
Madurez TI = Σ (Score Dominio × Peso)

Ejemplo:
- Inventario:        80% × 10% = 8.0
- Acceso:            60% × 20% = 12.0
- Datos:             70% × 15% = 10.5
- Seguridad:         50% × 15% = 7.5
- Respaldos:         90% × 20% = 18.0
- Monitoreo:         40% × 15% = 6.0
- Proveedores:       75% × 5%  = 3.75
─────────────────────────────────
Total:                      65.75% → "Satisfactorio" 🟡
```

**Preguntas Inversas (Lo malo es "Sí"):**
```
❌ ¿Existen usuarios compartidos?
   Sí = 0% (MALO), No = 100% (BUENO)

❌ ¿Hay cuentas administrativas compartidas?
   Sí = 0%, No = 100%

❌ ¿Ha sufrido incidentes de seguridad?
   Sí = 0%, No = 100%
```

---

## 📋 **PASO 1: Selector de Módulos**

### **Pantalla Inicial**
```
TIBOX — GRC Assessment
Seleccione el módulo de evaluación

┌─────────────────────────────────────────────────────────┐
│ 🛡️                                                       │
│ GRC Ciberseguridad                                       │
│ Evaluación de madurez en gobernanza, identidad...       │
│ NIST CSF · Ley 21.663                                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 📋                                                       │
│ GRC Protección de Datos                                 │
│ Evaluación de cumplimiento en protección de datos...    │
│ LEY 21.719 · CHILE                                      │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 🖥️                                                       │
│ Levantamiento TI                                        │
│ Inventario y diagnóstico de infraestructura...          │
│ SISTEMAS · INFRAESTRUCTURA                              │
└─────────────────────────────────────────────────────────┘
```

**Acción:** Haz clic en la tarjeta del módulo que desees

---

## 👤 **PASO 2: Perfil del Cliente**

### **Formulario (Obligatorio)**
```
Razón Social *          [Nombre de la empresa]
Industria *            [Dropdown: Financiero, Energía, Salud, etc]
N° de Usuarios *       [250]
Clasificación ANCI     [Dropdown: Organización General, PSE, OIV]
Infraestructura        [Dropdown: On-premise, Cloud, Híbrido]
Ecosistema Microsoft   [Dropdown: Sí (M365/Azure), Parcial, No]

¿Quién gestiona la seguridad?  [Dropdown: Interno, Externo, Mixto]
¿Incidentes en 12 meses?       [Dropdown: No, Sí, No sabemos]

Contacto Principal:
├─ Nombre *           [Juan Pérez]
├─ Cargo              [CISO]
├─ Email *            [juan@empresa.cl]
└─ Teléfono           [+56 9 ...]

[← Módulos]  [Continuar con Cuestionario →]
```

**Campos Obligatorios:** Razón Social, Industria, N° Usuarios, Nombre, Email

**Validación:** El sistema verifica que los campos requeridos estén completos antes de avanzar

---

## ❓ **PASO 3: Cuestionario**

### **Interfaz Wizard**

```
DOMINIOS                                    5 / 40 (12%)
┌─────────────────────────┬────────────────────────────────┐
│ [Gobernanza] [✓ Acceso] │ Progress: ████░░░░░░░░░░░░    │
└─────────────────────────┴────────────────────────────────┘

NIVEL DE MADUREZ

¿Tiene política de seguridad documentada?

┌──────────────────┬──────────────────┐
│ 🔴 No Implementado│ 🟡 Inicial       │
│ Nivel 0          │ Nivel 1          │
└──────────────────┴──────────────────┘

┌──────────────────┬──────────────────┐
│ 🔵 Avanzado      │ 🟢 Optimizado    │
│ Nivel 2          │ Nivel 3          │
└──────────────────┴──────────────────┘

[← Volver]  [Ver Resultados →] (si es última pregunta)
```

**Controles:**
- **Botones de dominio:** Haz clic para saltar a ese dominio
- **Opciones de nivel:** Selecciona tu respuesta (se guarda automáticamente)
- **Barra de progreso:** Muestra avance (preguntas respondidas / total)
- **✓ Checkmark:** Indica dominio completado

**Comportamiento:**
- Al responder → avanza automáticamente a siguiente pregunta
- Puede cambiar respuestas navegando entre dominios
- El progreso se guarda en tiempo real (backend)

---

## 📊 **PASO 4: Resultados (Dashboard)**

### **Gauge de Madurez Global**

```
┌─────────────────────────────────────────┐
│                                         │
│            ╱─────────────╲             │
│         ╱       67%        ╲           │
│        │    Satisfactorio  │          │
│         ╲                  ╱           │
│            ╲─────────────╱             │
│                                         │
│  Madurez Global                        │
└─────────────────────────────────────────┘
```

- **Gauge SVG:** Círculo con arco de progreso (color según nivel)
- **Porcentaje:** Score global (0-100%)
- **Nivel:** Crítico / En Riesgo / Satisfactorio / Optimizado

### **Dominios (7 Cards - TI)**

```
┌──────────────────────────┐  ┌──────────────────────────┐
│ Inventario               │  │ Acceso e Identidad       │
│ 80%                      │  │ 60%                      │
│ ████████░░              │  │ ██████░░░░              │
│ OPTIMIZAR                │  │ MEJORAR                  │
└──────────────────────────┘  └──────────────────────────┘

┌──────────────────────────┐  ┌──────────────────────────┐
│ Datos Personales         │  │ Seguridad Perimetral     │
│ 70%                      │  │ 50%                      │
│ ███████░░░              │  │ █████░░░░░              │
│ AVANZAR                  │  │ MEJORAR                  │
└──────────────────────────┘  └──────────────────────────┘
```

**Interactividad:**
- Haz clic en una card para ver **detalle de preguntas**
- Barra de progreso visual por dominio
- Color de la barra: siempre naranja (consistente)
- Status: "Mejorar" (<50%), "Avanzar" (50-75%), "Optimizar" (>75%)

### **Drill-Down Panel (Detalle)**

```
DETALLE: Inventario

¿Existe un inventario formal de sistemas?
└─ Sí

¿Existe inventario de servidores?
└─ Parcial

¿Hay inventario de equipos?
└─ No

¿Se documentan los proveedores?
└─ Desconoce

¿Existe documentación de infraestructura?
└─ Sí
```

**Qué ves:**
- Cada pregunta del dominio seleccionado
- Tu respuesta (Si/No/Parcial/Desconoce)
- Código de colores: Verde (Si), Rojo (No), Azul (Parcial), Gris (Desconoce)

**Botones de acción:**
- `← Volver` — Vuelve a módulos
- `Ver Roadmap →` — Ir a plan de mejora

---

## 🗺️ **PASO 5: Roadmap (Plan de Mejora)**

### **Timeline Gantt (12 meses)**

```
TAREAS                    M1  M2  M3  M4  M5  M6  M7  M8  M9  M10 M11 M12
─────────────────────────────────────────────────────────────────────────
Crear inventario      ███████
Documentar servidores     ████████████
Implementar cuentas       ████████████████
Habilitar MFA                  ██████████████████
Configurar firewall             ████████
                        [Red = Alta prioridad]
                        [Yellow = Media prioridad]
```

**Gantt Chart:**
- Tareas generadas automáticamente según dominios débiles
- Barras de color: Rojo (alta prioridad), Amarillo (media)
- Distribuidas en 12 meses

### **Hitos (3 Milestones)**

```
┌──────────┐    ┌──────────┐    ┌──────────┐
│    3     │    │    6     │    │    12    │
│ Meses   │    │ Meses   │    │ Meses   │
│          │    │          │    │          │
│ Inv +    │    │ Acceso + │    │ Monitoreo│
│ Privacidad│   │ Firewall │   │ + DR     │
└──────────┘    └──────────┘    └──────────┘
```

### **Resumen Ejecutivo (Dinámico)**

```
La infraestructura TI requiere intervención inmediata.
Acceso e Identidad (60%) es la prioridad crítica.

Se recomienda un plan de 12 meses enfocado en:
1. Inventario completo de sistemas y equipos
2. Implementación de cuentas individuales y MFA
3. Respaldos externos probados y validados
```

**Texto personalizado según:**
- Score global (<25%, 25-50%, 50-75%, >75%)
- Dominios débiles identificados
- Recomendaciones contextuales

### **Fases de Implementación (TI)**

```
FASE 1 (Meses 1-3)          FASE 2 (Meses 4-6)        FASE 3 (Meses 7-12)
─────────────────────────────────────────────────────────────────────────
→ Inventario formal         → Cuentas individuales    → Respaldos probados
→ Mapeo datos personales    → MFA implementado       → Monitoreo centralizado
→ Política de respaldos     → Firewall validado      → Incidentes formalizados
→ Matriz de proveedores     → Red segmentada         → Auditorías periódicas
```

**Entregables:**
- Documentos y políticas
- Sistemas implementados
- Procesos formalizados

---

## 💾 **FUNCIONALIDAD: EXPORT**

### **Cómo usar:**
```
1. Completa una evaluación (o cárgala)
2. Haz clic en botón "📥 Export" (Topbar superior)
3. Se descarga archivo: grc_assessment_YYYYMMDD.json
```

### **Contenido del archivo:**
```json
{
  "evaluacion": {
    "id": "uuid-random",
    "modulo": "ti",
    "perfil": {
      "empresa": "Acme Corp",
      "industria": "Tecnología",
      "usuarios": 250,
      "nombre": "Juan Pérez",
      "email": "juan@acme.cl"
    },
    "respuestas": {
      "ti-inv-1": "Si",
      "ti-inv-2": "Parcial",
      "ti-id-1": "No",
      ...
    },
    "timestamp": "2026-07-07T18:00:00Z"
  }
}
```

### **Casos de uso:**
- ✅ Guardar evaluación para compartir
- ✅ Backup local
- ✅ Importar en otra máquina
- ✅ Archivar histórico

---

## 📤 **FUNCIONALIDAD: IMPORT**

### **Cómo usar:**
```
1. Haz clic en "📤 Import" (Topbar)
2. Selecciona archivo .json (que hayas exportado antes)
3. Se cargan automáticamente:
   - Datos del cliente
   - Todas las respuestas
   - Puedes continuar editando
```

### **Casos de uso:**
- ✅ Recuperar evaluación incompleta
- ✅ Retomar desde otra sesión
- ✅ Compartir evaluación entre colegas
- ✅ Crear copias de plantillas

### **Validación:**
- El sistema verifica que el JSON sea válido
- Si falla: muestra error "Archivo inválido"
- Puedes reintentar con otro archivo

---

## 🌙 **FUNCIONALIDAD: Dark Mode**

### **Cómo activar:**
```
1. Haz clic en el botón "🌙" (Topbar superior derecha)
2. La página cambia automáticamente a tema oscuro
3. Se guarda la preferencia (localStorage)
```

### **Cambios visuales:**
- ✅ Fondo: Blanco → Gris oscuro
- ✅ Texto: Negro → Blanco
- ✅ Cards: Blanco → Gris oscuro
- ✅ Inputs: Blanco → Gris
- ✅ Colores mantienen legibilidad

**Colores en Dark Mode:**
- `--bg`: #0A0F1A (fondo)
- `--surface`: #111827 (cards)
- `--text`: #F1F5F9 (texto)
- Brand colors se adaptan automáticamente

---

## 🧭 **NAVEGACIÓN**

### **Flujo Completo:**
```
Selector de Módulos
        ↓
Perfil del Cliente (obligatorio)
        ↓
Cuestionario (wizard dinámico)
        ↓
Resultados (dashboard)
        ↓
Roadmap (plan de mejora)
        ↓
[← Volver] o [Nueva Evaluación]
```

### **Pasos en Topbar:**
- 🟦 PERFIL — Completado (azul), no visitado (gris)
- 🟦 CUESTIONARIO
- 🟦 RESULTADOS
- 🟦 ROADMAP

**Click en paso:** Retrocede a esa sección

---

## 📈 **INTERPRETACIÓN DE RESULTADOS**

### **Por Módulo:**

#### **Cyber & Ley 21.719 (niveles 0-3)**
```
60% de madurez = 1.8 de promedio
✓ Buena base, mejorar controles
```

#### **Levantamiento TI (ponderado)**
```
65% de madurez = Satisfactorio
- Inventario débil (60%)
- Acceso fuerte (80%)
- Respaldos excelentes (90%)

Acción: Mejorar inventario (dominio más débil)
```

### **Guía de Acción:**

| Score | Nivel | Acción |
|-------|-------|--------|
| 0-25% | 🔴 Crítico | Intervención inmediata, plan de 12 meses |
| 25-50% | 🟠 En Riesgo | Mejoras significativas, 9-12 meses |
| 50-75% | 🟡 Satisfactorio | Optimización, 6-9 meses |
| 75-100% | 🟢 Optimizado | Mantener y mejorar continuamente |

---

## ⚙️ **PREGUNTAS FRECUENTES**

### **¿Puedo cambiar respuestas?**
✅ Sí, navegando entre dominios en el cuestionario. Presiona el botón de dominio para saltar.

### **¿Se pierden datos si recargo la página?**
❌ No. Los datos se guardan automáticamente en el backend. Puedes recargar sin problema.

### **¿Cuánto tarda una evaluación?**
- Cyber/Ley: 2-3 minutos
- Levantamiento TI: 5-10 minutos (40 preguntas)

### **¿Qué significa "Parcial" en TI?**
"Parcial" = Implementado parcialmente o en proceso.
Ejemplo: "¿MFA habilitado?" → "Sí para algunos usuarios" = Parcial

### **¿El Roadmap es personalizado?**
✅ Sí. Se genera automáticamente según tus dominios más débiles.

### **¿Puedo compartir la evaluación?**
✅ Sí. Usa "Export" para descargar JSON y comparte por email.

### **¿Qué es NIST CSF?**
Framework de ciberseguridad de EEUU (industria estándar).

### **¿Qué es Ley 21.719?**
Ley chilena de Protección de Datos Personales.

---

## 🎯 **CASOS DE USO**

### **Empresa pequeña (20 usuarios)**
```
1. Selecciona "Levantamiento TI"
2. Completa perfil: 20 usuarios, infraestructura on-premise
3. Responde 40 preguntas (~8 min)
4. Recibe roadmap: "Prioridad: Inventario y MFA"
5. Exporta para compartir con junta directiva
```

### **Empresa grande con CISO (500 usuarios)**
```
1. Selecciona "GRC Ciberseguridad"
2. Completa perfil: 500 usuarios, cloud híbrido
3. Responde 5 preguntas (~2 min)
4. Recibe score y roadmap de 12 meses
5. Importa evaluación anterior para comparar progreso
```

### **Consultor asesorando cliente**
```
1. Llena perfil del cliente en la app
2. Importa evaluación TI de auditoría anterior
3. Responde nuevas preguntas
4. Exporta resultados para informe
5. Comparte con cliente vía email
```

---

## 📞 **SOPORTE**

**¿Algo no funciona?**
- Recarga la página (F5)
- Limpia cache del navegador (Ctrl+Shift+Delete)
- Intenta en navegador diferente
- Contacta al equipo: support@tibox.cl

**Contacto:** https://github.com/MarceloAraneda26/grc_assessment

---

**Versión:** 1.0  
**Última actualización:** 2026-07-07  
**Estado:** ✅ Completo y funcional
