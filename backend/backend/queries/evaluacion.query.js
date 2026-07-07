export const crearEvaluacionQuery = `INSERT INTO Evaluaciones
  (ClienteId, Modulo, DatosSensibles, DecisionesAuto, Transferencia)
  OUTPUT INSERTED.Id
  VALUES (@clienteId, @modulo, @datosSensibles, @decisionesAuto, @transferencia)`;

export const obtenerEvaluacionPorIdQuery = `SELECT e.*, c.RazonSocial, c.Industria, c.Usuarios, c.Anci, c.Infraestructura, c.EcosistemaMs, c.Gestion, c.Incidentes,
  c.ContactoNombre, c.ContactoCargo, c.ContactoEmail, c.ContactoTelefono
  FROM Evaluaciones e JOIN Clientes c ON c.Id = e.ClienteId
  WHERE e.Id = @id`;

export const obtenerEvaluacionesQuery = `SELECT e.Id, e.Modulo, e.FechaInicio, e.FechaActualizacion, e.Completada, c.RazonSocial, c.Industria
  FROM Evaluaciones e JOIN Clientes c ON c.Id = e.ClienteId
  ORDER BY e.FechaActualizacion DESC`;

export const actualizarFechaEvaluacionQuery = `UPDATE Evaluaciones SET FechaActualizacion = SYSUTCDATETIME() WHERE Id = @id`;
