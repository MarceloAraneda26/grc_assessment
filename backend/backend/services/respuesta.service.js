import { upsertRespuestaQuery, obtenerRespuestasPorEvaluacionQuery } from '../queries/respuesta.query.js';
import { actualizarFechaEvaluacionQuery } from '../queries/evaluacion.query.js';

export const upsertRespuesta = async (pool, evaluacionId, preguntaId, nivel) => {
  try {
    let query = upsertRespuestaQuery
      .replace(/@evaluacionId/g, evaluacionId)
      .replace(/@preguntaId/g, `'${preguntaId.replace(/'/g, "''")}'`)
      .replace(/@nivel/g, nivel);

    await pool.request().query(query);

    let updateQuery = actualizarFechaEvaluacionQuery.replace(/@id/g, evaluacionId);
    await pool.request().query(updateQuery);
  } catch (error) {
    console.error('Error al guardar respuesta:', error);
    throw error;
  }
}

export const obtenerRespuestasPorEvaluacion = async (pool, evaluacionId) => {
  try {
    let query = obtenerRespuestasPorEvaluacionQuery.replace(/@evaluacionId/g, evaluacionId);
    const result = await pool.request().query(query);
    return result.recordset;
  } catch (error) {
    console.error('Error al obtener respuestas de la evaluacion:', error);
    throw error;
  }
}
