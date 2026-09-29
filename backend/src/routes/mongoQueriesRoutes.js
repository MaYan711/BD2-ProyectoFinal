const express = require("express");
const controller = require("../controllers/mongoQueriesController");

const router = express.Router();

router.get("/aspirantes-tipo-institucion", controller.aspirantesPorTipoInstitucion);
router.get("/aprobados-materia", controller.aprobadosPorMateria);
router.get("/aprobados-carrera-anio", controller.aprobadosPorCarreraAnio);
router.get("/porcentaje-aprobacion-materia", controller.porcentajeAprobacionMateria);
router.get("/promedio-edad-carrera", controller.promedioEdadCarrera);

module.exports = router;