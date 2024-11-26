const express = require("express");
const router = express.Router();
const dbConnection = require("../Config/dbConfig");

router.post('/history-payment',(req, res) => {
    const { iduserdepartment } = req.body;

    const queryPayments = `SELECT c.concept, d.debtDate, p.paymentDate, pt.paymentTypeName, d.amount, d.status FROM payment p, paymenttype pt, debt d, userdepartament ud, concept c WHERE d.idUserDepartament = ud.idUserDepartament AND ud.idUserDepartament = ${iduserdepartment} AND ud.status = "ALOJANDO" AND d.status = "PAGADO" AND p.idDebt = d.idDebt AND p.idPaymentType = pt.idPaymentType AND c.idConcept = d.idConcept;`

    // console.log(queryPayments)

    dbConnection.query(queryPayments, (err, results) => {
        if (err) {
            console.error("Error al consultar la base de datos:", err);
            res.status(500).json({
                success: false,
                message: "Error en el servidor",
                recommendation: "Verifica la consulta",
            });
        } else {
            if (results.length > 0) {
                res.json(results);


            } else {
                res.json({
                    success: false,
                    message: "No se encontraron pagos"
                });
            }
        }
    })
});
module.exports = router;