import { spawn } from 'child_process';
import { DB_DATABASE, DB_USER, DB_PASSWORD } from '../../config.js';
import { writeFileSync, readFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

let pool = null;

export const getConnection = async () => {
  if (pool) return pool;

  console.log('✓ Conectado a la base de datos ' + DB_DATABASE);

  pool = {
    request: () => ({
      query: (sql) =>
        new Promise((resolve, reject) => {
          const sqlFile = join(tmpdir(), `query_${Date.now()}.sql`);
          const outFile = join(tmpdir(), `output_${Date.now()}.txt`);

          try {
            writeFileSync(sqlFile, sql);

            // Construye el comando PowerShell directamente
            const psCommand = `
              $sqlcmdPath = "C:\\Program Files\\Microsoft SQL Server\\Client SDK\\ODBC\\170\\Tools\\Binn\\sqlcmd.exe"
              if (-not (Test-Path $sqlcmdPath)) {
                $sqlcmdPath = "C:\\Program Files (x86)\\Microsoft SQL Server\\Client SDK\\ODBC\\170\\Tools\\Binn\\sqlcmd.exe"
              }
              & $sqlcmdPath -S "(local)\\SQLEXPRESS" -d ${DB_DATABASE} -i "${sqlFile}" -s "," | Out-File -Encoding ASCII -FilePath "${outFile}"
            `.trim();

            const ps = spawn('powershell.exe', [
              '-NoProfile',
              '-ExecutionPolicy', 'Bypass',
              '-Command', psCommand,
            ]);

            let psError = '';

            ps.stderr.on('data', (data) => {
              psError += data.toString();
            });

            ps.on('close', (code) => {
              if (psError) {
                console.error('PowerShell error:', psError);
              }

              setTimeout(() => {
                try {
                  const output = readFileSync(outFile, 'utf-8');

                  const lines = output.split('\n');
                  const recordset = [];
                  let headers = [];
                  let dataStarted = false;

                  // Parsing robusto: busca líneas con valores, ignora guiones y mensajes
                  const dataLines = [];
                  for (const line of lines) {
                    const trimmed = line.trim();
                    // La fila separadora de sqlcmd con -s "," se ve como
                    // "-----,----,---" (guiones separados por comas), no solo
                    // guiones puros, así que hay que aceptar también comas/espacios.
                    if (!trimmed || trimmed.match(/^[-=,\s]+$/) || trimmed.match(/rows affected/i)) continue;
                    dataLines.push(trimmed);
                  }

                  // Primera línea de datos = encabezados
                  if (dataLines.length > 0) {
                    headers = dataLines[0].split(',').map(h => h.trim());
                  }

                  // Resto = datos
                  for (let i = 1; i < dataLines.length; i++) {
                    const line = dataLines[i];
                    const values = line.split(',').map(v => v.trim());
                    const row = {};
                    headers.forEach((header, idx) => {
                      row[header] = values[idx] || null;
                    });
                    recordset.push(row);
                  }

                  // Si no hay encabezados válidos, intenta buscar números en el output (para @@IDENTITY)
                  if (recordset.length === 0 && dataLines.length > 0) {
                    const firstLine = dataLines[0];
                    const numberMatch = firstLine.match(/(\d+)/);
                    if (numberMatch) {
                      recordset.push({ Id: parseInt(numberMatch[1]) });
                    }
                  }

                  try { unlinkSync(sqlFile); } catch (e) {}
                  try { unlinkSync(outFile); } catch (e) {}

                  resolve({ recordset, rowsAffected: [recordset.length] });
                } catch (err) {
                  console.error('File error:', err.message);
                  reject(err);
                }
              }, 500);
            });
          } catch (err) {
            reject(err);
          }
        }),
    }),
  };

  return pool;
};
