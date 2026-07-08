import { useContext, useState } from 'react';
import { EvaluacionContext } from '../context/EvaluacionContext';
import { HistorialModal } from './HistorialModal';
import { exportarEvaluacionExcel } from '../utils/exportarExcel';
import '../styles/Topbar.css';

const MODULO_LABELS = { cyber: 'Ciberseguridad', ley: 'Protección de Datos', ti: 'Levantamiento TI' };

export const Topbar = () => {
  const { evaluacion, reiniciar, irAFase } = useContext(EvaluacionContext);
  const [darkMode, setDarkMode] = useState(false);
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

  const handleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark');
  };

  const steps = [
    { id: 1, label: 'Perfil', num: 1 },
    { id: 2, label: 'Cuestionario', num: 2 },
    { id: 3, label: 'Resultados', num: 3 },
    { id: 4, label: 'Roadmap', num: 4 },
  ];

  return (
    <div className="topbar">
      <div className="topbar-left">
        <button
          className="logo"
          onClick={handleHome}
          title="Volver al inicio"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <div className="logo-icon">GRC</div>
          <div className="logo-text">
            <div className="logo-main">TIBOX</div>
            <div className="logo-tag">Assessment</div>
          </div>
        </button>
      </div>

      <div className="topbar-center">
        {evaluacion.perfil?.empresa && (
          <div className="profile-pill">
            <span className="pill-dot"></span>
            <span className="pill-text">
              {evaluacion.perfil.empresa}
              {evaluacion.modulo && ` · ${MODULO_LABELS[evaluacion.modulo] || evaluacion.modulo}`}
            </span>
          </div>
        )}
      </div>

      <div className="topbar-right">
        <button className="btn-icon" onClick={() => setShowHistorial(true)} title="Ver evaluaciones anteriores">
          📚 Historial
        </button>
        <div className="divider"></div>
        {(evaluacion.fase === 3 || evaluacion.fase === 4) && (
          <>
            <button className="btn-icon" onClick={handleExport} title="Exportar a Excel (Resultados + Roadmap)" disabled={exportando}>
              {exportando ? '⏳ Exportando...' : '⬇ Export Excel'}
            </button>
            <div className="divider"></div>
          </>
        )}
        <button className="btn-icon" onClick={handleDarkMode} title="Tema oscuro">
          {darkMode ? '☀️' : '🌙'}
        </button>
        <div className="divider"></div>
        <div className="steps">
          {steps.map((step, idx) => {
            const alcanzable = step.num <= evaluacion.fase && (step.num < 2 || evaluacion.id);
            return (
              <div key={step.id}>
                <button
                  className={`step ${evaluacion.fase === step.num ? 'active' : evaluacion.fase > step.num ? 'done' : ''} ${!alcanzable ? 'disabled' : ''}`}
                  onClick={() => handleStepClick(step)}
                  disabled={!alcanzable}
                  title={alcanzable ? `Ir a ${step.label}` : 'Aún no disponible'}
                >
                  {step.label}
                </button>
                {idx < steps.length - 1 && <span className="step-divider">›</span>}
              </div>
            );
          })}
        </div>
      </div>

      {showHistorial && <HistorialModal onClose={() => setShowHistorial(false)} />}
    </div>
  );
};
