const Router = require('express').Router;
const validator = require('../../../../middlewares/validator');
const { farmVisitScheduleCtrl } = require('./farm-visit-schedule.controller');
const {scheduleCtrl} = require("../schedule/schedule.controller");

const routes = Router();

routes.post(
    '/',
    validator('validateFarmVisitSchedule'),
    farmVisitScheduleCtrl.create
);
routes.put("/:id", farmVisitScheduleCtrl.update);
routes.get("/:id", farmVisitScheduleCtrl.findOne);
routes.post("/reference", farmVisitScheduleCtrl.find);
routes.post("/farms/reference", farmVisitScheduleCtrl.farmsVisits);
routes.delete("/:id", farmVisitScheduleCtrl.softDelete);
routes.post("/stats", farmVisitScheduleCtrl.visitStats);
routes.get("/farmer/:id", farmVisitScheduleCtrl.farmerVisits);
routes.get("/sms/:id", farmVisitScheduleCtrl.sendSMS);
routes.get("/farm/:id", farmVisitScheduleCtrl.farmVisits);

module.exports.farmVisitSchedules = routes;
