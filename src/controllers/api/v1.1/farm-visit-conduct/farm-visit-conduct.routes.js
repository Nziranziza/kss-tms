const Router = require('express').Router;
const validator = require('middlewares/validator');
const { farmVisitConductCtrl } = require('./farm-visit-conduct.controller');

const router = Router();

router.post(
    '/',
    validator('validateFarmVisitConduct'),
    farmVisitConductCtrl.create
);
router.put("/:id", farmVisitConductCtrl.update);
router.put("/custom/:id", farmVisitConductCtrl.update);
router.get("/:id", farmVisitConductCtrl.findById);
router.post("/reference", farmVisitConductCtrl.find);
router.delete("/:id", farmVisitConductCtrl.softDelete);
router.post('/report', farmVisitConductCtrl.report);
router.post('/statistics', farmVisitConductCtrl.statistics);

module.exports.farmVisitConducts = router;