import { crearClienteQuery, obtenerClientePorIdQuery } from '../queries/cliente.query.js';

export const crearCliente = async (pool, perfil) => {
  try {
    let insertQuery = `INSERT INTO Clientes
      (RazonSocial, Industria, Usuarios, Anci, Infraestructura, EcosistemaMs, Gestion, Incidentes, ContactoNombre, ContactoCargo, ContactoEmail, ContactoTelefono)
      VALUES (
        N'${perfil.empresa.replace(/'/g, "''")}',
        N'${perfil.industria.replace(/'/g, "''")}',
        ${perfil.usuarios || 0},
        N'${(perfil.anci || 'general').replace(/'/g, "''")}',
        N'${(perfil.infra || 'onpremise').replace(/'/g, "''")}',
        N'${(perfil.ms || 'no').replace(/'/g, "''")}',
        N'${(perfil.gestion || 'nadie').replace(/'/g, "''")}',
        N'${(perfil.incidentes || 'no').replace(/'/g, "''")}',
        ${perfil.nombre ? `N'${perfil.nombre.replace(/'/g, "''")}'` : 'NULL'},
        ${perfil.cargo ? `N'${perfil.cargo.replace(/'/g, "''")}'` : 'NULL'},
        ${perfil.email ? `N'${perfil.email.replace(/'/g, "''")}'` : 'NULL'},
        ${perfil.tel ? `N'${perfil.tel.replace(/'/g, "''")}'` : 'NULL'}
      ); SELECT @@IDENTITY AS Id;`;

    const result = await pool.request().query(insertQuery);
    console.log('[DEBUG] Insert result:', JSON.stringify(result.recordset, null, 2));
    const clienteId = result.recordset[result.recordset.length - 1]?.Id;
    console.log('[DEBUG] Extracted clienteId:', clienteId);
    return parseInt(clienteId);
  } catch (error) {
    console.error('Error al crear cliente:', error);
    throw error;
  }
}

export const obtenerClientePorId = async (pool, id) => {
  try {
    let query = obtenerClientePorIdQuery.replace(/@id/g, id);
    const result = await pool.request().query(query);
    return result.recordset[0];
  } catch (error) {
    console.error('Error al obtener cliente por ID:', error);
    throw error;
  }
}
