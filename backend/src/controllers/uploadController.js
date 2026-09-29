const { procesarCsv } = require("../services/etlService");

async function cargarCsv(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Debe enviar un archivo CSV"
      });
    }

    const resultado = await procesarCsv(req.file);

    res.json({
      message: "Archivo procesado correctamente",
      resultado
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al procesar archivo",
      error: error.message
    });
  }
}

module.exports = {
  cargarCsv
};