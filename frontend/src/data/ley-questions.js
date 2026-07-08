// Extraído verbatim de GRC_v1.html (el prototipo original en un solo
// archivo). No se retipeó a mano: se extrajo con un script que localiza
// cada bloque de datos y verifica que evalúa como JS válido, para evitar
// errores de transcripción en un banco de preguntas de este tamaño.

export const DOMINIOS_LEY = [
  {id:'RAT',n:'Registro (RAT)',ico:'📋',c:'#8B5CF6',cf:'rgba(139,92,246,.15)',svc:'Consultoría Legal'},
  {id:'DPOL',n:'DPO',ico:'👤',c:'#0BA5EC',cf:'rgba(11,165,236,.15)',svc:'Consultoría Legal'},
  {id:'PP',n:'Política Privacidad',ico:'📄',c:'#10B981',cf:'rgba(16,185,129,.15)',svc:'Consultoría Legal'},
  {id:'CONS',n:'Consentimiento',ico:'✅',c:'#F59E0B',cf:'rgba(245,158,11,.15)',svc:'Consultoría Legal'},
  {id:'BL',n:'Bases Licitud',ico:'⚖️',c:'#EF4444',cf:'rgba(239,68,68,.15)',svc:'Consultoría Legal'},
  {id:'ARC',n:'Derechos ARCOP',ico:'🔑',c:'#06B6D4',cf:'rgba(6,182,212,.15)',svc:'Consultoría Legal'},
  {id:'DPIAL',n:'Evaluación Impacto',ico:'🔍',c:'#F97316',cf:'rgba(249,115,22,.15)',svc:'Consultoría Legal'},
  {id:'BRE',n:'Brechas',ico:'🚨',c:'#DC2626',cf:'rgba(220,38,38,.15)',svc:'Consultoría Legal'},
  {id:'DPAL',n:'Encargados (DPA)',ico:'🤝',c:'#7C3AED',cf:'rgba(124,58,237,.15)',svc:'Consultoría Legal'},
  {id:'SEGL',n:'Seguridad',ico:'🛡️',c:'#059669',cf:'rgba(5,150,105,.15)',svc:'Ciberseguridad'},
  {id:'TIL',n:'Transf. Internacional',ico:'🌐',c:'#2563EB',cf:'rgba(37,99,235,.15)',svc:'Consultoría Legal'},
  {id:'DSM',n:'Datos Sensibles',ico:'⚕️',c:'#BE185D',cf:'rgba(190,24,93,.15)',svc:'Consultoría Legal'},
  {id:'DAL',n:'Decisiones Auto.',ico:'🤖',c:'#4F46E5',cf:'rgba(79,70,229,.15)',svc:'Consultoría Legal'},
  {id:'MPI',n:'Prevención',ico:'🏆',c:'#0891B2',cf:'rgba(8,145,178,.15)',svc:'Consultoría Legal'},
  {id:'CAPL',n:'Capacitación',ico:'🎓',c:'#CA8A04',cf:'rgba(202,138,4,.15)',svc:'Consultoría Legal'}
];

export const FASES_LEY = [
  {id:'RAT',wks:4,dep:null},
  {id:'PP',wks:3,dep:['RAT']},
  {id:'CONS',wks:3,dep:['PP']},
  {id:'BL',wks:2,dep:['RAT']},
  {id:'ARC',wks:4,dep:['PP','CONS']},
  {id:'DPOL',wks:3,dep:['RAT']},
  {id:'SEGL',wks:4,dep:['RAT']},
  {id:'DPAL',wks:3,dep:['SEGL']},
  {id:'BRE',wks:3,dep:['SEGL']},
  {id:'DPIAL',wks:3,dep:['RAT','SEGL']},
  {id:'TIL',wks:3,dep:['DPAL']},
  {id:'DSM',wks:3,dep:['CONS','SEGL']},
  {id:'DAL',wks:2,dep:['ARC']},
  {id:'MPI',wks:4,dep:['RAT','SEGL','ARC','BRE']},
  {id:'CAPL',wks:2,dep:['PP','SEGL']}
];

// Preguntas con estructura padre/hija: las "hijas" (parent: 'XXX_P') se
// ocultan si la pregunta padre se respondió "No" (nivel 0). Algunas son
// condicionales al perfil vía .f(perfil) (datos sensibles, transferencia
// internacional, decisiones automatizadas).
export const PREGUNTAS_LEY = [
  // --- RAT ---
  {id:'RAT_P',d:'RAT',q:'¿Cuenta con un Registro de Actividades de Tratamiento (RAT)?',desc:'El RAT es un documento obligatorio donde se registran todos los tratamientos de datos personales que realiza su empresa: qué datos recogen, para qué, a quién los comparten y por cuánto tiempo los guardan.',type:'parent',f:function(){return true;},o:[{l:0,x:'No'},{l:1,x:'Parcial'},{l:3,x:'Sí'}]},
  {id:'RAT1',d:'RAT',parent:'RAT_P',q:'¿El RAT documenta las categorías de datos personales y de titulares?',f:function(){return true;},o:[{l:0,x:'No se registran.'},{l:1,x:'Listado parcial sin categorizar.'},{l:2,x:'Categorías definidas sin actualizar.'},{l:3,x:'Categorías completas y actualizadas.'}]},
  {id:'RAT2',d:'RAT',parent:'RAT_P',q:'¿El RAT registra la finalidad de cada tratamiento?',f:function(){return true;},o:[{l:0,x:'No se registra.'},{l:1,x:'Finalidades genéricas.'},{l:2,x:'Finalidades específicas sin revisión.'},{l:3,x:'Finalidades específicas y revisadas periódicamente.'}]},
  {id:'RAT3',d:'RAT',parent:'RAT_P',q:'¿El RAT identifica la base de licitud de cada tratamiento?',f:function(){return true;},o:[{l:0,x:'No se identifica.'},{l:1,x:'Base genérica para todo.'},{l:2,x:'Base por tratamiento sin documentar.'},{l:3,x:'Base documentada y justificada por tratamiento.'}]},
  {id:'RAT4',d:'RAT',parent:'RAT_P',q:'¿El RAT identifica destinatarios y plazos de conservación?',f:function(){return true;},o:[{l:0,x:'No se registran.'},{l:1,x:'Parcialmente identificados.'},{l:2,x:'Identificados sin criterios claros.'},{l:3,x:'Destinatarios y plazos documentados con criterios.'}]},
  {id:'RAT5',d:'RAT',parent:'RAT_P',q:'¿El RAT se mantiene actualizado de forma periódica?',f:function(){return true;},o:[{l:0,x:'Nunca se actualiza.'},{l:1,x:'Se actualiza ante cambios mayores.'},{l:2,x:'Revisión anual.'},{l:3,x:'Revisión periódica con responsable asignado.'}]},

  // --- DPO ---
  {id:'DPO_P',d:'DPOL',q:'¿Cuenta con un Delegado de Protección de Datos (DPO)?',desc:'El DPO es la persona responsable de supervisar que su empresa cumpla con la ley de protección de datos. Puede ser un empleado interno o un profesional externo contratado para este rol.',type:'parent',f:function(){return true;},o:[{l:0,x:'No'},{l:1,x:'Parcial'},{l:3,x:'Sí'}]},
  {id:'DPO1',d:'DPOL',parent:'DPO_P',q:'¿El DPO tiene autonomía funcional?',f:function(){return true;},o:[{l:0,x:'No tiene autonomía, depende de un área operativa.'},{l:1,x:'Autonomía declarada pero recibe instrucciones.'},{l:2,x:'Autonomía documentada sin revisión periódica.'},{l:3,x:'Autonomía garantizada, documentada y verificada.'}]},
  {id:'DPO2',d:'DPOL',parent:'DPO_P',q:'¿El DPO actúa como punto de contacto con la Agencia?',f:function(){return true;},o:[{l:0,x:'No está definido como contacto.'},{l:1,x:'Designado sin protocolo de comunicación.'},{l:2,x:'Protocolo documentado sin probar.'},{l:3,x:'Protocolo activo, probado y con registros.'}]},
  {id:'DPO3',d:'DPOL',parent:'DPO_P',q:'¿El DPO supervisa el cumplimiento interno?',f:function(){return true;},o:[{l:0,x:'No realiza supervisión.'},{l:1,x:'Supervisión reactiva ante incidentes.'},{l:2,x:'Supervisión planificada sin periodicidad.'},{l:3,x:'Supervisión sistemática con auditorías y reportes.'}]},
  {id:'DPO4',d:'DPOL',parent:'DPO_P',q:'¿El DPO informa y asesora a la organización?',f:function(){return true;},o:[{l:0,x:'No realiza asesoría.'},{l:1,x:'Asesoría informal sin registro.'},{l:2,x:'Asesoría documentada sin plan.'},{l:3,x:'Programa formal de asesoría y capacitaciones.'}]},
  {id:'DPO5',d:'DPOL',parent:'DPO_P',q:'¿El DPO cuenta con recursos y formación adecuados?',f:function(){return true;},o:[{l:0,x:'Sin recursos ni formación.'},{l:1,x:'Formación básica sin presupuesto.'},{l:2,x:'Presupuesto y formación sin plan de actualización.'},{l:3,x:'Presupuesto dedicado y formación continua.'}]},

  // --- POLÍTICA DE PRIVACIDAD ---
  {id:'PP_P',d:'PP',q:'¿Cuenta con una política de privacidad publicada?',desc:'La política de privacidad es el documento público donde su empresa informa a las personas qué datos recoge, para qué los usa, con quién los comparte y cómo pueden ejercer sus derechos.',type:'parent',f:function(){return true;},o:[{l:0,x:'No'},{l:1,x:'Parcial'},{l:3,x:'Sí'}]},
  {id:'PP1',d:'PP',parent:'PP_P',q:'¿La política identifica al responsable y sus datos de contacto?',f:function(){return true;},o:[{l:0,x:'No se identifica.'},{l:1,x:'Nombre sin contacto.'},{l:2,x:'Nombre y contacto incompleto.'},{l:3,x:'Identificación completa con DPO si aplica.'}]},
  {id:'PP2',d:'PP',parent:'PP_P',q:'¿La política informa finalidades y bases de licitud?',f:function(){return true;},o:[{l:0,x:'No las informa.'},{l:1,x:'Finalidades genéricas sin base legal.'},{l:2,x:'Finalidades específicas sin base legal.'},{l:3,x:'Finalidades y bases de licitud detalladas.'}]},
  {id:'PP3',d:'PP',parent:'PP_P',q:'¿La política informa sobre derechos ARCOP y cómo ejercerlos?',f:function(){return true;},o:[{l:0,x:'No los menciona.'},{l:1,x:'Mención genérica sin procedimiento.'},{l:2,x:'Derechos listados con procedimiento básico.'},{l:3,x:'Derechos detallados con canales y plazos claros.'}]},
  {id:'PP4',d:'PP',parent:'PP_P',q:'¿La política está redactada en lenguaje claro y accesible?',f:function(){return true;},o:[{l:0,x:'Lenguaje técnico/legal inaccesible.'},{l:1,x:'Parcialmente comprensible.'},{l:2,x:'Clara pero extensa.'},{l:3,x:'Clara, concisa y accesible para cualquier persona.'}]},

  // --- CONSENTIMIENTO ---
  {id:'CON_P',d:'CONS',q:'¿Gestionan el consentimiento de los titulares de datos?',desc:'El consentimiento es la autorización que una persona da para que su empresa use sus datos personales. Debe ser libre, informado, específico e inequívoco.',type:'parent',f:function(){return true;},o:[{l:0,x:'No'},{l:1,x:'Parcial'},{l:3,x:'Sí'}]},
  {id:'CON1',d:'CONS',parent:'CON_P',q:'¿El consentimiento es libre, informado, específico e inequívoco?',f:function(){return true;},o:[{l:0,x:'No cumple ningún requisito.'},{l:1,x:'Consentimiento genérico tipo "acepto todo".'},{l:2,x:'Informado pero no específico por finalidad.'},{l:3,x:'Cumple los cuatro requisitos y es verificable.'}]},
  {id:'CON2',d:'CONS',parent:'CON_P',q:'¿Se evitan casillas premarcadas y se permite revocar fácilmente?',f:function(){return true;},o:[{l:0,x:'Casillas premarcadas, sin revocación.'},{l:1,x:'Sin premarcado pero revocación difícil.'},{l:2,x:'Sin premarcado con revocación disponible.'},{l:3,x:'Sin premarcado, revocación sencilla y gratuita.'}]},
  {id:'CON3',d:'CONS',parent:'CON_P',q:'¿Se documenta y gestiona el consentimiento de forma verificable?',f:function(){return true;},o:[{l:0,x:'No se documenta.'},{l:1,x:'Registro parcial sin trazabilidad.'},{l:2,x:'Registro con fecha pero sin detalle.'},{l:3,x:'Registro completo, trazable y auditable.'}]},
  {id:'CON4',d:'CONS',parent:'CON_P',q:'¿Se solicita consentimiento separado para cada finalidad?',f:function(){return true;},o:[{l:0,x:'Un solo consentimiento para todo.'},{l:1,x:'Separación parcial.'},{l:2,x:'Separado pero sin granularidad suficiente.'},{l:3,x:'Consentimiento granular por finalidad.'}]},

  // --- BASES DE LICITUD ---
  {id:'BL_P',d:'BL',q:'¿Tienen documentadas las bases de licitud de sus tratamientos?',desc:'La base de licitud es la justificación legal que permite a su empresa tratar datos personales. Puede ser consentimiento, ejecución de contrato, obligación legal o interés legítimo, entre otras.',type:'parent',f:function(){return true;},o:[{l:0,x:'No'},{l:1,x:'Parcial'},{l:3,x:'Sí'}]},
  {id:'BL1',d:'BL',parent:'BL_P',q:'¿Cada tratamiento tiene una base de licitud identificada?',f:function(){return true;},o:[{l:0,x:'No se han identificado.'},{l:1,x:'Algunas actividades con base genérica.'},{l:2,x:'Mayoría identificadas sin documentar.'},{l:3,x:'Todas documentadas y justificadas.'}]},
  {id:'BL2',d:'BL',parent:'BL_P',q:'¿Se realiza análisis de ponderación cuando se invoca interés legítimo?',f:function(){return true;},o:[{l:0,x:'No se analiza.'},{l:1,x:'Invocación sin análisis.'},{l:2,x:'Análisis parcial sin documentar.'},{l:3,x:'Análisis documentado con balance de derechos.'}]},

  // --- DERECHOS ARCOP ---
  {id:'ARC_P',d:'ARC',q:'¿Tienen procedimientos para atender derechos ARCOP?',desc:'Los derechos ARCOP permiten a las personas acceder, rectificar, cancelar, oponerse y portar sus datos personales. Su empresa debe tener canales y plazos para atender estas solicitudes.',type:'parent',f:function(){return true;},o:[{l:0,x:'No'},{l:1,x:'Parcial'},{l:3,x:'Sí'}]},
  {id:'ARC1',d:'ARC',parent:'ARC_P',q:'¿Tienen procedimiento para acceso, rectificación y supresión?',f:function(){return true;},o:[{l:0,x:'No existen procedimientos.'},{l:1,x:'Se atienden de forma informal.'},{l:2,x:'Procedimiento documentado sin difusión.'},{l:3,x:'Procedimiento formal, difundido y probado.'}]},
  {id:'ARC2',d:'ARC',parent:'ARC_P',q:'¿Tienen procedimiento para oposición y portabilidad?',f:function(){return true;},o:[{l:0,x:'No existen.'},{l:1,x:'Atención informal.'},{l:2,x:'Documentado sin implementar completamente.'},{l:3,x:'Implementado con canales claros.'}]},
  {id:'ARC3',d:'ARC',parent:'ARC_P',q:'¿Se responde dentro de los plazos legales?',f:function(){return true;},o:[{l:0,x:'No se miden plazos.'},{l:1,x:'Sin control de tiempos.'},{l:2,x:'Plazos definidos sin seguimiento.'},{l:3,x:'Plazos controlados con métricas.'}]},
  {id:'ARC4',d:'ARC',parent:'ARC_P',q:'¿Existen canales accesibles y gratuitos para ejercer derechos?',f:function(){return true;},o:[{l:0,x:'No hay canales definidos.'},{l:1,x:'Solo correo genérico.'},{l:2,x:'Canal dedicado sin difusión.'},{l:3,x:'Canales múltiples, accesibles y difundidos.'}]},

  // --- EVALUACIÓN DE IMPACTO (DPIA) --- CONDICIONAL: datos sensibles a gran escala
  {id:'DPIA_P',d:'DPIAL',q:'¿Realizan evaluaciones de impacto en protección de datos (DPIA)?',desc:'La DPIA es un análisis que debe hacerse antes de realizar tratamientos de datos que impliquen alto riesgo para las personas, como perfilamiento automatizado o tratamiento masivo de datos sensibles.',type:'parent',f:function(p){return p.datosSensibles==='si';},o:[{l:0,x:'No'},{l:1,x:'Parcial'},{l:3,x:'Sí'}]},
  {id:'DPIA1',d:'DPIAL',parent:'DPIA_P',q:'¿La DPIA documenta naturaleza del tratamiento, riesgos y mitigación?',f:function(p){return p.datosSensibles==='si';},o:[{l:0,x:'No se documenta.'},{l:1,x:'Descripción básica sin riesgos.'},{l:2,x:'Riesgos identificados sin mitigación.'},{l:3,x:'Análisis completo con medidas de mitigación.'}]},
  {id:'DPIA2',d:'DPIAL',parent:'DPIA_P',q:'¿Se realiza DPIA para perfilamiento y tratamiento masivo de datos sensibles?',f:function(p){return p.datosSensibles==='si';},o:[{l:0,x:'Nunca.'},{l:1,x:'Solo ante solicitud.'},{l:2,x:'Para algunos tratamientos.'},{l:3,x:'Siempre que aplica, de forma sistemática.'}]},
  {id:'DPIA3',d:'DPIAL',parent:'DPIA_P',q:'¿Se consulta a la Agencia cuando el riesgo residual es alto?',f:function(p){return p.datosSensibles==='si';},o:[{l:0,x:'No se consulta.'},{l:1,x:'Desconocen la obligación.'},{l:2,x:'Conocen sin haber consultado.'},{l:3,x:'Consulta formal cuando corresponde.'}]},

  // --- BRECHAS ---
  {id:'BRE_P',d:'BRE',q:'¿Cuenta con un protocolo de gestión de brechas de seguridad de datos?',desc:'Una brecha de seguridad es cualquier incidente que comprometa datos personales (robo, filtración, acceso no autorizado). La ley exige notificar a la Agencia y a los afectados.',type:'parent',f:function(){return true;},o:[{l:0,x:'No'},{l:1,x:'Parcial'},{l:3,x:'Sí'}]},
  {id:'BRE1',d:'BRE',parent:'BRE_P',q:'¿Tienen capacidad para detectar y evaluar brechas oportunamente?',f:function(){return true;},o:[{l:0,x:'No hay detección.'},{l:1,x:'Detección manual reactiva.'},{l:2,x:'Alertas parciales sin evaluación formal.'},{l:3,x:'Detección automatizada con evaluación formal.'}]},
  {id:'BRE2',d:'BRE',parent:'BRE_P',q:'¿Se notifica a la Agencia y titulares dentro del plazo legal?',f:function(){return true;},o:[{l:0,x:'No se notifica.'},{l:1,x:'Sin plazos definidos.'},{l:2,x:'Protocolo sin probar.'},{l:3,x:'Protocolo probado con plazos cumplidos.'}]},
  {id:'BRE3',d:'BRE',parent:'BRE_P',q:'¿Se documentan incidentes y acciones correctivas?',f:function(){return true;},o:[{l:0,x:'No se documentan.'},{l:1,x:'Registro informal.'},{l:2,x:'Registro parcial sin acciones.'},{l:3,x:'Registro completo con acciones y seguimiento.'}]},

  // --- CONTRATOS CON ENCARGADOS (DPA) ---
  {id:'DPA_P',d:'DPAL',q:'¿Tienen contratos de tratamiento de datos (DPA) con sus proveedores?',desc:'Cuando un proveedor procesa datos personales en nombre de su empresa (ej. servicios cloud, CRM, nómina), debe existir un contrato que establezca las obligaciones de protección de datos.',type:'parent',f:function(){return true;},o:[{l:0,x:'No'},{l:1,x:'Parcial'},{l:3,x:'Sí'}]},
  {id:'DPA1',d:'DPAL',parent:'DPA_P',q:'¿Los contratos establecen finalidad, alcance y obligaciones de seguridad?',f:function(){return true;},o:[{l:0,x:'Sin cláusulas de datos.'},{l:1,x:'Cláusulas genéricas.'},{l:2,x:'Cláusulas específicas sin verificar.'},{l:3,x:'Cláusulas detalladas y verificadas.'}]},
  {id:'DPA2',d:'DPAL',parent:'DPA_P',q:'¿Los contratos incluyen responsabilidades ante brechas?',f:function(){return true;},o:[{l:0,x:'No se contemplan.'},{l:1,x:'Mención genérica.'},{l:2,x:'Procedimiento sin probar.'},{l:3,x:'Procedimiento detallado con plazos.'}]},
  {id:'DPA3',d:'DPAL',parent:'DPA_P',q:'¿Se verifica periódicamente el cumplimiento de los encargados?',f:function(){return true;},o:[{l:0,x:'Nunca se verifica.'},{l:1,x:'Confianza sin evaluación.'},{l:2,x:'Evaluación al contratar.'},{l:3,x:'Evaluación periódica documentada.'}]},

  // --- MEDIDAS DE SEGURIDAD ---
  {id:'SEG_P',d:'SEGL',q:'¿Implementan medidas de seguridad para proteger datos personales?',desc:'Son las medidas técnicas (cifrado, control de acceso, respaldos) y organizativas (políticas, procedimientos, roles) que protegen los datos personales contra accesos no autorizados, pérdida o destrucción.',type:'parent',f:function(){return true;},o:[{l:0,x:'No'},{l:1,x:'Parcial'},{l:3,x:'Sí'}]},
  {id:'SEG1',d:'SEGL',parent:'SEG_P',q:'¿Implementan medidas técnicas adecuadas al riesgo?',f:function(){return true;},o:[{l:0,x:'Sin medidas técnicas.'},{l:1,x:'Antivirus y firewall básico.'},{l:2,x:'Controles sin evaluación de riesgo.'},{l:3,x:'Controles proporcionales al riesgo evaluado.'}]},
  {id:'SEG2',d:'SEGL',parent:'SEG_P',q:'¿Implementan medidas organizativas (políticas, procedimientos)?',f:function(){return true;},o:[{l:0,x:'Sin medidas organizativas.'},{l:1,x:'Reglas informales.'},{l:2,x:'Políticas sin aplicar consistentemente.'},{l:3,x:'Políticas aprobadas, difundidas y auditadas.'}]},
  {id:'SEG3',d:'SEGL',parent:'SEG_P',q:'¿Cifran datos sensibles en almacenamiento y transmisión?',f:function(){return true;},o:[{l:0,x:'Sin cifrado.'},{l:1,x:'Cifrado parcial.'},{l:2,x:'Cifrado en sistemas críticos.'},{l:3,x:'Cifrado integral con gestión de llaves.'}]},
  {id:'SEG4',d:'SEGL',parent:'SEG_P',q:'¿Controlan accesos con principio de mínimo privilegio?',f:function(){return true;},o:[{l:0,x:'Acceso abierto.'},{l:1,x:'Permisos amplios sin revisión.'},{l:2,x:'Por área sin mínimo privilegio.'},{l:3,x:'Mínimo privilegio auditado periódicamente.'}]},

  // --- TRANSFERENCIAS INTERNACIONALES --- CONDICIONAL
  {id:'TI_P',d:'TIL',q:'¿Cuentan con garantías para transferencias internacionales de datos?',desc:'Cuando datos personales salen de Chile (servidores en el extranjero, proveedores internacionales, plataformas cloud con hosting fuera del país), se deben cumplir requisitos legales adicionales.',type:'parent',f:function(p){return p.transferencia==='si';},o:[{l:0,x:'No'},{l:1,x:'Parcial'},{l:3,x:'Sí'}]},
  {id:'TI1',d:'TIL',parent:'TI_P',q:'¿Verifican nivel de adecuación del país destinatario?',f:function(p){return p.transferencia==='si';},o:[{l:0,x:'No se verifica.'},{l:1,x:'Desconocen el requisito.'},{l:2,x:'Verificación parcial.'},{l:3,x:'Verificación documentada por transferencia.'}]},
  {id:'TI2',d:'TIL',parent:'TI_P',q:'¿Utilizan garantías adecuadas (cláusulas contractuales, normas corporativas)?',f:function(p){return p.transferencia==='si';},o:[{l:0,x:'Sin garantías.'},{l:1,x:'Confianza en el proveedor.'},{l:2,x:'Cláusulas genéricas.'},{l:3,x:'Cláusulas tipo o normas corporativas vinculantes.'}]},
  {id:'TI3',d:'TIL',parent:'TI_P',q:'¿Informan al titular sobre las transferencias internacionales?',f:function(p){return p.transferencia==='si';},o:[{l:0,x:'No se informa.'},{l:1,x:'Mención genérica.'},{l:2,x:'Información parcial.'},{l:3,x:'Información completa en política de privacidad.'}]},

  // --- DATOS SENSIBLES Y MENORES --- CONDICIONAL
  {id:'DSM_P',d:'DSM',q:'¿Aplican protección reforzada a datos sensibles y de menores?',desc:'Los datos sensibles incluyen salud, biometría, origen étnico, orientación sexual y datos penales. Los datos de menores de edad requieren consentimiento de padres o tutores.',type:'parent',f:function(p){return p.datosSensibles==='si';},o:[{l:0,x:'No'},{l:1,x:'Parcial'},{l:3,x:'Sí'}]},
  {id:'DSM1',d:'DSM',parent:'DSM_P',q:'¿Obtienen consentimiento explícito para datos sensibles?',f:function(p){return p.datosSensibles==='si';},o:[{l:0,x:'No se distinguen.'},{l:1,x:'Mismo consentimiento que datos comunes.'},{l:2,x:'Consentimiento separado sin verificar.'},{l:3,x:'Consentimiento explícito, verificable y documentado.'}]},
  {id:'DSM2',d:'DSM',parent:'DSM_P',q:'¿Obtienen consentimiento de padres/tutores para datos de menores?',f:function(p){return p.datosSensibles==='si';},o:[{l:0,x:'No se gestiona.'},{l:1,x:'Se asume consentimiento.'},{l:2,x:'Se solicita sin verificar identidad del tutor.'},{l:3,x:'Proceso verificable con identidad del tutor.'}]},
  {id:'DSM3',d:'DSM',parent:'DSM_P',q:'¿Limitan el tratamiento de datos sensibles al mínimo necesario?',f:function(p){return p.datosSensibles==='si';},o:[{l:0,x:'Se recopila sin criterio.'},{l:1,x:'Conciencia sin aplicar.'},{l:2,x:'Minimización parcial.'},{l:3,x:'Minimización estricta y documentada.'}]},

  // --- DECISIONES AUTOMATIZADAS --- CONDICIONAL
  {id:'DA_P',d:'DAL',q:'¿Garantizan derechos ante decisiones automatizadas?',desc:'Si su empresa usa algoritmos, IA o sistemas automáticos para tomar decisiones que afecten a personas (scoring, perfilamiento, selección), debe garantizar supervisión humana y el derecho a revisión.',type:'parent',f:function(p){return p.decisionesAuto==='si';},o:[{l:0,x:'No'},{l:1,x:'Parcial'},{l:3,x:'Sí'}]},
  {id:'DA1',d:'DAL',parent:'DA_P',q:'¿Proporcionan supervisión humana en decisiones con efectos significativos?',f:function(p){return p.decisionesAuto==='si';},o:[{l:0,x:'Decisiones 100% automáticas.'},{l:1,x:'Supervisión nominal sin intervención real.'},{l:2,x:'Supervisión para algunos casos.'},{l:3,x:'Supervisión humana garantizada con procedimiento.'}]},
  {id:'DA2',d:'DAL',parent:'DA_P',q:'¿Informan al titular cuando es sujeto de una decisión automatizada?',f:function(p){return p.decisionesAuto==='si';},o:[{l:0,x:'No se informa.'},{l:1,x:'Información genérica.'},{l:2,x:'Información parcial sin derecho a revisión.'},{l:3,x:'Información clara con derecho a revisión humana.'}]},

  // --- MODELO DE PREVENCIÓN ---
  {id:'MPI_P',d:'MPI',q:'¿Han adoptado un modelo de prevención de infracciones?',desc:'El modelo de prevención es un programa voluntario de cumplimiento que, si está certificado e inscrito en el Registro Nacional, puede atenuar sanciones ante infracciones.',type:'parent',f:function(){return true;},o:[{l:0,x:'No'},{l:1,x:'Parcial'},{l:3,x:'Sí'}]},
  {id:'MPI1',d:'MPI',parent:'MPI_P',q:'¿El modelo contempla protocolos y mecanismos de supervisión?',f:function(){return true;},o:[{l:0,x:'Sin protocolos.'},{l:1,x:'Directrices básicas.'},{l:2,x:'Protocolos sin supervisión.'},{l:3,x:'Protocolos con supervisión y mejora continua.'}]},
  {id:'MPI2',d:'MPI',parent:'MPI_P',q:'¿Se ha inscrito o planea inscribirse en el Registro Nacional?',f:function(){return true;},o:[{l:0,x:'No lo conocen.'},{l:1,x:'Conocen sin plan.'},{l:2,x:'En preparación.'},{l:3,x:'Inscrito o en proceso formal.'}]},

  // --- CAPACITACIÓN ---
  {id:'CAP_P',d:'CAPL',q:'¿Capacitan al personal en protección de datos personales?',desc:'Todo el personal que maneja datos personales debe conocer sus obligaciones. La capacitación debe ser periódica y cubrir políticas internas, derechos de titulares y protocolos ante brechas.',type:'parent',f:function(){return true;},o:[{l:0,x:'No'},{l:1,x:'Parcial'},{l:3,x:'Sí'}]},
  {id:'CAP1',d:'CAPL',parent:'CAP_P',q:'¿Se capacita periódicamente al personal sobre sus obligaciones?',f:function(){return true;},o:[{l:0,x:'Nunca.'},{l:1,x:'Charla única al ingresar.'},{l:2,x:'Capacitación anual sin evaluación.'},{l:3,x:'Programa continuo con evaluación.'}]},
  {id:'CAP2',d:'CAPL',parent:'CAP_P',q:'¿El personal conoce los protocolos ante brechas y solicitudes?',f:function(){return true;},o:[{l:0,x:'No los conocen.'},{l:1,x:'Conocimiento parcial.'},{l:2,x:'Difundidos sin verificar comprensión.'},{l:3,x:'Difundidos, comprendidos y practicados.'}]}
];

export const ENTREGABLES_LEY = {
  RAT:['Registro de Actividades de Tratamiento (RAT)','Inventario de bases de datos personales'],
  DPOL:['Nombramiento formal del DPO','Manual de funciones del DPO'],
  PP:['Política de privacidad publicada','Aviso de privacidad por canal de recolección'],
  CONS:['Formularios de consentimiento actualizados','Registro de consentimientos otorgados/revocados'],
  BL:['Mapa de bases de licitud por tratamiento','Análisis de interés legítimo documentado'],
  ARC:['Procedimiento de atención de derechos ARCOP','Formularios y canales de solicitud'],
  DPIAL:['Metodología de evaluación de impacto','DPIA documentadas por tratamiento de alto riesgo'],
  BRE:['Protocolo de gestión de brechas de seguridad','Plantilla de notificación a la Agencia'],
  DPAL:['Modelo de contrato de tratamiento de datos (DPA)','Registro de encargados evaluados'],
  SEGL:['Política de seguridad de datos personales','Plan de medidas técnicas y organizativas'],
  TIL:['Registro de transferencias internacionales','Cláusulas contractuales tipo implementadas'],
  DSM:['Protocolo de protección de datos sensibles','Procedimiento de consentimiento para menores'],
  DAL:['Protocolo de supervisión humana','Información al titular sobre decisiones automatizadas'],
  MPI:['Modelo de prevención de infracciones','Solicitud de inscripción en Registro Nacional'],
  CAPL:['Plan de capacitación en protección de datos','Material de formación y evaluación']
};
