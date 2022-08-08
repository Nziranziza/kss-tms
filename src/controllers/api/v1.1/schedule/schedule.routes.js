const Router = require("express").Router;
const { scheduleCtrl } = require("./schedule.controller");
const validator = require("../../../../middlewares/validator");

const routes = Router();

routes.post("/", validator("validateSchedule"), scheduleCtrl.create);
routes.get("/:id", scheduleCtrl.findOne);
routes.put("/:id", validator("validateUpdateSchedule"), scheduleCtrl.update);
routes.post(
  "/attendance/:id",
  validator("validateRecordAtt"),
  scheduleCtrl.recordAtt
);
routes.put(
  "/attendance/:id",
  validator("validateEditAtt"),
  scheduleCtrl.editAtt
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
routes.get('/farmer/attendancerate/:id', scheduleCtrl.getFarmerAttendance)
module.exports.schedules = routes;
