const Router = require('express').Router;
const { membersCtrl} = require('./members.controller');
const validator = require('../../../../middlewares/validator');

const routes = Router();

routes.post('/', validator('validateMembers'), membersCtrl.create);
routes.put('/:id', validator('validateMembers'), membersCtrl.update);
routes.get('/:id', membersCtrl.findOne);
routes.get('/', membersCtrl.find);
routes.get('/group/:id', membersCtrl.findOneByGroup);

module.exports.members = routes;
