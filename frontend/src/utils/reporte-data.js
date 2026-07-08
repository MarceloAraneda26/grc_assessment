import { PREGUNTAS_TI, DOMINIOS_TI } from '../data/ti-questions.js';
import { calcularMadurezTI, calcularDetallesMaturezTI, getNivelMadurezTI } from './ti-scoring.js';
import { generarTareasRoadmap, generarResumenEjecutivo, ENTREGABLES_TI } from './ti-roadmap.js';

// Preguntas de demostración para Ciberseguridad y Ley 21.719. Se mantienen
// centralizadas aquí para que ResultadosPage, RoadmapPage y el export a
// Excel usen exactamente el mismo set y no se desincronicen.
export const PREGUNTAS_DEMO = [
  { id: 'q1', texto: '¿Tiene política de seguridad documentada?', dominio: 'Gobernanza' },
  { id: 'q2', texto: '¿Realiza evaluaciones de riesgo regularmente?', dominio: 'Gobernanza' },
  { id: 'q3', texto: '¿Cuenta con un equipo de seguridad dedicado?', dominio: 'Gobernanza' },
  { id: 'q4', texto: '¿Implementa control de acceso basado en roles?', dominio: 'Acceso' },
  { id: 'q5', texto: '¿Utiliza autenticación multifactor?', dominio: 'Acceso' },
];

const LABEL_RESPUESTA = {
  Si: 'Sí', No: 'No', Parcial: 'Parcial', Desconoce: 'Desconoce',
  0: 'No Impl.', 1: 'Inicial', 2: 'Avanzado', 3: 'Optimizado',
};

export const labelRespuesta = (respuesta) => {
  if (respuesta === undefined) return 'Sin responder';
  return LABEL_RESPUESTA[respuesta] ?? String(respuesta);
};

const getNivelCyber = (porcentaje) => {
  if (porcentaje < 25) return { label: 'Crítico', color: '#EF4444', dot: '#EF4444' };
  if (porcentaje < 50) return { label: 'En Riesgo', color: '#F59E0B', dot: '#F59E0B' };
  if (porcentaje < 75) return { label: 'Satisfactorio', color: '#0BA5EC', dot: '#0BA5EC' };
  return { label: 'Optimizado', color: '#10B981', dot: '#10B981' };
};

const calcularScoreDominioTI = (respuestas, dominio) => {
  const preguntas = PREGUNTAS_TI.filter(q => q.dominio === dominio);
  if (preguntas.length === 0) return 0;
  const RESPUESTAS_INVERSAS = ['ti-id-3', 'ti-id-7', 'ti-mon-4'];
  const scores = preguntas.map(p => {
    const resp = respuestas[p.id] || 'No';
    const esInversa = RESPUESTAS_INVERSAS.includes(p.id);
    if (esInversa) {
      if (resp === 'Si') return 0;
      if (resp === 'No') return 100;
      if (resp === 'Parcial') return 50;
      return 0;
    }
    if (resp === 'Si') return 100;
    if (resp === 'No') return 0;
    if (resp === 'Parcial') return 50;
    return 0;
  });
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
};

/**
 * Calcula todos los datos necesarios para mostrar/exportar los Resultados
 * de una evaluación, para los 3 módulos (cyber, ley, ti).
 */
export const getDatosResultados = (evaluacion) => {
  const isTI = evaluacion.modulo === 'ti';
  const respuestas = evaluacion.respuestas || {};

  if (isTI) {
    const promedio = calcularMadurezTI(respuestas);
    const detalles = calcularDetallesMaturezTI(respuestas);
    const nivel = getNivelMadurezTI(promedio);
    const dominios = DOMINIOS_TI.map(d => {
      const preguntas = PREGUNTAS_TI.filter(q => q.dominio === d.nombre).map(q => ({
        texto: q.texto,
        valorCrudo: respuestas[q.id],
        respuesta: labelRespuesta(respuestas[q.id]),
      }));
      return { nombre: d.nombre, puntuacion: calcularScoreDominioTI(respuestas, d.nombre), preguntas };
    });
    return {
      titulo: 'Levantamiento TI',
      promedio,
      nivel,
      dominios,
      detalles,
    };
  }

  const respuestasPlanas = Object.values(respuestas);
  const promedio = respuestasPlanas.length === 0
    ? 0
    : Math.round((respuestasPlanas.reduce((a, b) => a + b, 0) / respuestasPlanas.length / 3) * 100);
  const nivel = getNivelCyber(promedio);
  const nombresDominios = [...new Set(PREGUNTAS_DEMO.map(q => q.dominio))];
  const dominios = nombresDominios.map(nombre => {
    const preguntasDominio = PREGUNTAS_DEMO.filter(q => q.dominio === nombre);
    const suma = preguntasDominio.reduce((acc, q) => acc + (respuestas[q.id] || 0), 0);
    const puntuacion = Math.round((suma / (preguntasDominio.length * 3)) * 100);
    const preguntas = preguntasDominio.map(q => ({
      texto: q.texto,
      valorCrudo: respuestas[q.id],
      respuesta: labelRespuesta(respuestas[q.id]),
    }));
    return { nombre, puntuacion, preguntas };
  });

  return {
    titulo: evaluacion.modulo === 'ley' ? 'Protección de Datos (Ley 21.719)' : 'Ciberseguridad',
    promedio,
    nivel,
    dominios,
  };
};

/**
 * Calcula todos los datos necesarios para mostrar/exportar el Roadmap de
 * una evaluación, para los 3 módulos (cyber, ley, ti).
 */
export const getDatosRoadmap = (evaluacion) => {
  const isTI = evaluacion.modulo === 'ti';
  const respuestas = evaluacion.respuestas || {};

  if (isTI) {
    const madurez = calcularMadurezTI(respuestas);
    const detalles = calcularDetallesMaturezTI(respuestas);
    const tareas = generarTareasRoadmap(detalles).map((t, idx) => ({
      id: idx,
      titulo: t.titulo,
      mesInicio: t.mes,
      mesFin: t.mes + (t.duracion || 2),
      prioridad: t.prioridad,
    }));

    return {
      titulo: 'Roadmap de Mejora TI',
      subtitulo: 'Plan de mejora de infraestructura y seguridad para los próximos 12 meses',
      tareas,
      hitos: [
        { num: '3', label: 'Meses', desc: 'Inventario y acceso consolidado' },
        { num: '6', label: 'Meses', desc: 'Respaldos y seguridad perimetral' },
        { num: '12', label: 'Meses', desc: 'Monitoreo y mejora continua' },
      ],
      resumen: generarResumenEjecutivo(madurez, detalles),
      entregables: [
        ...ENTREGABLES_TI['Fase 1 (Meses 1-3)'],
        ...ENTREGABLES_TI['Fase 2 (Meses 4-6)'],
        ...ENTREGABLES_TI['Fase 3 (Meses 7-12)'],
      ],
      fases: ENTREGABLES_TI,
    };
  }

  const tareas = [
    { id: 1, titulo: 'Política de Seguridad', mesInicio: 1, mesFin: 3, prioridad: 1 },
    { id: 2, titulo: 'Capacitación personal', mesInicio: 2, mesFin: 3, prioridad: 1 },
    { id: 3, titulo: 'Auditoría inicial', mesInicio: 2, mesFin: 4, prioridad: 2 },
    { id: 4, titulo: 'Implementar MFA', mesInicio: 4, mesFin: 6, prioridad: 1 },
    { id: 5, titulo: 'Monitoreo 24/7', mesInicio: 7, mesFin: 12, prioridad: 2 },
  ];

  const hitos = [
    { num: '3', label: 'Meses', desc: 'Fase inicial de gobernanza y capacitación' },
    { num: '6', label: 'Meses', desc: 'Control de acceso y autenticación implementado' },
    { num: '12', label: 'Meses', desc: 'Madurez operativa y monitoreo continuo' },
  ];

  const resumen = 'Basado en la evaluación realizada, se propone un plan de mejora de madurez distribuido en tres fases estratégicas: (1) Gobernanza y Sensibilización (meses 1–3), enfocado en establecer políticas y capacitación; (2) Controles de Acceso e Identidad (meses 4–6), implementando autenticación multifactor y gestión de accesos; (3) Operacionalización y Monitoreo (meses 7–12), estableciendo procesos de monitoreo continuo y mejora permanente.';

  const entregables = [
    'Política de Seguridad de la Información documentada',
    'Plan de Capacitación y Sensibilización aprobado',
    'Matriz de Riesgos actualizada y validada',
    'Arquitectura MFA implementada y operativa',
    'Centro de Monitoreo 24/7 en funcionamiento',
    'Informe de cumplimiento normativo periódico',
  ];

  return {
    titulo: 'Roadmap de Implementación',
    subtitulo: `Plan de mejora de madurez para los próximos 12 meses — ${evaluacion.modulo === 'ley' ? 'Protección de Datos' : 'Ciberseguridad'}`,
    tareas,
    hitos,
    resumen,
    entregables,
    fases: {},
  };
};
