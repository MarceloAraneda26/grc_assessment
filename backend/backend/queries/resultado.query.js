export const guardarResultadoQuery = `
  MERGE INTO dbo.Resultados AS target
  USING (SELECT @evaluacionId AS EvaluacionId) AS source
  ON target.EvaluacionId = source.EvaluacionId
  WHEN MATCHED THEN
    UPDATE SET
      PuntajeGlobal = @puntajeGlobal,
      Nivel = @nivel,
      InventarioScore = @inventarioScore,
      AccesoIdentidadScore = @accesoIdentidadScore,
      DatosPersonalesScore = @datosPersonalesScore,
      SeguridadPerimetralScore = @seguridadPerimetralScore,
      RespaldosScore = @respaldosScore,
      MonitoreoScore = @monitoreoScore,
      ProveedoresScore = @proveedoresScore,
      AreaDebilUno = @areaDebilUno,
      AreaDebilDos = @areaDebilDos,
      AreaDebilTres = @areaDebilTres,
      ResumenEjecutivo = @resumenEjecutivo,
      FechaActualizacion = SYSUTCDATETIME()
  WHEN NOT MATCHED THEN
    INSERT (EvaluacionId, PuntajeGlobal, Nivel, InventarioScore, AccesoIdentidadScore,
            DatosPersonalesScore, SeguridadPerimetralScore, RespaldosScore, MonitoreoScore,
            ProveedoresScore, AreaDebilUno, AreaDebilDos, AreaDebilTres, ResumenEjecutivo)
    VALUES (@evaluacionId, @puntajeGlobal, @nivel, @inventarioScore, @accesoIdentidadScore,
            @datosPersonalesScore, @seguridadPerimetralScore, @respaldosScore, @monitoreoScore,
            @proveedoresScore, @areaDebilUno, @areaDebilDos, @areaDebilTres, @resumenEjecutivo);

  SELECT * FROM dbo.Resultados WHERE EvaluacionId = @evaluacionId;
`;

export const obtenerResultadoQuery = `SELECT * FROM dbo.Resultados WHERE EvaluacionId = @evaluacionId`;

export const obtenerResultadosQuery = `
  SELECT r.*, e.Modulo, c.RazonSocial
  FROM dbo.Resultados r
  JOIN dbo.Evaluaciones e ON r.EvaluacionId = e.Id
  JOIN dbo.Clientes c ON e.ClienteId = c.Id
  ORDER BY r.FechaCalculo DESC
`;
