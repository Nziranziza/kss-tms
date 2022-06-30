const Router = require('express').Router;
const validator = require('../../../../middlewares/validator');
const { farmVisitScheduleCtrl } = require('./farm-visit-schedule.controller');

const routes = Router();

routes.post(
    '/',
    validator('validateCreateFarmVisitSchedule'),
    farmVisitScheduleCtrl.create
);

module.exports.farmVisitSchedules = routes;
