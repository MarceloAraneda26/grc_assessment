import { useContext, useState, useMemo } from 'react';
import { EvaluacionContext } from '../context/EvaluacionContext';
import { guardarRespuesta } from '../services/api';
import { PREGUNTAS_TI } from '../data/ti-questions';
import { DOMINIOS_CYBER } from '../data/cyber-questions';
import { DOMINIOS_LEY } from '../data/ley-questions';
import { obtenerPreguntasAplicables, textoPregunta } from '../utils/cyber-ley-scoring';

// Preguntas padre: No=0, Parcial=1, Sí=2 (máximo 2 — el nivel 3 se reserva
// a las hijas, que miden la calidad del control).
const LABELS_PARENT = [
  { l: 0, x: 'No', sub: 'No contamos con esto' },
  { l: 1, x: 'Parcial', sub: 'Existe pero está incompleto' },
  { l: 2, x: 'Sí', sub: 'Sí, contamos con esto' },
];

const NIVEL_STYLES = {
  0: { border: 'border-brand-red', bg: 'bg-red-light', text: 'text-brand-red' },
  1: { border: 'border-brand-yellow', bg: 'bg-yellow-light', text: 'text-brand-yellow' },
  2: { border: 'border-blue', bg: 'bg-blue-light', text: 'text-blue' },
  3: { border: 'border-brand-green', bg: 'bg-green-light', text: 'text-brand-green' },
};

const optSimpleClass = (selected) => [
  'border-2 rounded-[11px] p-4 cursor-pointer bg-surface-2 text-center font-semibold text-[0.9rem] text-text transition-all duration-200',
  'hover:-translate-y-0.5 hover:border-text-muted disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0',
  selected ? 'border-accent bg-blue-light text-accent' : 'border-border',
].join(' ');

// Badge de ley por pregunta (cuestionario unificado): azul=21.663,
// verde=21.719, ámbar=Ambas.
const LEY_BADGE = {
  '21.663': 'bg-blue-light text-blue',
  '21.719': 'bg-green-light text-brand-green',
  'Ambas': 'bg-yellow-light text-brand-yellow',
};
const LEY_LABEL = { '21.663': 'Ley 21.663', '21.719': 'Ley 21.719', 'Ambas': 'Ley 21.663 + 21.719' };

const optNivelClass = (nivel, selected) => {
  const st = NIVEL_STYLES[nivel] ?? NIVEL_STYLES[0];
  return [
    'border-2 rounded-[11px] p-4 cursor-pointer text-left transition-[transform,border-color] duration-100',
    'hover:-translate-y-0.5 hover:border-text-muted disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0',
    selected ? `${st.border} ${st.bg}` : 'border-border bg-surface-2',
  ].join(' ');
};

export const CuestionarioPage = () => {
  const { evaluacion, guardarRespuesta: guardarRespuestaLocal, irAFase } = useContext(EvaluacionContext);
  const isTI = evaluacion.modulo === 'ti';
  const dominiosDefinicion = evaluacion.modulo === 'ley' ? DOMINIOS_LEY : DOMINIOS_CYBER;

  // Preguntas aplicables a esta evaluación: para TI es fijo, para
  // cyber/ley depende del perfil (industria, etc.) y de las respuestas ya
  // dadas (en Ley, las preguntas "hija" desaparecen si la "padre" fue "No").
  const preguntas = useMemo(() => {
    if (isTI) return PREGUNTAS_TI;
    return obtenerPreguntasAplicables(evaluacion.modulo, evaluacion.perfil || {}, evaluacion.respuestas);
  }, [isTI, evaluacion.modulo, evaluacion.perfil, evaluacion.respuestas]);

  // Al retomar una evaluación con respuestas ya guardadas, arrancar en la
  // primera pregunta sin responder en vez de siempre desde el principio.
  const [preguntaActual, setPreguntaActual] = useState(() => {
    const idx = preguntas.findIndex(p => evaluacion.respuestas[p.id] === undefined);
    return idx === -1 ? 0 : idx;
  });
  const [saving, setSaving] = useState(false);

  const pregunta = preguntas[preguntaActual];
  const respuestaActual = evaluacion.respuestas[pregunta.id];

  // Dominio actual: para TI es un nombre plano; para cyber/ley se resuelve
  // contra DOMINIOS_CYBER/DOMINIOS_LEY (con ícono y color propio).
  const dominioActual = isTI ? null : dominiosDefinicion.find(d => d.id === pregunta.d);

  const dominios = useMemo(() => {
    if (isTI) return [...new Set(preguntas.map(p => p.dominio))];
    // Solo dominios con al menos una pregunta aplicable al perfil actual
    return dominiosDefinicion.filter(d => preguntas.some(p => p.d === d.id));
  }, [isTI, preguntas, dominiosDefinicion]);

  const domainsState = useMemo(() => {
    const state = {};
    dominios.forEach(dom => {
      const domId = isTI ? dom : dom.id;
      const domsPregs = preguntas.filter(p => (isTI ? p.dominio === dom : p.d === domId));
      const respondidas = domsPregs.filter(p => evaluacion.respuestas[p.id] !== undefined).length;
      state[domId] = { done: respondidas === domsPregs.length && domsPregs.length > 0, respondidas, total: domsPregs.length };
    });
    return state;
  }, [dominios, preguntas, evaluacion.respuestas, isTI]);

  const handleRespuesta = async (valor) => {
    setSaving(true);
    try {
      if (!evaluacion.id) {
        throw new Error('ID de evaluación no está disponible');
      }

      // Mapear respuestas string a números para el backend (solo aplica a TI)
      const mapeoRespuestas = { Si: 3, Parcial: 2, No: 1, Desconoce: 0 };
      const nivelNumerico = typeof valor === 'string' ? (mapeoRespuestas[valor] ?? 0) : valor;

      console.log(`🔹 Guardando Respuesta ${preguntaActual + 1}/${preguntas.length}:`, {
        preguntaId: pregunta.id,
        valor,
        nivelNumerico,
      });

      await guardarRespuesta(evaluacion.id, pregunta.id, nivelNumerico);
      guardarRespuestaLocal(pregunta.id, valor);

      if (isTI) {
        if (preguntaActual < preguntas.length - 1) {
          setPreguntaActual(preguntaActual + 1);
        } else {
          irAFase(3);
        }
      } else {
        // Recalcular la lista aplicable con la respuesta recién dada: si era
        // una pregunta "padre" de Ley respondida "No", sus hijas desaparecen
        // de la lista, así que hay que reubicar la posición actual en vez de
        // simplemente sumar 1 (podría saltar de más o de menos).
        const respuestasActualizadas = { ...evaluacion.respuestas, [pregunta.id]: valor };
        const nuevaLista = obtenerPreguntasAplicables(evaluacion.modulo, evaluacion.perfil || {}, respuestasActualizadas);
        const nuevoIdx = nuevaLista.findIndex(p => p.id === pregunta.id);
        if (nuevoIdx === -1 || nuevoIdx >= nuevaLista.length - 1) {
          irAFase(3);
        } else {
          setPreguntaActual(nuevoIdx + 1);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar respuesta: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSelectDominio = (dom) => {
    const domId = isTI ? dom : dom.id;
    const idx = preguntas.findIndex(p => (isTI ? p.dominio === dom : p.d === domId));
    if (idx !== -1) setPreguntaActual(idx);
  };

  // Determinar opciones según tipo de pregunta (solo aplica a TI)
  const getOpcionesTI = () => {
    const tipo = pregunta.tipo || 'si-no';
    if (tipo === 'si-no') return ['Si', 'No'];
    if (tipo === 'si-no-parcial') return ['Si', 'Parcial', 'No'];
    if (tipo === 'si-no-desconoce') return ['Si', 'No', 'Desconoce'];
    return [0, 1, 2, 3];
  };

  const opcionesTI = isTI ? getOpcionesTI() : null;
  const esRespuestaSimple = isTI && typeof opcionesTI[0] === 'string';
  const esPreguntaPadre = !isTI && evaluacion.modulo === 'ley' && pregunta.type === 'parent';

  // Contexto neutral de la pregunta (cuestionario): "por qué se pregunta" +
  // "concepto clave". Solo existe en el banco unificado de Ley
  // 21.663/21.719, no en TI ni Ciberseguridad. IMPORTANTE: nunca renderizar
  // aquí como_ayuda_tibox ni entregable_asociado (contenido comercial) — eso
  // va solo en Resultados/Roadmap, una vez calculado el diagnóstico, para no
  // sesgar cómo responde el cliente.
  const porQuePregunta = !isTI ? pregunta.por_que_se_pregunta : null;
  const conceptoClave = !isTI ? pregunta.concepto_clave : null;
  const hayContexto = Boolean(porQuePregunta || conceptoClave);
  // Solo el cuerpo (sin título de contenedor): el panel lateral y el
  // acordeón mobile envuelven esto con su propio encabezado/summary; cada
  // bloque interno lleva su propio subtítulo.
  const contextoCuerpo = hayContexto && (
    <>
      {porQuePregunta && (
        <div>
          <div className="flex items-center gap-1.5 mb-1.5 text-sm font-semibold text-text">
            <span className="text-accent-bright" aria-hidden="true">ⓘ</span>
            ¿Por qué se pregunta esto?
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">{porQuePregunta}</p>
        </div>
      )}
      {conceptoClave && (
        <div className={porQuePregunta ? 'mt-3 pt-3 border-t border-border' : ''}>
          <div className="flex items-center gap-1.5 mb-1.5 text-sm font-semibold text-text">
            <span className="text-accent-bright" aria-hidden="true">📖</span>
            Concepto clave
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">{conceptoClave}</p>
        </div>
      )}
      {pregunta.type !== 'parent' && (dominioActual?.n || pregunta.referencia) && (
        <div className="mt-3 pt-3 border-t border-border text-xs text-text-muted leading-relaxed">
          {dominioActual?.n && <div>{dominioActual.n}</div>}
          {pregunta.referencia && <div className="mt-0.5">{pregunta.referencia}</div>}
        </div>
      )}
    </>
  );

  return (
    <div className="animate-fade-in-up w-full max-w-[1280px] mx-auto px-7 pb-[60px] pt-6 min-w-0">
      <div className="mb-3.5">
        <div className="flex items-center gap-2 text-sm mb-2.5">
          DOMINIOS
          <div className="ml-auto text-[0.72rem] font-bold text-text-muted bg-surface-2 px-2.5 py-0.5 rounded-xl">
            {preguntaActual + 1} / {preguntas.length}
          </div>
        </div>
        <div className="flex items-center gap-2.5 mb-3">
          <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
            <div className="h-full bg-accent transition-[width] duration-300" style={{ width: `${((preguntaActual + 1) / preguntas.length) * 100}%` }} />
          </div>
          <div className="text-[0.7rem] text-text-muted font-semibold">{Math.round(((preguntaActual + 1) / preguntas.length) * 100)}%</div>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {dominios.map(dom => {
            const domId = isTI ? dom : dom.id;
            const domNombre = isTI ? dom : dom.n;
            const esActual = isTI ? pregunta.dominio === dom : pregunta.d === domId;
            const estado = domainsState[domId];
            return (
              <button
                key={domId}
                className={[
                  'flex items-center gap-1 border-[1.5px] rounded-lg px-2.5 py-1 text-[0.68rem] font-semibold cursor-pointer transition-colors duration-200',
                  esActual ? 'border-accent bg-blue-light text-accent' : estado?.done ? 'border-brand-green text-brand-green bg-surface-2' : 'border-border bg-surface-2 text-text-secondary hover:border-text',
                ].join(' ')}
                onClick={() => handleSelectDominio(dom)}
                title={!isTI ? `${estado?.respondidas || 0}/${estado?.total || 0}` : undefined}
              >
                <span>{!isTI && dom.ico ? `${dom.ico} ` : ''}{domNombre}</span>
                {estado?.done && <span className="font-extrabold opacity-80">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-5 items-start max-lg:flex-col">
      <div
        className="flex-1 min-w-0 bg-surface border border-border rounded-[20px] shadow-[var(--shadow)] px-[26px] py-7 border-t-4 border-t-purple"
        style={!isTI && dominioActual?.c ? { borderTopColor: dominioActual.c } : undefined}
      >
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="text-[0.66rem] text-text-muted uppercase tracking-wide font-semibold">
            {isTI ? pregunta.dominio : (esPreguntaPadre ? 'PREGUNTA PADRE' : dominioActual?.n)}
          </div>
          {!isTI && evaluacion.modulo === 'ley' && pregunta.ley && (
            <span className={`text-[0.62rem] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full whitespace-nowrap ${LEY_BADGE[pregunta.ley]}`}>
              {LEY_LABEL[pregunta.ley]}
            </span>
          )}
        </div>
        <h2 className="text-[1.3rem] font-bold leading-snug mb-2 text-text">
          {isTI ? pregunta.texto : textoPregunta(pregunta, evaluacion.perfil || {})}
        </h2>
        {!isTI && pregunta.desc && (
          <div className="text-[0.8rem] text-text-secondary leading-relaxed bg-surface-2 rounded-lg px-3.5 py-2.5 mb-[22px]">
            {pregunta.desc}
          </div>
        )}

        {/* Contexto en mobile/tablet: acordeón colapsable bajo la pregunta,
            con "¿por qué se pregunta esto?" y "concepto clave". En desktop
            se muestra en el panel lateral (más abajo), así que este bloque
            se oculta con lg:hidden. */}
        {hayContexto && (
          <details className="lg:hidden mb-[22px] group rounded-lg border border-border bg-surface-2 overflow-hidden">
            <summary className="cursor-pointer list-none flex items-center justify-between gap-2 px-3.5 py-2.5 text-[0.8rem] font-semibold text-text-secondary select-none">
              <span className="flex items-center gap-1.5">
                <span className="text-accent-bright" aria-hidden="true">ⓘ</span>
                Contexto de la pregunta
              </span>
              <span className="transition-transform duration-200 group-open:rotate-180" aria-hidden="true">▾</span>
            </summary>
            <div className="px-3.5 pb-3.5 pt-1">{contextoCuerpo}</div>
          </details>
        )}

        {saving ? (
          <div className="flex items-center justify-center gap-3 p-5 bg-surface-2 rounded-[11px] mt-5">
            <div className="w-5 h-5 border-[3px] border-border border-t-accent rounded-full animate-spin" />
            <span>Guardando y cargando siguiente pregunta...</span>
          </div>
        ) : isTI ? (
          <>
            {esRespuestaSimple ? (
              <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-3">
                {opcionesTI.map(opt => (
                  <button
                    key={opt}
                    className={optSimpleClass(respuestaActual === opt)}
                    onClick={() => handleRespuesta(opt)}
                    disabled={saving}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-3">
                {opcionesTI.map(nivel => (
                  <button
                    key={nivel}
                    className={optNivelClass(nivel, respuestaActual === nivel)}
                    onClick={() => handleRespuesta(nivel)}
                    disabled={saving}
                  >
                    <div className={`text-[0.64rem] font-extrabold uppercase tracking-wide mb-1 ${respuestaActual === nivel ? NIVEL_STYLES[nivel].text : 'text-text-muted'}`}>
                      {nivel === 0 ? 'No Impl.' : nivel === 1 ? 'Inicial' : nivel === 2 ? 'Avanzado' : 'Optimizado'}
                    </div>
                    <div className="text-[0.86rem] text-text leading-snug">Nivel {nivel}</div>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : esPreguntaPadre ? (
          <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-3 mb-5">
            {LABELS_PARENT.map(opt => (
              <button
                key={opt.l}
                className={optSimpleClass(respuestaActual === opt.l)}
                onClick={() => handleRespuesta(opt.l)}
                disabled={saving}
              >
                {opt.x}
                <div className="text-[0.68rem] text-text-muted font-medium mt-1 normal-case tracking-normal">{opt.sub}</div>
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-3">
            {pregunta.o.map(opt => (
              <button
                key={opt.l}
                className={optNivelClass(opt.l, respuestaActual === opt.l)}
                onClick={() => handleRespuesta(opt.l)}
                disabled={saving}
              >
                <div className={`text-[0.64rem] font-extrabold uppercase tracking-wide mb-1 ${respuestaActual === opt.l ? NIVEL_STYLES[opt.l].text : 'text-text-muted'}`}>
                  Nivel {opt.l}
                </div>
                <div className="text-[0.86rem] text-text leading-snug">{opt.x}</div>
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2.5 mt-5 flex-wrap max-sm:flex-col">
          <button type="button" onClick={() => irAFase(1)} className="btn btn-secondary max-sm:w-full max-sm:justify-center">
            ← Perfil
          </button>
          {preguntaActual > 0 && (
            <button
              type="button"
              onClick={() => setPreguntaActual(preguntaActual - 1)}
              className="btn btn-secondary max-sm:w-full max-sm:justify-center"
              disabled={saving}
            >
              ← Anterior
            </button>
          )}
          {preguntaActual === preguntas.length - 1 && (
            <button onClick={() => irAFase(3)} className="btn btn-primary max-sm:w-full max-sm:justify-center">
              Ver Resultados →
            </button>
          )}
        </div>
      </div>

      {/* Panel lateral (solo desktop): mismo contenido que el acordeón de
          arriba, oculto en mobile/tablet con hidden lg:block. */}
      {hayContexto && (
        <aside className="hidden lg:block w-80 shrink-0 sticky top-[70px] bg-surface-2 border border-border rounded-xl p-4">
          <div className="text-[0.66rem] text-text-muted uppercase tracking-wide font-semibold mb-3">
            Contexto de la pregunta
          </div>
          {contextoCuerpo}
        </aside>
      )}
      </div>
    </div>
  );
};
