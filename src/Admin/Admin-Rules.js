const express = require("express");
const router = express.Router();
const dbConnection = require("../Config/dbConfig");

router.post("/admin-rules", (req, res) => {
  const { opt } = req.body;

  if (opt === "consultarregistros") {
    const query = "SELECT `idRule`, `rule` FROM `rule`;";

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
          res.json({
            success: true,
            data: results,
          });
        } else {
          res.json({
            success: false,
            message: "No se encontraron Reglas",
          });
        }
      }
    });
  } else if (opt === "editarregistro") {
    const { idRule, rule } = req.body;

    const query = `UPDATE rule SET rule = "${rule}" WHERE idRule = ${idRule};`;

    dbConnection.query(query, (err, results) => {
      if (err) {
        console.error("Error al editar el registro:", err);
        res.status(500).json({
          success: false,
          message: "Error en el servidor al editar el registro",
          recommendation: "Verifica la consulta de edición",
        });
      } else {
        res.json({
          success: true,
          message: "Registro editado exitosamente.",
        });
      }
    });
  } else if (opt === "insertarregistro") {
    const { rule } = req.body;

    const query = `INSERT INTO rule(idUserType, rule) VALUES (2, "${rule}");`;

    dbConnection.query(query, (err, results) => {
      if (err) {
        console.error("Error al insertar el registro:", err);
        res.status(500).json({
          success: false,
          message: "Error en el servidor al insertar el registro",
          recommendation: "Verifica la consulta de inserción",
        });
      } else {
        res.json({
          success: true,
          message: "Registro insertado exitosamente.",
        });
      }
    });
  } else if (opt === "eliminarregistro") {
    const { idRule } = req.body;

    const query = `DELETE FROM rule WHERE idRule = ${idRule};`;

    dbConnection.query(query, (err, results) => {
      if (err) {
        console.error("Error al eliminar el registro:", err);
        res.status(500).json({
          success: false,
          message: "Error en el servidor al eliminar el registro",
          recommendation: "Verifica la consulta de eliminación",
        });
      } else {
        res.json({
          success: true,
          message: "Registro eliminado exitosamente.",
        });
      }
    });
  } else {
    res.status(400).json({
      success: false,
      message: "Opción no válida",
    });
  }
});

module.exports = router;
