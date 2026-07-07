import { useContext, useState, useMemo } from 'react';
import { EvaluacionContext } from '../context/EvaluacionContext';
import { PREGUNTAS_TI, DOMINIOS_TI } from '../data/ti-questions';
import { calcularMadurezTI, calcularDetallesMaturezTI, getNivelMadurezTI } from '../utils/ti-scoring';
import '../styles/ResultadosPage.css';

export const ResultadosPage = () => {
  const { evaluacion, irAFase } = useContext(EvaluacionContext);
  const [selectedDominio, setSelectedDominio] = useState(null);

  const isTI = evaluacion.modulo === 'ti';

  // Datos según el módulo
  const { allQuestions, dominios, promedio, nivel, drillDominio, drillPreguntas } = useMemo(() => {
    if (isTI) {
      const madurez = calcularMadurezTI(evaluacion.respuestas);
      const detalles = calcularDetallesMaturezTI(evaluacion.respuestas);
      const nivelTI = getNivelMadurezTI(madurez);

      const domsArray = DOMINIOS_TI.map(d => d.nombre);
      const selected = selectedDominio || (domsArray.length > 0 ? domsArray[0] : null);
      const drillQs = PREGUNTAS_TI.filter(q => q.dominio === selected);

      return {
        allQuestions: PREGUNTAS_TI,
        dominios: domsArray,
        promedio: madurez,
        nivel: nivelTI,
        detalles,
        drillDominio: selected,
        drillPreguntas: drillQs
      };
    } else {
      // Para cyber y ley: cálculo simple basado en niveles 0-3
      const allQs = [
        { id: 'q1', texto: '¿Tiene política de seguridad documentada?', dominio: 'Gobernanza' },
        { id: 'q2', texto: '¿Realiza evaluaciones de riesgo regularmente?', dominio: 'Gobernanza' },
        { id: 'q3', texto: '¿Cuenta con un equipo de seguridad dedicado?', dominio: 'Gobernanza' },
        { id: 'q4', texto: '¿Implementa control de acceso basado en roles?', dominio: 'Acceso' },
        { id: 'q5', texto: '¿Utiliza autenticación multifactor?', dominio: 'Acceso' },
      ];

      const respuestas = Object.values(evaluacion.respuestas);
      const prom = respuestas.length === 0 ? 0 : Math.round((respuestas.reduce((a, b) => a + b, 0) / respuestas.length / 3) * 100);

      const getNivelCyber = (porcentaje) => {
        if (porcentaje < 25) return { label: 'Crítico', color: '#EF4444', dot: '#EF4444' };
        if (porcentaje < 50) return { label: 'En Riesgo', color: '#F59E0B', dot: '#F59E0B' };
        if (porcentaje < 75) return { label: 'Satisfactorio', color: '#0BA5EC', dot: '#0BA5EC' };
        return { label: 'Optimizado', color: '#10B981', dot: '#10B981' };
      };

      const domsArray = [...new Set(allQs.map(q => q.dominio))];
      const selected = selectedDominio || (domsArray.length > 0 ? domsArray[0] : null);
      const drillQs = allQs.filter(q => q.dominio === selected);

      return {
        allQuestions: allQs,
        dominios: domsArray,
        promedio: prom,
        nivel: getNivelCyber(prom),
        drillDominio: selected,
        drillPreguntas: drillQs
      };
    }
  }, [evaluacion.modulo, evaluacion.respuestas, selectedDominio, isTI]);

  const calcularPorDominio = (dominio) => {
    if (isTI) {
      const preg = PREGUNTAS_TI.filter(q => q.dominio === dominio);
      if (preg.length === 0) return 0;

      // Calcular promedio de respuestas para este dominio
      const scores = preg.map(p => {
        const resp = evaluacion.respuestas[p.id] || 'No';
        const esInversa = ['ti-id-3', 'ti-id-7', 'ti-mon-4'].includes(p.id);
        if (esInversa) {
          if (resp === 'Si') return 0;
          if (resp === 'No') return 100;
          if (resp === 'Parcial') return 50;
          return 0;
        } else {
          if (resp === 'Si') return 100;
          if (resp === 'No') return 0;
          if (resp === 'Parcial') return 50;
          return 0;
        }
      });
      return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    } else {
      const domsPregs = allQuestions.filter(q => q.dominio === dominio);
      if (domsPregs.length === 0) return 0;
      const suma = domsPregs.reduce((acc, q) => acc + (evaluacion.respuestas[q.id] || 0), 0);
      return Math.round((suma / (domsPregs.length * 3)) * 100);
    }
  };

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
        <p>Análisis de {isTI ? 'Levantamiento TI' : evaluacion.modulo === 'ley' ? 'Protección de Datos (Ley 21.719)' : 'Ciberseguridad'}</p>
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
              const respuesta = evaluacion.respuestas[q.id] || 'Sin respuesta';
              const labelMap = {
                'Si': 'Sí',
                'No': 'No',
                'Parcial': 'Parcial',
                'Desconoce': 'Desconoce',
                0: 'No Impl.',
                1: 'Inicial',
                2: 'Avanzado',
                3: 'Optimizado'
              };
              return (
                <div key={q.id} className="drill-item">
                  <div className="drill-item-txt">{q.texto}</div>
                  <div className={`drill-item-lvl l-${respuesta}`}>{labelMap[respuesta] || respuesta}</div>
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
