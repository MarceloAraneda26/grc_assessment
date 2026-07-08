import { useEffect } from 'react';

// Fuentes en el orden exacto provisto (no reordenar): cada `nombre` es el
// texto visible antes del año, `resto` es el resto de la referencia en
// formato APA, y `url` (si existe) se linkea aparte al final.
const FUENTES = [
  {
    texto: 'Agencia Nacional de Ciberseguridad. (2024). ',
    cursiva: 'Ley N° 21.663: Establece la Ley Marco de Ciberseguridad e Infraestructura Crítica de la Información',
    resto: ' (8 de abril de 2024). Diario Oficial de la República de Chile.',
    url: 'https://www.bcn.cl/leychile/navegar?idNorma=1202434',
  },
  {
    texto: 'Agencia de Protección de Datos Personales. (2024). ',
    cursiva: 'Ley N° 21.719: Regula la protección y el tratamiento de los datos personales y crea la Agencia de Protección de Datos Personales',
    resto: ' (13 de diciembre de 2024). Diario Oficial de la República de Chile.',
    url: 'https://www.bcn.cl/leychile/navegar?idNorma=1209272',
  },
  {
    texto: 'International Organization for Standardization. (2022). ',
    cursiva: 'Information security, cybersecurity and privacy protection — Information security management systems — Requirements',
    resto: ' (ISO/IEC 27001:2022).',
    url: null,
  },
  {
    texto: 'ISACA. (2018). ',
    cursiva: 'CMMI for Development',
    resto: ' (versión 2.0). CMMI Institute.',
    url: null,
  },
  {
    texto: 'National Institute of Standards and Technology. (2024). ',
    cursiva: 'The NIST Cybersecurity Framework (CSF) 2.0',
    resto: ' (NIST CSWP 29). U.S. Department of Commerce.',
    url: 'https://doi.org/10.6028/NIST.CSWP.29',
  },
];

const NIVELES = [
  { n: 0, nombre: 'Crítico', desc: 'la práctica no existe.' },
  { n: 1, nombre: 'Inicial', desc: 'existe de forma informal, sin documentación ni consistencia.' },
  { n: 2, nombre: 'Definido', desc: 'está documentada y se aplica de forma consistente (nivel objetivo).' },
  { n: 3, nombre: 'Optimizado', desc: 'está formalizada, se revisa periódicamente y mejora de forma continua.' },
];

const Seccion = ({ titulo, children }) => (
  <div className="mb-5">
    <h3 className="text-sm font-semibold text-text mb-1.5">{titulo}</h3>
    <div className="text-sm text-text-secondary leading-relaxed">{children}</div>
  </div>
);

export const MetodologiaModal = ({ onClose }) => {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[500] p-5" onClick={onClose}>
      <div
        className="bg-surface border border-border rounded-[20px] w-full max-w-[640px] max-h-[85vh] flex flex-col shadow-[0_12px_32px_rgba(0,0,0,0.2)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="m-0 text-[1.05rem] font-semibold text-text">Metodología de evaluación</h2>
          <button
            className="bg-surface-2 border border-border rounded-md w-7 h-7 cursor-pointer text-text-secondary text-[0.85rem] hover:bg-surface-3"
            onClick={onClose}
            title="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto">
          <Seccion titulo="Naturaleza de la metodología">
            <p>
              Este assessment usa una metodología propia de TIBOX, no un estándar certificado ni una auditoría de
              tercera parte. Su escala de madurez (4 niveles) y su estructura de dominios están inspiradas en
              frameworks reconocidos de la industria —el NIST Cybersecurity Framework 2.0 y principios de gestión
              de madurez de procesos (CMMI)— pero los pesos, umbrales y la integración entre la Ley 21.663 y la Ley
              21.719 son criterio propio de TIBOX, calibrado según el riesgo legal de cada obligación.
            </p>
          </Seccion>

          <Seccion titulo="Escala de madurez">
            <ul className="flex flex-col gap-1 pl-4 list-disc">
              {NIVELES.map(n => (
                <li key={n.n}>
                  <span className="font-semibold text-text">Nivel {n.n} — {n.nombre}:</span> {n.desc}
                </li>
              ))}
            </ul>
          </Seccion>

          <Seccion titulo="Ponderación">
            <p>
              Cada dominio tiene un peso (1 a 3) según si representa una obligación legal directa y sancionable,
              una obligación condicionada al perfil de la empresa, o un atenuante / facilitador. El puntaje de
              cada dominio, de cada ley y el global se calculan como un promedio ponderado de estos pesos,
              considerando únicamente las preguntas aplicables según el perfil declarado.
            </p>
          </Seccion>

          <Seccion titulo="Doble métrica">
            <p>
              Se reportan dos indicadores: el índice de madurez (qué tan cerca está del nivel máximo) y el índice
              de cumplimiento (qué porcentaje de controles alcanza el nivel objetivo).
            </p>
          </Seccion>

          <Seccion titulo="Alcance y limitaciones">
            <p>
              Este assessment es una autoevaluación basada en las respuestas entregadas por el cliente. Un puntaje
              alto no constituye una certificación ni una garantía de cumplimiento legal, y no exime a la
              organización de sus obligaciones ante la Agencia de Protección de Datos Personales o la ANCI. Cubre
              exclusivamente el Eje 1 del Framework TIBOX (gobierno, documentación y evidencia).
            </p>
          </Seccion>

          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-semibold text-text mb-2">Fuentes</h3>
            <div className="flex flex-col gap-2.5">
              {FUENTES.map((f, idx) => (
                <p key={idx} className="text-xs text-text-muted leading-relaxed pl-4 -indent-4">
                  {f.texto}
                  <em>{f.cursiva}</em>
                  {f.resto}
                  {f.url && (
                    <>
                      {' '}
                      <a
                        href={f.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue hover:underline break-all"
                      >
                        {f.url}
                      </a>
                    </>
                  )}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
