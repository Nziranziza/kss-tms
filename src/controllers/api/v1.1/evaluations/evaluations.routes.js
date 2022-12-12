const Router = require("express").Router;
const { evaluationCtrl } = require("./evaluations.controller");
const validator = require("middlewares/validator");

const routes = Router();

routes.post("/", validator("validateEvaluation"), evaluationCtrl.create);
routes.get('/computeBaseline', evaluationCtrl.computeBaseline);
routes.get("/:id", evaluationCtrl.findOne);
routes.put("/:id", evaluationCtrl.update);
routes.get("/app/:id", evaluationCtrl.findByApp);
routes.delete("/:id", evaluationCtrl.delete);
routes.post("/stats", evaluationCtrl.evaluationStats);

module.exports.evaluations = routes;
