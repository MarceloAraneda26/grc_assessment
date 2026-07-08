import { useContext } from 'react';
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
