# Documentacion tecnica de consultas
MongoDB se utilizo para consultas de tipo analitico y agregaciones sobre documentos. Esto permite agrupar, contar, calcular porcentajes, 
obtener promedios y generar resumenes a partir de los registros cargados desde los archivos CSV.
Neo4j se utilizo para representar relaciones entre aspirantes, evaluaciones, materias, carreras, municipios, departamentos y tipos de institucion. 
Esto permite consultar la informacion como un grafo y analizar conexiones entre entidades.

## Consultas en MongoDB
Las consultas de MongoDB fueron implementadas mediante agregaciones usando `aggregate`. Cada consulta trabaja sobre la coleccion principal 
de evaluaciones, donde se almacena la informacion procesada desde el CSV.

Se implementaron 20 consultas, cubriendo los siguientes puntos:

- Conteo de aspirantes por tipo de institucion.
- Conteo de aprobados por materia.
- Agrupacion de aprobados por carrera y anio.
- Calculo de porcentaje de aprobacion por materia.
- Promedio de edad por carrera.
- Generacion de resumenes por carrera.
- Analisis de aprobados por edad, carrera y tipo de institucion.
- Agrupacion de aprobados por municipio y carrera.
- Evaluaciones por mes, materia e instituciones publicas.
- Carreras mas demandadas por aspirantes jovenes.
- Historial de desempeno por aspirante.
- Distribucion por sexo y tipo de institucion.
- Tasa de aprobacion por edad.
- Promedio de intentos por materia.
- Historial completo de un aspirante.
- Carreras con reprobados en primer intento.
- Top de municipios con mas aspirantes.
- Tasa de aprobacion por tipo de institucion.
- Carreras mas demandadas por departamento.
- Evolucion de aprobacion por anio.


Consultas en Neo4j
Para Neo4j se modelo la informacion como un grafo. En lugar de guardar todo como un solo documento, se separaron las entidades 
principales en nodos y se conectaron por medio de relaciones.
Los nodos utilizados fueron:

- Aspirante
- Evaluacion
- Materia
- Carrera
- Municipio
- Departamento
- TipoInstitucion

Las relaciones utilizadas fueron:
- Aspirante - REALIZO - Evaluacion
- Evaluacion - EVALUA - Materia
- Aspirante - ASPIRA_A - Carrera
- Aspirante - PROVIENE_DE - Municipio
- Aspirante - ESTUDIO_EN_TIPO - TipoInstitucion
- Municipio - PERTENECE_A - Departamento

Con este modelo se implementaron 5 consultas principales:
- Aspirantes por carrera.
- Aprobados por materia.
- Aspirantes por municipio.
- Aspirantes por tipo de institucion.
- Grafo completo de un aspirante por correlativo.