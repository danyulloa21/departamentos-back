const express = require('express');
const router = express.Router();
const dbConnection = require('./dbConfig'); // Importa la conexión a la base de datos

// Ruta para manejar el inicio de sesión (no incluyas '/api' en esta definición)
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Utiliza la conexión a la base de datos para verificar las credenciales en tu base de datos
  const query = 'SELECT * FROM account WHERE accountName = ? AND password = ? AND status = "Activo"';
  //SELECT usertype.userTypeName FROM user, usertype, account WHERE user.idUser = 1 AND user.idUserType = usertype.idUserType;
  dbConnection.query(query, [username, password], (err, results) => {
    if (err) {
      console.error('Error al consultar la base de datos:', err);
      res.status(500).json({ success: false, message: 'Error en el servidor' });
    } else {
      if (results.length > 0) {

        
        // Si las credenciales son válidas (usuario encontrado), devuelve el primer resultado como un objeto
        const user = results[0];
        const {idAccount, idUser, accountName, status} = user;

        

        const queryUserType = 'SELECT usertype.userTypeName FROM user, usertype, account WHERE user.idUser = ? AND user.idUserType = usertype.idUserType;';
        dbConnection.query(queryUserType, [idUser], (err, results2) => {
          if (err) {
            console.error('Error al consultar la base de datos (2)');
            res.status(500).json({ success: false, message: 'Error en el servidor al consultar iduser' });
          } else {
            if (results2.length > 0) {

              const usertype = results2[0];
              res.json({idAccount, idUser, accountName, usertype,status});
            }
          }
        })


        // res.json({idAccount, idUser, accountName, status});

        
        
        
      } else {
        // Si las credenciales son inválidas (usuario no encontrado), devuelve una respuesta de error
        res.status(401).json({ error: 1, message: 'Credenciales incorrectas' });
      }
    }
  });
});

module.exports = router;
