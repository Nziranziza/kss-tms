const Router = require("express").Router;
const { scheduleCtrl } = require("./schedule.controller");
const validator = require("../../../../middlewares/validator");
const {groupCtrl} = require("../group/group.controller");

const routes = Router();

routes.post("/", validator("validateSchedule"), scheduleCtrl.create);
routes.get("/:id", scheduleCtrl.findOne);
routes.put("/:id", scheduleCtrl.update);
routes.post(
  "/attendance/:id",
  validator("validateRecordAtt"),
  scheduleCtrl.recordAtt
);
routes.post("/reference/:id", scheduleCtrl.findAllByRef);
routes.delete("/:id", scheduleCtrl.delete);
routes.post("/sms/:id", scheduleCtrl.sendSMS);
routes.post(
  "/stats",
  validator("validateStats"),
  scheduleCtrl.attendanceSummary
);
routes.post('/report', scheduleCtrl.report);
routes.post('/report/download/:type', scheduleCtrl.downloadReport);
routes.post('/statistics', scheduleCtrl.statistics);

module.exports.schedules = routes;
