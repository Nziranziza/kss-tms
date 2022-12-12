const {
  applicationRepository
} = require('../../../../database/application/application.repository');
const BaseController = require('../../../../core/library/BaseController');
const asyncWrapper = require("../../../../core/helpers/asyncWrapper");
const responseWrapper = require("../../../../core/helpers/responseWrapper");
const { statusCodes, serverMessages } = require("../../../../utils/constants/common");
const CustomError = require("../../../../core/helpers/customerError");

class ApplicationController extends BaseController {
  constructor(repository) {
    super(repository);
  }
  create(req, res) {
    const { body } = req;
    return asyncWrapper(res, async () => {
      const data = await this.repository.create(body);
      if (!data) {
        throw new CustomError("Can not create the application", statusCodes.SERVER_ERROR);
      }
      return responseWrapper({
        res,
        message: serverMessages.CREATE_SUCCESS,
        status: statusCodes.OK,
        data,
      });
    });
  }
}

module.exports.applicationCtrl = new ApplicationController(applicationRepository);
