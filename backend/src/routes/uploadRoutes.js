const express = require("express");
const multer = require("multer");
const { cargarCsv } = require("../controllers/uploadController");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/csv", upload.single("file"), cargarCsv);

module.exports = router;