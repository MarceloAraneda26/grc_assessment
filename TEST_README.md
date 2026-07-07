# 🧪 **PRUEBAS (TESTS) — GRC Assessment**

## 📖 **Introducción**

Este documento explica cómo ejecutar y entender las pruebas automatizadas del proyecto.

**Archivo principal:** `frontend/src/utils/ti-scoring.test.js`

---

## 🚀 **Ejecutar las Pruebas**

### **Instalación de Jest (si no está instalado)**

```bash
cd frontend
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

### **Ejecutar todas las pruebas**

```bash
npm test
```

### **Ejecutar pruebas en modo watch (rerun automático)**

```bash
npm test -- --watch
```

### **Ejecutar un archivo específico**

```bash
npm test ti-scoring.test.js
```

### **Ver cobertura de código**

```bash
npm test -- --coverage
```

---

## 📊 **Pruebas Incluidas (10 Suites)**

### **1️⃣ Suite: Empty Responses**
**¿Qué prueba?** Que el sistema maneja correctamente respuestas vacías

```
✓ should return 0 for empty responses
✓ should handle null responses
```

**Ejemplo:**
```javascript
calcularMadurezTI({})  // → 0
calcularMadurezTI(null)  // → 0
```

---

### **2️⃣ Suite: All "Si" Responses**
**¿Qué prueba?** Que todas las respuestas "Si" dan 100%

```
✓ should return 100 when all responses are "Si"
```

**Ejemplo:**
```javascript
// 40 preguntas, todas "Si" (considerando inversas)
respuestas = {
  'ti-inv-1': 'Si',
  'ti-id-3': 'No',  // Inversa: lo malo es "Si"
  ...
}
calcularMadurezTI(respuestas)  // → 100
```

---

### **3️⃣ Suite: Mixed with "Parcial"**
**¿Qué prueba?** Que "Parcial" = 50% en el cálculo

```
✓ should calculate correctly with Parcial responses
```

**Ejemplo:**
```javascript
respuestas = {
  'ti-inv-1': 'Si',       // 100%
  'ti-inv-2': 'Parcial',  // 50%
  'ti-inv-3': 'No',       // 0%
  'ti-inv-4': 'Si',       // 100%
  'ti-inv-5': 'Si'        // 100%
}
// Inventario = (100+50+0+100+100)/5 = 70%
```

---

### **4️⃣ Suite: Inverse Questions**
**¿Qué prueba?** Que preguntas inversas se calculan correctamente

```
✓ should handle inverse questions correctly
✓ should handle inverse questions with "No"
```

**Preguntas Inversas:**
```
ti-id-3:   ¿Existen usuarios compartidos?
           Sí = 0% (MALO), No = 100% (BUENO)

ti-id-7:   ¿Hay cuentas administrativas compartidas?
           Sí = 0%, No = 100%

ti-mon-4:  ¿Ha sufrido incidentes de seguridad?
           Sí = 0%, No = 100%
```

**Ejemplo:**
```javascript
respuestas = {
  'ti-id-3': 'Si',   // Inversa: Si=0%, No=100%
  'ti-id-7': 'Si',   // Inversa: Si=0%, No=100%
  'ti-mon-4': 'Si'   // Inversa: Si=0%, No=100%
}
// Si todas son inversas con "Si" → score bajo
```

---

### **5️⃣ Suite: Maturity Levels**
**¿Qué prueba?** Que el nivel se clasifica correctamente

```
✓ should classify as Crítico (0-25)
✓ should classify as En Riesgo (25-50)
✓ should classify as Satisfactorio (50-75)
✓ should classify as Optimizado (75-100)
```

**Clasificación:**
```
0-25%   → 🔴 Crítico
25-50%  → 🟠 En Riesgo
50-75%  → 🟡 Satisfactorio
75-100% → 🟢 Optimizado
```

**Ejemplo:**
```javascript
getNivelMadurezTI(20)  // → { label: 'Crítico', color: '#EF4444' }
getNivelMadurezTI(65)  // → { label: 'Satisfactorio', color: '#0BA5EC' }
getNivelMadurezTI(85)  // → { label: 'Optimizado', color: '#10B981' }
```

---

### **6️⃣ Suite: Domain Details**
**¿Qué prueba?** Que cada dominio se calcula independientemente

```
✓ should return details for each domain
```

**7 Dominios:**
```
Inventario         → Todas Si = 100%
Acceso e Identidad → Muchas No = ~30%
Datos Personales   → Todas Parcial = 50%
Seguridad Perimetral → Todas Si = 100%
Respaldos          → Todas Si = 100%
Monitoreo          → Mix = ~70%
Proveedores        → Todas Si = 100%
```

**Ejemplo:**
```javascript
detalles = calcularDetallesMaturezTI(respuestas)
detalles['Inventario'].score        // → 100
detalles['Acceso e Identidad'].score // → 30
detalles['Datos Personales'].score   // → 50
```

---

### **7️⃣ Suite: Areas for Improvement**
**¿Qué prueba?** Que identifica correctamente los 3 dominios más débiles

```
✓ should identify weakest domains
```

**Ejemplo:**
```javascript
detalles = {
  'Acceso e Identidad': { score: 30 },      // 1° más débil
  'Seguridad Perimetral': { score: 40 },    // 2° más débil
  'Datos Personales': { score: 50 },        // 3° más débil
  'Inventario': { score: 80 },
  'Respaldos': { score: 90 }
}

areas = getAreasParaMejorar(detalles, 3)
// areas[0].nombre → 'Acceso e Identidad'
// areas[1].nombre → 'Seguridad Perimetral'
// areas[2].nombre → 'Datos Personales'
```

---

### **8️⃣ Suite: Real-World Scenario**
**¿Qué prueba?** Caso real: empresa mediana con problemas en Acceso

```
✓ should handle real company scenario
```

**Escenario:**
```
Inventario:        40% (débil)
Acceso:            30% (crítico)
Datos:             70% (OK)
Seguridad:         50% (necesita trabajo)
Respaldos:         90% (bueno)
Monitoreo:         60% (regular)
Proveedores:       75% (aceptable)

Madurez Global: ~55% → Satisfactorio
Dominio más débil: Acceso e Identidad
```

---

### **9️⃣ Suite: Value Ranges**
**¿Qué prueba?** Que nunca hay valores fuera de rango (0-100)

```
✓ should never return score > 100
✓ should never return negative score
```

---

### **🔟 Suite: Desconoce Responses**
**¿Qué prueba?** Que "Desconoce" se trata como 0%

```
✓ should treat Desconoce as 0%
```

**Ejemplo:**
```javascript
respuestas = {
  'ti-inv-5': 'Desconoce'  // Cuenta como 0%
}
// Baja el score del dominio Inventario
```

---

## 📋 **Estructura de cada Test**

```javascript
describe('Suite Name', () => {
  test('should do something', () => {
    // ARRANGE: preparar datos
    const respuestas = { /* ... */ };
    
    // ACT: ejecutar función
    const resultado = calcularMadurezTI(respuestas);
    
    // ASSERT: verificar resultado
    expect(resultado).toBe(100);
  });
});
```

---

## ✅ **Expected Output**

Cuando ejecutas `npm test`, deberías ver:

```
PASS  src/utils/ti-scoring.test.js
  TI Scoring System
    Empty responses
      ✓ should return 0 for empty responses (15ms)
      ✓ should handle null responses (2ms)
    All "Si" responses
      ✓ should return 100 when all responses are "Si" (8ms)
    Mixed responses with Parcial
      ✓ should calculate correctly with Parcial responses (6ms)
    Inverse questions (lo malo es "Si")
      ✓ should handle inverse questions correctly (5ms)
      ✓ should handle inverse questions with "No" (4ms)
    Maturity levels
      ✓ should classify as Crítico (0-25) (3ms)
      ✓ should classify as En Riesgo (25-50) (2ms)
      ✓ should classify as Satisfactorio (50-75) (2ms)
      ✓ should classify as Optimizado (75-100) (2ms)
    Domain details calculation
      ✓ should return details for each domain (15ms)
    Areas for improvement
      ✓ should identify weakest domains (8ms)
    Real-world scenario
      ✓ should handle real company scenario (12ms)
    Value ranges
      ✓ should never return score > 100 (7ms)
      ✓ should never return negative score (6ms)
    Desconoce (Unknown) responses
      ✓ should treat Desconoce as 0% (9ms)

Test Suites: 1 passed, 1 total
Tests:       15 passed, 15 total
Snapshots:   0 total
Time:        2.456s
```

---

## 🎯 **Casos de Prueba Manual**

Si quieres probar en la app directamente:

### **Test 1: Respuestas Vacías**
```
1. Selecciona módulo TI
2. Completa perfil
3. NO responde ninguna pregunta
4. Resultado debería mostrar: 0% - Crítico
```

### **Test 2: Todas "Si"**
```
1. Responde "Si" a todas las 40 preguntas
2. (Excepto inversas: "No" a ti-id-3, ti-id-7, ti-mon-4)
3. Resultado debería mostrar: 100% - Optimizado
```

### **Test 3: Mix realista**
```
1. Inventario: 60% (algunos No)
2. Acceso: 30% (muchos No)
3. Datos: 70% (varios Parcial)
4. Resultado debería mostrar: ~50-60% - Satisfactorio
```

---

## 📊 **Coverage Report**

```bash
npm test -- --coverage
```

**Salida esperada:**
```
File                  % Stmts % Branch % Funcs % Lines
─────────────────────────────────────────────────────
All files            100.00  100.00  100.00  100.00
 ti-scoring.js       100.00  100.00  100.00  100.00
```

---

## 🔧 **Troubleshooting**

### **Error: Jest not found**
```bash
npm install --save-dev jest
```

### **Tests no se ejecutan**
```bash
npm test -- --clearCache
npm test
```

### **Quiero ver solo tests que fallen**
```bash
npm test -- --verbose
```

---

## 📝 **Agregar más pruebas**

Para agregar una nueva prueba, agrega al final del archivo:

```javascript
describe('New feature', () => {
  test('should do something new', () => {
    const data = { /* ... */ };
    const result = functionToTest(data);
    expect(result).toBe(expectedValue);
  });
});
```

Luego ejecuta:
```bash
npm test
```

---

**Versión:** 1.0  
**Última actualización:** 2026-07-07  
**Tests:** 15 / 15 ✅
