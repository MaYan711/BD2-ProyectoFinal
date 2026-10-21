import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import "./App.css";

const API_URL = "http://localhost:3000/api";

const colors = ["#2563eb", "#16a34a", "#f97316", "#9333ea", "#dc2626", "#0891b2"];

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [tipoInstitucion, setTipoInstitucion] = useState([]);
  const [aprobadosMateria, setAprobadosMateria] = useState([]);
  const [tasaEdad, setTasaEdad] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [evolucion, setEvolucion] = useState([]);

  const [correlativo, setCorrelativo] = useState("");
  const [grafo, setGrafo] = useState(null);
  const [grafoError, setGrafoError] = useState("");

  const [archivo, setArchivo] = useState(null);
  const [resultadoCarga, setResultadoCarga] = useState(null);
  const [cargandoArchivo, setCargandoArchivo] = useState(false);

  const resumenEvolucion = useMemo(() => {
    if (!evolucion.length) return [];

    return evolucion.map((item) => {
      const aprobado = item.resultados.find((r) => r.aprobacion === "APROBADO");
      const noAprobado = item.resultados.find((r) => r.aprobacion === "NO APROBADO");

      return {
        anio_de_ingreso: item.anio_de_ingreso,
        aprobados: aprobado?.cantidad || 0,
        no_aprobados: noAprobado?.cantidad || 0,
        total: item.total
      };
    });
  }, [evolucion]);

  async function cargarDashboard() {
    setLoading(true);
    setError("");

    try {
      const [
        tipoInstitucionRes,
        aprobadosMateriaRes,
        tasaEdadRes,
        municipiosRes,
        evolucionRes
      ] = await Promise.all([
        axios.get(`${API_URL}/mongodb/aspirantes-tipo-institucion`),
        axios.get(`${API_URL}/mongodb/aprobados-materia`),
        axios.get(`${API_URL}/mongodb/tasa-aprobacion-edad`),
        axios.get(`${API_URL}/mongodb/top-municipios-aspirantes`),
        axios.get(`${API_URL}/mongodb/evolucion-aprobacion-anio`)
      ]);

      setTipoInstitucion(tipoInstitucionRes.data);
      setAprobadosMateria(aprobadosMateriaRes.data);
      setTasaEdad(tasaEdadRes.data);
      setMunicipios(municipiosRes.data);
      setEvolucion(evolucionRes.data);
    } catch (err) {
      setError("No fue posible cargar los datos del dashboard. Verifica que el backend este ejecutandose.");
    } finally {
      setLoading(false);
    }
  }

  async function buscarGrafo(event) {
    event.preventDefault();
    setGrafo(null);
    setGrafoError("");

    if (!correlativo.trim()) {
      setGrafoError("Ingresa un correlativo de aspirante.");
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/neo4j/grafo-aspirante/${correlativo.trim()}`);
      setGrafo(response.data);
    } catch (err) {
      setGrafoError("No fue posible consultar el grafo del aspirante.");
    }
  }

  async function cargarCsv(event) {
    event.preventDefault();
    setResultadoCarga(null);

    if (!archivo) {
      setResultadoCarga({ error: "Selecciona un archivo CSV antes de cargar." });
      return;
    }

    const formData = new FormData();
    formData.append("file", archivo);

    setCargandoArchivo(true);

    try {
      const response = await axios.post(`${API_URL}/uploads/csv`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      setResultadoCarga(response.data);
      await cargarDashboard();
    } catch (err) {
      setResultadoCarga({
        error: "No fue posible cargar el archivo CSV. Revisa el formato o el backend."
      });
    } finally {
      setCargandoArchivo(false);
    }
  }

  useEffect(() => {
    cargarDashboard();
  }, []);

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Proyecto Final Bases de Datos 2</p>
          <h1>Analisis de pruebas especificas USAC</h1>
          <p className="hero-text">
            Dashboard para cargar archivos CSV, consultar estadisticas en MongoDB y explorar relaciones en Neo4j.
          </p>
        </div>

        <div className="hero-actions">
          <button type="button" onClick={cargarDashboard}>
            Actualizar datos
          </button>
        </div>
      </section>

      {error && <div className="alert error">{error}</div>}
      {loading && <div className="alert">Cargando informacion del dashboard...</div>}

      <section className="stats-grid">
        <article className="stat-card">
          <span>Total registros</span>
          <strong>{resumenEvolucion[0]?.total || 0}</strong>
          <p>Evaluaciones cargadas desde CSV.</p>
        </article>

        <article className="stat-card">
          <span>Aprobados</span>
          <strong>{resumenEvolucion[0]?.aprobados || 0}</strong>
          <p>Evaluaciones con resultado aprobado.</p>
        </article>

        <article className="stat-card">
          <span>No aprobados</span>
          <strong>{resumenEvolucion[0]?.no_aprobados || 0}</strong>
          <p>Evaluaciones con resultado no aprobado.</p>
        </article>

        <article className="stat-card">
          <span>Materias</span>
          <strong>{aprobadosMateria.length}</strong>
          <p>Materias evaluadas en el dataset.</p>
        </article>
      </section>

      <section className="content-grid">
        <article className="panel">
          <div className="panel-header">
            <h2>Aspirantes por tipo de institucion</h2>
            <p>Consulta MongoDB: aspirantes agrupados por tipo de institucion educativa.</p>
          </div>

          <div className="chart-box">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={tipoInstitucion}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tipo_institucion_educativa" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cantidad_aspirantes" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <h2>Aprobados por materia</h2>
            <p>Consulta MongoDB: cantidad de evaluaciones aprobadas por materia.</p>
          </div>

          <div className="chart-box">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={aprobadosMateria}
                  dataKey="cantidad_aprobados"
                  nameKey="materia"
                  outerRadius={100}
                  label
                >
                  {aprobadosMateria.map((entry, index) => (
                    <Cell key={entry.materia} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <h2>Tasa de aprobacion por edad</h2>
            <p>Consulta MongoDB: porcentaje de aprobacion agrupado por edad.</p>
          </div>

          <div className="chart-box">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={tasaEdad}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="edad" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="porcentaje_aprobacion" stroke="#16a34a" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <h2>Top municipios con mas aspirantes</h2>
            <p>Consulta MongoDB: municipios de instituciones educativas con mayor cantidad de aspirantes.</p>
          </div>

          <div className="table-box">
            <table>
              <thead>
                <tr>
                  <th>Municipio</th>
                  <th>Aspirantes</th>
                </tr>
              </thead>
              <tbody>
                {municipios.map((item) => (
                  <tr key={item.municipio_institucion_educativa}>
                    <td>{item.municipio_institucion_educativa}</td>
                    <td>{item.cantidad_aspirantes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="two-columns">
        <article className="panel">
          <div className="panel-header">
            <h2>Carga de archivo CSV</h2>
            <p>Permite cargar informacion hacia MongoDB y Neo4j desde la interfaz.</p>
          </div>

          <form className="form" onSubmit={cargarCsv}>
            <input
              type="file"
              accept=".csv"
              onChange={(event) => setArchivo(event.target.files[0])}
            />
            <button type="submit" disabled={cargandoArchivo}>
              {cargandoArchivo ? "Procesando..." : "Cargar CSV"}
            </button>
          </form>

          {resultadoCarga && (
            <pre className={resultadoCarga.error ? "result error-box" : "result"}>
              {JSON.stringify(resultadoCarga, null, 2)}
            </pre>
          )}
        </article>

        <article className="panel">
          <div className="panel-header">
            <h2>Explorador de grafo Neo4j</h2>
            <p>Busca un aspirante por correlativo y visualiza sus relaciones principales.</p>
          </div>

          <form className="form" onSubmit={buscarGrafo}>
            <input
              type="text"
              value={correlativo}
              placeholder="Ejemplo: 949D241AC10256EDF11339A303C72A50"
              onChange={(event) => setCorrelativo(event.target.value)}
            />
            <button type="submit">Buscar grafo</button>
          </form>

          {grafoError && <div className="alert error">{grafoError}</div>}

          {grafo && (
            <div className="graph-card">
              <h3>Aspirante {grafo.correlativo_aspirante}</h3>
              <div className="graph-row">
                <span>Aspirante</span>
                <span>Evaluaciones: {grafo.evaluaciones?.length || 0}</span>
                <span>Carreras: {grafo.carreras?.join(", ") || "Sin datos"}</span>
                <span>Municipios: {grafo.municipios?.join(", ") || "Sin datos"}</span>
                <span>Tipo: {grafo.tipos_institucion?.join(", ") || "Sin datos"}</span>
              </div>

              <div className="graph-list">
                {(grafo.evaluaciones || []).map((evaluacion, index) => (
                  <div key={`${evaluacion.materia}-${index}`} className="graph-item">
                    <strong>{evaluacion.materia}</strong>
                    <span>{evaluacion.aprobacion}</span>
                    <small>Intento {evaluacion.intento}</small>
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>
      </section>
    </main>
  );
}

export default App;