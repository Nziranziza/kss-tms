const {
  applicationRepository
} = require('../../../../database/application/application.repository');
const BaseController = require('../../../../core/library/BaseController');

class ApplicationController extends BaseController {
  constructor(repository) {
    super(repository);
  }
}

module.exports.applicationCtrl = new ApplicationController(applicationRepository);
