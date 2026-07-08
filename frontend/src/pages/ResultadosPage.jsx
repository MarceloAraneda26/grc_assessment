import { useContext, useState, useMemo, useEffect } from 'react';
import { EvaluacionContext } from '../context/EvaluacionContext';
import { getDatosResultados } from '../utils/reporte-data';
import { guardarResultado } from '../services/api';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { MetodologiaModal } from '../components/MetodologiaModal';

export const ResultadosPage = () => {
  const { evaluacion, irAFase } = useContext(EvaluacionContext);
  const [selectedDominio, setSelectedDominio] = useState(null);
  const [guardandoResultado, setGuardandoResultado] = useState(false);
  const [showMetodologia, setShowMetodologia] = useState(false);

  const isTI = evaluacion.modulo === 'ti';

  const { titulo, promedio, nivel, dominios, scoresPorLey, cumplimientoGlobal, brechas, preguntasAplicables, brechasDetalle } = useMemo(
    () => getDatosResultados(evaluacion),
    [evaluacion.modulo, evaluacion.respuestas]
  );

  const drillDominio = selectedDominio || (dominios.length > 0 ? dominios[0].nombre : null);
  const drillPreguntas = dominios.find(d => d.nombre === drillDominio)?.preguntas || [];
  // Las "hijas" cuyo padre fue "No" nunca se preguntan en el wizard (quedan
  // sin respuesta por herencia condicional) pero siguen en el denominador
  // del score — se agrupan aparte para no generar ruido visual en el detalle.
  const drillRespondidas = drillPreguntas.filter(q => q.valorCrudo !== undefined);
  const drillSinResponder = drillPreguntas.filter(q => q.valorCrudo === undefined);

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
          resumenEjecutivo: `${titulo}: ${nivel.label} (${Math.round(promedio)}%). Áreas prioritarias: ${areasDebiles.map(a => a.nombre).join(', ')}.`,
          // Cuestionario unificado Eje 1 (Ley 21.663 + 21.719): doble métrica
          // por ley. undefined para cyber/ti — el backend los guarda como NULL.
          scoresPorLey,
          cumplimientoGlobal,
          brechas,
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
      <svg className="w-[180px] h-[180px]" viewBox="0 0 180 180">
        <circle cx="90" cy="90" r={radius} fill="none" stroke="var(--surface-3)" strokeWidth="12" />
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
    <div className="animate-fade-in-up w-full max-w-[1280px] mx-auto px-7 pb-[60px] pt-6">
      <div className="mb-7">
        <h1 className="text-2xl font-extrabold mb-1.5 text-text">Resultados de la Evaluación</h1>
        <p className="text-[0.82rem] text-text-secondary">Análisis de {titulo}</p>
      </div>

      <Card className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center p-7 mb-6">
        <div className="flex justify-center items-center">
          <SVGGauge valor={promedio} />
        </div>
        <div className="flex flex-col gap-3.5">
          <div className="flex items-baseline gap-2">
            <div className="text-[2.8rem] font-black text-text tracking-[-1px]">{promedio}%</div>
            <div className="text-[0.78rem] text-text-muted uppercase font-semibold">Madurez {isTI ? 'TI' : 'Global'}</div>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-2 w-fit">
            <div className="w-2 h-2 rounded-full" style={{ background: nivel.dot }} />
            <div className="text-[0.86rem] font-semibold text-text">{nivel.label}</div>
          </div>
          <div className="text-[0.8rem] leading-relaxed text-text-secondary">
            {promedio < 25 && (isTI ? 'Requiere intervención inmediata en infraestructura y controles' : 'Requiere intervención inmediata en procesos fundamentales')}
            {promedio >= 25 && promedio < 50 && (isTI ? 'Se necesitan mejoras significativas en inventario y seguridad' : 'Se necesitan mejoras significativas en gobernanza y controles')}
            {promedio >= 50 && promedio < 75 && (isTI ? 'Buena infraestructura, enfocarse en monitoreo y proveedores' : 'Buena madurez, enfocarse en optimización y automatización')}
            {promedio >= 75 && (isTI ? 'Infraestructura optimizada, mantener y mejorar continuamente' : 'Nivel de madurez avanzado, mantener y mejorar continuamente')}
          </div>
          {cumplimientoGlobal !== undefined && (
            <div className="text-[0.78rem] text-text-secondary">
              <b className="text-text">{cumplimientoGlobal}%</b> cumplimiento (nivel objetivo ≥ 2) · <b className="text-text">{brechas}</b> brecha{brechas === 1 ? '' : 's'} de {preguntasAplicables} preguntas aplicables
            </div>
          )}
          <button
            className="flex items-center gap-1 bg-transparent border-none text-text-muted text-xs cursor-pointer p-0 w-fit transition-colors duration-200 hover:text-text-secondary"
            onClick={() => setShowMetodologia(true)}
          >
            <span className="text-[0.875rem]" aria-hidden="true">ⓘ</span> Metodología
          </button>
        </div>
      </Card>

      {showMetodologia && <MetodologiaModal onClose={() => setShowMetodologia(false)} />}

      {scoresPorLey && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {scoresPorLey.map(s => (
            <Card key={s.ley} className="p-5">
              <div className="text-[0.72rem] font-bold uppercase tracking-wide text-text-muted mb-2">{s.label}</div>
              <div className="flex items-baseline gap-2 mb-2.5">
                <div className="text-[2rem] font-black text-text tracking-[-1px]">{s.promedio}%</div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: s.nivel.dot }} />
                  <div className="text-[0.78rem] font-semibold text-text">{s.nivel.label}</div>
                </div>
              </div>
              <ProgressBar value={s.promedio} className="mb-2.5" />
              <div className="text-[0.72rem] text-text-secondary">
                Cumplimiento {s.cumplimiento}% · {s.brechas} brecha{s.brechas === 1 ? '' : 's'} de {s.aplicables} preguntas aplicables
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {dominios.map(dom => (
          <Card
            key={dom.nombre}
            as="button"
            clickable
            active={selectedDominio === dom.nombre}
            className="p-4 text-left"
            onClick={() => setSelectedDominio(dom.nombre)}
          >
            <div className="flex justify-between items-baseline mb-2.5">
              <div className="text-[0.86rem] font-bold text-text">{dom.nombre}</div>
              <div className="text-[1.1rem] font-extrabold text-accent">{dom.puntuacion}%</div>
            </div>
            <ProgressBar value={dom.puntuacion} className="mb-2" />
            <div className="text-[0.68rem] text-text-muted font-semibold uppercase tracking-wide">
              {dom.puntuacion < 50 ? 'Mejorar' : dom.puntuacion < 75 ? 'Avanzar' : 'Optimizar'}
            </div>
          </Card>
        ))}
      </div>

      {drillDominio && (
        <Card className="p-5 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm font-bold uppercase tracking-wide text-text-secondary">Detalle: {drillDominio}</div>
          </div>
          <div className="flex flex-col gap-2">
            {drillRespondidas.map((q, idx) => (
              <div key={idx} className="flex justify-between items-center p-2.5 bg-surface-2 rounded-md text-[0.78rem]">
                <div className="flex-1 text-text-secondary">{q.texto}</div>
                {typeof q.valorCrudo === 'number' ? (
                  <Badge level={q.valorCrudo}>{q.respuesta}</Badge>
                ) : (
                  <Badge texto={q.valorCrudo}>{q.respuesta}</Badge>
                )}
              </div>
            ))}
          </div>

          {drillSinResponder.length > 0 && (
            <details className="mt-3 group rounded-lg border border-border bg-surface-2 overflow-hidden">
              <summary className="cursor-pointer list-none flex items-center justify-between gap-2 px-3.5 py-2.5 text-[0.78rem] font-semibold text-text-secondary select-none">
                <span>{drillSinResponder.length} pregunta{drillSinResponder.length === 1 ? '' : 's'} no aplicable{drillSinResponder.length === 1 ? '' : 's'} (condicional{drillSinResponder.length === 1 ? '' : 'es'})</span>
                <span className="transition-transform duration-200 group-open:rotate-180" aria-hidden="true">▾</span>
              </summary>
              <div className="flex flex-col gap-2 px-3.5 pb-3.5 pt-1">
                {drillSinResponder.map((q, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2.5 bg-surface rounded-md text-[0.78rem]">
                    <div className="flex-1 text-text-secondary">{q.texto}</div>
                    <Badge texto="Sin respuesta">{q.respuesta}</Badge>
                  </div>
                ))}
              </div>
            </details>
          )}
        </Card>
      )}

      {/* Contenido comercial (post-diagnóstico): solo aparece por brecha
          individual (nivel < 2) — una pregunta ya cumplida no necesita
          "cómo ayuda TIBOX" ni entregable. */}
      {brechasDetalle && brechasDetalle.length > 0 && (
        <Card className="p-5 mb-6">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="text-sm font-bold uppercase tracking-wide text-text-secondary">Brechas detectadas</div>
            <div className="text-[0.72rem] text-text-muted">
              {brechasDetalle.length} pregunta{brechasDetalle.length === 1 ? '' : 's'} bajo el nivel objetivo
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {brechasDetalle.map(b => (
              <details key={b.id} className="group rounded-lg border border-border bg-surface-2 overflow-hidden">
                <summary className="cursor-pointer list-none flex items-center justify-between gap-3 px-3.5 py-2.5 text-[0.78rem] select-none">
                  <div className="flex-1 min-w-0">
                    <div className="text-text-secondary">{b.texto}</div>
                    <div className="text-[0.68rem] text-text-muted mt-0.5">{b.dominio}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge level={b.nivel}>Nivel {b.nivel}/{b.maximo}</Badge>
                    <span className="transition-transform duration-200 group-open:rotate-180 text-text-muted" aria-hidden="true">▾</span>
                  </div>
                </summary>
                {(b.comoAyudaTibox || b.entregableAsociado) && (
                  <div className="px-3.5 pb-3.5 pt-1">
                    {b.comoAyudaTibox && (
                      <div className="border-l-2 border-blue pl-3 py-1 mb-2.5">
                        <div className="text-[0.66rem] font-bold uppercase tracking-wide text-blue mb-1">Cómo te ayudamos</div>
                        <p className="text-[0.78rem] text-text-secondary leading-relaxed">{b.comoAyudaTibox}</p>
                      </div>
                    )}
                    {b.entregableAsociado && (
                      <span className="inline-block rounded-full bg-blue-light text-blue px-3 py-1 text-xs font-semibold">
                        📄 {b.entregableAsociado}
                      </span>
                    )}
                  </div>
                )}
              </details>
            ))}
          </div>
        </Card>
      )}

      <div className="flex gap-2.5 flex-wrap max-sm:flex-col">
        <button onClick={() => irAFase(2)} className="btn btn-secondary max-sm:w-full max-sm:justify-center">
          ← Volver
        </button>
        <button onClick={() => irAFase(4)} className="btn btn-primary max-sm:w-full max-sm:justify-center">
          Ver Roadmap →
        </button>
      </div>
    </div>
  );
};
