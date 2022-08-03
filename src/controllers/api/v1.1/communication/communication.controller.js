const asyncWrapper = require("../../../../core/helpers/asyncWrapper");
const BaseController = require("../../../../core/library/BaseController");
const responseWrapper = require("../../../../core/helpers/responseWrapper");
const { statusCodes } = require("../../../../utils/constants/common");
const { commRepo } = require('../../../../database/communication/communication.repository');

class CommController extends BaseController {
  constructor(repository) {
    super(repository);
  }

  callback(req, res) {
    return asyncWrapper(res, async () => {
      return responseWrapper({
        res,
        status: statusCodes.OK,
        message: "Success",
        data: 'random data',
      });
    });
  }
}

module.exports.commCtrl = new CommController(commRepo);
