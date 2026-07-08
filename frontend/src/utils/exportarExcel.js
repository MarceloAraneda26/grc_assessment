import { getDatosResultados, getDatosRoadmap } from './reporte-data.js';

const MODULO_LABELS = { cyber: 'Ciberseguridad', ley: 'Gobierno y Cumplimiento', ti: 'Levantamiento TI' };

const ESTILO_TITULO = { font: { bold: true, size: 14 } };
const ESTILO_SUBTITULO = { font: { bold: true, size: 11 } };
const ESTILO_ENCABEZADO = {
  font: { bold: true, color: { argb: 'FFFFFFFF' } },
  fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF97316' } },
  alignment: { vertical: 'middle', wrapText: true },
};

const aplicarEncabezado = (row) => row.eachCell(c => { c.style = ESTILO_ENCABEZADO; });
const anchoColumnas = (sheet, anchos) => anchos.forEach((w, i) => { sheet.getColumn(i + 1).width = w; });

const construirHojaResultados = (workbook, evaluacion, datos) => {
  const moduloLabel = MODULO_LABELS[evaluacion.modulo] || evaluacion.modulo;
  const empresa = evaluacion.perfil?.empresa || 'Evaluación';
  const sh = workbook.addWorksheet('Resultados');
  anchoColumnas(sh, [26, 55, 16]);

  sh.mergeCells('A1:C1');
  sh.getCell('A1').value = `Resultados — ${empresa}`;
  sh.getCell('A1').style = ESTILO_TITULO;

  sh.getCell('A2').value = 'Módulo';
  sh.getCell('B2').value = moduloLabel;
  sh.getCell('A3').value = 'Fecha de exportación';
  sh.getCell('B3').value = new Date().toLocaleDateString('es-CL');
  sh.getCell('A4').value = 'Madurez Global';
  sh.getCell('B4').value = `${datos.promedio}%`;
  sh.getCell('A5').value = 'Nivel';
  sh.getCell('B5').value = datos.nivel.label;
  ['A2', 'A3', 'A4', 'A5'].forEach(ref => { sh.getCell(ref).font = { bold: true }; });

  let fila = 7;
  sh.getCell(`A${fila}`).value = 'Dominio';
  sh.getCell(`B${fila}`).value = 'Puntuación';
  aplicarEncabezado(sh.getRow(fila));
  fila++;

  datos.dominios.forEach(dom => {
    sh.getCell(`A${fila}`).value = dom.nombre;
    sh.getCell(`B${fila}`).value = `${dom.puntuacion}%`;
    fila++;
  });

  fila += 2;
  sh.getCell(`A${fila}`).value = 'Dominio';
  sh.getCell(`B${fila}`).value = 'Pregunta';
  sh.getCell(`C${fila}`).value = 'Respuesta';
  aplicarEncabezado(sh.getRow(fila));
  fila++;

  datos.dominios.forEach(dom => {
    dom.preguntas.forEach(p => {
      const row = sh.getRow(fila);
      row.getCell(1).value = dom.nombre;
      row.getCell(2).value = p.texto;
      row.getCell(2).alignment = { wrapText: true };
      row.getCell(3).value = p.respuesta;
      fila++;
    });
  });
};

const construirHojaRoadmap = (workbook, datos) => {
  const sh = workbook.addWorksheet('Roadmap');
  anchoColumnas(sh, [42, 14, 14, 12]);

  sh.mergeCells('A1:D1');
  sh.getCell('A1').value = datos.titulo;
  sh.getCell('A1').style = ESTILO_TITULO;
  sh.mergeCells('A2:D2');
  sh.getCell('A2').value = datos.subtitulo;

  let fila = 4;
  sh.getCell(`A${fila}`).value = 'Tarea';
  sh.getCell(`B${fila}`).value = 'Mes Inicio';
  sh.getCell(`C${fila}`).value = 'Mes Fin';
  sh.getCell(`D${fila}`).value = 'Prioridad';
  aplicarEncabezado(sh.getRow(fila));
  fila++;

  datos.tareas.forEach(t => {
    sh.getCell(`A${fila}`).value = t.titulo;
    sh.getCell(`B${fila}`).value = t.mesInicio;
    sh.getCell(`C${fila}`).value = t.mesFin;
    sh.getCell(`D${fila}`).value = t.prioridad === 1 ? 'Alta' : 'Media';
    fila++;
  });

  fila += 1;
  sh.getCell(`A${fila}`).value = 'Hitos';
  sh.getCell(`A${fila}`).style = ESTILO_SUBTITULO;
  fila++;
  sh.getCell(`A${fila}`).value = 'Plazo';
  sh.getCell(`B${fila}`).value = 'Descripción';
  aplicarEncabezado(sh.getRow(fila));
  fila++;
  datos.hitos.forEach(h => {
    sh.getCell(`A${fila}`).value = `${h.num} ${h.label}`;
    sh.mergeCells(`B${fila}:D${fila}`);
    sh.getCell(`B${fila}`).value = h.desc;
    fila++;
  });

  fila += 1;
  sh.getCell(`A${fila}`).value = 'Resumen Ejecutivo';
  sh.getCell(`A${fila}`).style = ESTILO_SUBTITULO;
  fila++;
  sh.mergeCells(`A${fila}:D${fila + 2}`);
  sh.getCell(`A${fila}`).value = datos.resumen;
  sh.getCell(`A${fila}`).alignment = { wrapText: true, vertical: 'top' };
  fila += 4;

  sh.getCell(`A${fila}`).value = 'Entregables Principales';
  sh.getCell(`A${fila}`).style = ESTILO_SUBTITULO;
  fila++;
  datos.entregables.forEach(ent => {
    sh.getCell(`A${fila}`).value = `• ${ent}`;
    fila++;
  });

  if (Object.keys(datos.fases).length > 0) {
    fila += 1;
    sh.getCell(`A${fila}`).value = 'Fases de Implementación';
    sh.getCell(`A${fila}`).style = ESTILO_SUBTITULO;
    fila++;
    sh.getCell(`A${fila}`).value = 'Fase';
    sh.getCell(`B${fila}`).value = 'Entregable';
    aplicarEncabezado(sh.getRow(fila));
    fila++;
    Object.entries(datos.fases).forEach(([fase, items]) => {
      items.forEach(item => {
        sh.getCell(`A${fila}`).value = fase;
        sh.mergeCells(`B${fila}:D${fila}`);
        sh.getCell(`B${fila}`).value = item;
        fila++;
      });
    });
  }
};

/**
 * Construye el Workbook de 2 hojas (Resultados / Roadmap) para la evaluación
 * dada, cubriendo los 3 módulos (Ciberseguridad, Ley 21.719 y Levantamiento
 * TI). Función pura, sin dependencias del navegador — reutilizable también
 * para pruebas o generación en el servidor.
 */
export const generarWorkbookEvaluacion = async (evaluacion) => {
  // Import dinámico: exceljs pesa ~900kb minificado, no tiene sentido
  // incluirlo en el bundle inicial para usuarios que nunca exportan.
  const { default: ExcelJS } = await import('exceljs');
  const datosResultados = getDatosResultados(evaluacion);
  const datosRoadmap = getDatosRoadmap(evaluacion);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'TIBOX GRC Assessment';
  workbook.created = new Date();

  construirHojaResultados(workbook, evaluacion, datosResultados);
  construirHojaRoadmap(workbook, datosRoadmap);

  return workbook;
};

export const nombreArchivoExcel = (evaluacion) => {
  const empresa = evaluacion.perfil?.empresa || 'Evaluacion';
  const moduloLabel = MODULO_LABELS[evaluacion.modulo] || evaluacion.modulo;
  return `${empresa}-${moduloLabel}`.replace(/[^a-zA-Z0-9-_]+/g, '_') + '.xlsx';
};

/**
 * Genera y descarga el Excel de la evaluación actual en el navegador.
 */
export const exportarEvaluacionExcel = async (evaluacion) => {
  const workbook = await generarWorkbookEvaluacion(evaluacion);
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombreArchivoExcel(evaluacion);
  a.click();
  URL.revokeObjectURL(url);
};
