# Consultas Neo4j

Este archivo documenta las 5 consultas implementadas en Neo4j 

## Modelo de grafo utilizado

Nodos principales:

- Aspirante
- Evaluacion
- Materia
- Carrera
- Municipio
- Departamento
- TipoInstitucion

Relaciones principales:

- Aspirante REALIZO Evaluacion
- Evaluacion EVALUA Materia
- Aspirante ASPIRA_A Carrera
- Aspirante PROVIENE_DE Municipio
- Aspirante ESTUDIO_EN_TIPO TipoInstitucion
- Municipio PERTENECE_A Departamento

## 1. Aspirantes por carrera

Endpoint:
GET /api/neo4j/aspirantes-carrera
Descripcion:
Cuenta la cantidad de aspirantes asociados a cada carrera objetivo.
Consulta Cypher:
```cypher
MATCH (a:Aspirante)-[:ASPIRA_A]->(c:Carrera)
RETURN c.nombre AS carrera, count(DISTINCT a) AS cantidad_aspirantes
ORDER BY cantidad_aspirantes DESC

2. Aprobados por materia
Endpoint:
GET /api/neo4j/aprobados-materia
Descripcion:
Cuenta las evaluaciones aprobadas por materia.
Consulta Cypher:
MATCH (:Aspirante)-[:REALIZO]->(e:Evaluacion)-[:EVALUA]->(m:Materia)
WHERE e.aprobado = true
RETURN m.nombre AS materia, count(e) AS cantidad_aprobados
ORDER BY cantidad_aprobados DESC

3. Aspirantes por municipio
Endpoint:
GET /api/neo4j/aspirantes-municipio
Descripcion:
Obtiene los municipios con mayor cantidad de aspirantes.
Consulta Cypher:
MATCH (a:Aspirante)-[:PROVIENE_DE]->(m:Municipio)
RETURN m.nombre AS municipio, count(DISTINCT a) AS cantidad_aspirantes
ORDER BY cantidad_aspirantes DESC
LIMIT 10

4. Aspirantes por tipo de institucion
Endpoint:
GET /api/neo4j/aspirantes-tipo-institucion
Descripcion:
Agrupa aspirantes segun el tipo de institucion educativa.
Consulta Cypher:
MATCH (a:Aspirante)-[:ESTUDIO_EN_TIPO]->(t:TipoInstitucion)
RETURN t.nombre AS tipo_institucion, count(DISTINCT a) AS cantidad_aspirantes
ORDER BY cantidad_aspirantes DESC

5. Grafo de aspirante
Endpoint:
GET /api/neo4j/grafo-aspirante/:correlativo
Descripcion:
Obtiene las relaciones principales de un aspirante: evaluaciones, materias, carrera, municipio, departamento y tipo de institucion.
Consulta Cypher:
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