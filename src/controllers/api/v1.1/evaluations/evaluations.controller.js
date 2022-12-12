const asyncWrapper = require("../../../../core/helpers/asyncWrapper");
const BaseController = require("../../../../core/library/BaseController");
const responseWrapper = require("../../../../core/helpers/responseWrapper");
const {
  evaluationRepository,
} = require("../../../../database/evaluation/evaluation.repository");
const { statusCodes } = require("../../../../utils/constants/common");

class EvaluationController extends BaseController {
  constructor(repository) {
    super(repository);
    this.findByApp = this.findByApp.bind(this);
    this.delete = this.delete.bind(this);
    this.evaluationStats = this.evaluationStats.bind(this);
    this.computeBaseline = this.computeBaseline.bind(this);
  }

  findByApp(req, res) {
    const body = { applicationId: req.params.id };
    return asyncWrapper(res, async () => {
      const data = await this.repository.find(body);
      const gaps = await this.repository.calculateScore(data);
      return responseWrapper({
        res,
        status: statusCodes.OK,
        message: "Success",
        data: gaps,
      });
    });
  }

  delete(req, res) {
    return asyncWrapper(res, async () => {
      const data = await this.repository.findById(req.params.id);
      if(!data) {
        return responseWrapper({
          res,
          status: statusCodes.NOT_FOUND,
          message: 'Record not found!'
        });
      }
      await data.softDelete();
      return responseWrapper({
        res,
        status: statusCodes.OK,
        message: "Removed successfully",
        data,
      });
    });
  }

  evaluationStats(req, res){
    const {body} = req;
    return asyncWrapper(res, async () => {
      const summary = await this.repository.evaluationStats(body);
      if (summary)
        return responseWrapper({
          res,
          status: statusCodes.OK,
          message: "success",
          data: summary,
        });
        
    });
  }

  /**
   * 
   * @param {*} req 
   * @param {*} res 
   * @description: This method computes the Baseline Score for the extension service pilot project
   * N.B: This script is only run once at the start of the project
   * The baseline is calculated by computing (N) number of visit scores and aggreting that
   */

  computeBaseline(req, res){
    return asyncWrapper(res, async () => {
      const data = await this.repository.computeBaseline();
      if (data)
        return responseWrapper({
          res,
          status: statusCodes.OK,
          message: "success",
          data,
        });
    });
  }
}

module.exports.evaluationCtrl = new EvaluationController(evaluationRepository);
