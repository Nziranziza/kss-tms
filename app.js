process.env.NODE_PATH = __dirname + '/src';
require('module').Module._initPaths();
const express = require("express");
const config = require("config");
const cors = require("cors");
const logger = require("./src/utils/logging");
const api = require("./src/routes");
const app = express();
const mongoCon = require("./src/startup/mongo");
require("./src/cron");
const appRoot = require('app-root-path');
const fs = require('fs');
const dir = `${appRoot}/files/downloads`;
const fileUpload = require('express-fileupload');

if (!fs.existsSync(dir)){
  fs.mkdirSync(dir, { recursive: true });
}

app.disable('x-powered-by');

app.use(cors());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin,X-Requested-With,Content-Type,Accept'
  );
  res.setHeader('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE');
  return next();
});

mongoCon();

app.use(
    express.json({
      limit: '1000mb'
    })
);

api.mountRoutes(app);

app.use((req, res) => {
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


app.listen(config.get('app.port'), () =>
    logger.info(
        `${config.get('app.name')} service is listening on port ${config.get(
            'app.port'
        )}!`
    )
);

module.exports = app;