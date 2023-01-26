const BaseController = require('core/library/BaseController');
const {
    farmVisitConductRepository
} = require('database/farm-visit-conduct/farm-visit-conduct.repository');
const asyncWrapper = require("core/helpers/asyncWrapper");
const responseWrapper = require("core/helpers/responseWrapper");
const {statusCodes} = require("utils/constants/common");

class FarmVisitConductController extends BaseController {
    constructor(repository) {
        super(repository);
        this.report = this.report.bind(this);
        this.statistics = this.statistics.bind(this);
    }
    statistics(req, res) {
        return asyncWrapper(res, async () => {
            const {body} = req;
            const visits = await this.repository.statistics(body);
            return responseWrapper({
                res,
                status: statusCodes.OK,
                message: "Success",
                data: visits,
            });

        });
    }

    report(req, res) {
        return asyncWrapper(res, async () => {
            const {body} = req;
            const visits = await this.repository.report(body);
            return responseWrapper({
                res,
                status: statusCodes.OK,
                message: "Success",
                data: visits,
            });
        });
    }

}
module.exports.farmVisitConductCtrl = new FarmVisitConductController(farmVisitConductRepository);
