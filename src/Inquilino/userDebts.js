const express = require("express");
const router = express.Router();
const dbConnection = require("../Config/dbConfig");

router.post('/debts-details', (req, res) => {
    const { iduserdepartment } = req.body;

    const queryDebts = `SELECT c.concept, d.debtDate, d.amount, d.status FROM debt d, userdepartament ud, concept c WHERE d.idUserDepartament = ud.idUserDepartament AND ud.idUserDepartament = ${iduserdepartment} AND ud.status = "ALOJANDO" AND d.status = "ACTIVO" AND c.idConcept = d.idConcept;`;

    dbConnection.query(queryDebts, (err, results) => {
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
                    message: "No se encontraron deudas"
                });
            }
        }
    })
});
module.exports = router;