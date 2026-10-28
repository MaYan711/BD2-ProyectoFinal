# Consultas MongoDB

Este archivo documenta las 20 consultas implementadas en MongoDB. La base de datos utilizada es `bd2_proyecto_final` y la coleccion principal creada por Mongoose es `evaluacions`.

Las consultas se ejecutan desde el backend mediante el modelo `Evaluacion`. A continuacion se muestran en una forma equivalente para `mongosh`.

## 1. Aspirantes por tipo de institucion educativa

**Endpoint:** `GET /api/mongodb/aspirantes-tipo-institucion`

Agrupa los aspirantes por tipo de institucion y evita contar varias veces al mismo aspirante.

```javascript
db.evaluacions.aggregate([
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
])
```

## 2. Cantidad de aprobados por materia

**Endpoint:** `GET /api/mongodb/aprobados-materia`

Cuenta las evaluaciones aprobadas y las agrupa por materia.

```javascript
db.evaluacions.aggregate([
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
])
```

## 3. Aprobados por carrera y anio de ingreso

**Endpoint:** `GET /api/mongodb/aprobados-carrera-anio`

Agrupa los aspirantes aprobados por carrera objetivo y anio de ingreso.

```javascript
db.evaluacions.aggregate([
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
])
```

## 4. Porcentaje de aprobacion por materia

**Endpoint:** `GET /api/mongodb/porcentaje-aprobacion-materia`

Calcula el total, la cantidad de aprobados y el porcentaje de aprobacion de cada materia.

```javascript
db.evaluacions.aggregate([
  {
    $group: {
      _id: "$materia",
      total: { $sum: 1 },
      aprobados: {
        $sum: { $cond: ["$aprobado", 1, 0] }
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
        $round: [
          { $multiply: [{ $divide: ["$aprobados", "$total"] }, 100] },
          2
        ]
      }
    }
  },
  { $sort: { porcentaje_aprobacion: -1 } }
])
```

## 5. Promedio de edad por carrera

**Endpoint:** `GET /api/mongodb/promedio-edad-carrera`

Calcula la edad promedio por carrera, excluyendo edades nulas o fuera del rango valido.

```javascript
db.evaluacions.aggregate([
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
])
```

## 6. Creacion de la coleccion auxiliar resumen_carrera

**Endpoint:** `POST /api/mongodb/resumen-carrera`

Genera un resumen por carrera y guarda el resultado en la coleccion `resumen_carrera`.

```javascript
const resumen = db.evaluacions.aggregate([
  {
    $group: {
      _id: "$carrera_objetivo",
      total_evaluaciones: { $sum: 1 },
      aspirantes: { $addToSet: "$correlativo_aspirante" },
      aprobados: {
        $sum: { $cond: ["$aprobado", 1, 0] }
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
]).toArray()

db.resumen_carrera.deleteMany({})

if (resumen.length > 0) {
  db.resumen_carrera.insertMany(resumen)
}
```

## 7. Promedio de edad de aprobados por carrera y tipo de institucion

**Endpoint:** `GET /api/mongodb/edad-aprobados-carrera-tipo`

Calcula la edad promedio de los aprobados por carrera y tipo de institucion.

```javascript
db.evaluacions.aggregate([
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
])
```

## 8. Distribucion de aprobados por municipio y carrera objetivo

**Endpoint:** `GET /api/mongodb/aprobados-municipio-carrera`

Cuenta las evaluaciones aprobadas agrupadas por municipio y carrera objetivo.

```javascript
db.evaluacions.aggregate([
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
])
```

## 9. Evaluaciones por mes y materia para instituciones publicas

**Endpoint:** `GET /api/mongodb/evaluaciones-mes-materia-publicas`

Cuenta las evaluaciones de instituciones publicas por mes y materia.

```javascript
db.evaluacions.aggregate([
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
])
```

## 10. Top 5 de carreras mas demandadas entre 16 y 18 anios

**Endpoint:** `GET /api/mongodb/top-carreras-16-18`

Obtiene las cinco carreras con mas aspirantes unicos entre 16 y 18 anios.

```javascript
db.evaluacions.aggregate([
  { $match: { edad: { $gte: 16, $lte: 18 } } },
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
])
```

## 11. Historial de desempeno por aspirante

**Endpoint:** `GET /api/mongodb/historial-desempeno/:correlativo`

Busca el historial de evaluaciones de un aspirante y ordena sus resultados.

```javascript
const correlativo = "949D241AC10256EDF11339A303C72A50"

db.evaluacions.find(
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
})
```

## 12. Distribucion por sexo y tipo de institucion educativa

**Endpoint:** `GET /api/mongodb/distribucion-sexo-tipo`

Agrupa aspirantes unicos por sexo y tipo de institucion.

```javascript
db.evaluacions.aggregate([
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
])
```

## 13. Tasa de aprobacion por edad

**Endpoint:** `GET /api/mongodb/tasa-aprobacion-edad`

Calcula el total, aprobados y porcentaje de aprobacion para cada edad valida.

```javascript
db.evaluacions.aggregate([
  { $match: { edad: { $ne: null, $gte: 10, $lte: 100 } } },
  {
    $group: {
      _id: "$edad",
      total: { $sum: 1 },
      aprobados: {
        $sum: { $cond: ["$aprobado", 1, 0] }
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
        $round: [
          { $multiply: [{ $divide: ["$aprobados", "$total"] }, 100] },
          2
        ]
      }
    }
  },
  { $sort: { edad: 1 } }
])
```

## 14. Numero promedio de intentos por materia

**Endpoint:** `GET /api/mongodb/promedio-intentos-materia`

Calcula el promedio de oportunidades de evaluacion por materia.

```javascript
db.evaluacions.aggregate([
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
])
```

## 15. Historial completo de un aspirante

**Endpoint:** `GET /api/mongodb/historial-completo/:correlativo`

Muestra todos los registros asociados al correlativo indicado.

```javascript
const correlativo = "949D241AC10256EDF11339A303C72A50"

db.evaluacions.find(
  { correlativo_aspirante: correlativo.toUpperCase() },
  { _id: 0, __v: 0 }
).sort({
  fecha_asignacion: 1,
  materia: 1
})
```

## 16. Carreras con mas aspirantes reprobados en primer intento

**Endpoint:** `GET /api/mongodb/carreras-reprobados-primer-intento`

Obtiene las carreras con mas aspirantes unicos reprobados en la primera oportunidad.

```javascript
db.evaluacions.aggregate([
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
])
```

## 17. Top 5 municipios con mayor cantidad de aspirantes

**Endpoint:** `GET /api/mongodb/top-municipios-aspirantes`

Obtiene los cinco municipios con mas aspirantes unicos.

```javascript
db.evaluacions.aggregate([
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
])
```

## 18. Tasa de aprobacion por tipo de institucion educativa

**Endpoint:** `GET /api/mongodb/tasa-aprobacion-tipo-institucion`

Calcula y compara el porcentaje de aprobacion por tipo de institucion.

```javascript
db.evaluacions.aggregate([
  {
    $group: {
      _id: "$tipo_institucion_educativa",
      total: { $sum: 1 },
      aprobados: {
        $sum: { $cond: ["$aprobado", 1, 0] }
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
        $round: [
          { $multiply: [{ $divide: ["$aprobados", "$total"] }, 100] },
          2
        ]
      }
    }
  },
  { $sort: { porcentaje_aprobacion: -1 } }
])
```

## 19. Carreras mas demandadas por departamento

**Endpoint:** `GET /api/mongodb/carreras-demandadas-departamento`

Agrupa aspirantes unicos por departamento y carrera objetivo.

```javascript
db.evaluacions.aggregate([
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
])
```

## 20. Evolucion de aprobacion por anio de ingreso

**Endpoint:** `GET /api/mongodb/evolucion-aprobacion-anio`

Calcula la cantidad y porcentaje de aprobados y no aprobados para cada anio de ingreso.

```javascript
db.evaluacions.aggregate([
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
                {
                  $multiply: [
                    { $divide: ["$$item.cantidad", "$total"] },
                    100
                  ]
                },
                2
              ]
            }
          }
        }
      }
    }
  },
  { $sort: { anio_de_ingreso: 1 } }
])
```

## Ejecucion desde mongosh

Para ingresar a MongoDB dentro del contenedor se utiliza:

```powershell
docker exec -it bd2_mongodb mongosh bd2_proyecto_final
```

Una vez dentro de `mongosh`, se puede copiar y ejecutar cualquiera de las consultas anteriores.

Las mismas consultas tambien pueden ejecutarse desde la interfaz grafica mediante el explorador de consultas del proyecto.
