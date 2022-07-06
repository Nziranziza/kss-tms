const Router = require("express").Router;
const { scheduleCtrl } = require("./schedule.controller");
const validator = require("../../../../middlewares/validator");

const routes = Router();

routes.post("/", validator("validateSchedule"), scheduleCtrl.create);
routes.get("/:id", scheduleCtrl.findOne);
routes.put("/:id", scheduleCtrl.update);
routes.post(
  "/attendance/:id",
  validator("validateRecordAtt"),
  scheduleCtrl.recordAtt
);
routes.get("/org/:id", scheduleCtrl.findAllByOrg);
routes.delete("/:id", scheduleCtrl.delete);
routes.get("/sms/:id", scheduleCtrl.sendSMS);

module.exports.schedules = routes;
