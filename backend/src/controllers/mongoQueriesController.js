const Evaluacion = require("../models/Evaluacion");

async function aspirantesPorTipoInstitucion(req, res) {
  try {
    const data = await Evaluacion.aggregate([
      {
        $group: {
          _id: "$tipo_institucion_educativa",
          cantidad: { $addToSet: "$correlativo_aspirante" }
        }
      },
      {
        $project: {
          _id: 0,
          tipo_institucion_educativa: "$_id",
          cantidad_aspirantes: { $size: "$cantidad" }
        }
      },
      { $sort: { cantidad_aspirantes: -1 } }
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error en consulta", error: error.message });
  }
}

async function aprobadosPorMateria(req, res) {
  try {
    const data = await Evaluacion.aggregate([
      { $match: { aprobado: true } },
      {
        $group: {
          _id: "$materia",
          cantidad_aprobados: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          materia: "$_id",
          cantidad_aprobados: 1
        }
      },
      { $sort: { cantidad_aprobados: -1 } }
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error en consulta", error: error.message });
  }
}

async function aprobadosPorCarreraAnio(req, res) {
  try {
    const data = await Evaluacion.aggregate([
      { $match: { aprobado: true } },
      {
        $group: {
          _id: {
            carrera_objetivo: "$carrera_objetivo",
            anio_de_ingreso: "$anio_de_ingreso"
          },
          aspirantes: { $addToSet: "$correlativo_aspirante" }
        }
      },
      {
        $project: {
          _id: 0,
          carrera_objetivo: "$_id.carrera_objetivo",
          anio_de_ingreso: "$_id.anio_de_ingreso",
          cantidad_aspirantes_aprobados: { $size: "$aspirantes" }
        }
      },
      { $sort: { anio_de_ingreso: 1, cantidad_aspirantes_aprobados: -1 } }
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error en consulta", error: error.message });
  }
}

async function porcentajeAprobacionMateria(req, res) {
  try {
    const data = await Evaluacion.aggregate([
      {
        $group: {
          _id: "$materia",
          total: { $sum: 1 },
          aprobados: {
            $sum: {
              $cond: ["$aprobado", 1, 0]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          materia: "$_id",
          total: 1,
          aprobados: 1,
          porcentaje_aprobacion: {
            $round: [{ $multiply: [{ $divide: ["$aprobados", "$total"] }, 100] }, 2]
          }
        }
      },
      { $sort: { porcentaje_aprobacion: -1 } }
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error en consulta", error: error.message });
  }
}

async function promedioEdadCarrera(req, res) {
  try {
    const data = await Evaluacion.aggregate([
      { $match: { edad: { $ne: null, $gte: 10, $lte: 100 } } },
      {
        $group: {
          _id: "$carrera_objetivo",
          promedio_edad: { $avg: "$edad" },
          cantidad_registros: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          carrera_objetivo: "$_id",
          promedio_edad: { $round: ["$promedio_edad", 2] },
          cantidad_registros: 1
        }
      },
      { $sort: { promedio_edad: -1 } }
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error en consulta", error: error.message });
  }
}

async function crearResumenCarrera(req, res) {
  try {
    const db = Evaluacion.db;

    const resumen = await Evaluacion.aggregate([
      {
        $group: {
          _id: "$carrera_objetivo",
          total_evaluaciones: { $sum: 1 },
          aspirantes: { $addToSet: "$correlativo_aspirante" },
          aprobados: {
            $sum: {
              $cond: ["$aprobado", 1, 0]
            }
          },
          promedio_edad: { $avg: "$edad" }
        }
      },
      {
        $project: {
          _id: 0,
          carrera_objetivo: "$_id",
          total_evaluaciones: 1,
          total_aspirantes: { $size: "$aspirantes" },
          aprobados: 1,
          promedio_edad: { $round: ["$promedio_edad", 2] }
        }
      },
      { $sort: { total_aspirantes: -1 } }
    ]);

    await db.collection("resumen_carrera").deleteMany({});
    if (resumen.length > 0) {
      await db.collection("resumen_carrera").insertMany(resumen);
    }

    res.json({
      message: "Coleccion resumen_carrera generada correctamente",
      total: resumen.length,
      data: resumen
    });
  } catch (error) {
    res.status(500).json({ message: "Error en consulta", error: error.message });
  }
}

async function edadAprobadosCarreraTipo(req, res) {
  try {
    const data = await Evaluacion.aggregate([
      {
        $match: {
          aprobado: true,
          edad: { $ne: null, $gte: 10, $lte: 100 }
        }
      },
      {
        $group: {
          _id: {
            carrera_objetivo: "$carrera_objetivo",
            tipo_institucion_educativa: "$tipo_institucion_educativa"
          },
          promedio_edad: { $avg: "$edad" },
          cantidad_registros: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          carrera_objetivo: "$_id.carrera_objetivo",
          tipo_institucion_educativa: "$_id.tipo_institucion_educativa",
          promedio_edad: { $round: ["$promedio_edad", 2] },
          cantidad_registros: 1
        }
      },
      { $sort: { carrera_objetivo: 1, promedio_edad: -1 } }
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error en consulta", error: error.message });
  }
}

async function aprobadosMunicipioCarrera(req, res) {
  try {
    const data = await Evaluacion.aggregate([
      { $match: { aprobado: true } },
      {
        $group: {
          _id: {
            municipio_institucion_educativa: "$municipio_institucion_educativa",
            carrera_objetivo: "$carrera_objetivo"
          },
          cantidad_aprobados: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          municipio_institucion_educativa: "$_id.municipio_institucion_educativa",
          carrera_objetivo: "$_id.carrera_objetivo",
          cantidad_aprobados: 1
        }
      },
      { $sort: { cantidad_aprobados: -1 } },
      { $limit: 100 }
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error en consulta", error: error.message });
  }
}

async function evaluacionesMesMateriaPublicas(req, res) {
  try {
    const data = await Evaluacion.aggregate([
      {
        $match: {
          tipo_institucion_educativa: "PUBLICO",
          fecha_asignacion: { $ne: null }
        }
      },
      {
        $group: {
          _id: {
            mes: { $month: "$fecha_asignacion" },
            materia: "$materia"
          },
          cantidad_evaluaciones: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          mes: "$_id.mes",
          materia: "$_id.materia",
          cantidad_evaluaciones: 1
        }
      },
      { $sort: { mes: 1, materia: 1 } }
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error en consulta", error: error.message });
  }
}

async function topCarrerasAspirantesJovenes(req, res) {
  try {
    const data = await Evaluacion.aggregate([
      {
        $match: {
          edad: { $gte: 16, $lte: 18 }
        }
      },
      {
        $group: {
          _id: "$carrera_objetivo",
          aspirantes: { $addToSet: "$correlativo_aspirante" }
        }
      },
      {
        $project: {
          _id: 0,
          carrera_objetivo: "$_id",
          cantidad_aspirantes: { $size: "$aspirantes" }
        }
      },
      { $sort: { cantidad_aspirantes: -1 } },
      { $limit: 5 }
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error en consulta", error: error.message });
  }
}

module.exports = {
  aspirantesPorTipoInstitucion,
  aprobadosPorMateria,
  aprobadosPorCarreraAnio,
  porcentajeAprobacionMateria,
  promedioEdadCarrera,
  crearResumenCarrera,
  edadAprobadosCarreraTipo,
  aprobadosMunicipioCarrera,
  evaluacionesMesMateriaPublicas,
  topCarrerasAspirantesJovenes
};