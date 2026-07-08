// Vite sirve los archivos de public/ bajo el "base" configurado en
// vite.config.js (hoy "/grc_assessment/"), no en la raíz del dominio.
// Este helper arma la ruta correcta en cualquier entorno (dev, build, GitHub Pages).
export const asset = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
