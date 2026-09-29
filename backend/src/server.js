const dotenv = require("dotenv");

dotenv.config();

const express = require("express");
const cors = require("cors");
const connectMongoDB = require("./config/mongodb");
const neo4jDriver = require("./config/neo4j");
const uploadRoutes = require("./routes/uploadRoutes");
const mongoQueriesRoutes = require("./routes/mongoQueriesRoutes");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/api/uploads", uploadRoutes);
app.use("/api/mongodb", mongoQueriesRoutes);

connectMongoDB();

app.get("/api/health", async (req, res) => {
  const session = neo4jDriver.session();

  try {
    await session.run("RETURN 1 AS ok");

    res.json({
      status: "ok",
      mongodb: "connected",
      neo4j: "connected"
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  } finally {
    await session.close();
  }
});

app.listen(port, () => {
  console.log(`API ejecutandose en http://localhost:${port}`);
});