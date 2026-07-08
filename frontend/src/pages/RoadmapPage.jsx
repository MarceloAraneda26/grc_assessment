import { useContext, useMemo } from 'react';
import { EvaluacionContext } from '../context/EvaluacionContext';
import { getDatosRoadmap } from '../utils/reporte-data';
import '../styles/RoadmapPage.css';

export const RoadmapPage = () => {
  const { evaluacion, reiniciar, irAFase } = useContext(EvaluacionContext);

  const isTI = evaluacion.modulo === 'ti';

  const { titulo, subtitulo, tareas: tareasCompletas, hitos, resumen, entregables, fases } = useMemo(
    () => getDatosRoadmap(evaluacion),
    [evaluacion.modulo, evaluacion.respuestas]
  );

  // Para TI, se muestran solo las 8 tareas prioritarias en el Gantt (el
  // resto del detalle igual queda disponible en entregables/fases).
  const tareas = isTI ? tareasCompletas.slice(0, 8) : tareasCompletas;

  const renderTaskBar = (tarea) => {
    const bars = [];
    for (let i = 1; i <= 12; i++) {
      const isActive = i >= tarea.mesInicio && i <= tarea.mesFin;
      const prioridadClass = tarea.prioridad ? `p${tarea.prioridad}` : '';
      bars.push(
        <div
          key={i}
          className={`timeline-task-bar ${isActive ? 'filled ' + prioridadClass : ''}`}
        />
      );
    }
    return bars;
  };

  return (
    <div className="roadmap-page">
      <div className="roadmap-header">
        <h1>{titulo}</h1>
        <p>{subtitulo}</p>
      </div>

      <div className="roadmap-timeline">
        <div className="timeline-months">
          <div className="timeline-months-header timeline-months-label">Tareas</div>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
            <div key={m} className="timeline-months-header" style={{ textAlign: 'center', borderRight: '1px solid var(--surface-2)' }}>
              M{m}
            </div>
          ))}
        </div>

        {tareas.map(tarea => (
          <div key={tarea.id} className="timeline-task">
            <div className="timeline-task-name">{tarea.titulo}</div>
            {renderTaskBar(tarea)}
          </div>
        ))}
      </div>

      <div className="roadmap-hitos">
        {hitos.map((hito, i) => (
          <div key={i} className="hito-card">
            <div className="hito-num">{hito.num}</div>
            <div className="hito-label">{hito.label}</div>
            <div className="hito-desc">{hito.desc}</div>
          </div>
        ))}
      </div>

      <div className="roadmap-resumen">
        <div className="roadmap-resumen-title">Resumen Ejecutivo</div>
        <div className="roadmap-resumen-text">
          {resumen}
        </div>
      </div>

      <div className="roadmap-entregables">
        <div className="roadmap-entregables-title">Entregables Principales</div>
        <div className="entregables-list">
          {entregables.map((ent, i) => (
            <div key={i} className="entregable-item">
              <div className="entregable-check">✓</div>
              <div className="entregable-text">{ent}</div>
            </div>
          ))}
        </div>
      </div>

      {isTI && Object.keys(fases).length > 0 && (
        <div className="roadmap-fases">
          <div className="roadmap-fases-title">Fases de Implementación</div>
          <div className="fases-grid">
            {Object.entries(fases).map(([fase, items]) => (
              <div key={fase} className="fase-card">
                <div className="fase-titulo">{fase}</div>
                <ul className="fase-items">
                  {items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="roadmap-actions">
        <button onClick={() => irAFase(3)} className="btn btn-secondary">
          ← Resultados
        </button>
        <button onClick={() => { if (window.confirm('¿Iniciar nueva evaluación?')) { reiniciar(); irAFase(0); window.location.hash = '#/inicio'; } }} className="btn btn-primary">
          Nueva Evaluación →
        </button>
      </div>
    </div>
  );
};
