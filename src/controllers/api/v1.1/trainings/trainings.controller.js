const asyncWrapper = require("../../../../core/helpers/asyncWrapper");
const BaseController = require("../../../../core/library/BaseController");
const responseWrapper = require("../../../../core/helpers/responseWrapper");
const {
  trainingRepository,
} = require("../../../../database/training/training.repository");
const { statusCodes } = require("../../../../utils/constants/common");

class TrainingController extends BaseController {
  constructor(repository) {
    super(repository);
    this.findByApp = this.findByApp.bind(this);
    this.delete = this.delete.bind(this);
  }

  findByApp(req, res) {
    const body = { applicationId: req.params.id };
    return asyncWrapper(res, async () => {
      console.log(body);
      const data = await this.repository.customFindAll(body);
      return responseWrapper({
        res,
        status: statusCodes.OK,
        message: "Success",
        data,
      });
    });
  }

  delete(req, res) {
    return asyncWrapper(res, async () => {
      const data = await this.repository.findOne(req.params.id);
      const isDeleted = await data.softDelete();
      console.log(isDeleted);
      return responseWrapper({
        res,
        status: statusCodes.OK,
        message: "Removed successfully",
        data,
      });
    });
  }
}

module.exports.trainingCtrl = new TrainingController(trainingRepository);
