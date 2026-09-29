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

async function historialDesempenoAspirante(req, res) {
  try {
    const { correlativo } = req.params;

    const data = await Evaluacion.find(
      { correlativo_aspirante: correlativo.toUpperCase() },
      {
        _id: 0,
        materia: 1,
        numero_de_fecha_de_evaluacion: 1,
        aprobacion: 1,
        aprobado: 1,
        fecha_asignacion: 1,
        anio_de_ingreso: 1,
        carrera_objetivo: 1
      }
    ).sort({
      anio_de_ingreso: 1,
      materia: 1,
      numero_de_fecha_de_evaluacion: 1
    });

    res.json({
      correlativo_aspirante: correlativo.toUpperCase(),
      total_evaluaciones: data.length,
      historial: data
    });
  } catch (error) {
    res.status(500).json({ message: "Error en consulta", error: error.message });
  }
}

async function distribucionSexoTipo(req, res) {
  try {
    const data = await Evaluacion.aggregate([
      {
        $group: {
          _id: {
            sexo: "$sexo",
            tipo_institucion_educativa: "$tipo_institucion_educativa"
          },
          aspirantes: { $addToSet: "$correlativo_aspirante" }
        }
      },
      {
        $project: {
          _id: 0,
          sexo: "$_id.sexo",
          tipo_institucion_educativa: "$_id.tipo_institucion_educativa",
          cantidad_aspirantes: { $size: "$aspirantes" }
        }
      },
      { $sort: { tipo_institucion_educativa: 1, sexo: 1 } }
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error en consulta", error: error.message });
  }
}

async function tasaAprobacionEdad(req, res) {
  try {
    const data = await Evaluacion.aggregate([
      {
        $match: {
          edad: { $ne: null, $gte: 10, $lte: 100 }
        }
      },
      {
        $group: {
          _id: "$edad",
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
          edad: "$_id",
          total: 1,
          aprobados: 1,
          porcentaje_aprobacion: {
            $round: [{ $multiply: [{ $divide: ["$aprobados", "$total"] }, 100] }, 2]
          }
        }
      },
      { $sort: { edad: 1 } }
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error en consulta", error: error.message });
  }
}

async function promedioIntentosMateria(req, res) {
  try {
    const data = await Evaluacion.aggregate([
      {
        $match: {
          numero_de_fecha_de_evaluacion: { $ne: null }
        }
      },
      {
        $group: {
          _id: "$materia",
          promedio_intentos: { $avg: "$numero_de_fecha_de_evaluacion" },
          cantidad_evaluaciones: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          materia: "$_id",
          promedio_intentos: { $round: ["$promedio_intentos", 2] },
          cantidad_evaluaciones: 1
        }
      },
      { $sort: { promedio_intentos: -1 } }
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error en consulta", error: error.message });
  }
}

async function historialCompletoAspirante(req, res) {
  try {
    const { correlativo } = req.params;

    const data = await Evaluacion.find(
      { correlativo_aspirante: correlativo.toUpperCase() },
      { _id: 0, __v: 0 }
    ).sort({
      fecha_asignacion: 1,
      materia: 1
    });

    res.json({
      correlativo_aspirante: correlativo.toUpperCase(),
      total_registros: data.length,
      registros: data
    });
  } catch (error) {
    res.status(500).json({ message: "Error en consulta", error: error.message });
  }
}

async function carrerasReprobadosPrimerIntento(req, res) {
  try {
    const data = await Evaluacion.aggregate([
      {
        $match: {
          numero_de_fecha_de_evaluacion: 1,
          aprobado: false
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
          cantidad_aspirantes_reprobados: { $size: "$aspirantes" }
        }
      },
      { $sort: { cantidad_aspirantes_reprobados: -1 } },
      { $limit: 10 }
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error en consulta", error: error.message });
  }
}

async function topMunicipiosAspirantes(req, res) {
  try {
    const data = await Evaluacion.aggregate([
      {
        $group: {
          _id: "$municipio_institucion_educativa",
          aspirantes: { $addToSet: "$correlativo_aspirante" }
        }
      },
      {
        $project: {
          _id: 0,
          municipio_institucion_educativa: "$_id",
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

async function tasaAprobacionTipoInstitucion(req, res) {
  try {
    const data = await Evaluacion.aggregate([
      {
        $group: {
          _id: "$tipo_institucion_educativa",
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
          tipo_institucion_educativa: "$_id",
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

async function carrerasDemandadasDepartamento(req, res) {
  try {
    const data = await Evaluacion.aggregate([
      {
        $group: {
          _id: {
            departamento: "$departamento_institucion_educativa",
            carrera: "$carrera_objetivo"
          },
          aspirantes: { $addToSet: "$correlativo_aspirante" }
        }
      },
      {
        $project: {
          _id: 0,
          departamento_institucion_educativa: "$_id.departamento",
          carrera_objetivo: "$_id.carrera",
          cantidad_aspirantes: { $size: "$aspirantes" }
        }
      },
      {
        $sort: {
          departamento_institucion_educativa: 1,
          cantidad_aspirantes: -1
        }
      }
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error en consulta", error: error.message });
  }
}

async function evolucionAprobacionAnio(req, res) {
  try {
    const data = await Evaluacion.aggregate([
      {
        $group: {
          _id: {
            anio_de_ingreso: "$anio_de_ingreso",
            aprobacion: "$aprobacion"
          },
          cantidad: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.anio_de_ingreso",
          resultados: {
            $push: {
              aprobacion: "$_id.aprobacion",
              cantidad: "$cantidad"
            }
          },
          total: { $sum: "$cantidad" }
        }
      },
      {
        $project: {
          _id: 0,
          anio_de_ingreso: "$_id",
          total: 1,
          resultados: {
            $map: {
              input: "$resultados",
              as: "item",
              in: {
                aprobacion: "$$item.aprobacion",
                cantidad: "$$item.cantidad",
                porcentaje: {
                  $round: [
                    { $multiply: [{ $divide: ["$$item.cantidad", "$total"] }, 100] },
                    2
                  ]
                }
              }
            }
          }
        }
      },
      { $sort: { anio_de_ingreso: 1 } }
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
  topCarrerasAspirantesJovenes,
  historialDesempenoAspirante,
  distribucionSexoTipo,
  tasaAprobacionEdad,
  promedioIntentosMateria,
  historialCompletoAspirante,
  carrerasReprobadosPrimerIntento,
  topMunicipiosAspirantes,
  tasaAprobacionTipoInstitucion,
  carrerasDemandadasDepartamento,
  evolucionAprobacionAnio
};