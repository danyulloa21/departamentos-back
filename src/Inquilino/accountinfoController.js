const express = require("express");
const router = express.Router();
const dbConnection = require("../Config/dbConfig");

router.post("/accountpage", (req, res) => {
  const { userid } = req.body;
  // console.log(userid);
  const queryUserInfo = `SELECT ud.idUserDepartament, u.name, u.surname, u.secondSurname, u.email, d.departamentNumber, r.idResidence, r.street, r.postalCode, r.cologne, ( SELECT c.name FROM city c JOIN tenantinformation tn ON c.idCity = tn.idCity WHERE tn.idUser = ${userid} ) AS residenceCity, ti.idTenantInformation, co.name AS countryName, st.name AS stateName, ci.name AS cityName, ti.job, ti.socialSecurity, ti.bloodType, ti.birthdate, ti.ineNumber FROM tenantinformation ti, user u, country co, state st, city ci, userdepartament ud, departament d, residence r WHERE ti.idUser = u.idUser AND u.idUser = 9 AND ti.idCity = ci.idCity AND ci.idState = st.idState AND st.idCountry = co.idCountry AND ud.idUser = u.idUser AND ud.idDepartament = d.idDepartament AND d.idResidence = r.idResidence AND ud.status = "ALOJANDO";
`;
  // console.log(queryUserInfo);
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
        // console.log(userinfo);

        //  res.json(userinfo);
        const queryPhone = `SELECT tp.type, tc.phone FROM tenantcontact tc, typephone tp, tenantinformation ti WHERE tc.idTenantInformation = ti.idTenantInformation AND ti.idUser = ${userid} AND tp.idTypePhone = tc.idTypePhone;`;
        // console.log(queryPhone);
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
              // console.log(phones);
              res.json({ userinfo, phones });
            }
          }
        });
      }
    }
  });
});
module.exports = router;