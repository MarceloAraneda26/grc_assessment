import { useContext, useEffect, useState, useMemo } from 'react';
import { EvaluacionContext } from '../context/EvaluacionContext';
import { listarEvaluaciones, obtenerEvaluacion } from '../services/api';
import { evaluacionEstaCompleta } from '../utils/evaluacion-helpers';

const MODULO_LABELS = { cyber: 'Ciberseguridad', ley: 'Gobierno y Cumplimiento', ti: 'Levantamiento TI' };

const MODULO_BADGE = {
  cyber: 'bg-blue-light text-blue',
  ley: 'bg-purple-light text-brand-purple',
  ti: 'bg-green-light text-brand-green',
};

const badgeClass = 'text-[0.68rem] font-bold px-2 py-0.5 rounded-xl whitespace-nowrap';

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[500] p-5" onClick={onClose}>
      <div
        className="bg-surface border border-border rounded-[20px] w-full max-w-[640px] max-h-[80vh] flex flex-col shadow-[0_12px_32px_rgba(0,0,0,0.2)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="m-0 text-[1.05rem] text-text">📚 Historial de Evaluaciones</h2>
          <button
            className="bg-surface-2 border border-border rounded-md w-7 h-7 cursor-pointer text-text-secondary text-[0.85rem] hover:bg-surface-3"
            onClick={onClose}
            title="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="flex gap-2 px-5 pt-4">
          <input
            type="text"
            placeholder="Buscar por Razón Social..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="flex-1 px-3 py-2 border border-border rounded-md bg-surface-2 text-text text-[0.85rem]"
          />
          <select
            value={filtroModulo}
            onChange={(e) => setFiltroModulo(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-surface-2 text-text text-[0.85rem]"
          >
            <option value="todos">Todos los módulos</option>
            <option value="cyber">Ciberseguridad</option>
            <option value="ley">Gobierno y Cumplimiento</option>
            <option value="ti">Levantamiento TI</option>
          </select>
        </div>

        {error && <div className="mx-5 mt-3 px-3 py-2.5 bg-red-light text-brand-red rounded-md text-[0.85rem]">{error}</div>}

        <div className="px-5 pb-5 pt-4 overflow-y-auto flex flex-col gap-2">
          {loading && <div className="text-center text-text-muted py-7 text-[0.9rem]">Cargando...</div>}
          {!loading && evaluacionesFiltradas.length === 0 && (
            <div className="text-center text-text-muted py-7 text-[0.9rem]">No hay evaluaciones que coincidan con la búsqueda.</div>
          )}
          {!loading && evaluacionesFiltradas.map(ev => (
            <div key={ev.Id} className="flex items-center justify-between gap-3 px-3.5 py-3 bg-surface-2 border border-border rounded-lg">
              <div>
                <div className="font-bold text-text text-[0.9rem] mb-1">{ev.RazonSocial}</div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`${badgeClass} ${MODULO_BADGE[ev.Modulo] || 'bg-surface-3 text-text-muted'}`}>
                    {MODULO_LABELS[ev.Modulo] || ev.Modulo}
                  </span>
                  <span className={`${badgeClass} ${ev.Completada ? 'bg-green-light text-brand-green' : 'bg-yellow-light text-brand-yellow'}`}>
                    {ev.Completada ? '✅ Completada' : '⏳ Incompleta'}
                  </span>
                  <span className="text-[0.72rem] text-text-muted">
                    {(() => {
                      const fecha = ev.FechaActualizacion ? new Date(ev.FechaActualizacion) : null;
                      return fecha && !isNaN(fecha) ? fecha.toLocaleDateString() : '';
                    })()}
                  </span>
                </div>
              </div>
              <button
                className="btn btn-primary shrink-0 px-3.5 py-1.5 text-[0.8rem]"
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
