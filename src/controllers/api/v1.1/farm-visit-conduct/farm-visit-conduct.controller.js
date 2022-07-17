const BaseController = require('../../../../core/library/BaseController');
const {
    farmVisitConductRepository
} = require('../../../../database/farm-visit-conduct/farm-visit-conduct.repository');

class FarmVisitConductController extends BaseController {
    constructor(repository) {
        super(repository);
    }
}
module.exports.farmVisitConductCtrl = new FarmVisitConductController(farmVisitConductRepository);
