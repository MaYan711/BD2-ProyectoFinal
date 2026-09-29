const { parse } = require("csv-parse/sync");
const Evaluacion = require("../models/Evaluacion");
const neo4jDriver = require("../config/neo4j");

function limpiarTexto(valor) {
  if (valor === undefined || valor === null) {
    return null;
  }

  const texto = String(valor).trim();

  if (texto === "" || texto.toUpperCase() === "SIN REGISTRO") {
    return null;
  }

  return texto.toUpperCase();
}

function obtener(row, nombres) {
  for (const nombre of nombres) {
    if (row[nombre] !== undefined) {
      return row[nombre];
    }
  }

  return null;
}

function convertirNumero(valor) {
  const limpio = limpiarTexto(valor);

  if (!limpio) {
    return null;
  }

  const numero = Number(limpio);

  if (Number.isNaN(numero)) {
    return null;
  }

  return numero;
}

function convertirFecha(valor) {
  const limpio = limpiarTexto(valor);

  if (!limpio) {
    return null;
  }

  const fecha = new Date(limpio);

  if (Number.isNaN(fecha.getTime())) {
    return null;
  }

  return fecha;
}

function transformarRegistro(row, archivoOrigen) {
  const anioNacimiento = convertirNumero(obtener(row, ["anio_nacimiento"]));
  const anioIngreso = convertirNumero(obtener(row, ["anio_de_ingreso"]));
  const aprobacion = limpiarTexto(obtener(row, ["aprobacion", "aprobación"]));

  return {
    fecha_asignacion: convertirFecha(obtener(row, ["fecha_asignacion"])),
    sexo: limpiarTexto(obtener(row, ["sexo"])),
    anio_nacimiento: anioNacimiento,
    edad: anioNacimiento && anioIngreso ? anioIngreso - anioNacimiento : null,
    materia: limpiarTexto(obtener(row, ["materia"])),
    numero_de_fecha_de_evaluacion: convertirNumero(
      obtener(row, ["numero_de_fecha_de_evaluacion", "numero_de_fecha_de_evaluación"])
    ),
    anio_de_ingreso: anioIngreso,
    aprobacion,
    aprobado: aprobacion === "APROBADO",
    carrera_objetivo: limpiarTexto(obtener(row, ["carrera_objetivo"])),
    departamento_institucion_educativa: limpiarTexto(
      obtener(row, ["departamento_institucion_educativa"])
    ),
    municipio_institucion_educativa: limpiarTexto(
      obtener(row, ["municipio_institucion_educativa"])
    ),
    tipo_institucion_educativa: limpiarTexto(
      obtener(row, ["tipo_institucion_educativa"])
    ),
    correlativo_aspirante: limpiarTexto(obtener(row, ["correlativo_aspirante"])),
    archivo_origen: archivoOrigen
  };
}

function validarRegistro(registro) {
  const errores = [];

  if (!registro.correlativo_aspirante) errores.push("correlativo_aspirante requerido");
  if (!registro.materia) errores.push("materia requerida");
  if (!registro.aprobacion) errores.push("aprobacion requerida");
  if (!registro.anio_de_ingreso) errores.push("anio_de_ingreso requerido");

  return errores;
}

async function cargarNeo4j(registros) {
  const session = neo4jDriver.session();

  const registrosNeo4j = registros.map((registro) => ({
    ...registro,
    fecha_asignacion: registro.fecha_asignacion
      ? registro.fecha_asignacion.toISOString().slice(0, 10)
      : null,
    materia: registro.materia || "SIN REGISTRO",
    carrera_objetivo: registro.carrera_objetivo || "NINGUNO",
    departamento_institucion_educativa:
      registro.departamento_institucion_educativa || "SIN REGISTRO",
    municipio_institucion_educativa:
      registro.municipio_institucion_educativa || "SIN REGISTRO",
    tipo_institucion_educativa:
      registro.tipo_institucion_educativa || "SIN REGISTRO"
  }));

  try {
    await session.run(
      `
      UNWIND $registros AS row
      MERGE (a:Aspirante {correlativo: row.correlativo_aspirante})
      SET a.sexo = row.sexo, a.anio_nacimiento = row.anio_nacimiento
      MERGE (m:Materia {nombre: row.materia})
      MERGE (c:Carrera {nombre: row.carrera_objetivo})
      MERGE (d:Departamento {nombre: row.departamento_institucion_educativa})
      MERGE (mu:Municipio {nombre: row.municipio_institucion_educativa})
      MERGE (t:TipoInstitucion {nombre: row.tipo_institucion_educativa})
      CREATE (e:Evaluacion {
        fecha_asignacion: row.fecha_asignacion,
        anio_de_ingreso: row.anio_de_ingreso,
        aprobacion: row.aprobacion,
        aprobado: row.aprobado,
        intento: row.numero_de_fecha_de_evaluacion
      })
      MERGE (a)-[:REALIZO]->(e)
      MERGE (e)-[:EVALUA]->(m)
      MERGE (a)-[:ASPIRA_A]->(c)
      MERGE (a)-[:PROVIENE_DE]->(mu)
      MERGE (mu)-[:PERTENECE_A]->(d)
      MERGE (a)-[:ESTUDIO_EN_TIPO]->(t)
      `,
      { registros: registrosNeo4j }
    );
  } finally {
    await session.close();
  }
}

async function procesarCsv(file) {
  const inicio = Date.now();
  const contenido = file.buffer.toString("utf8");

  const filas = parse(contenido, {
    columns: true,
    bom: true,
    skip_empty_lines: true,
    trim: true
  });

  const validos = [];
  const rechazados = [];

  for (const fila of filas) {
    const registro = transformarRegistro(fila, file.originalname);
    const errores = validarRegistro(registro);

    if (errores.length > 0) {
      rechazados.push({
        fila,
        errores
      });
    } else {
      validos.push(registro);
    }
  }

  if (validos.length > 0) {
    await Evaluacion.insertMany(validos);
    await cargarNeo4j(validos);
  }

  return {
    archivo: file.originalname,
    total_leidos: filas.length,
    procesados_correctamente: validos.length,
    rechazados: rechazados.length,
    errores: rechazados.slice(0, 20),
    tiempo_ms: Date.now() - inicio,
    estado: "FINALIZADO"
  };
}

module.exports = {
  procesarCsv
};