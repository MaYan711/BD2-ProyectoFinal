const Evaluacion = require("../models/Evaluacion");
const neo4jDriver = require("../config/neo4j");

async function limpiarDatos(req, res) {
  const session = neo4jDriver.session();

  try {
    const mongoResultado = await Evaluacion.deleteMany({});
    await session.run("MATCH (n) DETACH DELETE n");

    res.json({
      message: "Datos eliminados correctamente",
      mongodb: {
        evaluaciones_eliminadas: mongoResultado.deletedCount
      },
      neo4j: {
        nodos_eliminados: "todos"
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al limpiar datos",
      error: error.message
    });
  } finally {
    await session.close();
  }
}

module.exports = {
  limpiarDatos
};