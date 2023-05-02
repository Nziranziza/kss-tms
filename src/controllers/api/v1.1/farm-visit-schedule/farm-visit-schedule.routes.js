const Router = require("express").Router;
const validator = require("middlewares/validator");
const { farmVisitScheduleCtrl } = require("./farm-visit-schedule.controller");

const routes = Router();

routes.post(
  "/",
  validator("validateFarmVisitSchedule"),
  farmVisitScheduleCtrl.create
);
routes.put("/:id", farmVisitScheduleCtrl.update);
routes.get("/:id", farmVisitScheduleCtrl.findById);
routes.post("/reference", farmVisitScheduleCtrl.find);
routes.post("/farms/reference", farmVisitScheduleCtrl.farmsScheduledVisits);
routes.delete("/:id", farmVisitScheduleCtrl.softDelete);
routes.post(
  "/stats",
  validator("validateVisitStats"),
  farmVisitScheduleCtrl.schedulesStats
);
routes.get("/farmer/:id", farmVisitScheduleCtrl.farmerScheduledVisits);
routes.post("/sms/:id", farmVisitScheduleCtrl.sendSMS);
routes.post('/sms-callback', farmVisitScheduleCtrl.smsCallback)
routes.post("/farm", farmVisitScheduleCtrl.farmScheduledVisits);
routes.post("/visited/farms", farmVisitScheduleCtrl.visitedFarmsOverview);

module.exports.farmVisitSchedules = routes;
