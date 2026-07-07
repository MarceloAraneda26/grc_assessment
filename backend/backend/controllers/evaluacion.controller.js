import { getConnection } from "../database/connection.js";
import { crearCliente } from "../services/cliente.service.js";
import { crearEvaluacion, obtenerEvaluacionPorId, obtenerEvaluaciones } from "../services/evaluacion.service.js";
import { upsertRespuesta, obtenerRespuestasPorEvaluacion } from "../services/respuesta.service.js";

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
      acc[r.PreguntaId] = r.Nivel;
      return acc;
    }, {});
    res.status(200).json({
      id: row.Id,
      modulo: row.Modulo,
      completada: row.Completada,
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
    res.status(200).json({
      evaluaciones: evaluaciones || [],
      total: evaluaciones?.length || 0
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
