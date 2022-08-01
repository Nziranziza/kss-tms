const Router = require('express').Router;
const validator = require('../../../../middlewares/validator');
const { farmVisitConductCtrl } = require('./farm-visit-conduct.controller');

const routes = Router();

routes.post(
    '/',
    validator('validateFarmVisitConduct'),
    farmVisitConductCtrl.create
);
routes.put("/:id", farmVisitConductCtrl.update);
routes.get("/:id", farmVisitConductCtrl.findOne);
routes.post("/reference", farmVisitConductCtrl.find);
routes.delete("/:id", farmVisitConductCtrl.softDelete);

module.exports.farmVisitConducts = routes;
