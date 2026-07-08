import { useContext, useMemo } from 'react';
import { EvaluacionContext } from '../context/EvaluacionContext';
import { getDatosRoadmap } from '../utils/reporte-data';
import { Card } from '../components/ui/Card';

const PRIORIDAD_BG = { 1: 'bg-brand-red', 2: 'bg-brand-yellow', 3: 'bg-blue' };

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
      bars.push(
        <div key={i} className="relative h-7 bg-transparent border-r border-surface-2">
          {isActive && (
            <div className={`h-full rounded-[3px] mx-1 my-0.5 ${tarea.prioridad ? PRIORIDAD_BG[tarea.prioridad] : 'bg-accent'}`} />
          )}
        </div>
      );
    }
    return bars;
  };

  return (
    <div className="animate-fade-in-up w-full max-w-[1280px] mx-auto px-7 pb-[60px] pt-6">
      <div className="mb-7">
        <h1 className="text-2xl font-extrabold mb-1.5 text-text">{titulo}</h1>
        <p className="text-[0.82rem] text-text-secondary">{subtitulo}</p>
      </div>

      <Card className="p-7 mb-6 overflow-x-auto">
        <div className="grid grid-cols-[180px_repeat(12,1fr)] min-w-[900px] mb-4">
          <div className="text-[0.66rem] font-extrabold text-text-muted uppercase tracking-wide px-1 py-2 text-center border-r border-surface-2">Tareas</div>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
            <div key={m} className="text-[0.66rem] font-extrabold text-text-muted uppercase tracking-wide px-1 py-2 text-center border-r border-surface-2">
              M{m}
            </div>
          ))}
        </div>

        {tareas.map(tarea => (
          <div key={tarea.id} className="grid grid-cols-[180px_repeat(12,1fr)] min-w-[900px] mb-3.5 items-center min-h-[48px]">
            <div className="px-3 py-2 text-[0.78rem] font-semibold text-text border-r-2 border-border bg-surface-2 whitespace-nowrap overflow-hidden text-ellipsis">
              {tarea.titulo}
            </div>
            {renderTaskBar(tarea)}
          </div>
        ))}
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {hitos.map((hito, i) => (
          <Card key={i} className="p-4 flex flex-col gap-2.5">
            <div className="text-[2rem] font-black text-accent tracking-[-1px]">{hito.num}</div>
            <div className="text-[0.78rem] uppercase tracking-wide text-text-muted font-semibold">{hito.label}</div>
            <div className="text-[0.8rem] text-text-secondary leading-snug">{hito.desc}</div>
          </Card>
        ))}
      </div>

      <Card className="p-5 mb-6 border-l-4 border-l-accent">
        <div className="text-sm font-bold uppercase tracking-wide text-text-secondary mb-2.5">Resumen Ejecutivo</div>
        <div className="text-[0.82rem] leading-relaxed text-text-secondary">{resumen}</div>
      </Card>

      <Card className="p-5 mb-6">
        <div className="text-sm font-bold uppercase tracking-wide text-text-secondary mb-3">Entregables Principales</div>
        <div className="flex flex-col gap-2">
          {entregables.map((ent, i) => (
            <div key={i} className="flex items-start gap-2.5 p-2.5 bg-surface-2 rounded-md text-[0.8rem]">
              <div className="shrink-0 w-[18px] h-[18px] border-2 border-accent rounded-[3px] flex items-center justify-center text-accent text-[0.7rem] font-black">✓</div>
              <div className="flex-1 text-text-secondary">{ent}</div>
            </div>
          ))}
        </div>
      </Card>

      {isTI && Object.keys(fases).length > 0 && (
        <Card className="p-5 mb-6">
          <div className="text-sm font-bold uppercase tracking-wide text-text-secondary mb-4">Fases de Implementación</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(fases).map(([fase, items]) => (
              <div key={fase} className="bg-surface-2 border border-border rounded-xl p-3.5 border-l-4 border-l-accent">
                <div className="text-[0.82rem] font-bold text-text mb-2.5">{fase}</div>
                <ul className="list-none p-0 m-0 flex flex-col gap-1.5">
                  {items.map((item, i) => (
                    <li key={i} className="text-[0.78rem] text-text-secondary leading-snug flex gap-1.5">
                      <span className="text-accent font-bold shrink-0">→</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="flex gap-2.5 flex-wrap max-sm:flex-col">
        <button onClick={() => irAFase(3)} className="btn btn-secondary max-sm:w-full max-sm:justify-center">
          ← Resultados
        </button>
        <button
          onClick={() => { if (window.confirm('¿Iniciar nueva evaluación?')) { reiniciar(); irAFase(0); window.location.hash = '#/inicio'; } }}
          className="btn btn-primary max-sm:w-full max-sm:justify-center"
        >
          Nueva Evaluación →
        </button>
      </div>
    </div>
  );
};
