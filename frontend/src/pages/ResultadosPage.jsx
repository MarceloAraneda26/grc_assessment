import { useContext, useState } from 'react';
import { EvaluacionContext } from '../context/EvaluacionContext';
import '../styles/ResultadosPage.css';

export const ResultadosPage = () => {
  const { evaluacion, irAFase } = useContext(EvaluacionContext);
  const [selectedDominio, setSelectedDominio] = useState(null);

  const allQuestions = [
    { id: 'q1', texto: '¿Tiene política de seguridad documentada?', dominio: 'Gobernanza' },
    { id: 'q2', texto: '¿Realiza evaluaciones de riesgo regularmente?', dominio: 'Gobernanza' },
    { id: 'q3', texto: '¿Cuenta con un equipo de seguridad dedicado?', dominio: 'Gobernanza' },
    { id: 'q4', texto: '¿Implementa control de acceso basado en roles?', dominio: 'Acceso' },
    { id: 'q5', texto: '¿Utiliza autenticación multifactor?', dominio: 'Acceso' },
  ];

  const calcularPromedio = () => {
    const respuestas = Object.values(evaluacion.respuestas);
    if (respuestas.length === 0) return 0;
    return Math.round((respuestas.reduce((a, b) => a + b, 0) / respuestas.length / 3) * 100);
  };

  const calcularPorDominio = (dominio) => {
    const domsPregs = allQuestions.filter(q => q.dominio === dominio);
    if (domsPregs.length === 0) return 0;
    const suma = domsPregs.reduce((acc, q) => acc + (evaluacion.respuestas[q.id] || 0), 0);
    return Math.round((suma / (domsPregs.length * 3)) * 100);
  };

  const getNivel = (porcentaje) => {
    if (porcentaje < 25) return { label: 'Crítico', color: '#EF4444', dot: '#EF4444' };
    if (porcentaje < 50) return { label: 'En Riesgo', color: '#F59E0B', dot: '#F59E0B' };
    if (porcentaje < 75) return { label: 'Satisfactorio', color: '#0BA5EC', dot: '#0BA5EC' };
    return { label: 'Optimizado', color: '#10B981', dot: '#10B981' };
  };

  const promedio = calcularPromedio();
  const nivel = getNivel(promedio);
  const dominios = [...new Set(allQuestions.map(q => q.dominio))];
  const drillDominio = selectedDominio || (dominios.length > 0 ? dominios[0] : null);
  const drillPreguntas = allQuestions.filter(q => q.dominio === drillDominio);

  const SVGGauge = ({ valor }) => {
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (valor / 100) * circumference;
    const angle = (valor / 100) * 360 - 90;
    const x = 90 + radius * Math.cos((angle * Math.PI) / 180);
    const y = 90 + radius * Math.sin((angle * Math.PI) / 180);

    return (
      <svg className="gauge-svg" viewBox="0 0 180 180">
        <circle cx="90" cy="90" r={radius} fill="none" stroke="var(--surface-2)" strokeWidth="12" />
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke={nivel.color}
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
        <circle cx={x} cy={y} r="5" fill={nivel.color} />
      </svg>
    );
  };

  return (
    <div className="resultados-page">
      <div className="resultados-header">
        <h1>Resultados de la Evaluación</h1>
        <p>Análisis de madurez en {evaluacion.modulo === 'ley' ? 'Protección de Datos (Ley 21.719)' : 'Ciberseguridad'}</p>
      </div>

      <div className="resultado-gauge-card">
        <div className="resultado-gauge">
          <SVGGauge valor={promedio} />
        </div>
        <div className="resultado-gauge-text">
          <div className="resultado-score">
            <div className="resultado-score-numero">{promedio}%</div>
            <div className="resultado-score-label">Madurez Global</div>
          </div>
          <div className="resultado-nivel">
            <div className="resultado-nivel-dot" style={{ background: nivel.dot }} />
            <div className="resultado-nivel-tx">{nivel.label}</div>
          </div>
          <div className="resultado-desc">
            {promedio < 25 && 'Requiere intervención inmediata en procesos fundamentales'}
            {promedio >= 25 && promedio < 50 && 'Se necesitan mejoras significativas en gobernanza y controles'}
            {promedio >= 50 && promedio < 75 && 'Buena madurez, enfocarse en optimización y automatización'}
            {promedio >= 75 && 'Nivel de madurez avanzado, mantener y mejorar continuamente'}
          </div>
        </div>
      </div>

      <div className="resultado-dominios">
        {dominios.map(dom => {
          const puntuacion = calcularPorDominio(dom);
          return (
            <button
              key={dom}
              className={`dominio-card ${selectedDominio === dom ? 'active' : ''}`}
              onClick={() => setSelectedDominio(dom)}
            >
              <div className="dominio-card-header">
                <div className="dominio-card-name">{dom}</div>
                <div className="dominio-card-score">{puntuacion}%</div>
              </div>
              <div className="dominio-card-bar">
                <div className="dominio-card-fill" style={{ width: `${puntuacion}%` }} />
              </div>
              <div className="dominio-card-status">
                {puntuacion < 50 ? 'Mejorar' : puntuacion < 75 ? 'Avanzar' : 'Optimizar'}
              </div>
            </button>
          );
        })}
      </div>

      {drillDominio && (
        <div className="resultado-drill">
          <div className="resultado-drill-header">
            <div className="resultado-drill-title">Detalle: {drillDominio}</div>
          </div>
          <div className="drill-items">
            {drillPreguntas.map(q => {
              const respuesta = evaluacion.respuestas[q.id] || 0;
              const levelLabels = ['No Impl.', 'Inicial', 'Avanzado', 'Optimizado'];
              return (
                <div key={q.id} className="drill-item">
                  <div className="drill-item-txt">{q.texto}</div>
                  <div className={`drill-item-lvl l${respuesta}`}>{levelLabels[respuesta]}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="resultado-actions">
        <button onClick={() => irAFase(2)} className="btn btn-secondary">
          ← Volver
        </button>
        <button onClick={() => irAFase(4)} className="btn btn-primary">
          Ver Roadmap →
        </button>
      </div>
    </div>
  );
};
