const Router = require("express").Router;
const { dashCtrl } = require("./dashboard.controller");

const routes = Router();

routes.post("/filters", dashCtrl.getFilterOptions);

module.exports.dashboard = routes;
