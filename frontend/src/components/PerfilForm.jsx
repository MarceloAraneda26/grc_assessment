import { useContext, useState } from 'react';
import { EvaluacionContext } from '../context/EvaluacionContext';
import { crearEvaluacion } from '../services/api';
import '../styles/PerfilForm.css';

export const PerfilForm = () => {
  const { evaluacion, guardarPerfil, guardarEvaluacionId, irAFase } = useContext(EvaluacionContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
  };

  const validateForm = () => {
    if (!perfil.empresa?.trim()) return 'Razón Social es requerida';
    if (!perfil.industria) return 'Industria es requerida';
    if (!perfil.usuarios || parseInt(perfil.usuarios) <= 0) return 'Número de usuarios válido es requerido';
    if (!perfil.nombre?.trim()) return 'Nombre de contacto es requerido';
    if (!perfil.email?.trim()) return 'Email es requerido';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(perfil.email)) return 'Email válido es requerido';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
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
              <label>Razón Social <span className="required">*</span></label>
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
            <button type="button" className="btn btn-secondary" onClick={() => window.location.reload()}>
              ← Módulos
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Continuar con Cuestionario →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
