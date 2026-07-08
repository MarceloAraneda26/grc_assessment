import { useContext, useState } from 'react';
import { EvaluacionContext } from '../context/EvaluacionContext';
import '../styles/Topbar.css';

export const Topbar = () => {
  const { evaluacion, reiniciar, irAFase } = useContext(EvaluacionContext);
  const [darkMode, setDarkMode] = useState(false);

  const handleHome = () => {
    if (window.confirm('¿Volver al inicio? Se perderán los datos actuales.')) {
      reiniciar();
      irAFase(0);
      window.location.hash = '#/inicio';
    }
  };

  const handleExport = () => {
    try {
      const data = {
        perfil: evaluacion.perfil || {},
        respuestas: evaluacion.respuestas || {},
        fecha: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tibox-assessment.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export error:', e);
    }
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        // TODO: Implementar lógica de import
        alert('Import: ' + data.perfil?.empresa || 'datos importados');
      } catch (err) {
        alert('Archivo no válido');
      }
    };
    reader.readAsText(file);
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
            <span className="pill-text">{evaluacion.perfil.empresa}</span>
          </div>
        )}
      </div>

      <div className="topbar-right">
        {(evaluacion.fase === 3 || evaluacion.fase === 4) && (
          <>
            <button className="btn-icon" onClick={handleExport} title="Exportar">
              ⬇ Export
            </button>
            <label className="btn-icon" title="Importar">
              ⬆ Import
              <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
            </label>
            <div className="divider"></div>
          </>
        )}
        <button className="btn-icon" onClick={handleDarkMode} title="Tema oscuro">
          {darkMode ? '☀️' : '🌙'}
        </button>
        <div className="divider"></div>
        <div className="steps">
          {steps.map((step, idx) => (
            <div key={step.id}>
              <button
                className={`step ${evaluacion.fase === step.num ? 'active' : evaluacion.fase > step.num ? 'done' : ''}`}
              >
                {step.label}
              </button>
              {idx < steps.length - 1 && <span className="step-divider">›</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
