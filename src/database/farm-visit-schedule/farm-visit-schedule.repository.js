const BaseRepository = require("../../core/library/BaseRepository");
const {FarmVisitSchedule} = require("../farm-visit-schedule/farm-visit-schedule");

class FarmVisitScheduleRepository extends BaseRepository {
    constructor(model) {
        super(model);
    }
}

module.exports.farmVisitScheduleRepository = new FarmVisitScheduleRepository(
    FarmVisitSchedule
);