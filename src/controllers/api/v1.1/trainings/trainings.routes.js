const Router = require("express").Router;
const { trainingCtrl } = require("./trainings.controller");
const validator = require("../../../../middlewares/validator");

const routes = Router();

routes.post("/", validator("validateTraining"), trainingCtrl.create);
routes.get("/:id", trainingCtrl.findOne);
routes.put("/:id", validator("validateUpdateTraining"), trainingCtrl.update);
routes.get("/app/:id", trainingCtrl.findByApp);
routes.delete("/:id", trainingCtrl.delete);

module.exports.trainings = routes;
