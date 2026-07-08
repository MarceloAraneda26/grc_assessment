import { guardarResultadoQuery, obtenerResultadoQuery, obtenerResultadosQuery } from '../queries/resultado.query.js';

export const guardarResultadoEvaluacion = async (pool, evaluacionId, datos) => {
  try {
    if (!evaluacionId) {
      throw new Error('evaluacionId es requerido');
    }

    if (typeof datos.puntajeGlobal !== 'number' || datos.puntajeGlobal < 0 || datos.puntajeGlobal > 100) {
      throw new Error('puntajeGlobal debe ser un número entre 0 y 100');
    }

    if (!datos.nivel) {
      throw new Error('nivel es requerido');
    }

    const inventarioScore = datos.detalles?.Inventario?.score || null;
    const accesoIdentidadScore = datos.detalles?.['Acceso e Identidad']?.score || null;
    const datosPersonalesScore = datos.detalles?.['Datos Personales']?.score || null;
    const seguridadPerimetralScore = datos.detalles?.['Seguridad Perimetral']?.score || null;
    const respaldosScore = datos.detalles?.['Respaldos']?.score || null;
    const monitoreoScore = datos.detalles?.['Monitoreo']?.score || null;
    const proveedoresScore = datos.detalles?.['Proveedores']?.score || null;

    // Cuestionario unificado Eje 1 (Ley 21.663 + 21.719) — solo presentes
    // cuando la evaluación es del módulo "ley"; NULL para cyber/ti.
    const ley663Score = datos.scoresPorLey?.find(s => s.ley === '21.663')?.promedio ?? null;
    const ley719Score = datos.scoresPorLey?.find(s => s.ley === '21.719')?.promedio ?? null;
    const cumplimientoGlobal = datos.cumplimientoGlobal ?? null;
    const cumplimiento663 = datos.scoresPorLey?.find(s => s.ley === '21.663')?.cumplimiento ?? null;
    const cumplimiento719 = datos.scoresPorLey?.find(s => s.ley === '21.719')?.cumplimiento ?? null;
    const brechasGlobal = datos.brechas ?? null;

    const areaDebilUno = datos.areasParaMejorar?.[0]?.nombre || '';
    const areaDebilDos = datos.areasParaMejorar?.[1]?.nombre || '';
    const areaDebilTres = datos.areasParaMejorar?.[2]?.nombre || '';

    let query = guardarResultadoQuery
      .replace(/@evaluacionId/g, evaluacionId)
      .replace(/@puntajeGlobal/g, Math.round(datos.puntajeGlobal))
      .replace(/@nivel/g, `N'${datos.nivel.replace(/'/g, "''")}'`)
      .replace(/@inventarioScore/g, inventarioScore !== null ? inventarioScore : 'NULL')
      .replace(/@accesoIdentidadScore/g, accesoIdentidadScore !== null ? accesoIdentidadScore : 'NULL')
      .replace(/@datosPersonalesScore/g, datosPersonalesScore !== null ? datosPersonalesScore : 'NULL')
      .replace(/@seguridadPerimetralScore/g, seguridadPerimetralScore !== null ? seguridadPerimetralScore : 'NULL')
      .replace(/@respaldosScore/g, respaldosScore !== null ? respaldosScore : 'NULL')
      .replace(/@monitoreoScore/g, monitoreoScore !== null ? monitoreoScore : 'NULL')
      .replace(/@proveedoresScore/g, proveedoresScore !== null ? proveedoresScore : 'NULL')
      .replace(/@ley663Score/g, ley663Score !== null ? ley663Score : 'NULL')
      .replace(/@ley719Score/g, ley719Score !== null ? ley719Score : 'NULL')
      .replace(/@cumplimientoGlobal/g, cumplimientoGlobal !== null ? cumplimientoGlobal : 'NULL')
      .replace(/@cumplimiento663/g, cumplimiento663 !== null ? cumplimiento663 : 'NULL')
      .replace(/@cumplimiento719/g, cumplimiento719 !== null ? cumplimiento719 : 'NULL')
      .replace(/@brechasGlobal/g, brechasGlobal !== null ? brechasGlobal : 'NULL')
      .replace(/@areaDebilUno/g, areaDebilUno ? `N'${areaDebilUno.replace(/'/g, "''")}'` : 'NULL')
      .replace(/@areaDebilDos/g, areaDebilDos ? `N'${areaDebilDos.replace(/'/g, "''")}'` : 'NULL')
      .replace(/@areaDebilTres/g, areaDebilTres ? `N'${areaDebilTres.replace(/'/g, "''")}'` : 'NULL')
      .replace(/@resumenEjecutivo/g, datos.resumenEjecutivo ? `N'${datos.resumenEjecutivo.replace(/'/g, "''")}'` : 'NULL');

    const result = await pool.request().query(query);

    // Llegar a Resultados implica que el cuestionario se completó: se marca
    // la evaluación para que el Historial la muestre como terminada.
    await pool.request().query(`UPDATE Evaluaciones SET Completada = 1 WHERE Id = ${parseInt(evaluacionId, 10)}`);

    return result.recordset[0];
  } catch (error) {
    console.error('Error guardando resultado:', error);
    throw error;
  }
};

export const obtenerResultadoEvaluacion = async (pool, evaluacionId) => {
  try {
    if (!evaluacionId) {
      throw new Error('evaluacionId es requerido');
    }

    let query = obtenerResultadoQuery.replace(/@evaluacionId/g, evaluacionId);
    const result = await pool.request().query(query);
    return result.recordset[0] || null;
  } catch (error) {
    console.error('Error obteniendo resultado:', error);
    throw error;
  }
};

export const obtenerTodosResultados = async (pool) => {
  try {
    const result = await pool.request().query(obtenerResultadosQuery);
    return result.recordset;
  } catch (error) {
    console.error('Error obteniendo resultados:', error);
    throw error;
  }
};

export const obtenerEstadisticasResultados = async (pool) => {
  try {
    let query = `
      SELECT
        e.Modulo,
        COUNT(*) AS TotalEvaluaciones,
        ROUND(AVG(CAST(r.PuntajeGlobal AS FLOAT)), 2) AS PromedioGlobal,
        MIN(r.PuntajeGlobal) AS MinimoScore,
        MAX(r.PuntajeGlobal) AS MaximoScore,
        SUM(CASE WHEN r.Nivel = 'Crítico' THEN 1 ELSE 0 END) AS TotalCritico,
        SUM(CASE WHEN r.Nivel = 'En Riesgo' THEN 1 ELSE 0 END) AS TotalEnRiesgo,
        SUM(CASE WHEN r.Nivel = 'Satisfactorio' THEN 1 ELSE 0 END) AS TotalSatisfactorio,
        SUM(CASE WHEN r.Nivel = 'Optimizado' THEN 1 ELSE 0 END) AS TotalOptimizado
      FROM Resultados r
      JOIN Evaluaciones e ON r.EvaluacionId = e.Id
      GROUP BY e.Modulo
      ORDER BY e.Modulo
    `;

    const result = await pool.request().query(query);
    return result.recordset;
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    throw error;
  }
};
