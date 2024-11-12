const express = require("express");
const router = express.Router();
const dbConnection = require("../Config/dbConfig");

router.post("/admin-payments", (req, res) => {
  const { opt } = req.body;

    if (opt === "consultarregistros") {
    const query =
      `SELECT p.idPayment, p.idDebt, u.name, u.surname, u.secondSurname, ct.name AS "ciudad", s.name AS "estado", c.name "pais", r.cologne, r.street, r.postalCode, dp.departamentNumber, cc.concept, d.amount, pt.paymentTypeName, p.debtDate, p.paymentDate FROM debt d, paymenttype pt, payment p, userdepartament ud, user u, departament dp, residence r, city c, state s, country ct, concept cc WHERE p.idDebt = d.idDebt AND p.idPaymentType = pt.idPaymentType AND d.idConcept = cc.idConcept AND d.idUserDepartament = ud.idUserDepartament AND ud.idDepartament = dp.idDepartament AND u.idUser = ud.idUser AND dp.idResidence = r.idResidence AND r.idCity = c.idCity AND c.idState = s.idState AND s.idCountry = ct.idCountry`;

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
            message: "No se encontraron Pagos",
          });
        }
      }
    });
  } else if (opt === "editarregistro") {
    const { idDebt, idPayment } = req.body;

    // Primera consulta: Actualizar el estado de la deuda
    const updateDebtQuery = `UPDATE debt SET debt.status = "ACTIVO" WHERE debt.idDebt = ${idDebt}`;

    dbConnection.query(updateDebtQuery, (errUpdateDebt, resultsUpdateDebt) => {
      if (errUpdateDebt) {
        console.error("Error al actualizar el estado de la deuda:", errUpdateDebt);
        res.status(500).json({
          success: false,
          message: "Error en el servidor al actualizar el estado de la deuda",
        });
      } else {
        // Segunda consulta: Eliminar el pago
        const deletePaymentQuery = `DELETE FROM payment WHERE payment.idPayment = ${idPayment}`;

        dbConnection.query(deletePaymentQuery, (errDeletePayment, resultsDeletePayment) => {
          if (errDeletePayment) {
            console.error("Error al eliminar el pago:", errDeletePayment);
            res.status(500).json({
              success: false,
              message: "Error en el servidor al eliminar el pago",
            });
          } else {
            res.json({
              success: true,
              message: "Registro editado correctamente",
            });
          }
        });
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