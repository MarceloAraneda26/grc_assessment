import { createContext, useState, useCallback } from 'react';

export const EvaluacionContext = createContext();

export const EvaluacionProvider = ({ children }) => {
  const [evaluacion, setEvaluacion] = useState({
    id: null,
    modulo: null,
    perfil: {
      empresa: '',
      industria: '',
      usuarios: 0,
      anci: '',
      infra: '',
      ms: '',
      gestion: '',
      incidentes: '',
      nombre: '',
      cargo: '',
      email: '',
      tel: '',
      datosSensibles: false,
      decisionesAuto: false,
      transferencia: false,
    },
    respuestas: {},
    fase: 0, // 0: selector, 1: perfil, 2: cuestionario, 3: resultados, 4: roadmap
  });

  const iniciarEvaluacion = useCallback((modulo) => {
    setEvaluacion(prev => ({ ...prev, modulo, fase: 1 }));
  }, []);

  const guardarPerfil = useCallback((perfil) => {
    setEvaluacion(prev => ({ ...prev, perfil, fase: 2 }));
  }, []);

  const guardarEvaluacionId = useCallback((id) => {
    setEvaluacion(prev => ({ ...prev, id }));
  }, []);

  // El backend siempre persiste el nivel como número (0-3); el módulo TI
  // trabaja internamente con etiquetas de texto, así que hay que revertir
  // el mapeo al retomar una evaluación de ese módulo.
  const NIVEL_A_TEXTO_TI = { 3: 'Si', 2: 'Parcial', 1: 'No', 0: 'Desconoce' };

  const cargarEvaluacionCompleta = useCallback(({ id, modulo, perfil, respuestas, completada }) => {
    const respuestasNormalizadas = { ...(respuestas || {}) };
    if (modulo === 'ti') {
      Object.keys(respuestasNormalizadas).forEach((preguntaId) => {
        const nivel = respuestasNormalizadas[preguntaId];
        respuestasNormalizadas[preguntaId] = NIVEL_A_TEXTO_TI[nivel] ?? nivel;
      });
    }

    setEvaluacion(prev => ({
      ...prev,
      id,
      modulo,
      perfil: perfil || prev.perfil,
      respuestas: respuestasNormalizadas,
      fase: completada ? 3 : 2,
    }));
  }, []);

  const guardarRespuesta = useCallback((preguntaId, nivel) => {
    setEvaluacion(prev => ({
      ...prev,
      respuestas: { ...prev.respuestas, [preguntaId]: nivel }
    }));
  }, []);

  const irAFase = useCallback((fase) => {
    setEvaluacion(prev => ({ ...prev, fase }));
  }, []);

  const reiniciar = useCallback(() => {
    setEvaluacion({
      id: null,
      modulo: null,
      perfil: {
        empresa: '',
        industria: '',
        usuarios: 0,
        anci: '',
        infra: '',
        ms: '',
        gestion: '',
        incidentes: '',
        nombre: '',
        cargo: '',
        email: '',
        tel: '',
        datosSensibles: false,
        decisionesAuto: false,
        transferencia: false,
      },
      respuestas: {},
      fase: 0,
    });
  }, []);

  return (
    <EvaluacionContext.Provider
      value={{
        evaluacion,
        iniciarEvaluacion,
        guardarPerfil,
        guardarEvaluacionId,
        cargarEvaluacionCompleta,
        guardarRespuesta,
        irAFase,
        reiniciar,
      }}
    >
      {children}
    </EvaluacionContext.Provider>
  );
};
