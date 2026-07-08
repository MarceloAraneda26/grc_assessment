import { useContext } from 'react';
import { EvaluacionContext } from '../context/EvaluacionContext';
import '../styles/ModuloSelect.css';

export const ModuloSelect = () => {
  const { iniciarEvaluacion } = useContext(EvaluacionContext);

  const modulos = [
    {
      id: 'cyber',
      nombre: 'GRC Ciberseguridad',
      descripcion: 'Evaluación de madurez en gobernanza, identidad, datos, detección, respuesta y cumplimiento normativo',
      icono: '🛡️',
      tag: 'NIST CSF · Ley 21.663',
      tagBg: 'rgba(11, 165, 236, 0.12)',
      tagColor: '#0BA5EC',
    },
    {
      id: 'ley',
      nombre: 'GRC Protección de Datos',
      descripcion: 'Evaluación de cumplimiento de obligaciones en protección de datos personales',
      icono: '📋',
      tag: 'Ley 21.719 · Chile',
      tagBg: 'rgba(139, 92, 246, 0.12)',
      tagColor: '#8B5CF6',
    },
    {
      id: 'ti',
      nombre: 'Levantamiento TI',
      descripcion: 'Inventario y diagnóstico de infraestructura, sistemas, acceso, respaldos y seguridad',
      icono: '🖥️',
      tag: 'Sistemas · Infraestructura',
      tagBg: 'rgba(16, 185, 129, 0.12)',
      tagColor: '#10B981',
    },
  ];

  return (
    <div className="modulo-select">
      <div className="mod-hero">
        <div style={{ marginBottom: '12px' }}>
          <svg width="38" height="38" viewBox="0 0 28 28" fill="none">
            <polygon points="14,2 26,9 14,16 2,9" fill="#00AEEF"></polygon>
            <polygon points="2,9 14,16 14,26 2,19" fill="#0884D6"></polygon>
            <polygon points="26,9 14,16 14,26 26,19" fill="#FF7900"></polygon>
          </svg>
        </div>
        <h1>TIBOX — <span className="gradient-text">GRC Assessment</span></h1>
        <p>Seleccione el módulo de evaluación</p>
      </div>

      <div className="modulos-grid">
        {modulos.map(modulo => (
          <button
            key={modulo.id}
            className="modulo-card"
            onClick={() => iniciarEvaluacion(modulo.id)}
          >
            <div className="modulo-icono">{modulo.icono}</div>
            <h2>{modulo.nombre}</h2>
            <p>{modulo.descripcion}</p>
            <div className="modulo-tag" style={{ background: modulo.tagBg, color: modulo.tagColor }}>
              {modulo.tag}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
