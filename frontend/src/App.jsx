import { useContext, useEffect } from 'react';
import { EvaluacionProvider, EvaluacionContext } from './context/EvaluacionContext';
import { useUrlSync } from './hooks/useUrlSync';
import { Topbar } from './components/Topbar';
import { ModuloSelect } from './components/ModuloSelect';
import { PerfilForm } from './components/PerfilForm';
import { CuestionarioPage } from './pages/CuestionarioPage';
import { ResultadosPage } from './pages/ResultadosPage';
import { RoadmapPage } from './pages/RoadmapPage';
import './App.css';

function AppContent() {
  const { evaluacion, irAFase } = useContext(EvaluacionContext);
  useUrlSync(evaluacion.fase, irAFase);

  // Si el usuario recarga la página estando en una fase avanzada, el estado
  // en memoria se pierde pero el hash de la URL sigue apuntando ahí. Sin
  // datos cargados esa vista quedaría en blanco, así que se vuelve al inicio.
  useEffect(() => {
    if (evaluacion.fase > 0 && !evaluacion.modulo) {
      irAFase(0);
      window.location.hash = '#/inicio';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="app">
      <Topbar />
      <div className="page-container">
        {evaluacion.fase === 0 && <ModuloSelect />}
        {evaluacion.fase === 1 && <PerfilForm />}
        {evaluacion.fase === 2 && <CuestionarioPage />}
        {evaluacion.fase === 3 && <ResultadosPage />}
        {evaluacion.fase === 4 && <RoadmapPage />}
      </div>
    </div>
  );
}

function App() {
  return (
    <EvaluacionProvider>
      <AppContent />
    </EvaluacionProvider>
  );
}

export default App;
