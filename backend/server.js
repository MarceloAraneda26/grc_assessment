import express from "express";
import cors from "cors";
import helmet from "helmet";
import EvaluacionRouter from "./backend/routes/evaluacion.route.js";

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

app.listen(port, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${port}`);
  console.log(`📍 API disponible en http://localhost:${port}${apiBase}`);
});
