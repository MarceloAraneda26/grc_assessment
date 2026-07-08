import { PREGUNTAS_TI } from '../data/ti-questions';

// El backend solo marca una evaluación como "Completada" al llegar a la
// página de Resultados. Si el usuario retoma una evaluación cuyas respuestas
// ya cubren todo el cuestionario (por ejemplo, se completó y aún no se abrió
// Resultados), conviene llevarlo directo a Resultados en vez de a la primera
// pregunta.
export const evaluacionEstaCompleta = (modulo, respuestas, completadaBackend) => {
  if (completadaBackend) return true;
  if (modulo !== 'ti') return completadaBackend;
  return PREGUNTAS_TI.every(p => respuestas?.[p.id] !== undefined);
};
