const Router = require("express").Router;
const { applicationCtrl} = require('./application.controller');
const validator = require('middlewares/validator');
const auth = require("middlewares/auth");

const routes = Router();

routes.post('/',  validator('validateApplication'), applicationCtrl.create);
routes.use(auth)
routes.put('/:id',validator('validateApplication'), applicationCtrl.update);
routes.get('/:id', applicationCtrl.findById);

module.exports.applications = routes;
