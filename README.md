# Proyecto Final Bases de Datos 2

Aplicacion web para cargar, procesar, consultar y visualizar informacion de las pruebas especificas de aspirantes de la Universidad de San Carlos de Guatemala.

El proyecto utiliza MongoDB para las consultas estadisticas y Neo4j para representar las relaciones entre aspirantes, evaluaciones, materias, carreras e instituciones educativas.

## Tecnologias utilizadas

- React y Vite
- Node.js y Express
- MongoDB
- Neo4j
- Docker Compose

## Requisitos

- Node.js 22 o superior
- npm
- Git
- Docker Desktop

## Instalacion

Clonar el repositorio:

```bash
git clone https://github.com/MaYan711/BD2-ProyectoFinal.git
cd BD2-ProyectoFinal
```

Levantar MongoDB y Neo4j:

```bash
docker compose up -d
```

Configurar el backend:

```bash
cp backend/.env.example backend/.env
cd backend
npm install
npm run dev
```

En otra terminal, iniciar el frontend:

```bash
cd frontend
npm install
npm run dev
```

Abrir la aplicacion en:

```text
http://localhost:5173
```

La API funciona en:

```text
http://localhost:3000/api
```

## Funciones principales

- Carga de uno o varios archivos CSV.
- Transformacion y validacion de registros.
- Almacenamiento en MongoDB y Neo4j.
- Dashboard con indicadores, tablas y graficas.
- Explorador visual de grafos.
- 20 consultas MongoDB.
- 5 consultas Neo4j.
- Prevencion de archivos duplicados.

## Dataset

El archivo CSV debe descargarse desde el portal de Datos Abiertos de la Facultad de Ingenieria:

https://datosabiertos.ingenieria.usac.edu.gt/en/dataset/pruebas-especificas

Los archivos pueden colocarse en:

```text
data/raw/
```

## Documentacion

- Manual tecnico: `docs/manual-tecnico/ManualTecnico.pdf`
- Manual de usuario: `docs/manual-usuario/ManualUsuario.pdf`
- Consultas MongoDB: `database/mongodb/consultas/consultas_mongodb.md`
- Consultas Neo4j: `database/neo4j/consultas/consultas_neo4j.md`

## Pruebas

Para ejecutar la prueba de las 25 consultas:

```powershell
powershell -ExecutionPolicy Bypass -File .\backend\scripts\probar-consultas.ps1
```

Resultado obtenido:

```text
Exitosas: 25
Fallidas: 0
Total: 25
```

## Autor

Mario Raul Yancor Ocana  
Carne 201930761