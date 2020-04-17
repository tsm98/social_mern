const express = require("express");

const app = express();

app.get("/", (req, res) => res.send("API chalu hai mama"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Started to port ${PORT}`));
