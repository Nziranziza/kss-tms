const BaseController = require('../../../../core/library/BaseController');
const {
    farmVisitScheduleRepository
} = require('../../../../database/farm-visit-schedule/farm-visit-schedule.repository');

class FarmVisitScheduleController extends BaseController {
    constructor(repository) {
        super(repository);
    }
}
module.exports.farmVisitScheduleCtrl = new FarmVisitScheduleController(farmVisitScheduleRepository);
