const path = require("path");
const morgan = require("morgan");

const {conn} = require('./db.js');
const server = require('./microservices/users.js');
// require('./microservices/users.js');  //Uncomment requires for run all the microservices
// require('./microservices/email.js');
// require('./microservices/auth.js');
// require('./microservices/transaction.js');
// require("./microservices/accounts.js");
// require("./microservices/admin.js");
// require("./microservices/contacts.js");
// require("./microservices/statistics.js");
// require("./microservices/whatsapp.js");
// require("./microservices/interoperabilities.js");

conn.sync({ force: false })
.then(() => {
  server.listen(process.env.PORT || 8000, () => {
    console.log(`users microservice running on ${process.env.PORT || 8000}`);
  });
  console.log(`Connected to Database ${conn.config.database}, with user '${conn.config.username}' on port ${conn.config.port}`)
})
  