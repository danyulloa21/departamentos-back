const express = require("express");
const router = express.Router();
const dbConnection = require("../Config/dbConfig");

router.get("/show-rules", (req, res) => {
  const query = `SELECT rule FROM rule WHERE idUserType = 2;`;

  dbConnection.query(query, (err, results) => {
    if (err) {
      console.error("Error al consultar la base de datos:", err);
      res.status(500).json({
        success: false,
        message: "Error en el servidor",
        recommendation: "Verifica la consulta",
      });
    } else {
      if (results.length > 0) {
        res.json(results);
      } else {
        res.json({
          success: false,
          message: "No se encontraron reglas",
        });
      }
    }
  });
});
module.exports = router;
