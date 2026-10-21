const mongoose = require("mongoose");

const evaluacionSchema = new mongoose.Schema(
  {
    fecha_asignacion: Date,
    sexo: String,
    anio_nacimiento: Number,
    edad: Number,
    materia: String,
    numero_de_fecha_de_evaluacion: Number,
    anio_de_ingreso: Number,
    aprobacion: String,
    aprobado: Boolean,
    carrera_objetivo: String,
    departamento_institucion_educativa: String,
    municipio_institucion_educativa: String,
    tipo_institucion_educativa: String,
    correlativo_aspirante: String,
    archivo_origen: String
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Evaluacion", evaluacionSchema);