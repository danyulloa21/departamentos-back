const express = require("express");
const router = express.Router();
const dbConnection = require("../Config/dbConfig");

router.post("/admin-debts", (req, res) => {
  const { opt } = req.body;

  if (opt === "editarregistro") {
    const { id } = req.body;
    const query = `UPDATE debt SET debt.status = "PAGADO" WHERE debt.idDebt = ${id};`;

    dbConnection.query(query, (err, results) => {
      if (err) {
        console.error("Error al actualizar el registro:", err);
        res.status(500).json({
          success: false,
          message: "Error en el servidor",
          recommendation: "Verifica la actualización del registro",
        });
      } else {
        if (results.affectedRows > 0) {
          res.json({
            success: true,
            message: "Registro actualizado correctamente",
          });
        } else {
          res.json({
            success: false,
            message:
              "Ningún registro fue actualizado. Puede que el registro no exista.",
          });
        }
      }
    });
  } else if (opt === "consultarregistros") {
    const query =
      'SELECT d.idDebt, u.name, u.surname, u.secondSurname, ct.name AS "ciudad", s.name AS "estado", c.name "pais", r.cologne, r.street, r.postalCode, dp.departamentNumber, cc.concept, d.debtDate, d.amount FROM debt d, concept cc, userdepartament ud, user u, departament dp, residence r, city c, state s, country ct WHERE d.idConcept = cc.idConcept AND d.idUserDepartament = ud.idUserDepartament AND ud.idDepartament = dp.idDepartament AND u.idUser = ud.idUser AND dp.idResidence = r.idResidence AND r.idCity = c.idCity AND c.idState = s.idState AND s.idCountry = ct.idCountry AND d.status = "ACTIVO"  ORDER BY d.debtDate DESC;';

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
            data: results
          });
        } else {
          res.json({
            success: false,
            message: "No se encontraron Deudas",
          });
        }
      }
    });
  } else if (opt === "eliminarregistro") {
    const { id } = req.body;
    const query = `DELETE FROM debt WHERE debt.idDebt = ${id};`;

    dbConnection.query(query, (err, results) => {
      if (err) {
        console.error("Error al eliminar el registro:", err);
        res.status(500).json({
          success: false,
          message: "Error en el servidor",
          recommendation: "Verifica la eliminación del registro",
        });
      } else {
        if (results.affectedRows > 0) {
          res.json({
            success: true,
            message: "Registro eliminado correctamente",
          });
        } else {
          res.json({
            success: false,
            message:
              "Ningún registro fue eliminado. Puede que el registro no exista.",
          });
        }
      }
    });
  } else if (opt === "mostrardepartamentos"){
    const query = `SELECT ud.idUserDepartament, u.name, u.surname, u.secondSurname, ct.name AS "ciudad", s.name AS "estado", c.name "pais", r.cologne, r.street, r.postalCode, dp.departamentNumber, ud.admissionDate, ud.admissionTime FROM userdepartament ud, user u, departament dp, residence r, city c, state s, country ct WHERE ud.idDepartament = dp.idDepartament AND u.idUser = ud.idUser AND dp.idResidence = r.idResidence AND r.idCity = c.idCity AND c.idState = s.idState AND s.idCountry = ct.idCountry AND ud.status = "ALOJANDO" ORDER BY ud.admissionDate DESC, ud.admissionTime DESC;`;

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
            message: "No se encontraron Departamentos",
          });
        }
      }
    });
  } else if (opt === 'insertarregistro') {
    const {idUserDepartament, concept, amount} = req.body;
    const query = `INSERT INTO debt(idUserDepartament, idConcept, amount) VALUES (${idUserDepartament}, (SELECT idConcept FROM concept WHERE concept = "${concept}"), ${amount});`;

    dbConnection.query(query, (err, results) => {
      if (err) {
        console.error("Error al insertar el registro:", err);
        res.status(500).json({
          success: false,
          message: "Error en el servidor",
          recommendation: "Verifica la inserción del registro",
        });
      } else {
        if (results.affectedRows > 0) {
          res.json({
            success: true,
            message: "Registro insertado correctamente",
          });
        } else {
          res.json({
            success: false,
            message: "No se pudo insertar el registro",
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
