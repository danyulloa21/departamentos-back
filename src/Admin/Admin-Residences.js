const express = require("express");
const router = express.Router();
const dbConnection = require("../Config/dbConfig");

router.post("/admin-residences", (req, res) => {
  const { opt } = req.body;

  if (opt === "consultarregistros") {
    const query = `SELECT r.idResidence, ct.name AS "pais", s.name AS "estado", c.name AS "ciudad", r.street, r.cologne, r.postalCode, r.status FROM residence r, city c, state s, country ct WHERE r.idCity = c.idCity AND s.idState = c.idState AND ct.idCountry = s.idCountry;`;

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
            message: "No se encontraron Residencias",
          });
        }
      }
    });
  } else if (opt === "mostrardepartamentos") {
    const { idResidence } = req.body;

    const query = `SELECT d.idDepartament, ct.name AS "pais", s.name AS "estado", c.name AS "ciudad", r.street, r.cologne, r.postalCode, d.departamentNumber, d.amount, d.status FROM departament d, residence r, city c, state s, country ct WHERE d.idResidence = r.idResidence AND r.idCity = c.idCity AND s.idState = c.idState AND ct.idCountry = s.idCountry AND d.idResidence = ${idResidence};`;

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
            message: "No se encontraron Departamentos",
          });
        }
      }
    });
  } else if (opt === "desactivardepartamento") {
    const {idDepartament} = req.body;

    const updateQuery = `UPDATE departament SET status='INACTIVO' WHERE idDepartament = ${idDepartament};`;

    dbConnection.query(updateQuery, (updateErr, updateResults) => {
      if (updateErr) {
        console.error("Error al desactivar el departamento:", updateErr);
        res.status(500).json({
          success: false,
          message: "Error en el servidor al desactivar el departamento",
          recommendation: "Verifica la consulta de desactivación",
        });
      } else {
        res.json({
          success: true,
          message: "Departamento desactivado exitosamente.",
        });
      }
    });
  } else if (opt === "activardepartamento") {
    const {idDepartament} = req.body;
    // Verificar si alguien está alojando el departamento
    const checkQuery = `SELECT ud.idDepartament FROM userdepartament ud WHERE ud.idDepartament = ${idDepartament} AND ud.status = "ALOJANDO";`;

    dbConnection.query(checkQuery, (checkErr, checkResults) => {
      if (checkErr) {
        console.error(
          "Error al verificar la ocupación del departamento:",
          checkErr
        );
        res.status(500).json({
          success: false,
          message: "Error en el servidor al verificar ocupación",
          recommendation: "Verifica la consulta",
        });
      } else {
        if (checkResults.length > 0) {
          // Alguien está alojando el departamento, mostrar mensaje
          res.json({
            success: false,
            message:
              "No se puede activar el departamento. Está siendo alojado por alguien.",
          });
        } else {
          // Nadie está alojando el departamento, activar
          const updateQuery = `UPDATE departament SET status='ACTIVO' WHERE idDepartament = ${idDepartament};`;

          dbConnection.query(updateQuery, (updateErr, updateResults) => {
            if (updateErr) {
              console.error("Error al activar el departamento:", updateErr);
              res.status(500).json({
                success: false,
                message: "Error en el servidor al activar el departamento",
                recommendation: "Verifica la consulta de activación",
              });
            } else {
              res.json({
                success: true,
                message: "Departamento activado exitosamente.",
              });
            }
          });
        }
      }
    });
  } else if (opt === "insertardepartamento") {
    const { idResidence, departamentNumber, amount} = req.body;

    const query = `INSERT INTO departament (idResidence, departamentNumber, amount) VALUES (${idResidence}, ${departamentNumber}, ${amount});`;

    dbConnection.query(query, (err, results) => {
      if (err) {
        console.error("Error al crear el departamento:", err);
        res.status(500).json({
          success: false,
          message: "Error en el servidor",
          recommendation: "Verifica la consulta de insert",
        });
      } else {
        res.json({
          success: true,
          message: "Departamento insertado exitosamente.",
        });
      }
    });

  } else if (opt === "insertarresidencia") {
    const { idCity, street, cologne, postalCode} = req.body;

    const query = `INSERT INTO residence (idCity, street, postalCode, cologne) VALUES ('${idCity}', '${street}', '${postalCode}', '${cologne}');`;

    dbConnection.query(query, (err, results) => {
      if (err) {
        console.error("Error al crear la residencia:", err);
        res.status(500).json({
          success: false,
          message: "Error en el servidor",
          recommendation: "Verifica la consulta de insert",
        });
      } else {
        res.json({
          success: true,
          message: "Residencia insertado exitosamente.",
        });
      }
    });

  } else if (opt === "activarresidencia") {
    const { idResidence } = req.body;

    const checkQuery = `UPDATE residence SET status = 'ACTIVO' WHERE idResidence = ${idResidence};`;

    dbConnection.query(checkQuery, (err, results) => {
      if (err) {
        console.error("Error al activar la residencia:", err);
        res.status(500).json({
          success: false,
          message: "Error en el servidor al activar el departamento",
          recommendation: "Verifica la consulta de activación",
        });
      } else {
        res.json({
          success: true,
          message: "Residencia activado exitosamente.",
        });
      }
    });
  } else if (opt === "desactivarresidencia") {
    const { idResidence } = req.body;

    // Verificar si hay departamentos alojados en la residencia
    const checkDepartmentsQuery = `SELECT d.idDepartament FROM departament d WHERE d.idResidence = ${idResidence} AND d.status = 'ACTIVO';`;

    dbConnection.query(
      checkDepartmentsQuery,
      (checkDepartmentsErr, checkDepartmentsResults) => {
        if (checkDepartmentsErr) {
          console.error(
            "Error al verificar departamentos activos:",
            checkDepartmentsErr
          );
          res.status(500).json({
            success: false,
            message: "Error en el servidor al verificar departamentos activos",
            recommendation:
              "Verifica la consulta de verificación de departamentos",
          });
        } else {
          if (checkDepartmentsResults.length > 0) {
            // Hay departamentos activos, no se puede desactivar la residencia
            res.json({
              success: false,
              message:
                "No se puede desactivar la residencia. Hay departamentos activos.",
            });
          } else {
            // No hay departamentos activos, desactivar la residencia
            const updateResidenceQuery = `UPDATE residence SET status = 'INACTIVO' WHERE idResidence = ${idResidence};`;

            dbConnection.query(
              updateResidenceQuery,
              (updateResidenceErr, updateResidenceResults) => {
                if (updateResidenceErr) {
                  console.error(
                    "Error al desactivar la residencia:",
                    updateResidenceErr
                  );
                  res.status(500).json({
                    success: false,
                    message: "Error en el servidor al desactivar la residencia",
                    recommendation:
                      "Verifica la consulta de desactivación de residencia",
                  });
                } else {
                  res.json({
                    success: true,
                    message: "Residencia desactivada exitosamente.",
                  });
                }
              }
            );
          }
        }
      }
    );
  } else {
    res.status(400).json({
      success: false,
      message: "Opción no válida",
    });
  }
});

module.exports = router;
