// Preguntas de Levantamiento TI - 40 preguntas clave simplificadas
export const PREGUNTAS_TI = [
  // INVENTARIO (5 preguntas)
  {
    id: 'ti-inv-1',
    texto: '¿Existe un inventario formal de sistemas y aplicaciones en uso?',
    dominio: 'Inventario',
    tipo: 'si-no'
  },
  {
    id: 'ti-inv-2',
    texto: '¿Existe inventario documentado de servidores (físicos/virtuales/cloud)?',
    dominio: 'Inventario',
    tipo: 'si-no'
  },
  {
    id: 'ti-inv-3',
    texto: '¿Hay inventario actualizado de notebooks, desktops y dispositivos?',
    dominio: 'Inventario',
    tipo: 'si-no'
  },
  {
    id: 'ti-inv-4',
    texto: '¿Se documentan los proveedores tecnológicos y sus accesos?',
    dominio: 'Inventario',
    tipo: 'si-no'
  },
  {
    id: 'ti-inv-5',
    texto: '¿Existe documentación actualizada de la infraestructura TI?',
    dominio: 'Inventario',
    tipo: 'si-no'
  },

  // ACCESO E IDENTIDAD (7 preguntas)
  {
    id: 'ti-id-1',
    texto: '¿Todos los usuarios tienen cuentas individuales en sistemas críticos?',
    dominio: 'Acceso e Identidad',
    tipo: 'si-no-parcial'
  },
  {
    id: 'ti-id-2',
    texto: '¿Existe MFA (autenticación multifactor) en correo y sistemas críticos?',
    dominio: 'Acceso e Identidad',
    tipo: 'si-no-parcial'
  },
  {
    id: 'ti-id-3',
    texto: '¿Existen usuarios compartidos o genéricos en sistemas?',
    dominio: 'Acceso e Identidad',
    tipo: 'si-no-desconoce'
  },
  {
    id: 'ti-id-4',
    texto: '¿Se revisan periódicamente los accesos de usuarios inactivos o ex colaboradores?',
    dominio: 'Acceso e Identidad',
    tipo: 'si-no-parcial'
  },
  {
    id: 'ti-id-5',
    texto: '¿Hay proceso formal de alta, baja y cambio de permisos de usuarios?',
    dominio: 'Acceso e Identidad',
    tipo: 'si-no-parcial'
  },
  {
    id: 'ti-id-6',
    texto: '¿Se controla quién tiene permisos administrativos en servidores?',
    dominio: 'Acceso e Identidad',
    tipo: 'si-no-parcial'
  },
  {
    id: 'ti-id-7',
    texto: '¿Hay cuentas administrativas compartidas sin auditoría individual?',
    dominio: 'Acceso e Identidad',
    tipo: 'si-no-desconoce'
  },

  // DATOS PERSONALES Y PRIVACIDAD (6 preguntas)
  {
    id: 'ti-dp-1',
    texto: '¿Se conoce cuáles sistemas almacenan datos personales de clientes?',
    dominio: 'Datos Personales',
    tipo: 'si-no-parcial'
  },
  {
    id: 'ti-dp-2',
    texto: '¿Se identifican sistemas que contienen datos sensibles (biometría, salud, etc.)?',
    dominio: 'Datos Personales',
    tipo: 'si-no-parcial'
  },
  {
    id: 'ti-dp-3',
    texto: '¿Existen restricciones de acceso a bases de datos con datos personales?',
    dominio: 'Datos Personales',
    tipo: 'si-no-parcial'
  },
  {
    id: 'ti-dp-4',
    texto: '¿Se sabe quién puede descargar o exportar información de clientes?',
    dominio: 'Datos Personales',
    tipo: 'si-no-parcial'
  },
  {
    id: 'ti-dp-5',
    texto: '¿Existe trazabilidad de cambios o accesos a datos personales?',
    dominio: 'Datos Personales',
    tipo: 'si-no-parcial'
  },
  {
    id: 'ti-dp-6',
    texto: '¿Los proveedores de sistemas tienen cláusulas de confidencialidad y protección de datos?',
    dominio: 'Datos Personales',
    tipo: 'si-no-parcial'
  },

  // SEGURIDAD PERIMETRAL (6 preguntas)
  {
    id: 'ti-seg-1',
    texto: '¿La empresa cuenta con firewall perimetral?',
    dominio: 'Seguridad Perimetral',
    tipo: 'si-no-desconoce'
  },
  {
    id: 'ti-seg-2',
    texto: '¿El firewall tiene licenciamiento y soporte vigente?',
    dominio: 'Seguridad Perimetral',
    tipo: 'si-no-desconoce'
  },
  {
    id: 'ti-seg-3',
    texto: '¿Existe VPN para usuarios remotos?',
    dominio: 'Seguridad Perimetral',
    tipo: 'si-no-desconoce'
  },
  {
    id: 'ti-seg-4',
    texto: '¿La VPN requiere MFA?',
    dominio: 'Seguridad Perimetral',
    tipo: 'si-no-parcial'
  },
  {
    id: 'ti-seg-5',
    texto: '¿La red está segmentada por áreas o servicios críticos?',
    dominio: 'Seguridad Perimetral',
    tipo: 'si-no-parcial'
  },
  {
    id: 'ti-seg-6',
    texto: '¿Existe una red separada para visitantes o proveedores externos?',
    dominio: 'Seguridad Perimetral',
    tipo: 'si-no-desconoce'
  },

  // RESPALDOS Y CONTINUIDAD (6 preguntas)
  {
    id: 'ti-rb-1',
    texto: '¿Existe política formal de respaldo de sistemas críticos?',
    dominio: 'Respaldos',
    tipo: 'si-no-desconoce'
  },
  {
    id: 'ti-rb-2',
    texto: '¿Los respaldos se almacenan fuera de la infraestructura principal?',
    dominio: 'Respaldos',
    tipo: 'si-no-parcial'
  },
  {
    id: 'ti-rb-3',
    texto: '¿Se han probado restauraciones de respaldos en los últimos 12 meses?',
    dominio: 'Respaldos',
    tipo: 'si-no-desconoce'
  },
  {
    id: 'ti-rb-4',
    texto: '¿Los respaldos están protegidos contra ransomware o malware?',
    dominio: 'Respaldos',
    tipo: 'si-no-parcial'
  },
  {
    id: 'ti-rb-5',
    texto: '¿Existe plan de recuperación ante desastres documentado?',
    dominio: 'Respaldos',
    tipo: 'si-no-desconoce'
  },
  {
    id: 'ti-rb-6',
    texto: '¿Se han definido tiempos máximos de recuperación (RTO/RPO) por sistema?',
    dominio: 'Respaldos',
    tipo: 'si-no-desconoce'
  },

  // MONITOREO Y SEGURIDAD (6 preguntas)
  {
    id: 'ti-mon-1',
    texto: '¿Existe monitoreo activo de servidores y sistemas críticos?',
    dominio: 'Monitoreo',
    tipo: 'si-no-parcial'
  },
  {
    id: 'ti-mon-2',
    texto: '¿Se centralizan y conservan registros (logs) de eventos de seguridad?',
    dominio: 'Monitoreo',
    tipo: 'si-no-parcial'
  },
  {
    id: 'ti-mon-3',
    texto: '¿Existe procedimiento formal para reportar y gestionar incidentes de seguridad?',
    dominio: 'Monitoreo',
    tipo: 'si-no-desconoce'
  },
  {
    id: 'ti-mon-4',
    texto: '¿La empresa ha sufrido incidentes de seguridad en los últimos 12 meses?',
    dominio: 'Monitoreo',
    tipo: 'si-no-desconoce'
  },
  {
    id: 'ti-mon-5',
    texto: '¿Se realizan análisis de vulnerabilidades o test de penetración?',
    dominio: 'Monitoreo',
    tipo: 'si-no-parcial'
  },
  {
    id: 'ti-mon-6',
    texto: '¿Existe capacitación periódica en seguridad y protección de datos para usuarios?',
    dominio: 'Monitoreo',
    tipo: 'si-no-parcial'
  },

  // PROVEEDORES Y GESTIÓN (4 preguntas)
  {
    id: 'ti-prov-1',
    texto: '¿Existe matriz documentada de proveedores críticos?',
    dominio: 'Proveedores',
    tipo: 'si-no-desconoce'
  },
  {
    id: 'ti-prov-2',
    texto: '¿Se revisan periódicamente los accesos de proveedores a sistemas o datos?',
    dominio: 'Proveedores',
    tipo: 'si-no-parcial'
  },
  {
    id: 'ti-prov-3',
    texto: '¿Existen contratos vigentes que incluyen obligaciones de confidencialidad?',
    dominio: 'Proveedores',
    tipo: 'si-no-parcial'
  },
  {
    id: 'ti-prov-4',
    texto: '¿Se registra quién accede, cuándo y para qué en sistemas críticos?',
    dominio: 'Proveedores',
    tipo: 'si-no-parcial'
  }
];

// Dominios para scoring
export const DOMINIOS_TI = [
  { id: 'inventario', nombre: 'Inventario', peso: 0.10 },
  { id: 'identidad', nombre: 'Acceso e Identidad', peso: 0.20 },
  { id: 'datos', nombre: 'Datos Personales', peso: 0.15 },
  { id: 'seguridad', nombre: 'Seguridad Perimetral', peso: 0.15 },
  { id: 'respaldos', nombre: 'Respaldos', peso: 0.20 },
  { id: 'monitoreo', nombre: 'Monitoreo', peso: 0.15 },
  { id: 'proveedores', nombre: 'Proveedores', peso: 0.05 }
];

// Mapeo de preguntas a dominios para scoring
const DOMINIO_MAP = {
  'Inventario': 'inventario',
  'Acceso e Identidad': 'identidad',
  'Datos Personales': 'datos',
  'Seguridad Perimetral': 'seguridad',
  'Respaldos': 'respaldos',
  'Monitoreo': 'monitoreo',
  'Proveedores': 'proveedores'
};

export const getDoминioId = (dominio) => DOMINIO_MAP[dominio];
