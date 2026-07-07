import { PREGUNTAS_TI, DOMINIOS_TI } from '../data/ti-questions';

/**
 * Tareas de mejora por dominio TI
 */
export const TAREAS_TI = {
  'Inventario': [
    { titulo: 'Crear inventario formal de sistemas', mes: 1, prioridad: 1, duracion: 2 },
    { titulo: 'Documentar servidores y equipos', mes: 2, prioridad: 1, duracion: 3 },
    { titulo: 'Establecer proceso de actualización', mes: 4, prioridad: 2, duracion: 1 }
  ],
  'Acceso e Identidad': [
    { titulo: 'Implementar cuentas individuales', mes: 1, prioridad: 1, duracion: 4 },
    { titulo: 'Habilitar MFA en correo y críticos', mes: 2, prioridad: 1, duracion: 3 },
    { titulo: 'Eliminar usuarios compartidos', mes: 3, prioridad: 1, duracion: 2 },
    { titulo: 'Auditoría periódica de accesos', mes: 5, prioridad: 2, duracion: 1 }
  ],
  'Datos Personales': [
    { titulo: 'Mapear sistemas con datos personales', mes: 1, prioridad: 1, duracion: 2 },
    { titulo: 'Implementar restricciones de acceso', mes: 2, prioridad: 1, duracion: 3 },
    { titulo: 'Establecer trazabilidad de cambios', mes: 4, prioridad: 2, duracion: 2 },
    { titulo: 'Revisar contratos de privacidad', mes: 5, prioridad: 2, duracion: 1 }
  ],
  'Seguridad Perimetral': [
    { titulo: 'Validar y actualizar firewall', mes: 1, prioridad: 1, duracion: 2 },
    { titulo: 'Implementar o reforzar VPN', mes: 2, prioridad: 1, duracion: 3 },
    { titulo: 'Segmentar red por áreas', mes: 4, prioridad: 2, duracion: 3 },
    { titulo: 'Crear red separada para visitantes', mes: 6, prioridad: 2, duracion: 1 }
  ],
  'Respaldos': [
    { titulo: 'Crear política de respaldos', mes: 1, prioridad: 1, duracion: 1 },
    { titulo: 'Implementar respaldos externos', mes: 2, prioridad: 1, duracion: 4 },
    { titulo: 'Realizar pruebas de restauración', mes: 5, prioridad: 1, duracion: 2 },
    { titulo: 'Establecer RTO/RPO por sistema', mes: 6, prioridad: 2, duracion: 1 }
  ],
  'Monitoreo': [
    { titulo: 'Implementar monitoreo de infraestructura', mes: 2, prioridad: 1, duracion: 3 },
    { titulo: 'Centralizar logs de seguridad', mes: 3, prioridad: 1, duracion: 2 },
    { titulo: 'Crear procedimiento de incidentes', mes: 4, prioridad: 2, duracion: 1 },
    { titulo: 'Realizar análisis de vulnerabilidades', mes: 6, prioridad: 2, duracion: 2 }
  ],
  'Proveedores': [
    { titulo: 'Crear matriz de proveedores críticos', mes: 1, prioridad: 2, duracion: 1 },
    { titulo: 'Revisar contratos con cláusulas', mes: 2, prioridad: 2, duracion: 2 },
    { titulo: 'Implementar auditoría de accesos', mes: 4, prioridad: 2, duracion: 1 }
  ]
};

/**
 * Calcula las áreas críticas que necesitan mejora
 */
export const calcularAreasParaMejorar = (detalles) => {
  return Object.values(detalles)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3); // Top 3 áreas débiles
};

/**
 * Genera tareas prioritarias basadas en dominios débiles
 */
export const generarTareasRoadmap = (detalles) => {
  const areasDebiles = calcularAreasParaMejorar(detalles);
  const tareas = [];

  areasDebiles.forEach(area => {
    const tareasArea = TAREAS_TI[area.nombre] || [];
    tareas.push(...tareasArea.slice(0, 3)); // Primeras 3 tareas por área
  });

  // Ordenar por mes
  return tareas.sort((a, b) => a.mes - b.mes);
};

/**
 * Calcula resumen ejecutivo basado en scores
 */
export const generarResumenEjecutivo = (madurez, detalles) => {
  const areasDebiles = calcularAreasParaMejorar(detalles);
  const areaDebil1 = areasDebiles[0];
  const areaDebil2 = areasDebiles[1];

  let recomendacion = '';

  if (madurez < 25) {
    recomendacion = `La infraestructura TI requiere intervención inmediata. ${areaDebil1.nombre} (${areaDebil1.score}%) es la prioridad crítica. Se recomienda un plan de 12 meses enfocado en inventario, controles de acceso y respaldos básicos.`;
  } else if (madurez < 50) {
    recomendacion = `Existen brechas significativas en infraestructura. Priorizar: ${areaDebil1.nombre} (${areaDebil1.score}%) y ${areaDebil2.nombre} (${areaDebil2.score}%). Plan de 9-12 meses para consolidar controles y documentación.`;
  } else if (madurez < 75) {
    recomendacion = `Infraestructura satisfactoria. Enfocarse en optimizar ${areaDebil1.nombre} (${areaDebil1.score}%) y mejorar monitoreo. Plan de 6-9 meses para madurez operativa.`;
  } else {
    recomendacion = `Infraestructura optimizada. Mantener ${areaDebil1.nombre} (${areaDebil1.score}%) en línea. Plan de mejora continua y automatización avanzada.`;
  }

  return recomendacion;
};

/**
 * Entregables por fase
 */
export const ENTREGABLES_TI = {
  'Fase 1 (Meses 1-3)': [
    'Inventario formal de sistemas, servidores y equipos',
    'Mapeo de datos personales por sistema',
    'Política de respaldos documentada',
    'Matriz de proveedores críticos'
  ],
  'Fase 2 (Meses 4-6)': [
    'Cuentas individuales implementadas en sistemas críticos',
    'MFA habilitado para acceso remoto',
    'Firewall validado y VPN operativa',
    'Red segmentada por áreas'
  ],
  'Fase 3 (Meses 7-12)': [
    'Respaldos externos probados y validados',
    'Monitoreo centralizado de infraestructura',
    'Procedimiento de incidentes formalizado',
    'Auditorías periódicas implementadas'
  ]
};
