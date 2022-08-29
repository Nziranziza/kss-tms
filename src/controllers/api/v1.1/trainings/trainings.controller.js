const asyncWrapper = require("../../../../core/helpers/asyncWrapper");
const BaseController = require("../../../../core/library/BaseController");
const responseWrapper = require("../../../../core/helpers/responseWrapper");
const {
  trainingRepository,
} = require("../../../../database/training/training.repository");
const { statusCodes } = require("../../../../utils/constants/common");
const { ObjectId } = require('mongodb');

class TrainingController extends BaseController {
  constructor(repository) {
    super(repository);
    this.findByApp = this.findByApp.bind(this);
    this.delete = this.delete.bind(this);
  }

  findByApp(req, res) {
    const body = { applicationId: req.params.id };
    return asyncWrapper(res, async () => {
      const data = await this.repository.customFindAll(body);
      return responseWrapper({
        res,
        status: statusCodes.OK,
        message: "Success",
        data,
      });
    });
  }

  update(req, res){
    const {body, params} = req;
    return asyncWrapper(res, async () => {
      body.adoptionGaps.map((data) => ObjectId(data));
      const toUpdate = {
        _id: ObjectId(params.id),
        ...body
      };
      const data = await this.repository.update(toUpdate);
      return responseWrapper({
        res,
        status: statusCodes.OK,
        message: "Success",
        data,
      });
    });
  }

  findOne(req, res) {
    return asyncWrapper(res, async () => {
      const data = await this.repository.findOne(req.params.id);
      return responseWrapper({
        res,
        status: statusCodes.OK,
        message: "Success",
        data: data[0],
      });
    });
  }

  delete(req, res) {
    return asyncWrapper(res, async () => {
      const data = await this.repository.findSingle(req.params.id);
      const isDeleted = await data.softDelete();
      return responseWrapper({
        res,
        status: statusCodes.OK,
        message: "Removed successfully",
      });
    });
  }
}

module.exports.trainingCtrl = new TrainingController(trainingRepository);
