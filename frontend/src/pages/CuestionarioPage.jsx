import { useContext, useState } from 'react';
import { EvaluacionContext } from '../context/EvaluacionContext';
import { guardarRespuesta } from '../services/api';
import '../styles/CuestionarioPage.css';

export const CuestionarioPage = () => {
  const { evaluacion, guardarRespuesta: guardarRespuestaLocal, irAFase } = useContext(EvaluacionContext);
  const [preguntas] = useState([
    { id: 'q1', texto: '¿Tiene política de seguridad documentada?', dominio: 'Gobernanza' },
    { id: 'q2', texto: '¿Realiza evaluaciones de riesgo regularmente?', dominio: 'Gobernanza' },
    { id: 'q3', texto: '¿Cuenta con un equipo de seguridad dedicado?', dominio: 'Gobernanza' },
    { id: 'q4', texto: '¿Implementa control de acceso basado en roles?', dominio: 'Acceso' },
    { id: 'q5', texto: '¿Utiliza autenticación multifactor?', dominio: 'Acceso' },
  ]);

  const [preguntaActual, setPreguntaActual] = useState(0);
  const [saving, setSaving] = useState(false);

  const pregunta = preguntas[preguntaActual];
  const nivelActual = evaluacion.respuestas[pregunta.id] || undefined;

  const dominios = [...new Set(preguntas.map(p => p.dominio))];
  const domainsState = {};
  dominios.forEach(d => {
    const domsPregs = preguntas.filter(p => p.dominio === d);
    const allAnswered = domsPregs.every(p => evaluacion.respuestas[p.id] !== undefined);
    domainsState[d] = allAnswered;
  });

  const handleNivel = async (nivel) => {
    setSaving(true);
    try {
      await guardarRespuesta(evaluacion.id, pregunta.id, nivel);
      guardarRespuestaLocal(pregunta.id, nivel);

      if (preguntaActual < preguntas.length - 1) {
        setPreguntaActual(preguntaActual + 1);
      } else {
        irAFase(3);
      }
    } catch (error) {
      alert('Error al guardar respuesta');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectDominio = (dominio) => {
    const idx = preguntas.findIndex(p => p.dominio === dominio);
    if (idx !== -1) setPreguntaActual(idx);
  };

  const levelLabels = ['No Implementado', 'Inicial', 'Avanzado', 'Optimizado'];

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
        <div className="wizard-levels">NIVEL DE MADUREZ</div>
        <h2 className="wizard-qtxt">{pregunta.texto}</h2>

        <div className="wizard-opts">
          {[0, 1, 2, 3].map(nivel => (
            <button
              key={nivel}
              className={`wizard-opt s${nivel} ${nivelActual === nivel ? 'selected' : ''}`}
              onClick={() => handleNivel(nivel)}
              disabled={saving}
            >
              <div className="wizard-opt-lv">{levelLabels[nivel]}</div>
              <div className="wizard-opt-tx">Nivel {nivel}</div>
            </button>
          ))}
        </div>

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
