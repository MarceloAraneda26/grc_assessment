import {
  crearEvaluacionQuery,
  obtenerEvaluacionPorIdQuery,
  obtenerEvaluacionesQuery,
} from '../queries/evaluacion.query.js';

export const crearEvaluacion = async (pool, clienteId, perfil) => {
  try {
    let query = `INSERT INTO Evaluaciones
      (ClienteId, Modulo, DatosSensibles, DecisionesAuto, Transferencia)
      VALUES (
        ${clienteId},
        '${perfil.modulo}',
        ${perfil.datosSensibles === 'si' ? 1 : 0},
        ${perfil.decisionesAuto === 'si' ? 1 : 0},
        ${perfil.transferencia === 'si' ? 1 : 0}
      ); SELECT @@IDENTITY AS Id;`;

    const result = await pool.request().query(query);
    const evalId = result.recordset[result.recordset.length - 1]?.Id;
    return parseInt(evalId);
  } catch (error) {
    console.error('Error al crear evaluacion:', error);
    throw error;
  }
}

export const obtenerEvaluacionPorId = async (pool, id) => {
  try {
    const query = obtenerEvaluacionPorIdQuery.replace(/@id/g, parseInt(id));
    const result = await pool.request().query(query);
    return result.recordset[0];
  } catch (error) {
    console.error('Error al obtener evaluacion por ID:', error);
    throw error;
  }
}

export const obtenerEvaluaciones = async (pool) => {
  try {
    const result = await pool.request().query(obtenerEvaluacionesQuery);
    return result.recordset;
  } catch (error) {
    console.error('Error al obtener evaluaciones:', error);
    throw error;
  }
}
