import { useContext, useMemo } from 'react';
import { EvaluacionContext } from '../context/EvaluacionContext';
import { calcularDetallesMaturezTI, calcularMadurezTI } from '../utils/ti-scoring';
import { generarTareasRoadmap, generarResumenEjecutivo, ENTREGABLES_TI } from '../utils/ti-roadmap';
import '../styles/RoadmapPage.css';

export const RoadmapPage = () => {
  const { evaluacion, reiniciar } = useContext(EvaluacionContext);

  const isTI = evaluacion.modulo === 'ti';

  // Datos según el módulo
  const { titulo, subtitulo, tareas, hitos, resumen, entregables, fases } = useMemo(() => {
    if (isTI) {
      const madurez = calcularMadurezTI(evaluacion.respuestas);
      const detalles = calcularDetallesMaturezTI(evaluacion.respuestas);
      const tareasRoadmap = generarTareasRoadmap(detalles);

      // Calcular meses de inicio/fin basados en tareas generadas
      const tareasConMeses = tareasRoadmap.map((t, idx) => ({
        ...t,
        id: idx,
        mes_inicio: t.mes,
        mes_fin: t.mes + (t.duracion || 2)
      }));

      return {
        titulo: 'Roadmap de Mejora TI',
        subtitulo: 'Plan de mejora de infraestructura y seguridad para los próximos 12 meses',
        tareas: tareasConMeses.slice(0, 8), // Top 8 tareas
        hitos: [
          { num: '3', label: 'Meses', desc: 'Inventario y acceso consolidado' },
          { num: '6', label: 'Meses', desc: 'Respaldos y seguridad perimetral' },
          { num: '12', label: 'Meses', desc: 'Monitoreo y mejora continua' },
        ],
        resumen: generarResumenEjecutivo(madurez, detalles),
        entregables: [
          ...ENTREGABLES_TI['Fase 1 (Meses 1-3)'],
          ...ENTREGABLES_TI['Fase 2 (Meses 4-6)'],
          ...ENTREGABLES_TI['Fase 3 (Meses 7-12)']
        ],
        fases: ENTREGABLES_TI
      };
    } else {
      // Para cyber y ley
      const tareasBase = [
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

      const resumenCyber = 'Basado en la evaluación realizada, se propone un plan de mejora de madurez distribuido en tres fases estratégicas: (1) Gobernanza y Sensibilización (meses 1–3), enfocado en establecer políticas y capacitación; (2) Controles de Acceso e Identidad (meses 4–6), implementando autenticación multifactor y gestión de accesos; (3) Operacionalización y Monitoreo (meses 7–12), estableciendo procesos de monitoreo continuo y mejora permanente.';

      const entregablesBase = [
        'Política de Seguridad de la Información documentada',
        'Plan de Capacitación y Sensibilización aprobado',
        'Matriz de Riesgos actualizada y validada',
        'Arquitectura MFA implementada y operativa',
        'Centro de Monitoreo 24/7 en funcionamiento',
        'Informe de cumplimiento normativo periódico',
      ];

      return {
        titulo: 'Roadmap de Implementación',
        subtitulo: `Plan de mejora de madurez para los próximos 12 meses — ${evaluacion.modulo === 'ley' ? 'Protección de Datos' : 'Ciberseguridad'}`,
        tareas: tareasBase,
        hitos,
        resumen: resumenCyber,
        entregables: entregablesBase,
        fases: {}
      };
    }
  }, [evaluacion.modulo, evaluacion.respuestas, isTI]);

  const renderTaskBar = (tarea) => {
    const bars = [];
    for (let i = 1; i <= 12; i++) {
      const isActive = i >= tarea.mes_inicio && i <= tarea.mes_fin;
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
