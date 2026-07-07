import { useContext } from 'react';
import { EvaluacionContext } from '../context/EvaluacionContext';
import '../styles/RoadmapPage.css';

export const RoadmapPage = () => {
  const { evaluacion, reiniciar } = useContext(EvaluacionContext);

  const tareas = [
    { id: 1, titulo: 'Política de Seguridad', mes_inicio: 1, mes_fin: 3, prioridad: 1 },
    { id: 2, titulo: 'Capacitación personal', mes_inicio: 2, mes_fin: 3, prioridad: 1 },
    { id: 3, titulo: 'Auditoría inicial', mes_inicio: 2, mes_fin: 4, prioridad: 2 },
    { id: 4, titulo: 'Implementar MFA', mes_inicio: 4, mes_fin: 6, prioridad: 1 },
    { id: 5, titulo: 'Monitoreo 24/7', mes_inicio: 7, mes_fin: 12, prioridad: 2 },
  ];

  const hitos = [
    { num: '3', label: 'Meses', desc: 'Fase inicial de gobernanza y capacitación' },
    { num: '6', label: 'Meses', desc: 'Control de acceso y autenticación implementado' },
    { num: '12', label: 'Meses', desc: 'Madurez operativa y monitoreo continuo' },
  ];

  const entregables = [
    'Política de Seguridad de la Información documentada',
    'Plan de Capacitación y Sensibilización aprobado',
    'Matriz de Riesgos actualizada y validada',
    'Arquitectura MFA implementada y operativa',
    'Centro de Monitoreo 24/7 en funcionamiento',
    'Informe de cumplimiento normativo periódico',
  ];

  const renderTaskBar = (tarea) => {
    const bars = [];
    for (let i = 1; i <= 12; i++) {
      const isActive = i >= tarea.mes_inicio && i <= tarea.mes_fin;
      bars.push(
        <div
          key={i}
          className={`timeline-task-bar ${isActive ? 'filled p' + tarea.prioridad : ''}`}
        />
      );
    }
    return bars;
  };

  return (
    <div className="roadmap-page">
      <div className="roadmap-header">
        <h1>Roadmap de Implementación</h1>
        <p>Plan de mejora de madurez para los próximos 12 meses — {evaluacion.modulo === 'ley' ? 'Protección de Datos' : 'Ciberseguridad'}</p>
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
          Basado en la evaluación realizada, se propone un plan de mejora de madurez distribuido en tres fases estratégicas: (1) Gobernanza y Sensibilización
          (meses 1–3), enfocado en establecer políticas y capacitación; (2) Controles de Acceso e Identidad (meses 4–6), implementando autenticación multifactor
          y gestión de accesos; (3) Operacionalización y Monitoreo (meses 7–12), estableciendo procesos de monitoreo continuo y mejora permanente.
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

      <div className="roadmap-actions">
        <button onClick={() => window.location.reload()} className="btn btn-secondary">
          ← Volver
        </button>
        <button onClick={reiniciar} className="btn btn-primary">
          Nueva Evaluación →
        </button>
      </div>
    </div>
  );
};
