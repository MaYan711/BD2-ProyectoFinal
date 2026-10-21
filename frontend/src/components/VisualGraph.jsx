import { useMemo, useState } from "react";

const nodeColors = {
  aspirante: "#2563eb",
  evaluacion: "#f97316",
  carrera: "#16a34a",
  municipio: "#9333ea",
  departamento: "#0891b2",
  institucion: "#dc2626"
};

function shorten(value, length = 24) {
  if (!value) return "Sin datos";
  return value.length > length ? `${value.slice(0, length)}...` : value;
}

function VisualGraph({ grafo }) {
  const [filtro, setFiltro] = useState("todos");

  const graphData = useMemo(() => {
    const centerNode = {
      id: "aspirante",
      type: "aspirante",
      label: "Aspirante",
      detail: grafo.correlativo_aspirante,
      x: 450,
      y: 260
    };

    const relatedNodes = [];

    if (filtro === "todos" || filtro === "evaluaciones") {
      (grafo.evaluaciones || []).forEach((evaluacion, index) => {
        relatedNodes.push({
          id: `evaluacion-${index}`,
          type: "evaluacion",
          label: evaluacion.materia,
          detail: `${evaluacion.aprobacion} - Intento ${evaluacion.intento}`,
          relation: "REALIZO"
        });
      });
    }

    if (filtro === "todos" || filtro === "contexto") {
      (grafo.carreras || []).forEach((carrera, index) => {
        relatedNodes.push({
          id: `carrera-${index}`,
          type: "carrera",
          label: "Carrera",
          detail: carrera,
          relation: "ASPIRA_A"
        });
      });

      (grafo.municipios || []).forEach((municipio, index) => {
        relatedNodes.push({
          id: `municipio-${index}`,
          type: "municipio",
          label: "Municipio",
          detail: municipio,
          relation: "PROVIENE_DE"
        });
      });

      (grafo.departamentos || []).forEach((departamento, index) => {
        relatedNodes.push({
          id: `departamento-${index}`,
          type: "departamento",
          label: "Departamento",
          detail: departamento,
          relation: "PERTENECE_A"
        });
      });

      (grafo.tipos_institucion || []).forEach((tipo, index) => {
        relatedNodes.push({
          id: `institucion-${index}`,
          type: "institucion",
          label: "Tipo institucion",
          detail: tipo,
          relation: "ESTUDIO_EN_TIPO"
        });
      });
    }

    const radiusX = 330;
    const radiusY = 190;

    const positionedNodes = relatedNodes.map((node, index) => {
      const angle =
        (2 * Math.PI * index) / Math.max(relatedNodes.length, 1) -
        Math.PI / 2;

      return {
        ...node,
        x: 450 + radiusX * Math.cos(angle),
        y: 260 + radiusY * Math.sin(angle)
      };
    });

    return {
      centerNode,
      nodes: positionedNodes
    };
  }, [grafo, filtro]);

  return (
    <div className="visual-graph">
      <div className="graph-controls">
        <label htmlFor="graph-filter">Filtrar relaciones</label>

        <select
          id="graph-filter"
          value={filtro}
          onChange={(event) => setFiltro(event.target.value)}
        >
          <option value="todos">Todas las relaciones</option>
          <option value="evaluaciones">Solo evaluaciones</option>
          <option value="contexto">Carrera y procedencia</option>
        </select>
      </div>

      <div className="graph-canvas">
        <svg
          viewBox="0 0 900 520"
          role="img"
          aria-label="Grafo de relaciones del aspirante"
        >
          <defs>
            <marker
              id="arrow"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L0,6 L9,3 z" fill="#94a3b8" />
            </marker>
          </defs>

          {graphData.nodes.map((node) => (
            <g key={`edge-${node.id}`}>
              <line
                x1={graphData.centerNode.x}
                y1={graphData.centerNode.y}
                x2={node.x}
                y2={node.y}
                className="graph-edge"
                markerEnd="url(#arrow)"
              />

              <text
                x={(graphData.centerNode.x + node.x) / 2}
                y={(graphData.centerNode.y + node.y) / 2 - 7}
                className="edge-label"
                textAnchor="middle"
              >
                {node.relation}
              </text>
            </g>
          ))}

          {graphData.nodes.map((node) => (
            <g key={node.id}>
              <title>{`${node.label}: ${node.detail}`}</title>

              <circle
                cx={node.x}
                cy={node.y}
                r="43"
                fill={nodeColors[node.type]}
                className="graph-node"
              />

              <text
                x={node.x}
                y={node.y - 4}
                className="node-label"
                textAnchor="middle"
              >
                {shorten(node.label, 15)}
              </text>

              <text
                x={node.x}
                y={node.y + 14}
                className="node-detail"
                textAnchor="middle"
              >
                {shorten(node.detail, 18)}
              </text>
            </g>
          ))}

          <g>
            <title>{graphData.centerNode.detail}</title>

            <circle
              cx={graphData.centerNode.x}
              cy={graphData.centerNode.y}
              r="58"
              fill={nodeColors.aspirante}
              className="graph-node central-node"
            />

            <text
              x={graphData.centerNode.x}
              y={graphData.centerNode.y - 7}
              className="node-label central-label"
              textAnchor="middle"
            >
              Aspirante
            </text>

            <text
              x={graphData.centerNode.x}
              y={graphData.centerNode.y + 14}
              className="node-detail"
              textAnchor="middle"
            >
              {shorten(graphData.centerNode.detail, 12)}
            </text>
          </g>
        </svg>
      </div>

      <div className="graph-legend">
        {Object.entries(nodeColors).map(([type, color]) => (
          <span key={type}>
            <i style={{ backgroundColor: color }} />
            {type}
          </span>
        ))}
      </div>

      <p className="graph-help">
        Coloca el cursor sobre un nodo para consultar su contenido completo.
      </p>
    </div>
  );
}

export default VisualGraph;