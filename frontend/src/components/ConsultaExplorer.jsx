import { useMemo, useRef, useState } from "react";
import axios from "axios";

const consultasMongo = [
  {
    id: "aspirantes-tipo-institucion",
    nombre: "Aspirantes por tipo de institucion",
    metodo: "GET",
    ruta: "/mongodb/aspirantes-tipo-institucion"
  },
  {
    id: "aprobados-materia",
    nombre: "Aprobados por materia",
    metodo: "GET",
    ruta: "/mongodb/aprobados-materia"
  },
  {
    id: "aprobados-carrera-anio",
    nombre: "Aprobados por carrera y anio",
    metodo: "GET",
    ruta: "/mongodb/aprobados-carrera-anio"
  },
  {
    id: "porcentaje-aprobacion-materia",
    nombre: "Porcentaje de aprobacion por materia",
    metodo: "GET",
    ruta: "/mongodb/porcentaje-aprobacion-materia"
  },
  {
    id: "promedio-edad-carrera",
    nombre: "Promedio de edad por carrera",
    metodo: "GET",
    ruta: "/mongodb/promedio-edad-carrera"
  },
  {
    id: "resumen-carrera",
    nombre: "Generar resumen por carrera",
    metodo: "POST",
    ruta: "/mongodb/resumen-carrera"
  },
  {
    id: "edad-aprobados-carrera-tipo",
    nombre: "Edad de aprobados por carrera y tipo",
    metodo: "GET",
    ruta: "/mongodb/edad-aprobados-carrera-tipo"
  },
  {
    id: "aprobados-municipio-carrera",
    nombre: "Aprobados por municipio y carrera",
    metodo: "GET",
    ruta: "/mongodb/aprobados-municipio-carrera"
  },
  {
    id: "evaluaciones-mes-materia-publicas",
    nombre: "Evaluaciones por mes en instituciones publicas",
    metodo: "GET",
    ruta: "/mongodb/evaluaciones-mes-materia-publicas"
  },
  {
    id: "top-carreras-16-18",
    nombre: "Carreras principales entre 16 y 18 anios",
    metodo: "GET",
    ruta: "/mongodb/top-carreras-16-18"
  },
  {
    id: "distribucion-sexo-tipo",
    nombre: "Distribucion por sexo y tipo de institucion",
    metodo: "GET",
    ruta: "/mongodb/distribucion-sexo-tipo"
  },
  {
    id: "tasa-aprobacion-edad",
    nombre: "Tasa de aprobacion por edad",
    metodo: "GET",
    ruta: "/mongodb/tasa-aprobacion-edad"
  },
  {
    id: "promedio-intentos-materia",
    nombre: "Promedio de intentos por materia",
    metodo: "GET",
    ruta: "/mongodb/promedio-intentos-materia"
  },
  {
    id: "historial-desempeno",
    nombre: "Historial de desempeno de un aspirante",
    metodo: "GET",
    ruta: "/mongodb/historial-desempeno/:correlativo",
    parametro: "correlativo",
    placeholder: "Correlativo del aspirante"
  },
  {
    id: "historial-completo",
    nombre: "Historial completo de un aspirante",
    metodo: "GET",
    ruta: "/mongodb/historial-completo/:correlativo",
    parametro: "correlativo",
    placeholder: "Correlativo del aspirante"
  },
  {
    id: "carreras-reprobados-primer-intento",
    nombre: "Carreras con reprobados en primer intento",
    metodo: "GET",
    ruta: "/mongodb/carreras-reprobados-primer-intento"
  },
  {
    id: "top-municipios-aspirantes",
    nombre: "Municipios con mas aspirantes",
    metodo: "GET",
    ruta: "/mongodb/top-municipios-aspirantes"
  },
  {
    id: "tasa-aprobacion-tipo-institucion",
    nombre: "Tasa de aprobacion por tipo de institucion",
    metodo: "GET",
    ruta: "/mongodb/tasa-aprobacion-tipo-institucion"
  },
  {
    id: "carreras-demandadas-departamento",
    nombre: "Carreras demandadas por departamento",
    metodo: "GET",
    ruta: "/mongodb/carreras-demandadas-departamento"
  },
  {
    id: "evolucion-aprobacion-anio",
    nombre: "Evolucion de aprobacion por anio",
    metodo: "GET",
    ruta: "/mongodb/evolucion-aprobacion-anio"
  }
];

const consultasNeo4j = [
  {
    id: "aspirantes-carrera",
    nombre: "Aspirantes por carrera",
    metodo: "GET",
    ruta: "/neo4j/aspirantes-carrera"
  },
  {
    id: "aprobados-materia",
    nombre: "Aprobados por materia",
    metodo: "GET",
    ruta: "/neo4j/aprobados-materia"
  },
  {
    id: "aspirantes-municipio",
    nombre: "Aspirantes por municipio",
    metodo: "GET",
    ruta: "/neo4j/aspirantes-municipio"
  },
  {
    id: "aspirantes-tipo-institucion",
    nombre: "Aspirantes por tipo de institucion",
    metodo: "GET",
    ruta: "/neo4j/aspirantes-tipo-institucion"
  },
  {
    id: "grafo-aspirante",
    nombre: "Grafo completo de un aspirante",
    metodo: "GET",
    ruta: "/neo4j/grafo-aspirante/:correlativo",
    parametro: "correlativo",
    placeholder: "Correlativo del aspirante"
  }
];

const etiquetasColumnas = {
  tipo_institucion_educativa: "Tipo de institucion",
  tipo_institucion: "Tipo de institucion",
  cantidad_aspirantes: "Cantidad de aspirantes",
  cantidad_aprobados: "Cantidad de aprobados",
  cantidad_evaluaciones: "Cantidad de evaluaciones",
  cantidad_registros: "Cantidad de registros",
  cantidad_aspirantes_aprobados: "Aspirantes aprobados",
  cantidad_aspirantes_reprobados: "Aspirantes reprobados",
  carrera_objetivo: "Carrera objetivo",
  anio_de_ingreso: "Anio de ingreso",
  porcentaje_aprobacion: "Porcentaje de aprobacion",
  promedio_edad: "Promedio de edad",
  promedio_intentos: "Promedio de intentos",
  correlativo_aspirante: "Correlativo del aspirante",
  municipio_institucion_educativa: "Municipio",
  departamento_institucion_educativa: "Departamento",
  fecha_asignacion: "Fecha de asignacion",
  numero_de_fecha_de_evaluacion: "Numero de intento",
  aprobacion: "Resultado",
  aprobado: "Aprobado",
  materia: "Materia",
  carrera: "Carrera",
  municipio: "Municipio",
  departamento: "Departamento",
  sexo: "Sexo",
  edad: "Edad",
  intento: "Intento",
  total: "Total",
  resultados: "Resultados",
  evaluaciones: "Evaluaciones",
  carreras: "Carreras",
  municipios: "Municipios",
  departamentos: "Departamentos",
  tipos_institucion: "Tipos de institucion",
  historial: "Historial",
  registros: "Registros",
  message: "Mensaje",
  estado: "Estado",
  archivo: "Archivo"
};

function formatColumnName(columnName) {
  if (etiquetasColumnas[columnName]) {
    return etiquetasColumnas[columnName];
  }

  const texto = columnName.replaceAll("_", " ");

  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function formatValue(value) {
  if (value === null || value === undefined || value === "") {
    return "Sin datos";
  }

  if (typeof value === "boolean") {
    return value ? "Si" : "No";
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "Sin resultados";
    }

    return value
      .map((item) => {
        if (item && typeof item === "object") {
          return Object.entries(item)
            .map(
              ([key, itemValue]) =>
                `${formatColumnName(key)}: ${formatValue(itemValue)}`
            )
            .join(" | ");
        }

        return formatValue(item);
      })
      .join("\n");
  }

  if (typeof value === "object") {
    return Object.entries(value)
      .map(
        ([key, itemValue]) =>
          `${formatColumnName(key)}: ${formatValue(itemValue)}`
      )
      .join(" | ");
  }

  return String(value);
}

function normalizarRespuesta(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (data === null || data === undefined) {
    return [];
  }

  return [data];
}

function ConsultaExplorer({ apiUrl }) {
  const [baseDatos, setBaseDatos] = useState("mongodb");
  const [consultaId, setConsultaId] = useState(
    consultasMongo[0].id
  );
  const [parametro, setParametro] = useState("");
  const [resultado, setResultado] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [tiempoMs, setTiempoMs] = useState(null);
  const [consultaEjecutada, setConsultaEjecutada] =
    useState(false);
    const requestControllerRef = useRef(null);

  const consultas =
    baseDatos === "mongodb"
      ? consultasMongo
      : consultasNeo4j;

  const consultaSeleccionada = useMemo(
    () =>
      consultas.find(
        (consulta) => consulta.id === consultaId
      ) || consultas[0],
    [consultaId, consultas]
  );

  const columnas = useMemo(() => {
    const nombres = new Set();

    resultado.forEach((fila) => {
      if (
        fila &&
        typeof fila === "object" &&
        !Array.isArray(fila)
      ) {
        Object.keys(fila).forEach((clave) =>
          nombres.add(clave)
        );
      } else {
        nombres.add("resultado");
      }
    });

    return Array.from(nombres);
  }, [resultado]);


  function cancelarConsulta() {
  if (requestControllerRef.current) {
    requestControllerRef.current.abort();
    requestControllerRef.current = null;
  }

  setCargando(false);
}

function cambiarBaseDatos(event) {
  cancelarConsulta();

  const nuevaBase = event.target.value;
  const nuevasConsultas =
    nuevaBase === "mongodb"
      ? consultasMongo
      : consultasNeo4j;

  setBaseDatos(nuevaBase);
  setConsultaId(nuevasConsultas[0].id);
  setParametro("");
  setResultado([]);
  setError("");
  setTiempoMs(null);
  setConsultaEjecutada(false);
}

  function cambiarConsulta(event) {
  cancelarConsulta();
  setConsultaId(event.target.value);
  setParametro("");
  setResultado([]);
  setError("");
  setTiempoMs(null);
  setConsultaEjecutada(false);
}

 async function ejecutarConsulta(event) {
  event.preventDefault();

  cancelarConsulta();
  setError("");
  setResultado([]);
  setTiempoMs(null);
  setConsultaEjecutada(false);

  if (
    consultaSeleccionada.parametro &&
    !parametro.trim()
  ) {
    setError(
      "Debe ingresar el parametro requerido para ejecutar esta consulta."
    );
    return;
  }

  let ruta = consultaSeleccionada.ruta;

  if (consultaSeleccionada.parametro) {
    ruta = ruta.replace(
      `:${consultaSeleccionada.parametro}`,
      encodeURIComponent(parametro.trim())
    );
  }

  const controller = new AbortController();
  requestControllerRef.current = controller;

  setCargando(true);
  const inicio = performance.now();

  try {
    const response = await axios({
      method: consultaSeleccionada.metodo,
      url: `${apiUrl}${ruta}`,
      signal: controller.signal,
      timeout: 30000
    });

    setResultado(normalizarRespuesta(response.data));
    setConsultaEjecutada(true);
  } catch (requestError) {
    if (
      requestError.code === "ERR_CANCELED" ||
      requestError.name === "CanceledError"
    ) {
      setError("La consulta fue cancelada.");
    } else if (requestError.code === "ECONNABORTED") {
      setError(
        "La consulta excedio el tiempo maximo de 30 segundos."
      );
    } else {
      const status = requestError.response?.status;

      if (status === 400) {
        setError(
          "Los datos enviados no son validos para ejecutar esta consulta."
        );
      } else if (status === 404) {
        setError(
          "No se encontro informacion para la consulta seleccionada."
        );
      } else if (status === 409) {
        setError(
          "La operacion no puede realizarse porque la informacion ya existe."
        );
      } else if (status >= 500) {
        setError(
          "Ocurrio un problema interno al ejecutar la consulta."
        );
      } else {
        setError(
          "No fue posible comunicarse con el servidor. Verifica que el backend este ejecutandose."
        );
      }
    }

    setConsultaEjecutada(true);
  } finally {
    if (requestControllerRef.current === controller) {
      setTiempoMs(
        Math.round((performance.now() - inicio) * 100) / 100
      );
      setCargando(false);
      requestControllerRef.current = null;
    }
  }
}

  return (
    <section className="query-explorer">
      <div className="query-heading">
        <div>
          <p className="eyebrow query-eyebrow">
            Consultas disponibles
          </p>

          <h2>Explorador de consultas</h2>

          <p>
            Ejecuta y visualiza las consultas implementadas en
            MongoDB y Neo4j.
          </p>
        </div>

        <div className="query-counter">
          <strong>25</strong>
          <span>consultas disponibles</span>
        </div>
      </div>

      <form
        className="query-form"
        onSubmit={ejecutarConsulta}
      >
        <div className="query-field">
          <label htmlFor="database-select">
            Base de datos
          </label>

          <select
            id="database-select"
            value={baseDatos}
            onChange={cambiarBaseDatos}
          >
            <option value="mongodb">MongoDB</option>
            <option value="neo4j">Neo4j</option>
          </select>
        </div>

        <div className="query-field query-field-wide">
          <label htmlFor="query-select">Consulta</label>

          <select
            id="query-select"
            value={consultaId}
            onChange={cambiarConsulta}
          >
            {consultas.map((consulta, index) => (
              <option
                key={consulta.id}
                value={consulta.id}
              >
                {index + 1}. {consulta.nombre}
              </option>
            ))}
          </select>
        </div>

        {consultaSeleccionada.parametro && (
          <div className="query-field query-field-wide">
            <label htmlFor="query-parameter">
              Parametro requerido
            </label>

            <input
              id="query-parameter"
              type="text"
              value={parametro}
              placeholder={
                consultaSeleccionada.placeholder
              }
              onChange={(event) =>
                setParametro(event.target.value)
              }
            />
          </div>
        )}

        <div className="query-actions">
  <button type="submit" disabled={cargando}>
    {cargando
      ? "Ejecutando consulta..."
      : "Ejecutar consulta"}
  </button>

  {cargando && (
    <button
      type="button"
      className="cancel-button"
      onClick={cancelarConsulta}
    >
      Cancelar
    </button>
  )}
</div>
      </form>

      <div className="query-description">
  <span
    className={`database-badge ${baseDatos}`}
  >
    {baseDatos === "mongodb"
      ? "MongoDB"
      : "Neo4j"}
  </span>

  <strong>{consultaSeleccionada.nombre}</strong>

  <span className="query-ready">
    Consulta lista para ejecutar
  </span>
</div>

      {error && (
        <div className="alert error query-alert">
          {error}
        </div>
      )}

      {consultaEjecutada && !error && (
        <div className="query-metadata">
          <div>
            <span>Resultados</span>
            <strong>{resultado.length}</strong>
          </div>

          <div>
            <span>Tiempo</span>
            <strong>{tiempoMs} ms</strong>
          </div>

          <div>
            <span>Estado</span>
            <strong>Completada</strong>
          </div>
        </div>
      )}

      {consultaEjecutada &&
        !error &&
        resultado.length === 0 && (
          <div className="query-empty">
            La consulta se ejecuto correctamente, pero no
            devolvio resultados.
          </div>
        )}

      {resultado.length > 0 && (
        <div className="query-table-container">
          <table className="query-table">
            <thead>
              <tr>
                {columnas.map((columna) => (
                  <th key={columna}>
                    {formatColumnName(columna)}
                    </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {resultado.map((fila, rowIndex) => (
                <tr key={rowIndex}>
                  {columnas.map((columna) => (
                    <td key={`${rowIndex}-${columna}`}>
                      {fila &&
                      typeof fila === "object" &&
                      !Array.isArray(fila)
                        ? formatValue(fila[columna])
                        : formatValue(fila)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default ConsultaExplorer;