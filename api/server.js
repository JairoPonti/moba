const path = require("path");
const morgan = require("morgan");

const {conn} = require('./db.js');
const server = require('./microservices/statistics.js');


conn.sync({ force: false })
.then(() => {
  server.listen(process.env.PORT || 8000, () => {
    console.log(`statistics microservice running on ${process.env.PORT || 8000}`);
  });
  console.log(`Connected to Database ${conn.config.database}, with user '${conn.config.username}' on port ${conn.config.port}`)
})
  