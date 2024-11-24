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
    const queryWarnings = `SELECT * 
FROM (
    SELECT 
        wt.idWarning, departamentNumber, name, surname, secondsurname, 
        wt.warning, wt.creationDate, wt.creationTime, 
        w2.importanceLevel
    FROM (
        SELECT 
            w.idWarning, d.departamentNumber, u.name, u.surname, u.secondSurname, 
            w.warning, w.creationDate, w.creationTime, w.importanceLevel 
        FROM warning w
        JOIN account a ON a.idAccount = w.idAccount
        JOIN user u ON a.idUser = u.idUser
        JOIN userdepartament dp ON u.idUser = dp.idUser
        JOIN departament d ON d.idDepartament = dp.idUserDepartament
        JOIN residence r ON d.idResidence = r.idResidence
        WHERE w.status = "ACTIVO" 
          AND r.idResidence = ${idresidencia} 
        UNION
        SELECT 
            w.idWarning, "ADMIN" AS departmentNumber, u.name, u.surname, u.secondSurname, 
            w.warning, w.creationDate, w.creationTime, w.importanceLevel 
        FROM warning w
        JOIN account a ON a.idAccount = w.idAccount
        JOIN user u ON a.idUser = u.idUser
        JOIN usertype ut ON u.idUserType = ut.idUserType
        WHERE w.status = "ACTIVO" 
          AND ut.userTypeName = "ADMIN"
    ) AS wt
    JOIN warning w2 ON w2.idWarning = wt.idWarning
) AS tablaWarning 
ORDER BY tablaWarning.importanceLevel DESC, 
         tablaWarning.creationDate DESC, 
         tablaWarning.creationTime DESC;
`;

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
