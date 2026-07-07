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
        guardarRespuesta,
        irAFase,
        reiniciar,
      }}
    >
      {children}
    </EvaluacionContext.Provider>
  );
};
