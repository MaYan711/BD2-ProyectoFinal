const { procesarCsv } = require("../services/etlService");

async function cargarCsv(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Debe enviar un archivo CSV"
      });
    }

    const resultado = await procesarCsv(req.file);

    return res.json({
      message: "Archivo procesado correctamente",
      resultado
    });
  } catch (error) {
    if (error.code === "ARCHIVO_DUPLICADO") {
      return res.status(409).json({
        message: error.message,
        codigo: error.code
      });
    }

    return res.status(500).json({
      message: "Error al procesar archivo",
      error: error.message
    });
  }
}

module.exports = {
  cargarCsv
};