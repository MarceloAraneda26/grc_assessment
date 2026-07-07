import {
  calcularMadurezTI,
  calcularDetallesMaturezTI,
  getNivelMadurezTI,
  getAreasParaMejorar
} from './ti-scoring';

describe('TI Scoring System', () => {

  // ============================================
  // TEST 1: Respuestas vacías
  // ============================================
  describe('Empty responses', () => {
    test('should return 0 for empty responses', () => {
      const respuestas = {};
      const resultado = calcularMadurezTI(respuestas);
      expect(resultado).toBe(0);
    });

    test('should handle null responses', () => {
      const resultado = calcularMadurezTI(null);
      expect(resultado).toBe(0);
    });
  });

  // ============================================
  // TEST 2: Scoring simple (todas "Si")
  // ============================================
  describe('All "Si" responses', () => {
    test('should return 100 when all responses are "Si"', () => {
      const respuestas = {
        'ti-inv-1': 'Si',
        'ti-inv-2': 'Si',
        'ti-inv-3': 'Si',
        'ti-inv-4': 'Si',
        'ti-inv-5': 'Si',
        'ti-id-1': 'Si',
        'ti-id-2': 'Si',
        'ti-id-3': 'No',  // Inversa: No = 100
        'ti-id-4': 'Si',
        'ti-id-5': 'Si',
        'ti-id-6': 'Si',
        'ti-id-7': 'No',  // Inversa: No = 100
        'ti-dp-1': 'Si',
        'ti-dp-2': 'Si',
        'ti-dp-3': 'Si',
        'ti-dp-4': 'Si',
        'ti-dp-5': 'Si',
        'ti-dp-6': 'Si',
        'ti-seg-1': 'Si',
        'ti-seg-2': 'Si',
        'ti-seg-3': 'Si',
        'ti-seg-4': 'Si',
        'ti-seg-5': 'Si',
        'ti-seg-6': 'Si',
        'ti-rb-1': 'Si',
        'ti-rb-2': 'Si',
        'ti-rb-3': 'Si',
        'ti-rb-4': 'Si',
        'ti-rb-5': 'Si',
        'ti-rb-6': 'Si',
        'ti-mon-1': 'Si',
        'ti-mon-2': 'Si',
        'ti-mon-3': 'Si',
        'ti-mon-4': 'No',  // Inversa: No = 100
        'ti-mon-5': 'Si',
        'ti-mon-6': 'Si',
        'ti-prov-1': 'Si',
        'ti-prov-2': 'Si',
        'ti-prov-3': 'Si',
        'ti-prov-4': 'Si'
      };

      const resultado = calcularMadurezTI(respuestas);
      expect(resultado).toBe(100);
    });
  });

  // ============================================
  // TEST 3: Scoring con Parcial
  // ============================================
  describe('Mixed responses with Parcial', () => {
    test('should calculate correctly with Parcial responses', () => {
      const respuestas = {
        'ti-inv-1': 'Si',
        'ti-inv-2': 'Parcial',
        'ti-inv-3': 'No',
        'ti-inv-4': 'Si',
        'ti-inv-5': 'Si',
        // ... resto de preguntas como "Si"
        'ti-id-1': 'Si',
        'ti-id-2': 'Si',
        'ti-id-3': 'No',
        'ti-id-4': 'Si',
        'ti-id-5': 'Si',
        'ti-id-6': 'Si',
        'ti-id-7': 'No',
        'ti-dp-1': 'Si',
        'ti-dp-2': 'Si',
        'ti-dp-3': 'Si',
        'ti-dp-4': 'Si',
        'ti-dp-5': 'Si',
        'ti-dp-6': 'Si',
        'ti-seg-1': 'Si',
        'ti-seg-2': 'Si',
        'ti-seg-3': 'Si',
        'ti-seg-4': 'Si',
        'ti-seg-5': 'Si',
        'ti-seg-6': 'Si',
        'ti-rb-1': 'Si',
        'ti-rb-2': 'Si',
        'ti-rb-3': 'Si',
        'ti-rb-4': 'Si',
        'ti-rb-5': 'Si',
        'ti-rb-6': 'Si',
        'ti-mon-1': 'Si',
        'ti-mon-2': 'Si',
        'ti-mon-3': 'Si',
        'ti-mon-4': 'No',
        'ti-mon-5': 'Si',
        'ti-mon-6': 'Si',
        'ti-prov-1': 'Si',
        'ti-prov-2': 'Si',
        'ti-prov-3': 'Si',
        'ti-prov-4': 'Si'
      };

      const resultado = calcularMadurezTI(respuestas);
      // Inventario: (100+50+0+100+100)/5 = 70%
      // Otros todos 100% → resultado será ~97-98%
      expect(resultado).toBeGreaterThan(95);
      expect(resultado).toBeLessThanOrEqual(100);
    });
  });

  // ============================================
  // TEST 4: Preguntas inversas
  // ============================================
  describe('Inverse questions (lo malo es "Si")', () => {
    test('should handle inverse questions correctly', () => {
      const respuestas = {
        'ti-id-3': 'Si',   // Usuarios compartidos: Si=0%, No=100%
        'ti-id-7': 'Si',   // Cuentas admin compartidas: Si=0%, No=100%
        'ti-mon-4': 'Si',  // Incidentes: Si=0%, No=100%
      };

      // Si todas son inversas y respondemos "Si" (malo)
      // Score debería ser bajo
      const resultado = calcularMadurezTI(respuestas);
      expect(resultado).toBeLessThan(50);
    });

    test('should handle inverse questions with "No"', () => {
      const respuestas = {
        'ti-id-3': 'No',   // No hay usuarios compartidos: 100%
        'ti-id-7': 'No',   // No hay cuentas admin compartidas: 100%
        'ti-mon-4': 'No',  // No ha habido incidentes: 100%
      };

      const resultado = calcularMadurezTI(respuestas);
      expect(resultado).toBeGreaterThan(80);
    });
  });

  // ============================================
  // TEST 5: Niveles de Madurez
  // ============================================
  describe('Maturity levels', () => {
    test('should classify as Crítico (0-25)', () => {
      const nivel = getNivelMadurezTI(20);
      expect(nivel.label).toBe('Crítico');
      expect(nivel.color).toBe('#EF4444');
    });

    test('should classify as En Riesgo (25-50)', () => {
      const nivel = getNivelMadurezTI(35);
      expect(nivel.label).toBe('En Riesgo');
      expect(nivel.color).toBe('#F59E0B');
    });

    test('should classify as Satisfactorio (50-75)', () => {
      const nivel = getNivelMadurezTI(65);
      expect(nivel.label).toBe('Satisfactorio');
      expect(nivel.color).toBe('#0BA5EC');
    });

    test('should classify as Optimizado (75-100)', () => {
      const nivel = getNivelMadurezTI(85);
      expect(nivel.label).toBe('Optimizado');
      expect(nivel.color).toBe('#10B981');
    });
  });

  // ============================================
  // TEST 6: Detalles por dominio
  // ============================================
  describe('Domain details calculation', () => {
    test('should return details for each domain', () => {
      const respuestas = {
        'ti-inv-1': 'Si',
        'ti-inv-2': 'Si',
        'ti-inv-3': 'Si',
        'ti-inv-4': 'Si',
        'ti-inv-5': 'Si',
        'ti-id-1': 'No',
        'ti-id-2': 'No',
        'ti-id-3': 'Si',  // inverse: 0
        'ti-id-4': 'No',
        'ti-id-5': 'No',
        'ti-id-6': 'No',
        'ti-id-7': 'Si',  // inverse: 0
        'ti-dp-1': 'Parcial',
        'ti-dp-2': 'Parcial',
        'ti-dp-3': 'Parcial',
        'ti-dp-4': 'Parcial',
        'ti-dp-5': 'Parcial',
        'ti-dp-6': 'Parcial',
        'ti-seg-1': 'Si',
        'ti-seg-2': 'Si',
        'ti-seg-3': 'Si',
        'ti-seg-4': 'Si',
        'ti-seg-5': 'Si',
        'ti-seg-6': 'Si',
        'ti-rb-1': 'Si',
        'ti-rb-2': 'Si',
        'ti-rb-3': 'Si',
        'ti-rb-4': 'Si',
        'ti-rb-5': 'Si',
        'ti-rb-6': 'Si',
        'ti-mon-1': 'Si',
        'ti-mon-2': 'Si',
        'ti-mon-3': 'Si',
        'ti-mon-4': 'No',  // inverse: 100
        'ti-mon-5': 'Si',
        'ti-mon-6': 'Si',
        'ti-prov-1': 'Si',
        'ti-prov-2': 'Si',
        'ti-prov-3': 'Si',
        'ti-prov-4': 'Si'
      };

      const detalles = calcularDetallesMaturezTI(respuestas);

      // Verificar que tenemos 7 dominios
      expect(Object.keys(detalles)).toHaveLength(7);

      // Inventario debe ser 100% (todos Si)
      expect(detalles['Inventario'].score).toBe(100);

      // Acceso debe ser ~28% (28/7 promedio bajo)
      expect(detalles['Acceso e Identidad'].score).toBeLessThan(50);

      // Datos Personales debe ser 50% (todos Parcial)
      expect(detalles['Datos Personales'].score).toBe(50);
    });
  });

  // ============================================
  // TEST 7: Áreas para mejorar
  // ============================================
  describe('Areas for improvement', () => {
    test('should identify weakest domains', () => {
      const detalles = {
        'Inventario': { score: 80, nombre: 'Inventario', peso: 0.10 },
        'Acceso e Identidad': { score: 30, nombre: 'Acceso e Identidad', peso: 0.20 },
        'Datos Personales': { score: 50, nombre: 'Datos Personales', peso: 0.15 },
        'Seguridad Perimetral': { score: 40, nombre: 'Seguridad Perimetral', peso: 0.15 },
        'Respaldos': { score: 90, nombre: 'Respaldos', peso: 0.20 },
        'Monitoreo': { score: 60, nombre: 'Monitoreo', peso: 0.15 },
        'Proveedores': { score: 70, nombre: 'Proveedores', peso: 0.05 }
      };

      const areas = getAreasParaMejorar(detalles, 3);

      // Debe retornar 3 áreas
      expect(areas).toHaveLength(3);

      // Primera debe ser la más débil
      expect(areas[0].nombre).toBe('Acceso e Identidad');
      expect(areas[0].score).toBe(30);

      // Segunda debe ser Seguridad Perimetral
      expect(areas[1].nombre).toBe('Seguridad Perimetral');

      // Tercera debe ser Datos Personales
      expect(areas[2].nombre).toBe('Datos Personales');
    });
  });

  // ============================================
  // TEST 8: Caso real (ejemplo empresa)
  // ============================================
  describe('Real-world scenario', () => {
    test('should handle real company scenario', () => {
      // Empresa mediana con problemas en Acceso e Inventario
      const respuestas = {
        // Inventario: 40% (débil)
        'ti-inv-1': 'No',
        'ti-inv-2': 'Parcial',
        'ti-inv-3': 'No',
        'ti-inv-4': 'Si',
        'ti-inv-5': 'No',

        // Acceso: 30% (muy débil - problema crítico)
        'ti-id-1': 'No',
        'ti-id-2': 'No',
        'ti-id-3': 'Si',  // inverse: 0
        'ti-id-4': 'Parcial',
        'ti-id-5': 'No',
        'ti-id-6': 'No',
        'ti-id-7': 'Si',  // inverse: 0

        // Datos: 70% (OK)
        'ti-dp-1': 'Si',
        'ti-dp-2': 'Si',
        'ti-dp-3': 'Parcial',
        'ti-dp-4': 'Si',
        'ti-dp-5': 'Si',
        'ti-dp-6': 'Si',

        // Seguridad: 50% (necesita trabajo)
        'ti-seg-1': 'Si',
        'ti-seg-2': 'No',
        'ti-seg-3': 'Parcial',
        'ti-seg-4': 'No',
        'ti-seg-5': 'Si',
        'ti-seg-6': 'No',

        // Respaldos: 90% (bueno)
        'ti-rb-1': 'Si',
        'ti-rb-2': 'Si',
        'ti-rb-3': 'Si',
        'ti-rb-4': 'Si',
        'ti-rb-5': 'Si',
        'ti-rb-6': 'Parcial',

        // Monitoreo: 60% (regular)
        'ti-mon-1': 'Si',
        'ti-mon-2': 'Parcial',
        'ti-mon-3': 'Si',
        'ti-mon-4': 'Si',  // inverse: 100
        'ti-mon-5': 'No',
        'ti-mon-6': 'Si',

        // Proveedores: 75% (aceptable)
        'ti-prov-1': 'Si',
        'ti-prov-2': 'Si',
        'ti-prov-3': 'Parcial',
        'ti-prov-4': 'Si'
      };

      const madurez = calcularMadurezTI(respuestas);
      const detalles = calcularDetallesMaturezTI(respuestas);
      const nivel = getNivelMadurezTI(madurez);

      // Madurez global debe estar entre 50-65%
      expect(madurez).toBeGreaterThan(50);
      expect(madurez).toBeLessThan(70);

      // Debe ser "Satisfactorio"
      expect(nivel.label).toBe('Satisfactorio');

      // Acceso debe ser el más débil
      const areas = getAreasParaMejorar(detalles, 1);
      expect(areas[0].nombre).toBe('Acceso e Identidad');
    });
  });
});

// ============================================
// TEST 9: Rango de valores
// ============================================
describe('Value ranges', () => {
  test('should never return score > 100', () => {
    const allYes = {};
    for (let i = 1; i <= 40; i++) {
      allYes[`ti-q-${i}`] = 'Si';
    }

    const resultado = calcularMadurezTI(allYes);
    expect(resultado).toBeLessThanOrEqual(100);
  });

  test('should never return negative score', () => {
    const allNo = {};
    for (let i = 1; i <= 40; i++) {
      allNo[`ti-q-${i}`] = 'No';
    }

    const resultado = calcularMadurezTI(allNo);
    expect(resultado).toBeGreaterThanOrEqual(0);
  });
});

// ============================================
// TEST 10: Desconoce responses
// ============================================
describe('Desconoce (Unknown) responses', () => {
  test('should treat Desconoce as 0%', () => {
    const respuestas = {
      'ti-inv-1': 'Si',
      'ti-inv-2': 'Si',
      'ti-inv-3': 'Si',
      'ti-inv-4': 'Si',
      'ti-inv-5': 'Desconoce',  // Should be 0
      // ... rest all Si
      'ti-id-1': 'Si',
      'ti-id-2': 'Si',
      'ti-id-3': 'No',
      'ti-id-4': 'Si',
      'ti-id-5': 'Si',
      'ti-id-6': 'Si',
      'ti-id-7': 'No',
      'ti-dp-1': 'Si',
      'ti-dp-2': 'Si',
      'ti-dp-3': 'Si',
      'ti-dp-4': 'Si',
      'ti-dp-5': 'Si',
      'ti-dp-6': 'Si',
      'ti-seg-1': 'Si',
      'ti-seg-2': 'Si',
      'ti-seg-3': 'Si',
      'ti-seg-4': 'Si',
      'ti-seg-5': 'Si',
      'ti-seg-6': 'Si',
      'ti-rb-1': 'Si',
      'ti-rb-2': 'Si',
      'ti-rb-3': 'Si',
      'ti-rb-4': 'Si',
      'ti-rb-5': 'Si',
      'ti-rb-6': 'Si',
      'ti-mon-1': 'Si',
      'ti-mon-2': 'Si',
      'ti-mon-3': 'Si',
      'ti-mon-4': 'No',
      'ti-mon-5': 'Si',
      'ti-mon-6': 'Si',
      'ti-prov-1': 'Si',
      'ti-prov-2': 'Si',
      'ti-prov-3': 'Si',
      'ti-prov-4': 'Si'
    };

    const resultado = calcularMadurezTI(respuestas);
    // Inventario será 80% (4 Si + 1 Desconoce=0) / 5
    // Otros 100% → resultado será ~98%
    expect(resultado).toBeGreaterThan(95);
  });
});
