const express = require("express");
const router = express.Router();
const dbConnection = require("../Config/dbConfig");

router.post("/admin-warnings", (req, res) => {
  const { opt } = req.body;

  if (opt === "consultarregistros") {
    const query =
      "SELECT w.idWarning, ct.name AS pais, s.name AS estado, c.name AS ciudad, r.street, r.cologne, r.postalCode, d.departamentNumber, u.name, u.surname, u.secondSurname, w.warning, w.creationDate, w.creationTime, w.importanceLevel FROM warning w, account a, user u, userdepartament ud, departament d, residence r, city c, state s, country ct WHERE w.idAccount = a.idAccount AND a.idUser = u.idUser AND ud.idUser = u.idUser AND ud.idDepartament = d.idDepartament AND d.idResidence = r.idResidence AND r.idCity = c.idCity AND c.idState = s.idState AND s.idCountry = ct.idCountry AND ud.status = 'ALOJANDO' AND w.status = 'ACTIVO' ORDER BY r.idResidence, w.importanceLevel DESC, w.creationDate DESC, w.creationTime DESC;";

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
            message: "No se encontraron Avisos",
          });
        }
      }
    });
  } else if (opt === "eliminarregistro") {
    const { idWarning } = req.body;

    const query = `DELETE FROM warning WHERE idWarning = ${idWarning};`;

    dbConnection.query(query, (err, results) => {
      if (err) {
        res.status(500).json({
          success: false,
          message: "Error al eliminar el aviso",
        });
      } else {
        res.json({
          success: true,
          message: "Aviso eliminado exitosamente",
        });
      }
    });
  } else if (opt === "consultarregistrosadmin") {
    const query = `SELECT "Administrador" , w.warning, w.creationDate, w.creationTime, w.importanceLevel FROM warning w, account a, user u, usertype ut WHERE w.idAccount = a.idAccount AND a.idUser = u.idUser AND u.idUserType = ut.idUserType AND w.status = "ACTIVO" AND ut.userTypeName = "ADMIN" ORDER BY w.importanceLevel DESC, w.creationDate DESC, w.creationTime DESC;`;

    dbConnection.query(query, (err, results) => {
      if (err) {
        res.status(500).json({
          success: false,
          message: "Error al consultar los registros de administradores",
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
          message: "No se encontraron avisos del administrador"
        });
      }
      }
    });
  }
  else {
    res.status(400).json({
      success: false,
      message: "Opción no válida",
    });
  }
});

module.exports = router;
