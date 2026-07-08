import { useContext, useState, useMemo } from 'react';
import { EvaluacionContext } from '../context/EvaluacionContext';
import { guardarRespuesta } from '../services/api';
import { PREGUNTAS_TI } from '../data/ti-questions';
import '../styles/CuestionarioPage.css';

export const CuestionarioPage = () => {
  const { evaluacion, guardarRespuesta: guardarRespuestaLocal, irAFase } = useContext(EvaluacionContext);
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [saving, setSaving] = useState(false);

  // Cargar preguntas según el módulo
  const preguntas = useMemo(() => {
    if (evaluacion.modulo === 'ti') {
      return PREGUNTAS_TI;
    }
    // Para cyber y ley, mantener las preguntas de demostración
    return [
      { id: 'q1', texto: '¿Tiene política de seguridad documentada?', dominio: 'Gobernanza' },
      { id: 'q2', texto: '¿Realiza evaluaciones de riesgo regularmente?', dominio: 'Gobernanza' },
      { id: 'q3', texto: '¿Cuenta con un equipo de seguridad dedicado?', dominio: 'Gobernanza' },
      { id: 'q4', texto: '¿Implementa control de acceso basado en roles?', dominio: 'Acceso' },
      { id: 'q5', texto: '¿Utiliza autenticación multifactor?', dominio: 'Acceso' },
    ];
  }, [evaluacion.modulo]);

  const pregunta = preguntas[preguntaActual];
  const respuestaActual = evaluacion.respuestas[pregunta.id] || undefined;

  const dominios = useMemo(() => [...new Set(preguntas.map(p => p.dominio))], [preguntas]);

  const domainsState = useMemo(() => {
    const state = {};
    dominios.forEach(d => {
      const domsPregs = preguntas.filter(p => p.dominio === d);
      const allAnswered = domsPregs.every(p => evaluacion.respuestas[p.id] !== undefined);
      state[d] = allAnswered;
    });
    return state;
  }, [dominios, preguntas, evaluacion.respuestas]);

  const handleRespuesta = async (valor) => {
    setSaving(true);
    try {
      if (!evaluacion.id) {
        throw new Error('ID de evaluación no está disponible');
      }

      // Mapear respuestas string a números para el backend
      const mapeoRespuestas = {
        'Si': 3,
        'Parcial': 2,
        'No': 1,
        'Desconoce': 0
      };

      const nivelNumerico = typeof valor === 'string' ? (mapeoRespuestas[valor] || 0) : valor;
      const numeroPregunta = preguntaActual + 1;

      console.log(`🔹 Guardando Respuesta ${numeroPregunta}/${preguntas.length}:`, {
        preguntaId: pregunta.id,
        texto: pregunta.texto.substring(0, 50) + '...',
        valor,
        nivelNumerico
      });

      await guardarRespuesta(evaluacion.id, pregunta.id, nivelNumerico);
      guardarRespuestaLocal(pregunta.id, valor);

      if (preguntaActual < preguntas.length - 1) {
        setPreguntaActual(preguntaActual + 1);
      } else {
        irAFase(3);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar respuesta: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSelectDominio = (dominio) => {
    const idx = preguntas.findIndex(p => p.dominio === dominio);
    if (idx !== -1) setPreguntaActual(idx);
  };

  // Determinar opciones según tipo de pregunta
  const getOpciones = () => {
    const tipo = pregunta.tipo || 'si-no';
    if (tipo === 'si-no') return ['Si', 'No'];
    if (tipo === 'si-no-parcial') return ['Si', 'Parcial', 'No'];
    if (tipo === 'si-no-desconoce') return ['Si', 'No', 'Desconoce'];
    return [0, 1, 2, 3]; // Para cyber y ley
  };

  const opciones = getOpciones();
  const esRespuestaSimple = typeof opciones[0] === 'string';

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
          {dominios.map(dom => (
            <button
              key={dom}
              className={`wizard-dom ${pregunta.dominio === dom ? 'cur' : ''} ${domainsState[dom] ? 'done' : ''}`}
              onClick={() => handleSelectDominio(dom)}
            >
              <span>{dom}</span>
              {domainsState[dom] && <span className="wizard-dom-c">✓</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="wizard-card">
        <div className="wizard-levels">{pregunta.dominio}</div>
        <h2 className="wizard-qtxt">{pregunta.texto}</h2>

        {saving ? (
          <div className="wizard-loading">
            <div className="spinner" />
            <span>Guardando y cargando siguiente pregunta...</span>
          </div>
        ) : (
          <>
            {esRespuestaSimple ? (
              // Para preguntas Si/No/Parcial/Desconoce
              <div className="wizard-opts-simple">
                {opciones.map(opt => (
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
              // Para preguntas de nivel 0-3 (cyber y ley)
              <div className="wizard-opts">
                {opciones.map(nivel => (
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
        )}

        <div className="wizard-actions">
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
