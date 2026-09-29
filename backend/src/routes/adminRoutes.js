const express = require("express");
const controller = require("../controllers/adminController");

const router = express.Router();

router.delete("/datos", controller.limpiarDatos);

module.exports = router;