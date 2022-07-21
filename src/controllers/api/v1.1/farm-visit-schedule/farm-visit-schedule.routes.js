const Router = require('express').Router;
const validator = require('../../../../middlewares/validator');
const { farmVisitScheduleCtrl } = require('./farm-visit-schedule.controller');

const routes = Router();

routes.post(
    '/',
    validator('validateFarmVisitSchedule'),
    farmVisitScheduleCtrl.create
);
routes.put("/:id", farmVisitScheduleCtrl.update);
routes.get("/:id", farmVisitScheduleCtrl.findOne);
routes.post("/reference", farmVisitScheduleCtrl.find);
routes.delete("/:id", farmVisitScheduleCtrl.softDelete);
routes.post("/stats", farmVisitScheduleCtrl.visitStats);
routes.get("/farmer/:id", farmVisitScheduleCtrl.farmerVisits);

module.exports.farmVisitSchedules = routes;
