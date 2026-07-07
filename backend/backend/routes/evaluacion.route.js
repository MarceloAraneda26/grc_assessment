import { Router } from "express";
import {
  crearEvaluacionController,
  obtenerEvaluacionController,
  listarEvaluacionesController,
  guardarRespuestaController,
  guardarResultadoController,
  obtenerResultadoController,
  listarResultadosController,
  obtenerEstadisticasController
} from "../controllers/evaluacion.controller.js";

const router = Router();

// Evaluaciones
router.get("/evaluaciones", listarEvaluacionesController);
router.post("/evaluaciones", crearEvaluacionController);
router.get("/evaluaciones/:id", obtenerEvaluacionController);
router.put("/evaluaciones/:id/respuestas/:preguntaId", guardarRespuestaController);

// Resultados
router.post("/evaluaciones/:id/resultados", guardarResultadoController);
router.get("/evaluaciones/:id/resultados", obtenerResultadoController);
router.get("/resultados", listarResultadosController);
router.get("/resultados/estadisticas/por-modulo", obtenerEstadisticasController);

export default router;
