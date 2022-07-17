const asyncWrapper = require('../../../../core/helpers/asyncWrapper');
const responseWrapper = require('../../../../core/helpers/responseWrapper');
const BaseController = require('../../../../core/library/BaseController');
const {
    farmVisitScheduleRepository
} = require('../../../../database/farm-visit-schedule/farm-visit-schedule.repository');
const { statusCodes } = require('../../../../utils/constants/common');

class FarmVisitScheduleController extends BaseController {
    constructor(repository) {
        super(repository);
        this.visitStats = this.visitStats.bind(this);
    }

    visitStats(req, res){
    const {body} = req;
    return asyncWrapper(res, async () => {
      const summary = await this.repository.visitStats(body);
      if (summary)
        return responseWrapper({
          res,
          status: statusCodes.OK,
          message: "success",
          data: summary,
        });
        
    });
    }
}
module.exports.farmVisitScheduleCtrl = new FarmVisitScheduleController(farmVisitScheduleRepository);
