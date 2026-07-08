import { useContext, useState, useMemo } from 'react';
import { EvaluacionContext } from '../context/EvaluacionContext';
import { guardarRespuesta } from '../services/api';
import { PREGUNTAS_TI } from '../data/ti-questions';
import { DOMINIOS_CYBER } from '../data/cyber-questions';
import { DOMINIOS_LEY } from '../data/ley-questions';
import { obtenerPreguntasAplicables, textoPregunta } from '../utils/cyber-ley-scoring';
import '../styles/CuestionarioPage.css';

const LABELS_PARENT = [
  { l: 0, x: 'No', sub: 'No contamos con esto' },
  { l: 1, x: 'Parcial', sub: 'Existe pero está incompleto' },
  { l: 3, x: 'Sí', sub: 'Sí, contamos con esto' },
];

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

  return (
    <div className="page">
      <div className="wizard-top">
        <div className="wizard-domlabel">
          DOMINIOS
          <div className="wizard-globalpos">{preguntaActual + 1} / {preguntas.length}</div>
        </div>
        <div className="progrow">
          <div className="progbar">
            <div className="progfill" style={{ width: `${((preguntaActual + 1) / preguntas.length) * 100}%` }} />
          </div>
          <div className="proglab">{Math.round(((preguntaActual + 1) / preguntas.length) * 100)}%</div>
        </div>
        <div className="wizard-doms">
          {dominios.map(dom => {
            const domId = isTI ? dom : dom.id;
            const domNombre = isTI ? dom : dom.n;
            const esActual = isTI ? pregunta.dominio === dom : pregunta.d === domId;
            const estado = domainsState[domId];
            return (
              <button
                key={domId}
                className={`wizard-dom ${esActual ? 'cur' : ''} ${estado?.done ? 'done' : ''}`}
                onClick={() => handleSelectDominio(dom)}
                title={!isTI ? `${estado?.respondidas || 0}/${estado?.total || 0}` : undefined}
              >
                <span>{!isTI && dom.ico ? `${dom.ico} ` : ''}{domNombre}</span>
                {estado?.done && <span className="wizard-dom-c">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="wizard-card" style={!isTI ? { borderTopColor: dominioActual?.c } : undefined}>
        <div className="wizard-levels">
          {isTI ? pregunta.dominio : (esPreguntaPadre ? 'PREGUNTA PADRE' : dominioActual?.n)}
        </div>
        <h2 className="wizard-qtxt">
          {isTI ? pregunta.texto : textoPregunta(pregunta, evaluacion.perfil || {})}
        </h2>
        {!isTI && pregunta.desc && <div className="wizard-desc">{pregunta.desc}</div>}

        {saving ? (
          <div className="wizard-loading">
            <div className="spinner" />
            <span>Guardando y cargando siguiente pregunta...</span>
          </div>
        ) : isTI ? (
          <>
            {esRespuestaSimple ? (
              <div className="wizard-opts-simple">
                {opcionesTI.map(opt => (
                  <button
                    key={opt}
                    className={`wizard-opt-simple ${respuestaActual === opt ? 'selected' : ''}`}
                    onClick={() => handleRespuesta(opt)}
                    disabled={saving}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <div className="wizard-opts">
                {opcionesTI.map(nivel => (
                  <button
                    key={nivel}
                    className={`wizard-opt s${nivel} ${respuestaActual === nivel ? 'selected' : ''}`}
                    onClick={() => handleRespuesta(nivel)}
                    disabled={saving}
                  >
                    <div className="wizard-opt-lv">
                      {nivel === 0 ? 'No Impl.' : nivel === 1 ? 'Inicial' : nivel === 2 ? 'Avanzado' : 'Optimizado'}
                    </div>
                    <div className="wizard-opt-tx">Nivel {nivel}</div>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : esPreguntaPadre ? (
          <div className="wizard-opts-simple">
            {LABELS_PARENT.map(opt => (
              <button
                key={opt.l}
                className={`wizard-opt-simple ${respuestaActual === opt.l ? 'selected' : ''}`}
                onClick={() => handleRespuesta(opt.l)}
                disabled={saving}
              >
                {opt.x}
                <div className="wizard-opt-sub">{opt.sub}</div>
              </button>
            ))}
          </div>
        ) : (
          <div className="wizard-opts">
            {pregunta.o.map(opt => (
              <button
                key={opt.l}
                className={`wizard-opt s${opt.l} ${respuestaActual === opt.l ? 'selected' : ''}`}
                onClick={() => handleRespuesta(opt.l)}
                disabled={saving}
              >
                <div className="wizard-opt-lv">Nivel {opt.l}</div>
                <div className="wizard-opt-tx">{opt.x}</div>
              </button>
            ))}
          </div>
        )}

        <div className="wizard-actions">
          <button type="button" onClick={() => irAFase(1)} className="btn btn-secondary">
            ← Perfil
          </button>
          {preguntaActual > 0 && (
            <button
              type="button"
              onClick={() => setPreguntaActual(preguntaActual - 1)}
              className="btn btn-secondary"
              disabled={saving}
            >
              ← Anterior
            </button>
          )}
          {preguntaActual === preguntas.length - 1 && (
            <button onClick={() => irAFase(3)} className="btn btn-primary">
              Ver Resultados →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
