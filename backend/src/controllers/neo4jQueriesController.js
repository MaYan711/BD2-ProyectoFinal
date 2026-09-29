const neo4jDriver = require("../config/neo4j");

async function ejecutarConsulta(query, params = {}) {
  const session = neo4jDriver.session();

  try {
    const result = await session.run(query, params);

    return result.records.map((record) => {
      const item = {};

      record.keys.forEach((key) => {
        const value = record.get(key);

        if (value && typeof value.toNumber === "function") {
          item[key] = value.toNumber();
        } else {
          item[key] = value;
        }
      });

      return item;
    });
  } finally {
    await session.close();
  }
}

async function aspirantesPorCarrera(req, res) {
  try {
    const data = await ejecutarConsulta(`
      MATCH (a:Aspirante)-[:ASPIRA_A]->(c:Carrera)
      RETURN c.nombre AS carrera, count(DISTINCT a) AS cantidad_aspirantes
      ORDER BY cantidad_aspirantes DESC
    `);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error en consulta Neo4j", error: error.message });
  }
}

async function aprobadosPorMateria(req, res) {
  try {
    const data = await ejecutarConsulta(`
      MATCH (:Aspirante)-[:REALIZO]->(e:Evaluacion)-[:EVALUA]->(m:Materia)
      WHERE e.aprobado = true
      RETURN m.nombre AS materia, count(e) AS cantidad_aprobados
      ORDER BY cantidad_aprobados DESC
    `);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error en consulta Neo4j", error: error.message });
  }
}

async function aspirantesPorMunicipio(req, res) {
  try {
    const data = await ejecutarConsulta(`
      MATCH (a:Aspirante)-[:PROVIENE_DE]->(m:Municipio)
      RETURN m.nombre AS municipio, count(DISTINCT a) AS cantidad_aspirantes
      ORDER BY cantidad_aspirantes DESC
      LIMIT 10
    `);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error en consulta Neo4j", error: error.message });
  }
}

async function aspirantesPorTipoInstitucion(req, res) {
  try {
    const data = await ejecutarConsulta(`
      MATCH (a:Aspirante)-[:ESTUDIO_EN_TIPO]->(t:TipoInstitucion)
      RETURN t.nombre AS tipo_institucion, count(DISTINCT a) AS cantidad_aspirantes
      ORDER BY cantidad_aspirantes DESC
    `);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error en consulta Neo4j", error: error.message });
  }
}

async function grafoAspirante(req, res) {
  const { correlativo } = req.params;

  try {
    const data = await ejecutarConsulta(
      `
      MATCH (a:Aspirante {correlativo: $correlativo})
      OPTIONAL MATCH (a)-[:REALIZO]->(e:Evaluacion)-[:EVALUA]->(m:Materia)
      OPTIONAL MATCH (a)-[:ASPIRA_A]->(c:Carrera)
      OPTIONAL MATCH (a)-[:PROVIENE_DE]->(mu:Municipio)-[:PERTENECE_A]->(d:Departamento)
      OPTIONAL MATCH (a)-[:ESTUDIO_EN_TIPO]->(t:TipoInstitucion)
      RETURN
        a.correlativo AS correlativo_aspirante,
        a.sexo AS sexo,
        collect(DISTINCT {
          materia: m.nombre,
          aprobacion: e.aprobacion,
          aprobado: e.aprobado,
          intento: e.intento,
          anio_de_ingreso: e.anio_de_ingreso
        }) AS evaluaciones,
        collect(DISTINCT c.nombre) AS carreras,
        collect(DISTINCT mu.nombre) AS municipios,
        collect(DISTINCT d.nombre) AS departamentos,
        collect(DISTINCT t.nombre) AS tipos_institucion
      `,
      { correlativo }
    );

    res.json(data[0] || {
      correlativo_aspirante: correlativo,
      sexo: null,
      evaluaciones: [],
      carreras: [],
      municipios: [],
      departamentos: [],
      tipos_institucion: []
    });
  } catch (error) {
    res.status(500).json({ message: "Error en consulta Neo4j", error: error.message });
  }
}

module.exports = {
  aspirantesPorCarrera,
  aprobadosPorMateria,
  aspirantesPorMunicipio,
  aspirantesPorTipoInstitucion,
  grafoAspirante
};