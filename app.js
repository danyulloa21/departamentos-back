// app.js

const express = require('express');
const app = express();
const cors = require('cors'); // Importa el middleware CORS
const session = require('express-session'); // Importa otros módulos necesarios
const loginCmd = require('./src/Config/loginController');
const userinfoCmd = require('./src/Inquilino/accountinfoController');
const debtsCmd = require('./src/Inquilino/userDebts');
const paymentCmd = require('./src/Inquilino/userPayments');
const ShowWarningsCmd = require('./src/Inquilino/showWarnings');
const rulesCmd = require('./src/Inquilino/userRules');

// RUTAS ADMIN

const AdminDebtsCmd = require('./src/Admin/Admin-Debts');
const AdminPaymentsCmd = require('./src/Admin/Admin-Payments');
const AdminContractsCmd = require('./src/Admin/Admin-Contracts');
const AdminResidences = require('./src/Admin/Admin-Residences');
const AdminWarnings = require('./src/Admin/Admin-Warnings');
const AdminRules = require('./src/Admin/Admin-Rules');

// Configura Express y otros middleware
app.use(express.json()); // Agrega esta línea para analizar JSON en las solicitudes


// Configura CORS
app.use(cors({
  origin: '*',
}));

// Otras rutas y configuraciones

app.use('/api', loginCmd);
app.use('/api', userinfoCmd);
app.use('/api', debtsCmd);
app.use('/api', paymentCmd);
app.use('/api', ShowWarningsCmd);
app.use('/api', rulesCmd);


//Rutas Admin

app.use('/api', AdminDebtsCmd);
app.use('/api', AdminPaymentsCmd);
app.use('/api', AdminContractsCmd);
app.use(('/api'), AdminResidences);
app.use(('/api'), AdminWarnings);
app.use(('/api'), AdminRules);

class App {
  constructor() {
    // ... constructor logic
  }

  // ... other methods
}

// Export the App constructor
module.exports = {
  App: App,
};

// Inicia el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor en ejecución en el puerto ${PORT}`);
});
app.set('json spaces', 2);