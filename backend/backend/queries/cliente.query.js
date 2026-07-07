export const crearClienteQuery = `INSERT INTO Clientes
  (RazonSocial, Industria, Usuarios, Anci, Infraestructura, EcosistemaMs, Gestion, Incidentes, ContactoNombre, ContactoCargo, ContactoEmail, ContactoTelefono)
  OUTPUT INSERTED.Id
  VALUES (@razonSocial, @industria, @usuarios, @anci, @infraestructura, @ecosistemaMs, @gestion, @incidentes, @contactoNombre, @contactoCargo, @contactoEmail, @contactoTelefono)`;

export const obtenerClientePorIdQuery = `SELECT * FROM Clientes WHERE Id = @id`;
