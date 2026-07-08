import { useContext, useState, useMemo, useEffect } from 'react';
import { EvaluacionContext } from '../context/EvaluacionContext';
import { getDatosResultados } from '../utils/reporte-data';
import { guardarResultado } from '../services/api';
import '../styles/ResultadosPage.css';

export const ResultadosPage = () => {
  const { evaluacion, irAFase } = useContext(EvaluacionContext);
  const [selectedDominio, setSelectedDominio] = useState(null);
  const [guardandoResultado, setGuardandoResultado] = useState(false);

  const isTI = evaluacion.modulo === 'ti';

  const { titulo, promedio, nivel, dominios } = useMemo(
    () => getDatosResultados(evaluacion),
    [evaluacion.modulo, evaluacion.respuestas]
  );

  const drillDominio = selectedDominio || (dominios.length > 0 ? dominios[0].nombre : null);
  const drillPreguntas = dominios.find(d => d.nombre === drillDominio)?.preguntas || [];

  // Guardar resultados en BD cuando se carga la página (los 3 módulos)
  useEffect(() => {
    const guardarEnBD = async () => {
      if (!evaluacion.id || guardandoResultado) return;

      try {
        setGuardandoResultado(true);

        const areasDebiles = [...dominios]
          .sort((a, b) => a.puntuacion - b.puntuacion)
          .slice(0, 3)
          .map(d => ({ nombre: d.nombre, score: d.puntuacion }));

        const detallesPorDominio = dominios.reduce((acc, d) => {
          acc[d.nombre] = { score: d.puntuacion };
          return acc;
        }, {});

        const datosResultado = {
          puntajeGlobal: Math.round(promedio),
          nivel: nivel.label,
          detalles: detallesPorDominio,
          areasParaMejorar: areasDebiles,
          resumenEjecutivo: `${titulo}: ${nivel.label} (${Math.round(promedio)}%). Áreas prioritarias: ${areasDebiles.map(a => a.nombre).join(', ')}.`
        };

        await guardarResultado(evaluacion.id, datosResultado);
      } catch (error) {
        console.error('Error guardando resultado en BD:', error);
      } finally {
        setGuardandoResultado(false);
      }
    };

    guardarEnBD();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evaluacion.id, evaluacion.respuestas]);

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
        <p>Análisis de {titulo}</p>
      </div>

      <div className="resultado-gauge-card">
        <div className="resultado-gauge">
          <SVGGauge valor={promedio} />
        </div>
        <div className="resultado-gauge-text">
          <div className="resultado-score">
            <div className="resultado-score-numero">{promedio}%</div>
            <div className="resultado-score-label">Madurez {isTI ? 'TI' : 'Global'}</div>
          </div>
          <div className="resultado-nivel">
            <div className="resultado-nivel-dot" style={{ background: nivel.dot }} />
            <div className="resultado-nivel-tx">{nivel.label}</div>
          </div>
          <div className="resultado-desc">
            {promedio < 25 && (isTI ? 'Requiere intervención inmediata en infraestructura y controles' : 'Requiere intervención inmediata en procesos fundamentales')}
            {promedio >= 25 && promedio < 50 && (isTI ? 'Se necesitan mejoras significativas en inventario y seguridad' : 'Se necesitan mejoras significativas en gobernanza y controles')}
            {promedio >= 50 && promedio < 75 && (isTI ? 'Buena infraestructura, enfocarse en monitoreo y proveedores' : 'Buena madurez, enfocarse en optimización y automatización')}
            {promedio >= 75 && (isTI ? 'Infraestructura optimizada, mantener y mejorar continuamente' : 'Nivel de madurez avanzado, mantener y mejorar continuamente')}
          </div>
        </div>
      </div>

      <div className="resultado-dominios">
        {dominios.map(dom => (
          <button
            key={dom.nombre}
            className={`dominio-card ${selectedDominio === dom.nombre ? 'active' : ''}`}
            onClick={() => setSelectedDominio(dom.nombre)}
          >
            <div className="dominio-card-header">
              <div className="dominio-card-name">{dom.nombre}</div>
              <div className="dominio-card-score">{dom.puntuacion}%</div>
            </div>
            <div className="dominio-card-bar">
              <div className="dominio-card-fill" style={{ width: `${dom.puntuacion}%` }} />
            </div>
            <div className="dominio-card-status">
              {dom.puntuacion < 50 ? 'Mejorar' : dom.puntuacion < 75 ? 'Avanzar' : 'Optimizar'}
            </div>
          </button>
        ))}
      </div>

      {drillDominio && (
        <div className="resultado-drill">
          <div className="resultado-drill-header">
            <div className="resultado-drill-title">Detalle: {drillDominio}</div>
          </div>
          <div className="drill-items">
            {drillPreguntas.map((q, idx) => (
              <div key={idx} className="drill-item">
                <div className="drill-item-txt">{q.texto}</div>
                <div className={`drill-item-lvl l-${q.valorCrudo ?? 'Sin respuesta'}`}>{q.respuesta}</div>
              </div>
            ))}
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
