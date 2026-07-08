import { PREGUNTAS_TI, DOMINIOS_TI } from '../data/ti-questions.js';

/**
 * Calcula el score de una respuesta según su tipo
 * Si/No: Sí=100, No=0
 * Si/No/Parcial: Sí=100, Parcial=50, No=0
 * Si/No/Desconoce: Sí=100, Desconoce=0, No=0
 *
 * EXCEPCIONES (respuestas inversas):
 * ti-id-3: "¿Existen usuarios compartidos?" → Sí=0 (malo), No=100 (bueno)
 * ti-id-7: "¿Hay cuentas administrativas compartidas?" → Sí=0, No=100
 * ti-mon-4: "¿Ha sufrido incidentes?" → Sí=0, No=100
 */
const RESPUESTAS_INVERSAS = ['ti-id-3', 'ti-id-7', 'ti-mon-4'];

const calcularScorePregunta = (preguntaId, respuesta) => {
  if (!respuesta) return 0;

  const esInversa = RESPUESTAS_INVERSAS.includes(preguntaId);
  const respuestaNormalizada = respuesta.toLowerCase();

  // Para preguntas inversas
  if (esInversa) {
    if (respuestaNormalizada === 'si') return 0;
    if (respuestaNormalizada === 'no') return 100;
    if (respuestaNormalizada === 'parcial') return 50;
    if (respuestaNormalizada === 'desconoce') return 0;
    return 0;
  }

  // Para preguntas normales
  if (respuestaNormalizada === 'si') return 100;
  if (respuestaNormalizada === 'no') return 0;
  if (respuestaNormalizada === 'parcial') return 50;
  if (respuestaNormalizada === 'desconoce') return 0;
  return 0;
};

/**
 * Calcula score por dominio
 */
const calcularScorePorDominio = (respuestas, dominioNombre) => {
  const preguntasDominio = PREGUNTAS_TI.filter(p => p.dominio === dominioNombre);

  if (preguntasDominio.length === 0) return 0;

  const scores = preguntasDominio.map(p =>
    calcularScorePregunta(p.id, respuestas[p.id])
  );

  const promedio = scores.reduce((a, b) => a + b, 0) / scores.length;
  return Math.round(promedio);
};

/**
 * Calcula score global ponderado
 */
export const calcularMadurezTI = (respuestas) => {
  if (!respuestas || Object.keys(respuestas).length === 0) return 0;

  let scoreTotal = 0;

  DOMINIOS_TI.forEach(dominio => {
    const nombreDominio = dominio.nombre;
    const scoreD = calcularScorePorDominio(respuestas, nombreDominio);
    scoreTotal += scoreD * dominio.peso;
  });

  return Math.round(scoreTotal);
};

/**
 * Retorna detalles de madurez por dominio
 */
export const calcularDetallesMaturezTI = (respuestas) => {
  const detalles = {};

  DOMINIOS_TI.forEach(dominio => {
    const nombreDominio = dominio.nombre;
    const score = calcularScorePorDominio(respuestas, nombreDominio);
    detalles[nombreDominio] = {
      id: dominio.id,
      nombre: dominio.nombre,
      score,
      peso: dominio.peso
    };
  });

  return detalles;
};

/**
 * Retorna nivel de madurez basado en score
 */
export const getNivelMadurezTI = (score) => {
  if (score < 25) return { label: 'Crítico', color: '#EF4444', bg: '#FEF2F2' };
  if (score < 50) return { label: 'En Riesgo', color: '#F59E0B', bg: '#FFFBEB' };
  if (score < 75) return { label: 'Satisfactorio', color: '#0BA5EC', bg: '#F0F9FF' };
  return { label: 'Optimizado', color: '#10B981', bg: '#ECFDF5' };
};

/**
 * Identifica las áreas más críticas (score más bajo)
 */
export const getAreasParaMejorar = (detalles, cantidad = 3) => {
  return Object.values(detalles)
    .sort((a, b) => a.score - b.score)
    .slice(0, cantidad);
};
