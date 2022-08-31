const Router = require("express").Router;
const { commCtrl } = require("./communication.controller");

const routes = Router();

routes.post("/training/callback", commCtrl.callback);
routes.post("/visit/callback", commCtrl.callback);
routes.post("/orders", commCtrl.orderSMS);
routes.get("/orders/:id", commCtrl.getOrders);
routes.get("/balance/:id", commCtrl.getBalance);

module.exports.communication = routes;
