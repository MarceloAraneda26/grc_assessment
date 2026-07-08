import { DOMINIOS_CYBER, PREGUNTAS_CYBER, PREGUNTAS_CYBER_SECTOR, FASES_CYBER, ENTREGABLES_CYBER } from '../data/cyber-questions.js';
import { DOMINIOS_LEY, PREGUNTAS_LEY, FASES_LEY, ENTREGABLES_LEY } from '../data/ley-questions.js';

// Portado de GRC_v1.html (funciones getPQF/qText/getSc del prototipo
// original) para que Ciberseguridad use el mismo banco de preguntas y la
// misma lógica de filtrado/puntaje que el prototipo. El módulo "ley" (banco
// unificado Ley 21.663 + Ley 21.719, cuestionario maestro v3) usa su propia
// metodología de cálculo — ver calcularResultadoLeyUnificada() más abajo.

const datosModulo = (modulo) => (modulo === 'ley'
  ? { dominios: DOMINIOS_LEY, fases: FASES_LEY, entregables: ENTREGABLES_LEY }
  : { dominios: DOMINIOS_CYBER, fases: FASES_CYBER, entregables: ENTREGABLES_CYBER });

/**
 * Preguntas a MOSTRAR EN EL WIZARD: filtradas por perfil (industria, datos
 * sensibles, transferencia internacional, decisiones automatizadas, OIV) y,
 * para el módulo "ley", sin las preguntas "hijas" cuya pregunta padre fue
 * respondida "No" (nivel 0) — se ocultan de la navegación, aunque para el
 * CÁLCULO de score sí cuentan (ver obtenerPreguntasParaCalculo).
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

/**
 * Preguntas aplicables PARA EL CÁLCULO de score del módulo "ley": solo
 * depende de la condición de perfil de cada pregunta (.f), NO se excluyen
 * las hijas de un padre respondido "No" — permanecen en el denominador y
 * puntúan 0 automáticamente (metodología v3, hoja "Metodología" del Excel:
 * "PERMANECEN en el denominador").
 */
const obtenerPreguntasParaCalculo = (perfil) => PREGUNTAS_LEY.filter(p => p.f(perfil));

export const textoPregunta = (pregunta, perfil) => (
  typeof pregunta.q === 'function' ? pregunta.q(perfil) : pregunta.q
);

// Preguntas "padre" del módulo "ley": No=0, Parcial=1, Sí=2 (máximo 2 — el
// nivel 3 se reserva a las hijas, que miden la calidad del control).
export const LABELS_PARENT = [
  { l: 0, x: 'No' },
  { l: 1, x: 'Parcial' },
  { l: 2, x: 'Sí' },
];

export const textoOpcion = (pregunta, nivel) => {
  if (nivel === undefined) return 'Sin responder';
  const opciones = pregunta.type === 'parent' ? LABELS_PARENT : pregunta.o;
  return opciones?.find(o => o.l === nivel)?.x ?? `Nivel ${nivel}`;
};

const getNivel = (pct) => {
  if (pct < 25) return { label: 'Crítico', color: '#EF4444', dot: '#EF4444' };
  if (pct < 50) return { label: 'En Riesgo', color: '#F59E0B', dot: '#F59E0B' };
  if (pct < 75) return { label: 'Satisfactorio', color: '#0BA5EC', dot: '#0BA5EC' };
  return { label: 'Optimizado', color: '#10B981', dot: '#10B981' };
};

// Clasificación propia del cuestionario maestro unificado (hoja
// "Metodología", sección 7) — distinta de la clasificación genérica
// (getNivel) que usan Ciberseguridad y Levantamiento TI.
const getNivelLey = (pct) => {
  if (pct < 50) return { label: 'Crítico', color: '#EF4444', dot: '#EF4444' };
  if (pct < 67) return { label: 'En camino', color: '#F59E0B', dot: '#F59E0B' };
  if (pct < 85) return { label: 'Cumplimiento razonable', color: '#0BA5EC', dot: '#0BA5EC' };
  return { label: 'Optimizado', color: '#10B981', dot: '#10B981' };
};

const NIVEL_OBJETIVO_CUMPLIMIENTO = 2;
const maximoDe = (p) => (p.type === 'parent' ? 2 : 3);

// Herencia padre → hija: si el padre se respondió "No" (0), la hija puntúa 0
// sin importar cualquier respuesta previa que pudiera tener.
const puntosDe = (p, respuestas) => {
  if (p.parent && respuestas[p.parent] === 0) return 0;
  const nivel = respuestas[p.id];
  return typeof nivel === 'number' ? nivel : 0;
};

/**
 * Resultados del cuestionario maestro unificado (Ley 21.663 + Ley 21.719):
 * score por dominio, score global y por ley (ponderados por peso de
 * dominio), % de cumplimiento (nivel objetivo = 2) y brechas — global y por
 * ley. Formato compatible con ResultadosPage (mismos campos que el resto de
 * módulos: titulo/promedio/nivel/dominios) más los campos nuevos
 * (scoresPorLey/cumplimientoGlobal/brechas/brechasDetalle).
 */
const calcularResultadoLeyUnificada = (perfil, respuestas) => {
  const aplicables = obtenerPreguntasParaCalculo(perfil);
  const conPuntos = aplicables.map(p => ({
    pregunta: p,
    puntos: puntosDe(p, respuestas),
    maximo: maximoDe(p),
  }));

  const porDominio = DOMINIOS_LEY.map(d => {
    const delDominio = conPuntos.filter(x => x.pregunta.d === d.id);
    if (delDominio.length === 0) return null;
    const sumaPuntos = delDominio.reduce((a, x) => a + x.puntos, 0);
    const sumaMax = delDominio.reduce((a, x) => a + x.maximo, 0);
    const puntuacion = sumaMax ? Math.round((sumaPuntos / sumaMax) * 100) : 0;
    return {
      nombre: d.n,
      puntuacion,
      preguntas: delDominio.map(x => ({
        texto: textoPregunta(x.pregunta, perfil),
        valorCrudo: respuestas[x.pregunta.id],
        respuesta: textoOpcion(x.pregunta, respuestas[x.pregunta.id]),
      })),
    };
  }).filter(Boolean);

  // % = Σ(puntos × peso del dominio) / Σ(máximo × peso del dominio) × 100
  const scorePonderado = (items) => {
    const sumaPuntos = items.reduce((a, x) => a + x.puntos * x.pregunta.peso, 0);
    const sumaMax = items.reduce((a, x) => a + x.maximo * x.pregunta.peso, 0);
    return sumaMax ? Math.round((sumaPuntos / sumaMax) * 100) : 0;
  };
  const cumplimientoDe = (items) => {
    const ok = items.filter(x => x.puntos >= NIVEL_OBJETIVO_CUMPLIMIENTO).length;
    return { pct: items.length ? Math.round((ok / items.length) * 100) : 0, ok, brechas: items.length - ok, aplicables: items.length };
  };

  const scorePorLey = (ley, label) => {
    const items = conPuntos.filter(x => x.pregunta.ley === ley || x.pregunta.ley === 'Ambas');
    const promedio = scorePonderado(items);
    const cump = cumplimientoDe(items);
    return { ley, label, promedio, nivel: getNivelLey(promedio), cumplimiento: cump.pct, aplicables: cump.aplicables, brechas: cump.brechas };
  };

  const promedio = scorePonderado(conPuntos);
  const cumpGlobal = cumplimientoDe(conPuntos);

  // Contenido comercial (Resultados/Roadmap, no en el cuestionario): solo se
  // adjunta a las preguntas que efectivamente son brecha (nivel < objetivo),
  // ya que en una pregunta ya cumplida no hay nada que ofrecer.
  const brechasDetalle = conPuntos
    .filter(x => x.puntos < NIVEL_OBJETIVO_CUMPLIMIENTO)
    .map(x => ({
      id: x.pregunta.id,
      texto: textoPregunta(x.pregunta, perfil),
      dominio: DOMINIOS_LEY.find(d => d.id === x.pregunta.d)?.n,
      ley: x.pregunta.ley,
      nivel: x.puntos,
      maximo: x.maximo,
      comoAyudaTibox: x.pregunta.como_ayuda_tibox,
      entregableAsociado: x.pregunta.entregable_asociado,
    }));

  return {
    titulo: 'Gobierno, GRC y Cumplimiento — Ley 21.663 + Ley 21.719',
    promedio,
    nivel: getNivelLey(promedio),
    dominios: porDominio,
    scoresPorLey: [
      scorePorLey('21.663', 'Ley 21.663 — Ciberseguridad'),
      scorePorLey('21.719', 'Ley 21.719 — Protección de Datos'),
    ],
    cumplimientoGlobal: cumpGlobal.pct,
    brechas: cumpGlobal.brechas,
    preguntasAplicables: cumpGlobal.aplicables,
    brechasDetalle,
  };
};

/**
 * Resultados de la evaluación: puntaje global + detalle por dominio, en el
 * mismo formato que espera ResultadosPage/reporte-data.js. Para el módulo
 * "ley" usa la metodología del cuestionario maestro unificado; para
 * "cyber" mantiene el cálculo genérico original (sin cambios).
 */
export const calcularResultadoCyberLey = (modulo, perfil, respuestas) => {
  if (modulo === 'ley') return calcularResultadoLeyUnificada(perfil, respuestas);

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
    titulo: 'Ciberseguridad',
    promedio,
    nivel: getNivel(promedio),
    dominios: porDominio,
  };
};

/**
 * Roadmap: prioriza los dominios más débiles, y calendariza los meses según
 * las semanas/dependencias definidas en FASES_CYBER/FASES_LEY (portado de
 * las fases del prototipo original / diseñado para el banco unificado v3),
 * en el mismo formato que espera RoadmapPage/reporte-data.js.
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

  // Todos los dominios aplicables, priorizados por los más débiles primero
  // (antes se limitaba a los 8 peores; el cuestionario unificado tiene 19
  // dominios y todos deben listarse en el Gantt).
  const debiles = [...resultado.dominios]
    .map(d => ({ ...d, id: dominios.find(dom => dom.n === d.nombre)?.id }))
    .sort((a, b) => a.puntuacion - b.puntuacion);

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
    subtitulo: modulo === 'ley'
      ? 'Plan de mejora de madurez para los próximos 12 meses — Gobierno, GRC y Cumplimiento (Ley 21.663 + Ley 21.719)'
      : 'Plan de mejora de madurez para los próximos 12 meses — Ciberseguridad',
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
