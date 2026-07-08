import { useContext, useEffect, useState } from 'react';
import { EvaluacionContext } from '../context/EvaluacionContext';
import { HistorialModal } from './HistorialModal';
import { exportarEvaluacionExcel } from '../utils/exportarExcel';
import { asset } from '../utils/asset';

const MODULO_LABELS = { cyber: 'Ciberseguridad', ley: 'Gobierno y Cumplimiento', ti: 'Levantamiento TI' };

const btnIcon = 'bg-surface-2 border-[1.5px] border-border rounded-md px-2.5 py-1 text-[0.72rem] font-bold text-text-secondary whitespace-nowrap transition-colors duration-200 hover:border-text hover:bg-surface-3 disabled:opacity-55 disabled:cursor-not-allowed';

export const Topbar = () => {
  const { evaluacion, reiniciar, irAFase } = useContext(EvaluacionContext);
  // El script inline de index.html ya aplicó (o no) la clase "dark" a
  // <html> antes del primer paint, según localStorage/preferencia del
  // sistema; acá solo se lee ese estado inicial para que el ícono del
  // toggle y <body> (por compatibilidad con CSS existente) arranquen en
  // sync con lo que ya se ve en pantalla.
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
  const [showHistorial, setShowHistorial] = useState(false);
  const [exportando, setExportando] = useState(false);

  const handleHome = () => {
    // En fase 0 no hay nada que perder, así que no hace falta confirmar.
    if (evaluacion.fase === 0) {
      return;
    }
    // A partir del cuestionario, cada respuesta ya quedó guardada en el
    // servidor: no se pierde nada real, solo se sale de la sesión actual.
    const mensaje = evaluacion.id
      ? '¿Volver al inicio? Tu progreso ya está guardado, puedes retomarlo luego desde el Historial.'
      : '¿Volver al inicio? Se perderán los datos del perfil sin guardar.';
    if (window.confirm(mensaje)) {
      reiniciar();
      irAFase(0);
      window.location.hash = '#/inicio';
    }
  };

  const handleStepClick = (step) => {
    // Solo permite navegar a fases ya alcanzadas, y solo si hay una
    // evaluación activa para las fases posteriores al perfil.
    if (step.num > evaluacion.fase) return;
    if (step.num >= 2 && !evaluacion.id) return;
    irAFase(step.num);
  };

  const handleExport = async () => {
    setExportando(true);
    try {
      await exportarEvaluacionExcel(evaluacion);
    } catch (e) {
      console.error('Export error:', e);
      alert('Error al exportar a Excel: ' + e.message);
    } finally {
      setExportando(false);
    }
  };

  // <html> ya arrancó con la clase correcta gracias al script inline de
  // index.html; acá solo se replica en <body> para que el CSS antiguo
  // (selectores "body.dark ...", aún vigente en páginas no migradas a
  // Tailwind) se mantenga sincronizado con el mismo estado.
  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDarkMode = () => {
    const nuevoValor = !darkMode;
    setDarkMode(nuevoValor);
    document.documentElement.classList.toggle('dark', nuevoValor);
    document.body.classList.toggle('dark', nuevoValor);
    try {
      localStorage.setItem('tibox-theme', nuevoValor ? 'dark' : 'light');
    } catch (e) {}
  };

  const steps = [
    { id: 1, label: 'Perfil', num: 1 },
    { id: 2, label: 'Cuestionario', num: 2 },
    { id: 3, label: 'Resultados', num: 3 },
    { id: 4, label: 'Roadmap', num: 4 },
  ];

  // Motivo explícito del bloqueo (no solo un color apagado): para que el
  // candado tenga sentido, no basta con "aún no disponible".
  const motivoBloqueo = (step) => {
    if (evaluacion.fase === 0) return 'Selecciona primero un módulo de evaluación';
    if (step.num >= 2 && !evaluacion.id) return 'Completa el Perfil primero';
    return `Completa "${steps[step.num - 2]?.label}" primero`;
  };

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between gap-2 h-[52px] px-5 bg-surface border-b border-border shadow-sm max-sm:flex-wrap max-sm:h-auto max-sm:px-3 max-sm:py-2">
      <div className="shrink-0">
        <button
          className="flex items-center gap-2 bg-transparent border-none cursor-pointer p-0"
          onClick={handleHome}
          title="Volver al inicio"
        >
          <img
            src={asset(darkMode ? 'images/logo_tibox_fondo_oscuro.png' : 'images/logo_tibox_fondo_claro.png')}
            alt="TIBOX"
            className="h-[22px] w-auto block"
          />
          <div className="text-[0.52rem] uppercase tracking-[1.2px] text-text-secondary font-medium leading-none">Assessment</div>
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center max-sm:order-3 max-sm:basis-full max-sm:justify-start">
        {evaluacion.perfil?.empresa && (
          <div className="flex items-center gap-1 bg-surface-2 border border-border rounded-full px-2.5 py-0.5 text-[0.7rem] text-text-secondary max-w-[160px] max-sm:max-w-full">
            <span className="w-[5px] h-[5px] rounded-full bg-accent-bright shrink-0"></span>
            <span className="overflow-hidden text-ellipsis whitespace-nowrap">
              {evaluacion.perfil.empresa}
              {evaluacion.modulo && ` · ${MODULO_LABELS[evaluacion.modulo] || evaluacion.modulo}`}
            </span>
          </div>
        )}
      </div>

      <div className="shrink-0 flex items-center gap-1.5 flex-wrap">
        <button className={btnIcon} onClick={() => setShowHistorial(true)} title="Ver evaluaciones anteriores">
          📚 Historial
        </button>
        <div className="w-px h-[18px] bg-border" />
        {(evaluacion.fase === 3 || evaluacion.fase === 4) && (
          <>
            <button className={btnIcon} onClick={handleExport} title="Exportar a Excel (Resultados + Roadmap)" disabled={exportando}>
              {exportando ? '⏳ Exportando...' : '⬇ Export Excel'}
            </button>
            <div className="w-px h-[18px] bg-border" />
          </>
        )}
        <button className={btnIcon} onClick={handleDarkMode} title="Tema oscuro">
          {darkMode ? '☀️' : '🌙'}
        </button>
        <div className="w-px h-[18px] bg-border max-sm:hidden" />
        <div className="flex items-center flex-wrap max-sm:hidden">
          {steps.map((step, idx) => {
            const alcanzable = step.num <= evaluacion.fase && (step.num < 2 || evaluacion.id);
            const activo = evaluacion.fase === step.num;
            const hecho = evaluacion.fase > step.num;
            return (
              <div key={step.id} className="flex items-center">
                <button
                  className={[
                    'flex items-center gap-1 px-2.5 py-1 rounded-full border-none text-[0.65rem] font-bold uppercase tracking-wide transition-colors duration-200',
                    activo
                      ? 'bg-accent text-white'
                      : hecho
                        ? 'text-text bg-transparent hover:bg-surface-2 cursor-pointer'
                        : 'text-nav-disabled bg-transparent cursor-not-allowed',
                  ].join(' ')}
                  onClick={() => handleStepClick(step)}
                  disabled={!alcanzable}
                  title={alcanzable ? `Ir a ${step.label}` : motivoBloqueo(step)}
                >
                  {hecho && <span className="text-accent">●</span>}
                  {!alcanzable && <span aria-hidden="true">🔒</span>}
                  {step.label}
                </button>
                {idx < steps.length - 1 && <span className="text-border text-[0.7rem] px-0.5">›</span>}
              </div>
            );
          })}
        </div>
      </div>

      {showHistorial && <HistorialModal onClose={() => setShowHistorial(false)} />}
    </div>
  );
};
