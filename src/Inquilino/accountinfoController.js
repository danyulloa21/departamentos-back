const express = require("express");
const router = express.Router();
const dbConnection = require("../Config/dbConfig");

router.post("/accountpage", (req, res) => {
  const { userid } = req.body;

  const queryUserInfo = `SELECT ud.idUserDepartament, u.name, u.surname, u.secondSurname, u.email, d.departamentNumber, r.idResidence, r.street, r.postalCode, r.cologne, (SELECT ct.name FROM residence re, city ct, tenantinformation t WHERE ct.idCity = re.idCity AND t.idCity = ct.idCity AND t.idUser = ${userid}) as residenceCity, ti.idTenantInformation, co.name as countryName, st.name as stateName, ci.name as cityName, ti.job, ti.socialSecurity, ti.bloodType, ti.birthdate, ti.ineNumber FROM tenantinformation ti, user u, country co, state st, city ci, userdepartament ud, departament d, residence r WHERE ti.idUser = u.idUser AND u.idUser = ${userid} AND ti.idCity = ci.idCity AND ci.idState = st.idState AND st.idCountry = co.idCountry AND ud.idDepartament = d.departamentNumber AND d.idResidence = r.idResidence AND ud.status = "ALOJANDO";`;

  dbConnection.query(queryUserInfo, (err, results) => {
    if (err) {
      console.error("Error al consultar la base de datos:", err);
      res.status(500).json({
        success: false,
        message: "Error en el servidor",
        recommendation: "Verifica la consulta",
      });
    } else {
      if (results.length > 0) {
        const userinfo = results[0];

        //  res.json(userinfo);
        const queryPhone = `SELECT tp.type, tc.phone FROM tenantcontact tc, typephone tp, tenantinformation ti WHERE tc.idTenantInformation = ti.idTenantInformation AND ti.idTenantInformation = ${userid} AND tp.idTypePhone = tc.idTypePhone;`;

        dbConnection.query(queryPhone, (err2, phoneResults) => {
          if (err2) {
            console.error("Error al consultar la base de datos:", err);
            res.status(500).json({
              success: false,
              message: "Error en el servidor",
              recommendation: "Verifica la consulta (PhoneQuery)",
            });
          } else {
            if (phoneResults.length > 0) {
              const phones = phoneResults;
              res.json({ userinfo, phones });
            }
          }
        });
      }
    }
  });
});
module.exports = router;