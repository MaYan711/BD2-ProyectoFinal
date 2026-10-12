# Consultas MongoDB

Este archivo documenta las 20 consultas implementadas en MongoDB

## 1. Aspirantes por tipo de institucion

Endpoint:

GET /api/mongodb/aspirantes-tipo-institucion

Descripcion:

Agrupa los aspirantes segun el tipo de institucion educativa de procedencia.

## 2. Aprobados por materia

Endpoint:

GET /api/mongodb/aprobados-materia

Descripcion:

Cuenta la cantidad de evaluaciones aprobadas por materia.

## 3. Aprobados por carrera y anio

Endpoint:

GET /api/mongodb/aprobados-carrera-anio

Descripcion:

Agrupa aspirantes aprobados por carrera objetivo y anio de ingreso.

## 4. Porcentaje de aprobacion por materia

Endpoint:

GET /api/mongodb/porcentaje-aprobacion-materia

Descripcion:

Calcula el porcentaje de aprobacion por materia usando total de evaluaciones y aprobadas.

## 5. Promedio de edad por carrera

Endpoint:

GET /api/mongodb/promedio-edad-carrera

Descripcion:

Calcula el promedio de edad de los aspirantes agrupado por carrera objetivo.

## 6. Resumen por carrera

Endpoint:

POST /api/mongodb/resumen-carrera

Descripcion:

Genera una coleccion de resumen con totales agrupados por carrera.

## 7. Edad de aprobados por carrera y tipo de institucion

Endpoint:

GET /api/mongodb/edad-aprobados-carrera-tipo

Descripcion:

Agrupa aspirantes aprobados por edad, carrera y tipo de institucion.

## 8. Aprobados por municipio y carrera

Endpoint:

GET /api/mongodb/aprobados-municipio-carrera

Descripcion:

Cuenta aspirantes aprobados agrupados por municipio y carrera objetivo.

## 9. Evaluaciones por mes, materia e instituciones publicas

Endpoint:

GET /api/mongodb/evaluaciones-mes-materia-publicas

Descripcion:

Agrupa evaluaciones de instituciones publicas por mes y materia.

## 10. Top carreras de aspirantes entre 16 y 18 anios

Endpoint:

GET /api/mongodb/top-carreras-16-18

Descripcion:

Obtiene las carreras mas demandadas por aspirantes jovenes.

## 11. Historial de desempeno de aspirante

Endpoint:

GET /api/mongodb/historial-desempeno/:correlativo

Descripcion:

Muestra el historial de evaluaciones de un aspirante segun su correlativo.

## 12. Distribucion por sexo y tipo de institucion

Endpoint:

GET /api/mongodb/distribucion-sexo-tipo

Descripcion:

Agrupa aspirantes por sexo y tipo de institucion educativa.

## 13. Tasa de aprobacion por edad

Endpoint:

GET /api/mongodb/tasa-aprobacion-edad

Descripcion:

Calcula el porcentaje de aprobacion agrupado por edad.

## 14. Promedio de intentos por materia

Endpoint:

GET /api/mongodb/promedio-intentos-materia

Descripcion:

Calcula el promedio de intentos de evaluacion por materia.

## 15. Historial completo de aspirante

Endpoint:

GET /api/mongodb/historial-completo/:correlativo

Descripcion:

Muestra todos los registros asociados a un aspirante.

## 16. Carreras con reprobados en primer intento

Endpoint:

GET /api/mongodb/carreras-reprobados-primer-intento

Descripcion:

Obtiene las carreras con mayor cantidad de aspirantes reprobados en el primer intento.

## 17. Top municipios con mas aspirantes

Endpoint:

GET /api/mongodb/top-municipios-aspirantes

Descripcion:

Obtiene los municipios con mayor cantidad de aspirantes.

## 18. Tasa de aprobacion por tipo de institucion

Endpoint:

GET /api/mongodb/tasa-aprobacion-tipo-institucion

Descripcion:

Calcula el porcentaje de aprobacion agrupado por tipo de institucion educativa.

## 19. Carreras mas demandadas por departamento

Endpoint:

GET /api/mongodb/carreras-demandadas-departamento

Descripcion:

Agrupa aspirantes por departamento y carrera objetivo.

## 20. Evolucion de aprobacion por anio

Endpoint:

GET /api/mongodb/evolucion-aprobacion-anio

Descripcion:

Muestra la distribucion de aprobados y no aprobados por anio de ingreso.