export const upsertRespuestaQuery = `MERGE Respuestas AS target
  USING (SELECT @evaluacionId AS EvaluacionId, @preguntaId AS PreguntaId, @nivel AS Nivel) AS source
  ON target.EvaluacionId = source.EvaluacionId AND target.PreguntaId = source.PreguntaId
  WHEN MATCHED THEN UPDATE SET Nivel = source.Nivel, FechaRespuesta = SYSUTCDATETIME()
  WHEN NOT MATCHED THEN INSERT (EvaluacionId, PreguntaId, Nivel) VALUES (source.EvaluacionId, source.PreguntaId, source.Nivel);`;

export const obtenerRespuestasPorEvaluacionQuery = `SELECT PreguntaId, Nivel FROM Respuestas WHERE EvaluacionId = @evaluacionId`;
