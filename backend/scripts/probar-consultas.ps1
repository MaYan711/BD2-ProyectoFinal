$BaseUrl = "http://localhost:3000/api"
$Correlativo = "949D241AC10256EDF11339A303C72A50"

$Consultas = @(
    @{ Base = "MongoDB"; Metodo = "GET"; Ruta = "/mongodb/aspirantes-tipo-institucion"; Nombre = "Aspirantes por tipo de institucion" },
    @{ Base = "MongoDB"; Metodo = "GET"; Ruta = "/mongodb/aprobados-materia"; Nombre = "Aprobados por materia" },
    @{ Base = "MongoDB"; Metodo = "GET"; Ruta = "/mongodb/aprobados-carrera-anio"; Nombre = "Aprobados por carrera y anio" },
    @{ Base = "MongoDB"; Metodo = "GET"; Ruta = "/mongodb/porcentaje-aprobacion-materia"; Nombre = "Porcentaje de aprobacion por materia" },
    @{ Base = "MongoDB"; Metodo = "GET"; Ruta = "/mongodb/promedio-edad-carrera"; Nombre = "Promedio de edad por carrera" },
    @{ Base = "MongoDB"; Metodo = "POST"; Ruta = "/mongodb/resumen-carrera"; Nombre = "Resumen por carrera" },
    @{ Base = "MongoDB"; Metodo = "GET"; Ruta = "/mongodb/edad-aprobados-carrera-tipo"; Nombre = "Edad de aprobados por carrera y tipo" },
    @{ Base = "MongoDB"; Metodo = "GET"; Ruta = "/mongodb/aprobados-municipio-carrera"; Nombre = "Aprobados por municipio y carrera" },
    @{ Base = "MongoDB"; Metodo = "GET"; Ruta = "/mongodb/evaluaciones-mes-materia-publicas"; Nombre = "Evaluaciones por mes en instituciones publicas" },
    @{ Base = "MongoDB"; Metodo = "GET"; Ruta = "/mongodb/top-carreras-16-18"; Nombre = "Carreras principales entre 16 y 18 anios" },
    @{ Base = "MongoDB"; Metodo = "GET"; Ruta = "/mongodb/distribucion-sexo-tipo"; Nombre = "Distribucion por sexo y tipo" },
    @{ Base = "MongoDB"; Metodo = "GET"; Ruta = "/mongodb/tasa-aprobacion-edad"; Nombre = "Tasa de aprobacion por edad" },
    @{ Base = "MongoDB"; Metodo = "GET"; Ruta = "/mongodb/promedio-intentos-materia"; Nombre = "Promedio de intentos por materia" },
    @{ Base = "MongoDB"; Metodo = "GET"; Ruta = "/mongodb/historial-desempeno/$Correlativo"; Nombre = "Historial de desempeno" },
    @{ Base = "MongoDB"; Metodo = "GET"; Ruta = "/mongodb/historial-completo/$Correlativo"; Nombre = "Historial completo" },
    @{ Base = "MongoDB"; Metodo = "GET"; Ruta = "/mongodb/carreras-reprobados-primer-intento"; Nombre = "Carreras con reprobados en primer intento" },
    @{ Base = "MongoDB"; Metodo = "GET"; Ruta = "/mongodb/top-municipios-aspirantes"; Nombre = "Municipios con mas aspirantes" },
    @{ Base = "MongoDB"; Metodo = "GET"; Ruta = "/mongodb/tasa-aprobacion-tipo-institucion"; Nombre = "Tasa por tipo de institucion" },
    @{ Base = "MongoDB"; Metodo = "GET"; Ruta = "/mongodb/carreras-demandadas-departamento"; Nombre = "Carreras demandadas por departamento" },
    @{ Base = "MongoDB"; Metodo = "GET"; Ruta = "/mongodb/evolucion-aprobacion-anio"; Nombre = "Evolucion de aprobacion por anio" },
    @{ Base = "Neo4j"; Metodo = "GET"; Ruta = "/neo4j/aspirantes-carrera"; Nombre = "Aspirantes por carrera" },
    @{ Base = "Neo4j"; Metodo = "GET"; Ruta = "/neo4j/aprobados-materia"; Nombre = "Aprobados por materia" },
    @{ Base = "Neo4j"; Metodo = "GET"; Ruta = "/neo4j/aspirantes-municipio"; Nombre = "Aspirantes por municipio" },
    @{ Base = "Neo4j"; Metodo = "GET"; Ruta = "/neo4j/aspirantes-tipo-institucion"; Nombre = "Aspirantes por tipo de institucion" },
    @{ Base = "Neo4j"; Metodo = "GET"; Ruta = "/neo4j/grafo-aspirante/$Correlativo"; Nombre = "Grafo completo del aspirante" }
)

$Exitosas = 0
$Fallidas = 0
$Numero = 0

Write-Host ""
Write-Host "Prueba automatica de consultas"
Write-Host "Total de consultas: $($Consultas.Count)"
Write-Host ""

foreach ($Consulta in $Consultas) {
    $Numero++
    $Url = "$BaseUrl$($Consulta.Ruta)"
    $Inicio = Get-Date

    try {
        $Parametros = @{
            Uri = $Url
            Method = $Consulta.Metodo
            TimeoutSec = 60
            UseBasicParsing = $true
            ErrorAction = "Stop"
        }

        $Respuesta = Invoke-WebRequest @Parametros
        $Tiempo = [math]::Round(((Get-Date) - $Inicio).TotalMilliseconds, 2)

        if ($Respuesta.StatusCode -ge 200 -and $Respuesta.StatusCode -lt 300) {
            $Exitosas++

            Write-Host "[$Numero/25] OK  $($Consulta.Base)  $($Consulta.Nombre)  HTTP $($Respuesta.StatusCode)  $Tiempo ms" -ForegroundColor Green
        } else {
            $Fallidas++

            Write-Host "[$Numero/25] ERROR  $($Consulta.Base)  $($Consulta.Nombre)  HTTP $($Respuesta.StatusCode)" -ForegroundColor Red
        }
    } catch {
        $Fallidas++
        $Tiempo = [math]::Round(((Get-Date) - $Inicio).TotalMilliseconds, 2)
        $Status = "Sin respuesta"

        if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
            $Status = [int]$_.Exception.Response.StatusCode
        }

        Write-Host "[$Numero/25] ERROR  $($Consulta.Base)  $($Consulta.Nombre)  HTTP $Status  $Tiempo ms" -ForegroundColor Red
        Write-Host "          $($_.Exception.Message)" -ForegroundColor DarkRed
    }
}

Write-Host ""
Write-Host "Resumen de pruebas"
Write-Host "Exitosas: $Exitosas" -ForegroundColor Green
Write-Host "Fallidas: $Fallidas" -ForegroundColor $(if ($Fallidas -eq 0) { "Green" } else { "Red" })
Write-Host "Total: $($Consultas.Count)"
Write-Host ""

if ($Fallidas -gt 0) {
    exit 1
}

exit 0