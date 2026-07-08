const API_BASE = '/api/v1';

export const crearEvaluacion = async (perfil) => {
  const response = await fetch(`${API_BASE}/evaluaciones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(perfil),
  });
  if (!response.ok) throw new Error('Error al crear evaluación');
  return response.json();
};

export const obtenerEvaluacion = async (id) => {
  const response = await fetch(`${API_BASE}/evaluaciones/${id}`);
  if (!response.ok) throw new Error('Error al obtener evaluación');
  return response.json();
};

export const listarEvaluaciones = async () => {
  const response = await fetch(`${API_BASE}/evaluaciones`);
  if (!response.ok) throw new Error('Error al listar evaluaciones');
  return response.json();
};

export const guardarRespuesta = async (evaluacionId, preguntaId, nivel) => {
  const response = await fetch(`${API_BASE}/evaluaciones/${evaluacionId}/respuestas/${preguntaId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nivel }),
  });
  if (!response.ok) throw new Error('Error al guardar respuesta');
  return response.json();
};

export const guardarResultado = async (evaluacionId, resultados) => {
  const response = await fetch(`${API_BASE}/evaluaciones/${evaluacionId}/resultados`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(resultados),
  });
  if (!response.ok) throw new Error('Error al guardar resultado');
  return response.json();
};

export const obtenerResultado = async (evaluacionId) => {
  const response = await fetch(`${API_BASE}/evaluaciones/${evaluacionId}/resultados`);
  if (!response.ok) throw new Error('Error al obtener resultado');
  return response.json();
};

export const buscarEvaluacionesPorRazonSocial = async (razonSocial) => {
  const response = await fetch(`${API_BASE}/buscar-evaluaciones?razonSocial=${encodeURIComponent(razonSocial)}`);
  if (!response.ok) throw new Error('Error al buscar evaluaciones');
  return response.json();
};

export const verificarRazonSocial = async (razonSocial) => {
  const response = await fetch(`${API_BASE}/verificar-razon-social?razonSocial=${encodeURIComponent(razonSocial)}`);
  if (!response.ok) throw new Error('Error al verificar razón social');
  return response.json();
};
