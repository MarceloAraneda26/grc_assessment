import { useEffect } from 'react';

export const useUrlSync = (fase, irAFase) => {
  const faseToUrl = {
    0: '#/inicio',
    1: '#/perfil',
    2: '#/cuestionario',
    3: '#/resultados',
    4: '#/roadmap'
  };

  const urlToFase = {
    '#/inicio': 0,
    '#/perfil': 1,
    '#/cuestionario': 2,
    '#/resultados': 3,
    '#/roadmap': 4
  };

  // Actualizar URL cuando cambia la fase
  useEffect(() => {
    window.location.hash = faseToUrl[fase] || '#/inicio';
  }, [fase]);

  // Sincronizar URL al cargar
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const nuevaFase = urlToFase[hash];
      if (nuevaFase !== undefined) {
        irAFase(nuevaFase);
      }
    };

    window.addEventListener('hashchange', handleHashChange);

    // Verificar URL inicial
    const hash = window.location.hash;
    if (hash && urlToFase[hash] !== undefined) {
      irAFase(urlToFase[hash]);
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [irAFase]);
};
