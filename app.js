const express = require("express");
const app = express();
const http = require("http").Server(app);
const path = require("path");
const bodyParser = require("body-parser");
const { urlencoded } = require("body-parser");
const cors = require("cors");


require("dotenv").config();

// Middleware
app.use(cors());
app.use(express.json());
app.use(urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));

// //* Main Routes




require("dotenv").config();


app.use(express.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));


app.use(require("./routes/router.js"));


const port = 5500;
http.listen(port, () => console.log(`Listening on port ${port}`));