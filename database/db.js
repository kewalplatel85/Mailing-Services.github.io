const mysql = require("mysql");
require("dotenv").config();

// Establish Connection
const connection = mysql.createConnection({
  host: process.env.HOST,
  port: process.env.PORT,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});

connection.connect(function (err) {
  if (err) {
    console.log("error occured while connecting", err);
  } else {
    console.log("connection created with mysql successfully");
  }
});

module.exports = connection;