import { useContext, useState } from 'react';
import { EvaluacionContext } from '../context/EvaluacionContext';
import { crearEvaluacion, buscarEvaluacionesPorRazonSocial, obtenerEvaluacion, verificarRazonSocial } from '../services/api';
import { evaluacionEstaCompleta } from '../utils/evaluacion-helpers';
import { Card } from './ui/Card';

const inputClass = 'bg-input-bg border-[1.5px] border-border rounded-lg px-[11px] py-2 text-text text-[0.85rem] transition-all duration-200 placeholder:text-text-muted focus:outline-none focus:border-accent-bright focus:shadow-[0_0_0_3px_rgba(0,174,239,0.15)]';
const selectClass = `${inputClass} appearance-none cursor-pointer pr-[26px] bg-no-repeat`;
const selectArrowStyle = {
  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath fill='%2394A3B8' d='M5 6L0 0h10z'/%3E%3C/svg%3E\")",
  backgroundPosition: 'right 10px center',
};
const labelClass = 'text-[0.68rem] font-bold uppercase tracking-wide text-text-secondary';
const sectionTitleClass = 'text-[0.7rem] font-bold text-text-secondary uppercase tracking-wide mb-2.5 flex items-center gap-1.5';

const SectionTitle = ({ children }) => (
  <div className={sectionTitleClass}>
    <span className="w-[3px] h-3 bg-accent rounded-sm" />
    {children}
  </div>
);

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

  const MODULO_LABELS = { cyber: 'Ciberseguridad', ley: 'Gobierno y Cumplimiento', ti: 'Levantamiento TI' };

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
    <div className="animate-fade-in-up w-full max-w-[1280px] mx-auto px-7 pb-[60px] pt-6 min-w-0">
      <div className="mb-[18px]">
        <h1 className="text-[1.3rem] font-bold tracking-[-0.3px] mb-0.5 text-text">
          Perfil del Cliente — {evaluacion.modulo === 'ley' ? 'Ley 21.719' : evaluacion.modulo === 'ti' ? 'Levantamiento TI' : 'Ciberseguridad'}
        </h1>
        <p className="text-[0.82rem] text-text-secondary">Complete junto al cliente</p>
      </div>

      <Card className="p-5">
        <form onSubmit={handleSubmit}>
          {/* Identificación */}
          <SectionTitle>Identificación</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-4">
            <div className="flex flex-col gap-1">
              <label className={labelClass}>
                Razón Social <span className="text-brand-red">*</span>
                {verificandoRazonSocial && <span className="ml-2.5 text-[0.8rem] text-text-muted normal-case font-normal">verificando...</span>}
                {razonSocialExiste && !verificandoRazonSocial && <span className="ml-2.5 text-[0.8rem] text-orange normal-case font-normal">✓ Empresa existente</span>}
              </label>
              <input className={inputClass} type="text" name="empresa" value={perfil.empresa || ''} onChange={handleChange} placeholder="Nombre de la empresa" />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Industria <span className="text-brand-red">*</span></label>
              <select className={selectClass} style={selectArrowStyle} name="industria" value={perfil.industria || ''} onChange={handleChange}>
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
            <div className="flex flex-col gap-1">
              <label className={labelClass}>N° de Usuarios <span className="text-brand-red">*</span></label>
              <input className={inputClass} type="number" name="usuarios" value={perfil.usuarios || ''} onChange={handleChange} placeholder="Ej: 250" min="1" />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Clasificación ANCI</label>
              <select className={selectClass} style={selectArrowStyle} name="anci" value={perfil.anci || 'general'} onChange={handleChange}>
                <option value="general">Organización General</option>
                <option value="pse">PSE</option>
                <option value="oiv">OIV</option>
              </select>
            </div>
          </div>

          <hr className="border-0 border-t border-border my-4" />

          {/* Entorno Tecnológico */}
          <SectionTitle>Entorno Tecnológico</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-4">
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Infraestructura</label>
              <select className={selectClass} style={selectArrowStyle} name="infra" value={perfil.infra || 'onpremise'} onChange={handleChange}>
                <option value="onpremise">On-premise</option>
                <option value="cloud">Cloud</option>
                <option value="hibrido">Híbrido</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Ecosistema Microsoft</label>
              <select className={selectClass} style={selectArrowStyle} name="ms" value={perfil.ms || 'no'} onChange={handleChange}>
                <option value="si">Sí — M365 / Azure</option>
                <option value="parcial">Parcial</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>

          <hr className="border-0 border-t border-border my-4" />

          {/* Contexto Actual */}
          <SectionTitle>Contexto Actual</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-4">
            <div className="flex flex-col gap-1">
              <label className={labelClass}>¿Quién gestiona la seguridad?</label>
              <select className={selectClass} style={selectArrowStyle} name="gestion" value={perfil.gestion || 'nadie'} onChange={handleChange}>
                <option value="nadie">Nadie formalmente</option>
                <option value="interno">Equipo interno de TI</option>
                <option value="proveedor">Proveedor externo</option>
                <option value="mixto">Mixto</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>¿Incidentes en 12 meses?</label>
              <select className={selectClass} style={selectArrowStyle} name="incidentes" value={perfil.incidentes || 'no'} onChange={handleChange}>
                <option value="no">No</option>
                <option value="si">Sí</option>
                <option value="nosabe">No sabemos</option>
              </select>
            </div>
          </div>

          <hr className="border-0 border-t border-border my-4" />

          {/* Contacto Principal */}
          <SectionTitle>Contacto Principal</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-4">
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Nombre</label>
              <input className={inputClass} type="text" name="nombre" value={perfil.nombre || ''} onChange={handleChange} placeholder="Nombre completo" />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Cargo</label>
              <input className={inputClass} type="text" name="cargo" value={perfil.cargo || ''} onChange={handleChange} placeholder="Ej: CISO" />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Email</label>
              <input className={inputClass} type="email" name="email" value={perfil.email || ''} onChange={handleChange} placeholder="correo@empresa.cl" />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Teléfono</label>
              <input className={inputClass} type="tel" name="tel" value={perfil.tel || ''} onChange={handleChange} placeholder="+56 9 ..." />
            </div>
          </div>

          {/* Retomar Evaluación Anterior */}
          {razonSocialExiste && (
            <div className="mt-5 p-[15px] bg-surface-2 rounded-lg">
              <button
                type="button"
                onClick={handleBuscarHistorial}
                disabled={loading}
                className="w-full py-2.5 bg-blue text-white border-none rounded-md cursor-pointer font-semibold disabled:opacity-55 disabled:cursor-not-allowed"
              >
                🔄 Reanudar Evaluación Anterior
              </button>

              {showHistorial && historial && historial.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2.5 text-sm font-semibold text-text">Evaluaciones encontradas:</p>
                  {historial.map((eval_) => (
                    <div
                      key={eval_.Id}
                      className="p-2.5 mb-2 bg-surface rounded-md flex justify-between items-center text-sm"
                    >
                      <div>
                        <strong className="text-text">{eval_.RazonSocial}</strong> <span className="text-text-secondary">({MODULO_LABELS[eval_.Modulo] || eval_.Modulo})</span><br />
                        <small className="text-text-muted">
                          {eval_.Completada ? '✅ Completada' : '⏳ Incompleta'} - {new Date(eval_.FechaActualizacion).toLocaleDateString()}
                        </small>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleReanudarEvaluacion(eval_.Id)}
                        disabled={loading}
                        className="px-3 py-2 bg-orange text-white border-none rounded text-[0.85rem] cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed"
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
              <hr className="border-0 border-t border-border my-4" />
              <SectionTitle>Preguntas Preliminares — Ley 21.663 y Ley 21.719</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-4">
                <div className="flex flex-col gap-1">
                  <label className={labelClass}>¿Tratan datos sensibles a gran escala?</label>
                  <select className={selectClass} style={selectArrowStyle} name="datosSensibles" value={perfil.datosSensibles || 'no'} onChange={handleChange}>
                    <option value="no">No</option>
                    <option value="si">Sí</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className={labelClass}>¿Usan decisiones automatizadas?</label>
                  <select className={selectClass} style={selectArrowStyle} name="decisionesAuto" value={perfil.decisionesAuto || 'no'} onChange={handleChange}>
                    <option value="no">No</option>
                    <option value="si">Sí</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className={labelClass}>¿Transfieren datos fuera de Chile?</label>
                  <select className={selectClass} style={selectArrowStyle} name="transferencia" value={perfil.transferencia || 'no'} onChange={handleChange}>
                    <option value="no">No</option>
                    <option value="si">Sí</option>
                  </select>
                </div>
              </div>
              <div className="text-[0.72rem] text-text-secondary leading-relaxed mb-4 px-3.5 py-2.5 bg-surface-2 rounded-lg border-l-[3px] border-l-accent [&_b]:text-text">
                <b>Datos sensibles:</b> salud, biometría, origen étnico, orientación sexual, datos penales, datos de menores.<br />
                <b>Decisiones automatizadas:</b> scoring, perfilamiento, filtros de selección, pricing automatizado, IA.<br />
                <b>Transferencias:</b> servidores en el extranjero, proveedores internacionales, plataformas cloud con hosting fuera de Chile.<br />
                <b>OIV (Ley 21.663):</b> se determina con la Clasificación ANCI de la sección Identificación — habilita las preguntas de reporte al CSIRT Nacional.
              </div>
            </>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-2.5 px-[13px] py-[9px] bg-red-light border border-brand-red rounded-lg text-[0.78rem] text-brand-red font-semibold">
              {error}
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-2.5 mt-5 flex-wrap max-sm:flex-col">
            <button type="button" className="btn btn-secondary max-sm:w-full max-sm:justify-center" onClick={() => irAFase(0)}>
              ← Módulos
            </button>
            <button type="submit" className="btn btn-primary max-sm:w-full max-sm:justify-center" disabled={loading || verificandoRazonSocial || razonSocialExiste}>
              {loading ? 'Guardando...' : verificandoRazonSocial ? 'Verificando...' : razonSocialExiste ? 'Empresa existente' : 'Continuar con Cuestionario →'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};
