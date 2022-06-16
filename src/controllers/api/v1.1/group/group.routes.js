const Router = require('express').Router;
const { groupCtrl} = require('./group.controller');
const validator = require('../../../../middlewares/validator');

const routes = Router();

routes.post('/',  validator('validateGroup'), groupCtrl.create);
routes.put('/:id',validator('validateGroup'), groupCtrl.update);
routes.get('/:id', groupCtrl.findOne);
routes.post('/reference', groupCtrl.find);

module.exports.groups = routes;
