const Router = require('express').Router;
const validator = require('../../../../middlewares/validator');
const { farmVisitScheduleCtrl } = require('./farm-visit-schedule.controller');

const routes = Router();

routes.post(
    '/',
    validator('validateFarmVisitSchedule'),
    farmVisitScheduleCtrl.create
);

module.exports.farmVisiteSchedules = routes;
