const Router = require('express').Router;
const { groupCtrl} = require('./group.controller');
const validator = require('../../../../middlewares/validator');

const routes = Router();

routes.post('/',  validator('validateGroup'), groupCtrl.create);
routes.put('/:id', groupCtrl.update);
routes.get('/:id', groupCtrl.findOne);
routes.post('/search', groupCtrl.searchGroup);
routes.post('/reference', groupCtrl.find);
routes.get('/', groupCtrl.findAll);
routes.put('/members/:id',validator('validateUpdateMembers'), groupCtrl.updateMembers);
routes.put('/profile/:id',validator('validateUpdateProfile'), groupCtrl.updateProfile);

module.exports.groups = routes;
