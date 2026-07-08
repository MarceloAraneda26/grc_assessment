import { useContext, useEffect, useState, useMemo } from 'react';
import { EvaluacionContext } from '../context/EvaluacionContext';
import { listarEvaluaciones, obtenerEvaluacion } from '../services/api';
import { evaluacionEstaCompleta } from '../utils/evaluacion-helpers';
import '../styles/HistorialModal.css';

const MODULO_LABELS = { cyber: 'Ciberseguridad', ley: 'Protección de Datos', ti: 'Levantamiento TI' };

export const HistorialModal = ({ onClose }) => {
  const { cargarEvaluacionCompleta } = useContext(EvaluacionContext);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [abriendoId, setAbriendoId] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroModulo, setFiltroModulo] = useState('todos');

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      try {
        const resultado = await listarEvaluaciones();
        setEvaluaciones(resultado.evaluaciones || []);
      } catch (err) {
        setError('No se pudo cargar el historial: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const evaluacionesFiltradas = useMemo(() => {
    return evaluaciones.filter(ev => {
      const coincideBusqueda = !busqueda.trim() || (ev.RazonSocial || '').toLowerCase().includes(busqueda.trim().toLowerCase());
      const coincideModulo = filtroModulo === 'todos' || ev.Modulo === filtroModulo;
      return coincideBusqueda && coincideModulo;
    });
  }, [evaluaciones, busqueda, filtroModulo]);

  const handleAbrir = async (evalId) => {
    setAbriendoId(evalId);
    setError('');
    try {
      const response = await obtenerEvaluacion(evalId);
      cargarEvaluacionCompleta({
        id: response.id,
        modulo: response.modulo,
        perfil: response.perfil,
        respuestas: response.respuestas,
        completada: evaluacionEstaCompleta(response.modulo, response.respuestas, response.completada),
      });
      onClose();
    } catch (err) {
      setError('Error al abrir evaluación: ' + err.message);
    } finally {
      setAbriendoId(null);
    }
  };

  return (
    <div className="historial-overlay" onClick={onClose}>
      <div className="historial-modal" onClick={(e) => e.stopPropagation()}>
        <div className="historial-header">
          <h2>📚 Historial de Evaluaciones</h2>
          <button className="historial-close" onClick={onClose} title="Cerrar">✕</button>
        </div>

        <div className="historial-filtros">
          <input
            type="text"
            placeholder="Buscar por Razón Social..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="historial-buscar"
          />
          <select value={filtroModulo} onChange={(e) => setFiltroModulo(e.target.value)} className="historial-select">
            <option value="todos">Todos los módulos</option>
            <option value="cyber">Ciberseguridad</option>
            <option value="ley">Protección de Datos</option>
            <option value="ti">Levantamiento TI</option>
          </select>
        </div>

        {error && <div className="historial-error">{error}</div>}

        <div className="historial-lista">
          {loading && <div className="historial-vacio">Cargando...</div>}
          {!loading && evaluacionesFiltradas.length === 0 && (
            <div className="historial-vacio">No hay evaluaciones que coincidan con la búsqueda.</div>
          )}
          {!loading && evaluacionesFiltradas.map(ev => (
            <div key={ev.Id} className="historial-item">
              <div className="historial-item-info">
                <div className="historial-item-empresa">{ev.RazonSocial}</div>
                <div className="historial-item-meta">
                  <span className={`historial-badge modulo-${ev.Modulo}`}>{MODULO_LABELS[ev.Modulo] || ev.Modulo}</span>
                  <span className={`historial-badge estado-${ev.Completada ? 'completa' : 'incompleta'}`}>
                    {ev.Completada ? '✅ Completada' : '⏳ Incompleta'}
                  </span>
                  <span className="historial-fecha">
                    {(() => {
                      const fecha = ev.FechaActualizacion ? new Date(ev.FechaActualizacion) : null;
                      return fecha && !isNaN(fecha) ? fecha.toLocaleDateString() : '';
                    })()}
                  </span>
                </div>
              </div>
              <button
                className="btn btn-primary historial-abrir"
                onClick={() => handleAbrir(ev.Id)}
                disabled={abriendoId === ev.Id}
              >
                {abriendoId === ev.Id ? 'Abriendo...' : (ev.Completada ? 'Ver resultados' : 'Retomar')}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
