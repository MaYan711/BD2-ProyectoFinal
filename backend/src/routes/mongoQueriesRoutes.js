const express = require("express");
const controller = require("../controllers/mongoQueriesController");

const router = express.Router();

router.get("/aspirantes-tipo-institucion", controller.aspirantesPorTipoInstitucion);
router.get("/aprobados-materia", controller.aprobadosPorMateria);
router.get("/aprobados-carrera-anio", controller.aprobadosPorCarreraAnio);
router.get("/porcentaje-aprobacion-materia", controller.porcentajeAprobacionMateria);
router.get("/promedio-edad-carrera", controller.promedioEdadCarrera);

router.post("/resumen-carrera", controller.crearResumenCarrera);
router.get("/edad-aprobados-carrera-tipo", controller.edadAprobadosCarreraTipo);
router.get("/aprobados-municipio-carrera", controller.aprobadosMunicipioCarrera);
router.get("/evaluaciones-mes-materia-publicas", controller.evaluacionesMesMateriaPublicas);
router.get("/top-carreras-16-18", controller.topCarrerasAspirantesJovenes);

router.get("/historial-desempeno/:correlativo", controller.historialDesempenoAspirante);
router.get("/distribucion-sexo-tipo", controller.distribucionSexoTipo);
router.get("/tasa-aprobacion-edad", controller.tasaAprobacionEdad);
router.get("/promedio-intentos-materia", controller.promedioIntentosMateria);
router.get("/historial-completo/:correlativo", controller.historialCompletoAspirante);

router.get("/carreras-reprobados-primer-intento", controller.carrerasReprobadosPrimerIntento);
router.get("/top-municipios-aspirantes", controller.topMunicipiosAspirantes);
router.get("/tasa-aprobacion-tipo-institucion", controller.tasaAprobacionTipoInstitucion);
router.get("/carreras-demandadas-departamento", controller.carrerasDemandadasDepartamento);
router.get("/evolucion-aprobacion-anio", controller.evolucionAprobacionAnio);

module.exports = router;