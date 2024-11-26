const express = require("express");
const router = express.Router();
const dbConnection = require("../Config/dbConfig");

router.post("/admin-contracts", (req, res) => {
  const { opt } = req.body;

  if (opt === "editarregistro") {
    const { idUser, email, ineNumber, socialSecurity, tenantContacts, accountName, password, job, idAccount } = req.body;
  
    // Actualizar datos del usuario
    const updateUserQuery = `UPDATE user SET email = '${email}' WHERE idUser = ${idUser};`;
  
    // Actualizar información del inquilino
    const updateTenantInfoQuery = `UPDATE tenantinformation SET job = '${job}', socialSecurity = '${socialSecurity}', ineNumber = '${ineNumber}' WHERE idUser = ${idUser};`;
  
    // Actualizar contactos del inquilino
    const updateContactsQueries = tenantContacts.map(
      (contact) =>
        `UPDATE tenantcontact SET phone = '${contact.phone}', idTypePhone = (SELECT idTypePhone FROM typephone WHERE type = '${contact.type}') WHERE idTenantContact = ${contact.idTenantContact};`
    );
  
    // Actualizar información de la cuenta
    const updateAccountQuery = `UPDATE account SET accountName = '${accountName}', password = '${password}' WHERE idAccount = ${idAccount};`;
  
    // Ejecutar las consultas en transacción para asegurar atomicidad
    dbConnection.beginTransaction((err) => {
      if (err) {
        console.error("Error al iniciar la transacción:", err);
        res.status(500).json({
          success: false,
          message: "Error en el servidor",
          recommendation: "Error al iniciar la transacción",
        });
        return;
      }
  
      // Actualizar datos del usuario
      dbConnection.query(updateUserQuery, (err, results) => {
        if (err) {
          dbConnection.rollback(() => {
            console.error("Error al actualizar el email del usuario:", err);
            res.status(500).json({
              success: false,
              message: "Error en el servidor",
              recommendation: "Verifica la actualización del email del usuario",
            });
          });
        } else {
          // Actualizar información del inquilino
          dbConnection.query(updateTenantInfoQuery, (err, results) => {
            if (err) {
              dbConnection.rollback(() => {
                console.error("Error al actualizar la información del inquilino:", err);
                res.status(500).json({
                  success: false,
                  message: "Error en el servidor",
                  recommendation: "Verifica la actualización de la información del inquilino",
                });
              });
            } else {
              // Actualizar contactos del inquilino
              const updateContacts = () => {
                const updateContact = (index) => {
                  if (index < updateContactsQueries.length) {
                    const query = updateContactsQueries[index];
                    dbConnection.query(query, (err, results) => {
                      if (err) {
                        dbConnection.rollback(() => {
                          console.error(`Error al actualizar el contacto ${index + 1}:`, err);
                          res.status(500).json({
                            success: false,
                            message: "Error en el servidor",
                            recommendation: `Verifica la actualización del contacto ${index + 1}`,
                          });
                        });
                      } else {
                        updateContact(index + 1);
                      }
                    });
                  } else {
                    // Todos los contactos actualizados correctamente
                    dbConnection.query(updateAccountQuery, (err, results) => {
                      if (err) {
                        dbConnection.rollback(() => {
                          console.error("Error al actualizar la información de la cuenta:", err);
                          res.status(500).json({
                            success: false,
                            message: "Error en el servidor",
                            recommendation: "Verifica la actualización de la información de la cuenta",
                          });
                        });
                      } else {
                        // Verificar si se afectaron filas
                        if (results.affectedRows > 0) {
                          // Continuar con las demás operaciones
                          dbConnection.commit((err) => {
                            if (err) {
                              dbConnection.rollback(() => {
                                console.error("Error al realizar commit:", err);
                                res.status(500).json({
                                  success: false,
                                  message: "Error en el servidor",
                                  recommendation: "Error al realizar commit",
                                });
                              });
                            } else {
                              res.json({
                                success: true,
                                message: "Registros actualizados correctamente",
                              });
                            }
                          });
                        } else {
                          // No se actualizaron filas, puedes manejarlo de acuerdo a tus necesidades
                          dbConnection.rollback(() => {
                            console.error("No se actualizó ninguna fila en la cuenta");
                            res.status(500).json({
                              success: false,
                              message: "Error en el servidor",
                              recommendation: "No se actualizó ninguna fila en la cuenta",
                            });
                          });
                        }
                      }
                    });
                  }
                };
  
                updateContact(0);
              };
  
              // Ejecutar la actualización de los contactos
              updateContacts();
            }
          });
        }
      });
    });
  } else if (opt === "consultarregistros") {
    const { optadd } = req.body;
    if (optadd === 'activos') {
        const query =
      'SELECT ud.idUserDepartament, u.name, u.surname, u.secondSurname, u.email, d.departamentNumber, r.street, r.postalCode, r.cologne, c.name AS "ciudad", s.name AS "estado", ct.name AS "pais", ud.admissionDate, ud.admissionTime FROM userdepartament ud, user u, departament d, residence r, city c, state s, country ct WHERE ud.idDepartament = d.idDepartament AND ud.idUser = u.idUser AND d.idResidence = r.idResidence AND c.idCity = r.idCity AND s.idState = c.idState AND ct.idCountry = s.idCountry AND ud.status = "ALOJANDO"';

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
            message: "No se encontraron Contratos",
          });
        }
      }
    });
    } else if (optadd === 'acabados') {
        const query = `SELECT u.name, u.surname, u.secondSurname, u.email, d.departamentNumber, r.street, r.postalCode, r.cologne, c.name AS "ciudad", s.name AS "estado", ct.name AS "pais", ud.admissionDate, ud.admissionTime,ud.dischargeDate, ud.dischargeTime FROM userdepartament ud, user u, departament d, residence r, city c, state s, country ct WHERE ud.idDepartament = d.idDepartament AND ud.idUser = u.idUser AND d.idResidence = r.idResidence AND c.idCity = r.idCity AND s.idState = c.idState AND ct.idCountry = s.idCountry AND ud.status = "DESALOJADO";`;

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
                    message: "No se encontraron Contratos Acabados",
                  });
                }
              }
        });
    } else if (optadd === 'inquilinosactivos') {
        const query = `SELECT u.idUser, a.idAccount, t.idTenantInformation, u.name, u.surname, u.secondSurname, u.email FROM userdepartament ud, user u, account a, tenantinformation t WHERE ud.idUser = u.idUser AND u.idUser = a.idUser AND u.idUser = t.idUser AND ud.status = "ALOJANDO" GROUP BY ud.idUser;`;

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
                    message: "No se encontraron Inquilinos Activos",
                  });
                }
              }
        });
    } else if (optadd === 'inquilinosinactivos') {
      const query = `SELECT u.idUser, u.name, u.surname, u.secondSurname, u.email FROM userdepartament ud, user u WHERE ud.status = "DESALOJADO" AND ud.idUser = u.idUser AND NOT EXISTS (SELECT idUser FROM userdepartament ud2 WHERE ud2.idUser = ud.idUser AND ud2.status = "ALOJANDO");`;

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
                  message: "No se encontraron Inquilinos Inactivos",
                });
              }
            }
      });
  } else {
        res.status(400).json({
            success: false,
            message: "Opción no válida, verifica los datos enviados",
          });
    }
    
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
  } else if (opt === "insertarregistro") {
    const { optadd } = req.body;

    if (optadd === "nuevocontrato") {
      const {
        name,
        surname,
        secondSurname,
        email,
        country,
        state,
        city,
        job,
        bloodType,
        socialSecurity,
        birthday,
        INEnumber,
        personalPhone,
        emergencyPhone,
        residence,
        departament,
      } = req.body;

      // INSERT INTO user
      const insertUserQuery = `INSERT INTO user(idUserType, name, surname, secondSurname, email) VALUES (2, '${name}', '${surname}', '${secondSurname}', '${email}');`;

      // INSERT INTO tenantinformation
      const insertTenantInfoQuery = `INSERT INTO tenantinformation(idUser, idCity, job, socialSecurity, bloodType, birthdate, ineNumber) VALUES ((SELECT u.idUser FROM user u ORDER BY u.idUser DESC LIMIT 1), ${city}, '${job}', '${socialSecurity}', '${bloodType}', '${birthday}', '${INEnumber}');`;

      // INSERT INTO tenantcontact (personalPhone)
      const insertPersonalContactQuery = `INSERT INTO tenantcontact(idTenantInformation, idTypePhone, phone) VALUES ((SELECT ti.idTenantInformation FROM tenantinformation ti ORDER BY ti.idTenantInformation DESC LIMIT 1), 1, '${personalPhone}');`;

      // INSERT INTO tenantcontact (emergencyPhone)
      const insertEmergencyContactQuery = `INSERT INTO tenantcontact(idTenantInformation, idTypePhone, phone) VALUES ((SELECT ti.idTenantInformation FROM tenantinformation ti ORDER BY ti.idTenantInformation DESC LIMIT 1), 4, '${emergencyPhone}');`;

      // INSERT INTO userdepartament
      const insertUserDepartamentQuery = `INSERT INTO userdepartament(idDepartament, idUser) VALUES (${departament}, (SELECT u.idUser FROM user u ORDER BY u.idUser DESC LIMIT 1));`;

      // Función para generar el nombre de usuario
      const generateUsername = (name, surname) => {
        const username = name.toLowerCase() + surname.toLowerCase();
        return username;
      };

      // Función para generar la contraseña (actualmente, la contraseña es el nombre)
      const generatePassword = (name) => {
        const password = name.toLowerCase();
        return password;
      };

      // Ejecutar las consultas en transacción para asegurar atomicidad
      dbConnection.beginTransaction((err) => {
        if (err) {
          console.error("Error al iniciar la transacción:", err);
          res.status(500).json({
            success: false,
            message: "Error en el servidor",
            recommendation: "Error al iniciar la transacción",
          });
          return;
        }

        // Insertar en user
        dbConnection.query(insertUserQuery, (err, results) => {
          if (err) {
            dbConnection.rollback(() => {
              console.error("Error al insertar en la tabla 'user':", err);
              res.status(500).json({
                success: false,
                message: "Error en el servidor",
                recommendation: "Verifica la inserción en la tabla 'user'",
              });
            });
          } else {
            // Insertar en tenantinformation
            dbConnection.query(insertTenantInfoQuery, (err, results) => {
              if (err) {
                dbConnection.rollback(() => {
                  console.error(
                    "Error al insertar en la tabla 'tenantinformation':",
                    err
                  );
                  res.status(500).json({
                    success: false,
                    message: "Error en el servidor",
                    recommendation:
                      "Verifica la inserción en la tabla 'tenantinformation'",
                  });
                });
              } else {
                // Insertar en tenantcontact (personalPhone)
                dbConnection.query(
                  insertPersonalContactQuery,
                  (err, results) => {
                    if (err) {
                      dbConnection.rollback(() => {
                        console.error(
                          "Error al insertar en la tabla 'tenantcontact' (personalPhone):",
                          err
                        );
                        res.status(500).json({
                          success: false,
                          message: "Error en el servidor",
                          recommendation:
                            "Verifica la inserción en la tabla 'tenantcontact' (personalPhone)",
                        });
                      });
                    } else {
                      // Insertar en tenantcontact (emergencyPhone)
                      dbConnection.query(
                        insertEmergencyContactQuery,
                        (err, results) => {
                          if (err) {
                            dbConnection.rollback(() => {
                              console.error(
                                "Error al insertar en la tabla 'tenantcontact' (emergencyPhone):",
                                err
                              );
                              res.status(500).json({
                                success: false,
                                message: "Error en el servidor",
                                recommendation:
                                  "Verifica la inserción en la tabla 'tenantcontact' (emergencyPhone)",
                              });
                            });
                          } else {
                            // Insertar en userdepartament
                            dbConnection.query(
                              insertUserDepartamentQuery,
                              (err, results) => {
                                if (err) {
                                  dbConnection.rollback(() => {
                                    console.error(
                                      "Error al insertar en la tabla 'userdepartament':",
                                      err
                                    );
                                    res.status(500).json({
                                      success: false,
                                      message: "Error en el servidor",
                                      recommendation:
                                        "Verifica la inserción en la tabla 'userdepartament'",
                                    });
                                  });
                                } else {
                                  // Generar nombre de usuario y contraseña
                                  const generatedUsername = generateUsername(
                                    name,
                                    surname
                                  );
                                  const generatedPassword =
                                    generatePassword(name);

                                  // INSERT INTO account
                                  const insertAccountQuery = `INSERT INTO account(idUser, accountName, password) VALUES ((SELECT u.idUser FROM user u ORDER BY u.idUser DESC LIMIT 1), '${generatedUsername}', '${generatedPassword}');`;
                                  //Insertar en account
                                  dbConnection.query(
                                    insertAccountQuery,
                                    (err, resultsAccount) => {
                                      if (err) {
                                        dbConnection.rollback(() => {
                                          console.error(
                                            "Error al insertar en la tabla 'account':",
                                            err
                                          );
                                          res.status(500).json({
                                            success: false,
                                            message: "Error en el servidor",
                                            recommendation:
                                              "Verifica la inserción en la tabla 'account'",
                                          });
                                        });
                                      } else {
                                        // Commit si todas las inserciones fueron exitosas
                                        dbConnection.commit((err) => {
                                          if (err) {
                                            dbConnection.rollback(() => {
                                              console.error(
                                                "Error al realizar commit:",
                                                err
                                              );
                                              res.status(500).json({
                                                success: false,
                                                message: "Error en el servidor",
                                                recommendation:
                                                  "Error al realizar commit",
                                              });
                                            });
                                          } else {
                                            res.json({
                                              success: true,
                                              message:
                                                "Registros insertados correctamente",
                                              data: {
                                                username: generatedUsername,
                                                password: generatedPassword,
                                              },
                                            });
                                          }
                                        });
                                      }
                                    }
                                  );
                                }
                              }
                            );
                          }
                        }
                      );
                    }
                  }
                );
              }
            });
          }
        });
      });
    }
  } else if (opt === "mostrarinfoinquilinoactivo") {
    const { idUser, idAccount, idTenantInformation } = req.body;

    const params = [idUser, idUser, idTenantInformation, idAccount, idUser];


    const queries = [
      "SELECT name, surname, secondSurname, email FROM user WHERE idUser = ?",
      'SELECT c.name AS "ciudad", s.name AS "estado", ct.name AS "pais", t.job, t.socialSecurity, t.bloodType, t.birthdate, t.registerDate, t.registerTime, t.ineNumber FROM tenantinformation t, city c, state s, country ct WHERE t.idUser = ? AND t.idCity = c.idCity AND c.idState = s.idState AND s.idCountry = ct.idCountry',
      "SELECT idTenantContact, typephone.type, phone FROM tenantcontact, typephone WHERE tenantcontact.idTypePhone = typephone.idTypePhone AND tenantcontact.idTenantInformation = ?",
      "SELECT accountName, password FROM account WHERE idAccount = ?",
      "SELECT observationDate, observationTime, observation FROM obsertvationtenant WHERE idUser = ? ORDER BY observationDate DESC, observationTime DESC",
    ];

    const results = [];

    const executeQuery = (query, params) => {
      return new Promise((resolve, reject) => {
        dbConnection.query(query, params, (err, result) => {
          if (err) {
            console.error("Error en la consulta:", err);
            reject(err);
          } else {
            // console.log("Consulta exitosa:", query, "con parámetros:", params);
            results.push(result);
            resolve();
          }
        });
      });
    };
    

    const executeQueries = async () => {
      for (let i = 0; i < queries.length; i++){
        // await executeQuery(query, [
        //   idUser,
        //   idUser,
        //   idTenantInformation,
        //   idAccount,
        //   idUser,
        // ]);
        const query = queries[i];
        const param = params[i];
        // Agrega logs antes de ejecutar cada consulta
        // console.log(`Ejecutando consulta ${i + 1}: ${query} con parámetros: ${param}`);

        await executeQuery(query, param);
        // console.log(`Resultados de la consulta ${i + 1}:`, results[i]);
      }
      // Manipular los resultados como desees
      const userData = results[0][0];
      const tenantInfo = results[1][0];
      const tenantContacts = results[2];
      const accountInfo = results[3][0];
      const observations = results[4];

      res.json({
        success: true,
        data: {
          user: userData,
          tenantInformation: tenantInfo,
          tenantContacts: tenantContacts,
          account: accountInfo,
          observations: observations,
        },
      });
    };

    executeQueries().catch((error) => {
      console.error("Error al ejecutar las consultas:", error);
      res.status(500).json({
        success: false,
        message: "Error en el servidor",
        recommendation: "Verifica la consulta",
      });
    });
  } else if (opt === "mostrarinfoinquilinoactivo") {
  } else if (opt === "mostrartipotelefonos") {
    const query = `SELECT typephone.type FROM typephone;`;

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
            message: "No se encontraron tipos de telefono",
          });
        }
      }
    });
  } else if (opt === "mostrarpaises") {
    const query = `SELECT idCountry, name FROM country;`;

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
            message: "No se encontraron ciudades",
          });
        }
      }
    });
  } else if (opt === "mostrarestados") {
    const { idCountry } = req.body;
    const query = `SELECT idState,name FROM state WHERE state.idCountry = ${idCountry};`;

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
            message: "No se encontraron estados",
          });
        }
      }
    });
  } else if (opt === "mostrarciudades") {
    const { idState } = req.body;
    const query = `SELECT idCity, name FROM city WHERE idState = ${idState};`;

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
            message: "No se encontraron ciudades",
          });
        }
      }
    });
  } else if (opt === "mostrarresidencias") {
    const query = `SELECT r.idResidence, c.name AS "ciudad", s.name AS 'state', ct.name AS "pais", r.street, r.cologne, r.postalCode FROM residence r, city c, state s, country ct WHERE r.idCity = c.idCity AND c.idState = s.idState AND ct.idCountry = s.idCountry AND r.status = "ACTIVO";`;

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
            message: "No se encontraron residencias disponibles.",
          });
        }
      }
    });
  } else if (opt === "mostrardepartamentos") {
    const { idResidence } = req.body;
    const query = `SELECT
    d.idDepartament,
    d.departamentNumber,
    d.amount AS "mensualidad",
    c.name AS "ciudad",
    s.name AS "state",
    ct.name AS "pais",
    r.street,
    r.cologne,
    r.postalCode
FROM
    departament d
    JOIN residence r ON d.idResidence = r.idResidence
    JOIN city c ON r.idCity = c.idCity
    JOIN state s ON c.idState = s.idState
    JOIN country ct ON s.idCountry = ct.idCountry
WHERE
    d.idResidence = ${idResidence}
    AND d.status = "ACTIVO";`;
    // console.log(query);
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
            message: "No se encontraron departamentos disponibles.",
          });
        }
      }
    });
  } else if (opt === "terminarcontrato") {
    const { idUserDepartament } = req.body;

    const query = `UPDATE userdepartament SET status= 'DESALOJADO' WHERE idUserDepartament = ${idUserDepartament};`;

    dbConnection.query(query, (err,results) => {
      if (err) {
        console.error("Error al terminar el contrato:", err);
        res.status(500).json({
          success: false,
          message: "Error en el servidor",
          recommendation:
            "Verifica la actualización para la terminacion del contrato",
        });
      } else {
        res.json({
          success: true,
          message: "Se terminado el contrato con exito"
        })
      }
    });
  } else {
    res.status(400).json({
      success: false,
      message: "Opción no válida",
    });
  }
});

module.exports = router;