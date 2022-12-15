const asyncWrapper = require("core/helpers/asyncWrapper");
const BaseController = require("core/library/BaseController");
const responseWrapper = require("core/helpers/responseWrapper");
const {
  trainingRepository,
} = require("database/training/training.repository");
const { statusCodes, serverMessages } = require("utils/constants/common");

class TrainingController extends BaseController {
  constructor(repository) {
    super(repository);
    this.findByApp = this.findByApp.bind(this);
    this.delete = this.delete.bind(this);
  }

  findByApp(req, res) {
    const body = { applicationId: req.params.id };
    return asyncWrapper(res, async () => {
      const data = await this.repository.find(body);
      return responseWrapper({
        res,
        status: statusCodes.OK,
        message: serverMessages.SUCCESS,
        data,
      });
    });
  }

  update(req, res){
    const { body, params } = req;
    return asyncWrapper(res, async () => {
      const data = await this.repository.update(params.id, body);
      return responseWrapper({
        res,
        status: statusCodes.OK,
        message: serverMessages.SUCCESS,
        data,
      });
    });
  }

  findOne(req, res) {
    return asyncWrapper(res, async () => {
      const data = await this.repository.findById(req.params.id);
      return responseWrapper({
        res,
        status: statusCodes.OK,
        message: serverMessages.SUCCESS,
        data: data[0],
      });
    });
  }

  delete(req, res) {
    return asyncWrapper(res, async () => {
      const data = await this.repository.findSingle(req.params.id);
      await data.softDelete();
      return responseWrapper({
        res,
        status: statusCodes.OK,
        message: serverMessages.DELETE_SUCCESS,
      });
    });
  }
}

module.exports.trainingCtrl = new TrainingController(trainingRepository);
