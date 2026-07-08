import { useContext, useState } from 'react';
import { EvaluacionContext } from '../context/EvaluacionContext';
import { crearEvaluacion, buscarEvaluacionesPorRazonSocial, obtenerEvaluacion, verificarRazonSocial } from '../services/api';
import { evaluacionEstaCompleta } from '../utils/evaluacion-helpers';
import '../styles/PerfilForm.css';

export const PerfilForm = () => {
  const { evaluacion, guardarPerfil, guardarEvaluacionId, cargarEvaluacionCompleta, irAFase } = useContext(EvaluacionContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHistorial, setShowHistorial] = useState(false);
  const [historial, setHistorial] = useState(null);
  const [razonSocialExiste, setRazonSocialExiste] = useState(false);
  const [verificandoRazonSocial, setVerificandoRazonSocial] = useState(false);
  const [perfil, setPerfil] = useState(evaluacion.perfil || {
    empresa: '',
    industria: '',
    usuarios: '',
    anci: 'general',
    infra: 'onpremise',
    ms: 'no',
    gestion: 'nadie',
    incidentes: 'no',
    nombre: '',
    cargo: '',
    email: '',
    tel: '',
    datosSensibles: evaluacion.modulo === 'ley' ? 'no' : false,
    decisionesAuto: evaluacion.modulo === 'ley' ? 'no' : false,
    transferencia: evaluacion.modulo === 'ley' ? 'no' : false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPerfil(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');

    // Verificar Razón Social en tiempo real
    if (name === 'empresa') {
      handleVerificarRazonSocial(value);
    }
  };

  const validateForm = async () => {
    if (!perfil.empresa?.trim()) return 'Razón Social es requerida';
    if (!perfil.industria) return 'Industria es requerida';
    if (!perfil.usuarios || parseInt(perfil.usuarios) <= 0) return 'Número de usuarios válido es requerido';
    if (!perfil.nombre?.trim()) return 'Nombre de contacto es requerido';
    if (!perfil.email?.trim()) return 'Email es requerido';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(perfil.email)) return 'Email válido es requerido';

    // Verificar nuevamente antes de crear (por si acaso)
    try {
      const resultado = await verificarRazonSocial(perfil.empresa);
      if (resultado.existe) return 'Esta Razón Social ya existe. Usa "Reanudar Evaluación Anterior" o cambia el nombre.';
    } catch (err) {
      console.warn('No se pudo verificar razón social:', err);
    }

    return '';
  };

  const MODULO_LABELS = { cyber: 'Ciberseguridad', ley: 'Protección de Datos', ti: 'Levantamiento TI' };

  const handleVerificarRazonSocial = async (razonSocial) => {
    if (!razonSocial?.trim()) {
      setRazonSocialExiste(false);
      return;
    }

    setVerificandoRazonSocial(true);
    try {
      const resultado = await verificarRazonSocial(razonSocial);
      setRazonSocialExiste(resultado.existe);
    } catch (err) {
      setRazonSocialExiste(false);
    } finally {
      setVerificandoRazonSocial(false);
    }
  };

  const handleBuscarHistorial = async () => {
    if (!perfil.empresa?.trim()) {
      setError('Ingresa la Razón Social para buscar evaluaciones anteriores');
      return;
    }

    setLoading(true);
    try {
      const resultado = await buscarEvaluacionesPorRazonSocial(perfil.empresa);
      setHistorial(resultado.evaluaciones || []);
      setShowHistorial(true);
      if (resultado.total === 0) {
        setError('No hay evaluaciones anteriores para esta Razón Social');
      }
    } catch (err) {
      setError('Error al buscar evaluaciones: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReanudarEvaluacion = async (evalId) => {
    setLoading(true);
    try {
      const response = await obtenerEvaluacion(evalId);
      cargarEvaluacionCompleta({
        id: response.id,
        modulo: response.modulo,
        perfil: response.perfil,
        respuestas: response.respuestas,
        completada: evaluacionEstaCompleta(response.modulo, response.respuestas, response.completada),
      });
    } catch (err) {
      setError('Error al reanudar evaluación: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = await validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        empresa: perfil.empresa,
        industria: perfil.industria,
        usuarios: parseInt(perfil.usuarios),
        anci: perfil.anci,
        infra: perfil.infra,
        ms: perfil.ms,
        gestion: perfil.gestion,
        incidentes: perfil.incidentes,
        nombre: perfil.nombre,
        cargo: perfil.cargo,
        email: perfil.email,
        tel: perfil.tel,
        datosSensibles: evaluacion.modulo === 'ley' ? perfil.datosSensibles : undefined,
        decisionesAuto: evaluacion.modulo === 'ley' ? perfil.decisionesAuto : undefined,
        transferencia: evaluacion.modulo === 'ley' ? perfil.transferencia : undefined,
        modulo: evaluacion.modulo,
      };

      const response = await crearEvaluacion(payload);
      guardarEvaluacionId(response.evaluacionId);
      guardarPerfil(perfil);
      irAFase(2);
    } catch (err) {
      setError('Error al guardar perfil: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Perfil del Cliente — {evaluacion.modulo === 'ley' ? 'Ley 21.719' : 'Ciberseguridad'}</h1>
        <p>Complete junto al cliente</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          {/* Identificación */}
          <div className="section-title">Identificación</div>
          <div className="form-grid">
            <div className="form-group">
              <label>
                Razón Social <span className="required">*</span>
                {verificandoRazonSocial && <span style={{ marginLeft: '10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>verificando...</span>}
                {razonSocialExiste && !verificandoRazonSocial && <span style={{ marginLeft: '10px', fontSize: '0.8rem', color: 'var(--orange)' }}>✓ Empresa existente</span>}
              </label>
              <input type="text" name="empresa" value={perfil.empresa || ''} onChange={handleChange} placeholder="Nombre de la empresa" />
            </div>
            <div className="form-group">
              <label>Industria <span className="required">*</span></label>
              <select name="industria" value={perfil.industria || ''} onChange={handleChange}>
                <option value="">Seleccionar...</option>
                <option value="financiero">Financiero / Seguros</option>
                <option value="energia">Energía / Utilities</option>
                <option value="salud">Salud</option>
                <option value="gobierno">Gobierno / Sector Público</option>
                <option value="retail">Retail / Comercio</option>
                <option value="manufactura">Manufactura</option>
                <option value="tecnologia">Tecnología / Software</option>
                <option value="educacion">Educación</option>
                <option value="construccion">Construcción</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div className="form-group">
              <label>N° de Usuarios <span className="required">*</span></label>
              <input type="number" name="usuarios" value={perfil.usuarios || ''} onChange={handleChange} placeholder="Ej: 250" min="1" />
            </div>
            <div className="form-group">
              <label>Clasificación ANCI</label>
              <select name="anci" value={perfil.anci || 'general'} onChange={handleChange}>
                <option value="general">Organización General</option>
                <option value="pse">PSE</option>
                <option value="oiv">OIV</option>
              </select>
            </div>
          </div>

          <hr className="divider" />

          {/* Entorno Tecnológico */}
          <div className="section-title">Entorno Tecnológico</div>
          <div className="form-grid">
            <div className="form-group">
              <label>Infraestructura</label>
              <select name="infra" value={perfil.infra || 'onpremise'} onChange={handleChange}>
                <option value="onpremise">On-premise</option>
                <option value="cloud">Cloud</option>
                <option value="hibrido">Híbrido</option>
              </select>
            </div>
            <div className="form-group">
              <label>Ecosistema Microsoft</label>
              <select name="ms" value={perfil.ms || 'no'} onChange={handleChange}>
                <option value="si">Sí — M365 / Azure</option>
                <option value="parcial">Parcial</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>

          <hr className="divider" />

          {/* Contexto Actual */}
          <div className="section-title">Contexto Actual</div>
          <div className="form-grid">
            <div className="form-group">
              <label>¿Quién gestiona la seguridad?</label>
              <select name="gestion" value={perfil.gestion || 'nadie'} onChange={handleChange}>
                <option value="nadie">Nadie formalmente</option>
                <option value="interno">Equipo interno de TI</option>
                <option value="proveedor">Proveedor externo</option>
                <option value="mixto">Mixto</option>
              </select>
            </div>
            <div className="form-group">
              <label>¿Incidentes en 12 meses?</label>
              <select name="incidentes" value={perfil.incidentes || 'no'} onChange={handleChange}>
                <option value="no">No</option>
                <option value="si">Sí</option>
                <option value="nosabe">No sabemos</option>
              </select>
            </div>
          </div>

          <hr className="divider" />

          {/* Contacto Principal */}
          <div className="section-title">Contacto Principal</div>
          <div className="form-grid">
            <div className="form-group">
              <label>Nombre</label>
              <input type="text" name="nombre" value={perfil.nombre || ''} onChange={handleChange} placeholder="Nombre completo" />
            </div>
            <div className="form-group">
              <label>Cargo</label>
              <input type="text" name="cargo" value={perfil.cargo || ''} onChange={handleChange} placeholder="Ej: CISO" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={perfil.email || ''} onChange={handleChange} placeholder="correo@empresa.cl" />
            </div>
            <div className="form-group">
              <label>Teléfono</label>
              <input type="tel" name="tel" value={perfil.tel || ''} onChange={handleChange} placeholder="+56 9 ..." />
            </div>
          </div>

          {/* Retomar Evaluación Anterior */}
          {razonSocialExiste && (
            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: 'var(--surface-2)', borderRadius: '8px' }}>
              <button
                type="button"
                onClick={handleBuscarHistorial}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: 'var(--blue)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                🔄 Reanudar Evaluación Anterior
              </button>

            {showHistorial && historial && historial.length > 0 && (
              <div style={{ marginTop: '15px' }}>
                <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', fontWeight: '600' }}>Evaluaciones encontradas:</p>
                {historial.map((eval_) => (
                  <div
                    key={eval_.Id}
                    style={{
                      padding: '10px',
                      marginBottom: '8px',
                      backgroundColor: 'var(--surface)',
                      borderRadius: '6px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.9rem'
                    }}
                  >
                    <div>
                      <strong>{eval_.RazonSocial}</strong> ({MODULO_LABELS[eval_.Modulo] || eval_.Modulo})<br />
                      <small style={{ color: 'var(--text-muted)' }}>
                        {eval_.Completada ? '✅ Completada' : '⏳ Incompleta'} - {new Date(eval_.FechaActualizacion).toLocaleDateString()}
                      </small>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleReanudarEvaluacion(eval_.Id)}
                      disabled={loading}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: 'var(--orange)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      Reanudar
                    </button>
                  </div>
                ))}
              </div>
            )}
            </div>
          )}

          {/* Preguntas Preliminares Ley 21.719 */}
          {evaluacion.modulo === 'ley' && (
            <>
              <hr className="divider" />
              <div className="section-title">Preguntas Preliminares — Ley 21.719</div>
              <div className="form-grid">
                <div className="form-group">
                  <label>¿Tratan datos sensibles a gran escala?</label>
                  <select name="datosSensibles" value={perfil.datosSensibles || 'no'} onChange={handleChange}>
                    <option value="no">No</option>
                    <option value="si">Sí</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>¿Usan decisiones automatizadas?</label>
                  <select name="decisionesAuto" value={perfil.decisionesAuto || 'no'} onChange={handleChange}>
                    <option value="no">No</option>
                    <option value="si">Sí</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>¿Transfieren datos fuera de Chile?</label>
                  <select name="transferencia" value={perfil.transferencia || 'no'} onChange={handleChange}>
                    <option value="no">No</option>
                    <option value="si">Sí</option>
                  </select>
                </div>
              </div>
              <div className="info-text">
                <b>Datos sensibles:</b> salud, biometría, origen étnico, orientación sexual, datos penales, datos de menores.<br />
                <b>Decisiones automatizadas:</b> scoring, perfilamiento, filtros de selección, pricing automatizado, IA.<br />
                <b>Transferencias:</b> servidores en el extranjero, proveedores internacionales, plataformas cloud con hosting fuera de Chile.
              </div>
            </>
          )}

          {/* Error Message */}
          {error && <div className="error-message">{error}</div>}

          {/* Botones */}
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => irAFase(0)}>
              ← Módulos
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading || verificandoRazonSocial || razonSocialExiste}>
              {loading ? 'Guardando...' : verificandoRazonSocial ? 'Verificando...' : razonSocialExiste ? 'Empresa existente' : 'Continuar con Cuestionario →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
