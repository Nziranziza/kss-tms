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
require("./src/cron");
const appRoot = require('app-root-path');
const fs = require('fs');
const dir = `${appRoot}/files/downloads`;

if (!fs.existsSync(dir)){
  fs.mkdirSync(dir, { recursive: true });
}

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

app.use((req, res, next) => {
  res.status(404).send({
    status: 404,
    error: 'Resource not found'
  });
});

app.use(
    fileUpload({
      limits: { fileSize: 50 * 1024 * 1024 }
    })
);

app.listen(config.get("app.port"), () => {
  logger.info(
    `${config.get("app.name")} service is listening on port ${config.get(
      "app.port"
    )}!`
  );

  client.on("connect", () => {
    console.log("Skipped claiming token")
    claimToken();
  });
});

module.exports = app;
