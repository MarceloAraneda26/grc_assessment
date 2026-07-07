import { Router } from "express";
import {
  crearEvaluacionController,
  obtenerEvaluacionController,
  listarEvaluacionesController,
  guardarRespuestaController,
} from "../controllers/evaluacion.controller.js";

const router = Router();

router.get("/evaluaciones", listarEvaluacionesController);
router.post("/evaluaciones", crearEvaluacionController);
router.get("/evaluaciones/:id", obtenerEvaluacionController);
router.put("/evaluaciones/:id/respuestas/:preguntaId", guardarRespuestaController);

export default router;
