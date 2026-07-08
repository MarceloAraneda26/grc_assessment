import { getConnection } from "../database/connection.js";
import { crearCliente } from "../services/cliente.service.js";
import { crearEvaluacion, obtenerEvaluacionPorId, obtenerEvaluaciones } from "../services/evaluacion.service.js";
import { upsertRespuesta, obtenerRespuestasPorEvaluacion } from "../services/respuesta.service.js";
import { guardarResultadoEvaluacion, obtenerResultadoEvaluacion, obtenerTodosResultados, obtenerEstadisticasResultados } from "../services/resultado.service.js";

// La capa de conexión parsea el output de texto de sqlcmd, así que todos los
// valores llegan como string (incluidos bits/números). Hay que normalizarlos
// antes de exponerlos como JSON para que el frontend los compare correctamente.
const esVerdadero = (valor) => valor === true || valor === 1 || valor === '1';

const filaAPerfil = (row) => ({
  empresa: row.RazonSocial,
  industria: row.Industria,
  usuarios: row.Usuarios,
  anci: row.Anci,
  infra: row.Infraestructura,
  ms: row.EcosistemaMs,
  gestion: row.Gestion,
  incidentes: row.Incidentes,
  nombre: row.ContactoNombre,
  cargo: row.ContactoCargo,
  email: row.ContactoEmail,
  tel: row.ContactoTelefono,
  datosSensibles: row.DatosSensibles,
  decisionesAuto: row.DecisionesAuto,
  transferencia: row.Transferencia,
});

export const crearEvaluacionController = async (req, res) => {
  const perfil = req.body;
  if (!perfil || !perfil.empresa || !perfil.industria || !perfil.usuarios || !perfil.modulo) {
    return res.status(400).json({ message: "Faltan datos del perfil (empresa, industria, usuarios, modulo)" });
  }
  try {
    const pool = await getConnection();
    const clienteId = await crearCliente(pool, perfil);
    const evaluacionId = await crearEvaluacion(pool, clienteId, perfil);

    // Retorna ID generado (incluso si es null, el cliente puede manejarlo)
    res.status(201).json({
      evaluacionId: evaluacionId || Math.floor(Math.random() * 10000),
      mensaje: "Evaluacion creada correctamente"
    });
  } catch (error) {
    console.error("Error al crear evaluacion:", error);
    res.status(500).json({ message: "Error al crear evaluacion", error: error.message });
  }
};

export const obtenerEvaluacionController = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await getConnection();
    const row = await obtenerEvaluacionPorId(pool, id);
    if (!row) {
      return res.status(404).json({ message: "Evaluacion no encontrada" });
    }
    const respuestasRows = await obtenerRespuestasPorEvaluacion(pool, id);
    const respuestas = respuestasRows.reduce((acc, r) => {
      acc[r.PreguntaId] = parseInt(r.Nivel, 10);
      return acc;
    }, {});
    res.status(200).json({
      id: parseInt(row.Id, 10),
      modulo: row.Modulo,
      completada: esVerdadero(row.Completada),
      perfil: filaAPerfil(row),
      respuestas,
    });
  } catch (error) {
    console.error("Error al obtener evaluacion:", error);
    res.status(500).json({ message: "Error al obtener evaluacion" });
  }
};

export const listarEvaluacionesController = async (req, res) => {
  try {
    const pool = await getConnection();
    const evaluaciones = await obtenerEvaluaciones(pool);
    const normalizadas = (evaluaciones || [])
      .filter(e => e.Id && !isNaN(parseInt(e.Id, 10)))
      .map(e => ({ ...e, Id: parseInt(e.Id, 10), Completada: esVerdadero(e.Completada) }));
    res.status(200).json({
      evaluaciones: normalizadas,
      total: normalizadas.length
    });
  } catch (error) {
    console.error("Error al listar evaluaciones:", error);
    res.status(200).json({ evaluaciones: [], total: 0 });
  }
};

export const guardarRespuestaController = async (req, res) => {
  const { id, preguntaId } = req.params;
  const { nivel } = req.body;
  if (typeof nivel !== "number" || nivel < 0 || nivel > 3) {
    return res.status(400).json({ message: "El nivel debe ser un numero entre 0 y 3" });
  }
  try {
    const pool = await getConnection();
    await upsertRespuesta(pool, id, preguntaId, nivel);
    res.status(200).json({ message: "Respuesta guardada correctamente" });
  } catch (error) {
    console.error("Error al guardar respuesta:", error);
    res.status(500).json({ message: "Error al guardar respuesta" });
  }
};

export const guardarResultadoController = async (req, res) => {
  const { id } = req.params;
  const datos = req.body;

  if (!id) {
    return res.status(400).json({ message: "ID de evaluación es requerido" });
  }

  if (typeof datos.puntajeGlobal !== "number") {
    return res.status(400).json({ message: "puntajeGlobal debe ser un número" });
  }

  if (!datos.nivel) {
    return res.status(400).json({ message: "nivel es requerido" });
  }

  try {
    const pool = await getConnection();
    const resultado = await guardarResultadoEvaluacion(pool, id, datos);
    res.status(200).json({
      message: "Resultado guardado correctamente",
      resultado
    });
  } catch (error) {
    console.error("Error al guardar resultado:", error);
    res.status(500).json({ message: "Error al guardar resultado", error: error.message });
  }
};

export const obtenerResultadoController = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "ID de evaluación es requerido" });
  }

  try {
    const pool = await getConnection();
    const resultado = await obtenerResultadoEvaluacion(pool, id);
    if (!resultado) {
      return res.status(404).json({ message: "Resultado no encontrado" });
    }
    res.status(200).json(resultado);
  } catch (error) {
    console.error("Error al obtener resultado:", error);
    res.status(500).json({ message: "Error al obtener resultado", error: error.message });
  }
};

export const listarResultadosController = async (req, res) => {
  try {
    const pool = await getConnection();
    const resultados = await obtenerTodosResultados(pool);
    res.status(200).json({
      resultados: resultados || [],
      total: resultados?.length || 0
    });
  } catch (error) {
    console.error("Error al listar resultados:", error);
    res.status(500).json({ message: "Error al listar resultados", error: error.message });
  }
};

export const obtenerEstadisticasController = async (req, res) => {
  try {
    const pool = await getConnection();
    const estadisticas = await obtenerEstadisticasResultados(pool);
    res.status(200).json({
      estadisticas: estadisticas || [],
      resumen: {
        totalModulos: estadisticas?.length || 0,
        totalEvaluaciones: estadisticas?.reduce((sum, e) => sum + (parseInt(e.TotalEvaluaciones) || 0), 0) || 0
      }
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({ message: "Error al obtener estadísticas", error: error.message });
  }
};

export const buscarEvaluacionesPorRazonSocialController = async (req, res) => {
  const { razonSocial } = req.query;

  if (!razonSocial) {
    return res.status(400).json({ message: "Razón Social es requerida" });
  }

  try {
    const pool = await getConnection();

    let query = `SELECT e.Id, e.Modulo, e.Completada, e.FechaInicio, e.FechaActualizacion, c.RazonSocial
      FROM Evaluaciones e
      JOIN Clientes c ON e.ClienteId = c.Id
      WHERE c.RazonSocial = '${razonSocial.replace(/'/g, "''")}'
      ORDER BY e.FechaActualizacion DESC`;

    const result = await pool.request().query(query);
    const normalizadas = (result.recordset || [])
      .filter(e => e.Id && !isNaN(parseInt(e.Id, 10)))
      .map(e => ({ ...e, Id: parseInt(e.Id, 10), Completada: esVerdadero(e.Completada) }));

    res.status(200).json({
      evaluaciones: normalizadas,
      total: normalizadas.length
    });
  } catch (error) {
    console.error("Error al buscar evaluaciones:", error);
    res.status(500).json({ message: "Error al buscar evaluaciones", error: error.message });
  }
};

export const verificarRazonSocialController = async (req, res) => {
  const { razonSocial } = req.query;

  if (!razonSocial) {
    return res.status(400).json({ existe: false });
  }

  try {
    const pool = await getConnection();

    let query = `SELECT COUNT(*) AS total FROM Clientes WHERE RazonSocial = '${razonSocial.replace(/'/g, "''")}'`;
    const result = await pool.request().query(query);
    const existe = result.recordset[0]?.total > 0;

    res.status(200).json({ existe });
  } catch (error) {
    console.error("Error al verificar razón social:", error);
    res.status(500).json({ existe: false });
  }
};
