const Router = require("express").Router;
const { commCtrl } = require("./communication.controller");

const routes = Router();

routes.post("/", commCtrl.callback);

module.exports.communication = routes;
