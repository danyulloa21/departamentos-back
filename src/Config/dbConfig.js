
const mysql = require('mysql2');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '=Pulparindo123_',
  database: 'departamentos',
  multipleStatements: true, // Habilita el soporte para múltiples consultas
};

const handleDisconnect = () => {
  const connection = mysql.createConnection(dbConfig);

  connection.connect((err) => {
    if (err) {
      console.error('Error al reconectar a la base de datos:', err);
      setTimeout(handleDisconnect, 2000); // Reintentar después de 2 segundos
    } else {
      console.log('Reconexión exitosa a la base de datos');
    }
  });

  connection.on('error', (err) => {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.log('Conexión cerrada. Intentando reconectar...');
      handleDisconnect(); // Reconectar si la conexión se pierde
    } else {
      throw err;
    }
  });

  return connection;
};

const connection = handleDisconnect();

module.exports = connection;
 