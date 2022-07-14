const BaseRepository = require("../../core/library/BaseRepository");
const {FarmVisitSchedule} = require("../farm-visit-schedule/farm-visit-schedule");

class FarmVisitScheduleRepository extends BaseRepository {
    constructor(model) {
        super(model);
    }
    find(data) {
        return super.find(data)
            .populate('farms.location.prov_id', 'namek')
            .populate('farms.location.dist_id', 'name')
            .populate('farms.location.sect_id', 'name')
            .populate('farms.location.cell_id', 'name')
            .populate('farms.location.village_id', 'name')
            .populate('gaps')
            .populate('groupId');
    }
    findAll() {
        return super.findAll()
            .populate('farms.location.prov_id', 'namek')
            .populate('farms.location.dist_id', 'name')
            .populate('farms.location.sect_id', 'name')
            .populate('farms.location.cell_id', 'name')
            .populate('gaps')
            .populate('groupId');
    }
    findOne(id) {
        return super.findOne(id)
            .populate('farms.location.prov_id', 'namek')
            .populate('farms.location.dist_id', 'name')
            .populate('farms.location.sect_id', 'name')
            .populate('farms.location.cell_id', 'name')
            .populate('farms.location.village_id', 'name')
            .populate('gaps')
            .populate('groupId');

    }
}

module.exports.farmVisitScheduleRepository = new FarmVisitScheduleRepository(
    FarmVisitSchedule
);