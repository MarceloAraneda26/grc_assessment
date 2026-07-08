import { DOMINIOS_CYBER, PREGUNTAS_CYBER, PREGUNTAS_CYBER_SECTOR, FASES_CYBER, ENTREGABLES_CYBER } from '../data/cyber-questions.js';
import { DOMINIOS_LEY, PREGUNTAS_LEY, FASES_LEY, ENTREGABLES_LEY } from '../data/ley-questions.js';

// Portado de GRC_v1.html (funciones getPQF/qText/getSc del prototipo
// original) para que Ciberseguridad y Ley 21.719 usen el mismo banco de
// preguntas y la misma lógica de filtrado/puntaje que el prototipo.

const datosModulo = (modulo) => (modulo === 'ley'
  ? { dominios: DOMINIOS_LEY, fases: FASES_LEY, entregables: ENTREGABLES_LEY }
  : { dominios: DOMINIOS_CYBER, fases: FASES_CYBER, entregables: ENTREGABLES_CYBER });

/**
 * Preguntas efectivamente aplicables a esta evaluación: filtradas por perfil
 * (industria, datos sensibles, transferencia internacional, decisiones
 * automatizadas) y, para Ley 21.719, sin las preguntas "hijas" cuya pregunta
 * padre fue respondida "No" (nivel 0).
 */
export const obtenerPreguntasAplicables = (modulo, perfil, respuestas = {}) => {
  if (modulo === 'ley') {
    return PREGUNTAS_LEY
      .filter(p => (typeof p.f === 'function' ? p.f(perfil) : true))
      .filter(p => !(p.parent && respuestas[p.parent] === 0));
  }
  const generales = PREGUNTAS_CYBER.filter(p => p.f(perfil));
  const sectoriales = PREGUNTAS_CYBER_SECTOR.filter(p => p.f(perfil));
  return [...generales, ...sectoriales];
};

export const textoPregunta = (pregunta, perfil) => (
  typeof pregunta.q === 'function' ? pregunta.q(perfil) : pregunta.q
);

// Las preguntas "padre" de Ley no usan pregunta.o: son siempre estas 3
// opciones fijas (mismo texto que muestra CuestionarioPage.jsx).
export const LABELS_PARENT = [
  { l: 0, x: 'No' },
  { l: 1, x: 'Parcial' },
  { l: 3, x: 'Sí' },
];

export const textoOpcion = (pregunta, nivel) => {
  if (nivel === undefined) return 'Sin responder';
  const opciones = pregunta.type === 'parent' ? LABELS_PARENT : pregunta.o;
  return opciones?.find(o => o.l === nivel)?.x ?? `Nivel ${nivel}`;
};

const NIVEL_LABEL = ['Crítico', 'En Riesgo', 'Satisfactorio', 'Optimizado'];
const NIVEL_COLOR = ['#EF4444', '#F59E0B', '#0BA5EC', '#10B981'];

const getNivel = (pct) => {
  if (pct < 25) return { label: 'Crítico', color: '#EF4444', dot: '#EF4444' };
  if (pct < 50) return { label: 'En Riesgo', color: '#F59E0B', dot: '#F59E0B' };
  if (pct < 75) return { label: 'Satisfactorio', color: '#0BA5EC', dot: '#0BA5EC' };
  return { label: 'Optimizado', color: '#10B981', dot: '#10B981' };
};

/**
 * Resultados de la evaluación: puntaje global + detalle por dominio,
 * en el mismo formato que espera ResultadosPage/reporte-data.js.
 */
export const calcularResultadoCyberLey = (modulo, perfil, respuestas) => {
  const { dominios } = datosModulo(modulo);
  const aplicables = obtenerPreguntasAplicables(modulo, perfil, respuestas);

  const porDominio = dominios.map(d => {
    const preguntasDominio = aplicables.filter(p => p.d === d.id);
    const respondidas = preguntasDominio.filter(p => respuestas[p.id] !== undefined);
    const suma = respondidas.reduce((acc, p) => acc + (respuestas[p.id] || 0), 0);
    const puntuacion = respondidas.length ? Math.round((suma / (respondidas.length * 3)) * 100) : null;
    return {
      nombre: d.n,
      puntuacion,
      preguntas: respondidas.map(p => ({
        texto: textoPregunta(p, perfil),
        valorCrudo: respuestas[p.id],
        respuesta: textoOpcion(p, respuestas[p.id]),
      })),
    };
  }).filter(d => d.puntuacion !== null); // dominios sin preguntas respondidas (no aplican al perfil) se omiten

  const promedio = porDominio.length
    ? Math.round(porDominio.reduce((a, d) => a + d.puntuacion, 0) / porDominio.length)
    : 0;

  return {
    titulo: modulo === 'ley' ? 'Protección de Datos (Ley 21.719)' : 'Ciberseguridad',
    promedio,
    nivel: getNivel(promedio),
    dominios: porDominio,
  };
};

/**
 * Roadmap: prioriza los dominios más débiles, y calendariza los meses según
 * las semanas/dependencias definidas en FASES_CYBER/FASES_LEY (portado de
 * las fases del prototipo original), en el mismo formato que espera
 * RoadmapPage/reporte-data.js.
 */
export const calcularRoadmapCyberLey = (modulo, perfil, respuestas) => {
  const { dominios, fases, entregables } = datosModulo(modulo);
  const resultado = calcularResultadoCyberLey(modulo, perfil, respuestas);

  // Mes de fin de cada fase, respetando dependencias (semanas → meses, redondeando hacia arriba)
  const finMes = {};
  const calcularFin = (id) => {
    if (finMes[id] !== undefined) return finMes[id];
    const fase = fases.find(f => f.id === id);
    if (!fase) return 0;
    const inicio = fase.dep && fase.dep.length ? Math.max(...fase.dep.map(calcularFin)) : 0;
    const duracion = Math.max(1, Math.round(fase.wks / 4));
    finMes[id] = inicio + duracion;
    return finMes[id];
  };
  fases.forEach(f => calcularFin(f.id));

  const debiles = [...resultado.dominios]
    .map(d => ({ ...d, id: dominios.find(dom => dom.n === d.nombre)?.id }))
    .sort((a, b) => a.puntuacion - b.puntuacion)
    .slice(0, 8);

  const tareas = debiles.map((d, idx) => {
    const fin = finMes[d.id] || 6;
    const fase = fases.find(f => f.id === d.id);
    const inicio = Math.max(0, fin - Math.max(1, Math.round((fase?.wks || 4) / 4)));
    return {
      id: idx,
      titulo: d.nombre,
      mesInicio: Math.max(1, inicio),
      mesFin: Math.max(inicio + 1, fin),
      prioridad: d.puntuacion < 50 ? 1 : 2,
    };
  }).sort((a, b) => a.mesInicio - b.mesInicio);

  const peor = debiles[0];
  const resumen = peor
    ? `${resultado.nivel.label} (${resultado.promedio}%). Área prioritaria: ${peor.nombre} (${peor.puntuacion}%). Se recomienda iniciar por ahí, siguiendo la secuencia de dependencias del plan.`
    : `${resultado.nivel.label} (${resultado.promedio}%).`;

  const entregablesList = Object.values(entregables).flat();

  return {
    titulo: 'Roadmap de Implementación',
    subtitulo: `Plan de mejora de madurez para los próximos 12 meses — ${modulo === 'ley' ? 'Protección de Datos' : 'Ciberseguridad'}`,
    tareas,
    hitos: [
      { num: '3', label: 'Meses', desc: 'Gobernanza y controles base establecidos' },
      { num: '6', label: 'Meses', desc: 'Dominios críticos en remediación activa' },
      { num: '12', label: 'Meses', desc: 'Madurez operativa y mejora continua' },
    ],
    resumen,
    entregables: entregablesList,
    fases: {},
  };
};
