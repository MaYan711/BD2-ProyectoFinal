const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const neo4j = require("neo4j-driver");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB conectado");
  })
  .catch((error) => {
    console.error("Error al conectar MongoDB:", error.message);
  });

const neo4jDriver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

app.get("/api/health", async (req, res) => {
  let mongoStatus = "disconnected";
  let neo4jStatus = "disconnected";

  if (mongoose.connection.readyState === 1) {
    mongoStatus = "connected";
  }

  const session = neo4jDriver.session();

  try {
    await session.run("RETURN 1 AS ok");
    neo4jStatus = "connected";
  } catch (error) {
    neo4jStatus = "error";
  } finally {
    await session.close();
  }

  res.json({
    status: "ok",
    mongodb: mongoStatus,
    neo4j: neo4jStatus
  });
});

app.listen(port, () => {
  console.log(`API ejecutandose en http://localhost:${port}`);
});