import express from "express";
import cors from "cors";
import helmet from "helmet";
import EvaluacionRouter from "./backend/routes/evaluacion.route.js";

// Sin esto, cualquier excepción no atrapada en cualquier request (ej. un bug
// en un controller, un rechazo de promesa sin catch) tira todo el proceso
// Node abajo — afecta a TODOS los usuarios conectados, no solo a quien
// disparó el error. Para una herramienta interna como esta, preferimos
// loguear y seguir corriendo en vez de caernos por un error aislado.
process.on("uncaughtException", (err) => {
  console.error("❌ Excepción no atrapada:", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("❌ Promesa rechazada sin catch:", reason);
});

const port = process.env.PORT || 3000;

const app = express();
app.options("*", cors());
app.use(express.json());
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "default-src": ["'self'"],
        "connect-src": ["'self'"],
        "img-src": ["'self'", "data:", "blob:"],
        "script-src": ["'self'"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "font-src": ["'self'"],
        "worker-src": ["'self'", "blob:"],
        "frame-src": ["'self'"],
        "media-src": ["'self'"],
      },
    },
  })
);

app.use((req, res, next) => {
  const policy =
    "geolocation=(), microphone=(), camera=(), fullscreen=(self), payment=()";
  res.setHeader("Permissions-Policy", policy);
  res.setHeader("Permission-Policy", policy);
  next();
});

const apiBase = "/api/v1";
app.use(apiBase, EvaluacionRouter);

// Red de seguridad centralizada: cualquier error que llegue hasta acá (ej.
// JSON malformado en el body, una excepción síncrona en un middleware) se
// responde como 500 en vez de tumbar el proceso o colgar la request.
app.use((err, req, res, next) => {
  console.error("❌ Error no manejado en request:", err);
  if (res.headersSent) return next(err);
  res.status(500).json({ message: "Error interno del servidor" });
});

app.listen(port, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${port}`);
  console.log(`📍 API disponible en http://localhost:${port}${apiBase}`);
});
