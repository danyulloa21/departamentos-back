const express = require("express");
const router = express.Router();
const dbConnection = require("../Config/dbConfig");

router.post("/show-warnings", (req, res) => {
  const { idresidencia, opt } = req.body;
    
  if (opt == "insertarregistro") {
    const { iduser, aviso, nivelimportancia } = req.body;

    const queryInsertWarning = `INSERT INTO warning(idAccount, warning, importanceLevel) VALUES ((SELECT a.idAccount FROM account a, user u WHERE a.idUser = ${iduser} AND a.idUser = u.idUser), "${aviso}", "${nivelimportancia}");`;

    dbConnection.query(queryInsertWarning, (err, results) => {
        if (err) {
            console.error("Error al consultar la base de datos:", err);
            res.status(500).json({
              success: false,
              message: "Error en el servidor",
              recommendation: "Verifica la consulta",
              error: err.message // Puedes agregar más detalles del error aquí

            });
          } else {

            if (results.affectedRows > 0) {
                res.json({
                    success: true,
                    message: "Aviso insertado correctamente",
                    affectedRows: results.affectedRows
                  });
            } else {
              res.json({
                success: false,
                message: "Error al insertar aviso",
              });
            }
          }
    })

  } else {
    const queryWarnings = `SELECT * FROM (SELECT wt.idWarning, departamentNumber, name, surname, secondsurname, wt.warning, wt.creationDate, wt.creationTime, w2.importanceLevel FROM (SELECT w.idWarning, d.departamentNumber, u.name, u.surname, u.secondSurname, w.warning, w.creationDate, w.creationTime, w.importanceLevel FROM warning w, account a, user u, residence r, departament d, userdepartament dp WHERE a.idAccount = w.idAccount AND w.status  = "ACTIVO" AND a.idUser = u.idUser AND u.idUser = dp.idUser AND d.idDepartament = dp.idUserDepartament AND d.idResidence = r.idResidence AND r.idResidence = ${idresidencia} UNION SELECT w.idWarning, "ADMIN" as departmentNumber, u.name, u.surname, u.secondSurname, w.warning, w.creationDate, w.creationTime, w.importanceLevel FROM warning w, account a, user u, usertype ut WHERE a.idAccount = w.idAccount AND w.status  = "ACTIVO" AND a.idUser = u.idUser AND u.idUserType = ut.idUserType AND ut.userTypeName = "ADMIN" GROUP BY w.importanceLevel DESC) AS wt, warning w2 WHERE w2.idWarning = wt.idWarning) AS tablaWarning ORDER BY tablaWarning.importanceLevel DESC, tablaWarning.creationDate DESC, tablaWarning.creationTime DESC;`;

    dbConnection.query(queryWarnings, (err, results) => {
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
            message: "No se encontraron avisos",
          });
        }
      }
    });
  }
});
module.exports = router;
