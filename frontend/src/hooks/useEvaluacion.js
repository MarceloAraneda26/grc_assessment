import { useContext } from 'react';
import { EvaluacionContext } from '../context/EvaluacionContext';

export const useEvaluacion = () => {
  const context = useContext(EvaluacionContext);
  if (!context) {
    throw new Error('useEvaluacion debe usarse dentro de EvaluacionProvider');
  }
  return context;
};
