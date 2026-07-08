const TONES = {
  red: 'bg-brand-red text-white',
  yellow: 'bg-brand-yellow text-white',
  blue: 'bg-blue text-white',
  green: 'bg-brand-green text-white',
  muted: 'bg-border text-text-muted',
};

// Niveles de madurez 0-3 (Ciberseguridad/Ley 21.719/algunos dominios TI).
const LEVEL_TONE = { 0: 'red', 1: 'yellow', 2: 'blue', 3: 'green' };

// Respuestas simples de texto (Levantamiento TI).
const TEXTO_TONE = { Si: 'green', No: 'red', Parcial: 'blue', Desconoce: 'muted', 'Sin respuesta': 'muted' };

/**
 * Badge semántico reutilizable. Pasar exactamente uno de:
 * - tone: "red" | "yellow" | "blue" | "green" | "muted" (control directo)
 * - level: 0-3 (nivel de madurez → color automático)
 * - texto: "Si" | "No" | "Parcial" | "Desconoce" | "Sin respuesta"
 */
export const Badge = ({ children, tone, level, texto, className = '' }) => {
  const resuelto = tone || (level !== undefined ? LEVEL_TONE[level] : texto ? TEXTO_TONE[texto] : 'muted');
  return (
    <span className={`inline-block font-bold px-2 py-0.5 rounded text-[0.66rem] uppercase tracking-wide ${TONES[resuelto] || TONES.muted} ${className}`}>
      {children}
    </span>
  );
};
