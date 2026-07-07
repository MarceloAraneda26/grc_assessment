import { Connection, Request } from 'tedious';

const config = {
  server: 'localhost',
  instanceName: 'SQLEXPRESS',
  authentication: {
    type: 'default',
  },
  options: {
    encrypt: false,
    trustServerCertificate: true,
    database: 'GRC_Assessment',
  },
};

console.log('🔍 Intentando conectar con Tedious...\n');

const connection = new Connection(config);

connection.on('connect', () => {
  console.log('✓ Conectado exitosamente\n');

  const request = new Request(
    `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo' ORDER BY TABLE_NAME`,
    (err, rowCount) => {
      if (err) {
        console.error('✗ Error en query:', err);
        process.exit(1);
      }
      console.log(`\n✅ Query ejecutada. Filas: ${rowCount}`);
      connection.close();
      process.exit(0);
    }
  );

  request.on('row', (columns) => {
    columns.forEach((col) => {
      console.log(`   ✓ ${col.value}`);
    });
  });

  connection.execSql(request);
});

connection.on('error', (err) => {
  console.error('✗ Error de conexión:', err.message);
  process.exit(1);
});

connection.connect();
