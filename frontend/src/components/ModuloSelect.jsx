import { useContext, useState } from 'react';
import { EvaluacionContext } from '../context/EvaluacionContext';
import { asset } from '../utils/asset';
import { MetodologiaModal } from './MetodologiaModal';

const SUBMODULOS = {
  ley: {
    id: 'ley',
    nombre: 'GRC Gobierno y Cumplimiento',
    descripcion: 'Cuestionario maestro unificado: gobernanza, riesgos, incidentes, proveedores y evidencia — Ciberseguridad y Protección de Datos a la vez',
    icono: 'images/ciberseguridad.png',
    tag: 'Ley 21.663 + Ley 21.719',
    tagBg: 'rgba(245, 158, 11, 0.12)',
    tagColor: '#F59E0B',
  },
  ti: {
    id: 'ti',
    nombre: 'Levantamiento TI',
    descripcion: 'Inventario y diagnóstico de infraestructura, sistemas, acceso, respaldos y seguridad',
    icono: 'images/infraestructura.png',
    tag: 'Sistemas · Infraestructura',
    tagBg: 'rgba(16, 185, 129, 0.12)',
    tagColor: '#10B981',
  },
};

// "bloqueadoPor": el eje que hay que completar antes de este. La
// disponibilidad ya NO depende de si el eje tiene submódulos cargados (Eje 3
// sí tiene Levantamiento TI funcionando) — se bloquea explícitamente para
// mantener el orden secuencial 1 → 2 → 3 del Framework TIBOX.
const EJES = [
  {
    id: 'eje1',
    num: 1,
    nombre: 'Gobierno, documentación y evidencia',
    descripcion: 'Estructurar la base documental, los responsables, riesgos, procedimientos, proveedores, incidentes y evidencias necesarias para demostrar gestión y trazabilidad.',
    submodulos: ['ley'],
    bloqueadoPor: null,
  },
  {
    id: 'eje2',
    num: 2,
    nombre: 'Sistemas, datos, accesos y colaboración segura',
    descripcion: 'Identificar los sistemas, flujos de datos, usuarios, permisos y plataformas críticas donde se captura, almacena, procesa o comparte información corporativa y datos personales.',
    submodulos: [],
    bloqueadoPor: 'Eje 1',
  },
  {
    id: 'eje3',
    num: 3,
    nombre: 'Infraestructura, seguridad, continuidad y respuesta',
    descripcion: 'Evaluar la infraestructura tecnológica, redes, servidores, dispositivos, respaldos, monitoreo y capacidades de continuidad y respuesta ante incidentes.',
    submodulos: ['ti'],
    bloqueadoPor: 'Eje 2',
  },
];

const heroClass = 'relative overflow-hidden text-center rounded-3xl w-full max-w-[900px] px-6 py-10 md:py-12 bg-slate-900 bg-cover bg-center';
const heroStyle = { backgroundImage: `url(${asset('images/fondo_portada.jpg')})` };

// Sin opacity-55: apagaba TODO el texto de la card (título incluido) al
// mismo tono ilegible que el resto de la app tenía en el header. En vez de
// eso, cada elemento de texto elige su propio tono según el estado.
const ejeCardClass = (disponible) => [
  'text-left rounded-[20px] px-[22px] py-[26px] border-2 border-l-4 shadow-[var(--shadow)] transition-[transform,border-color,box-shadow] duration-150 bg-surface',
  disponible
    ? 'border-border border-l-accent-bright cursor-pointer hover:-translate-y-[3px] hover:border-accent-bright hover:shadow-[0_0_0_3px_rgba(0,174,239,0.15)]'
    : 'border-border border-l-nav-disabled cursor-not-allowed',
].join(' ');

const moduloCardClass = 'text-center bg-surface border-2 border-border rounded-[20px] px-[22px] py-7 shadow-[var(--shadow)] transition-transform duration-150 cursor-pointer hover:-translate-y-[3px] hover:border-accent-bright hover:shadow-[0_0_0_3px_rgba(0,174,239,0.15)]';

export const ModuloSelect = () => {
  const { iniciarEvaluacion } = useContext(EvaluacionContext);
  const [ejeActivo, setEjeActivo] = useState(null);
  const [showMetodologia, setShowMetodologia] = useState(false);

  if (ejeActivo) {
    const submodulos = ejeActivo.submodulos.map(id => SUBMODULOS[id]);
    return (
      <div className="animate-fade-in-up flex flex-col items-center justify-center min-h-[80vh] gap-6 px-4 py-7">
        <div className={heroClass} style={heroStyle}>
          <div className="absolute inset-0 bg-black/45" />
          <div className="relative z-10">
            <img src={asset('images/logo_tibox_fondo_oscuro.png')} alt="TIBOX" className="h-[34px] w-auto mx-auto mb-4" />
            <button
              className="block mx-auto mb-3.5 bg-transparent border-none text-slate-300 text-xs font-semibold cursor-pointer p-0 transition-colors duration-200 hover:text-white"
              onClick={() => setEjeActivo(null)}
            >
              ← Volver a los Ejes
            </button>
            <h1 className="text-2xl font-extrabold tracking-tight mb-1.5 text-white">
              Eje {ejeActivo.num} · <span className="gradient-text">{ejeActivo.nombre}</span>
            </h1>
            <p className="text-sm text-slate-300">Seleccione el submódulo de evaluación</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-[900px]">
          {submodulos.map(modulo => (
            <button key={modulo.id} className={moduloCardClass} onClick={() => iniciarEvaluacion(modulo.id)}>
              <div className="text-[2.2rem] mb-2.5 flex items-center justify-center">
                {modulo.icono.endsWith('.png') ? <img src={asset(modulo.icono)} alt="" className="h-[52px] w-auto" /> : modulo.icono}
              </div>
              <h2 className="text-base font-bold mb-1 text-text">{modulo.nombre}</h2>
              <p className="text-xs text-text-secondary leading-snug">{modulo.descripcion}</p>
              <div
                className="inline-block mt-2.5 px-2.5 py-0.5 rounded-xl text-[0.6rem] font-bold uppercase tracking-wide"
                style={{ background: modulo.tagBg, color: modulo.tagColor }}
              >
                {modulo.tag}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up flex flex-col items-center justify-center min-h-[80vh] gap-6 px-4 py-7">
      <div className={heroClass} style={heroStyle}>
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative z-10">
          <img src={asset('images/logo_tibox_fondo_oscuro.png')} alt="TIBOX" className="h-[34px] w-auto mx-auto mb-4" />
          <h1 className="text-2xl font-extrabold tracking-tight mb-1.5 text-white">
            Framework TIBOX <span className="gradient-text">3 Ejes</span>
          </h1>
          <p className="text-sm text-slate-300">Seleccione el eje de evaluación</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-[900px]">
        {EJES.map(eje => {
          const disponible = !eje.bloqueadoPor;
          return (
            <button
              key={eje.id}
              className={ejeCardClass(disponible)}
              disabled={!disponible}
              onClick={() => disponible && setEjeActivo(eje)}
              title={disponible ? undefined : `Disponible después de ${eje.bloqueadoPor}`}
            >
              <div
                className={[
                  'inline-block text-[0.62rem] font-extrabold uppercase tracking-wide rounded-[10px] px-2.5 py-[3px] mb-2.5',
                  disponible ? 'text-accent-bright bg-blue-light' : 'text-nav-disabled bg-surface-2',
                ].join(' ')}
              >
                Eje {eje.num}
              </div>
              <h2 className={`text-base font-bold mb-1.5 ${disponible ? 'text-text' : 'text-nav-disabled'}`}>{eje.nombre}</h2>
              <p className="text-[0.78rem] text-text-secondary leading-relaxed">{eje.descripcion}</p>
              {!disponible && (
                <div className="inline-flex items-center gap-1 mt-3 px-2.5 py-[3px] rounded-xl text-[0.6rem] font-bold uppercase tracking-wide bg-surface-2 text-nav-disabled">
                  <span aria-hidden="true">🔒</span> Posterior a {eje.bloqueadoPor}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <button
        className="flex items-center gap-1 bg-transparent border-none text-text-muted text-xs cursor-pointer p-0 transition-colors duration-200 hover:text-text-secondary"
        onClick={() => setShowMetodologia(true)}
      >
        <span className="text-[0.875rem]" aria-hidden="true">ⓘ</span> Metodología
      </button>

      {showMetodologia && <MetodologiaModal onClose={() => setShowMetodologia(false)} />}
    </div>
  );
};
