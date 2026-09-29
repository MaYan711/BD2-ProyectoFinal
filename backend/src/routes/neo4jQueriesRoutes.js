const express = require("express");
const controller = require("../controllers/neo4jQueriesController");

const router = express.Router();

router.get("/aspirantes-carrera", controller.aspirantesPorCarrera);
router.get("/aprobados-materia", controller.aprobadosPorMateria);
router.get("/aspirantes-municipio", controller.aspirantesPorMunicipio);
router.get("/aspirantes-tipo-institucion", controller.aspirantesPorTipoInstitucion);
router.get("/grafo-aspirante/:correlativo", controller.grafoAspirante);

module.exports = router;