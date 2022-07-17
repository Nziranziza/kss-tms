const express = require("express");
const path = require("path");
const config = require("config");
const cors = require("cors");
const logger = require("./src/utils/logging");
const api = require("./src/routes");
const app = express();

const mongoCon = require("./src/startup/mongo");
const client = require("./src/startup/redisconnection");
const { claimToken } = require("./src/services/comm.service");
require('./src/cron');

// Disable Powered By Header
app.disable("x-powered-by");

app.use(
  express.json({
    limit: "5mb",
  })
);
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

mongoCon();

api.mountRoutes(app);

// Allow cors from dev environment
if (config.get("app.node_env") === "development") {
  //allowing cors policies
  app.use(cors());
}

app.listen(config.get("app.port"), () => {
  logger.info(
    `${config.get("app.name")} service is listening on port ${config.get(
      "app.port"
    )}!`
  );

  client.on("connect", () => {
    claimToken();
  });
});

module.exports = app;
