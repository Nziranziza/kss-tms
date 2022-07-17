const BaseRepository = require("../../core/library/BaseRepository");
const {FarmVisitConduct} = require("../farm-visit-conduct/farm-visit-conduct");

class FarmVisitConductRepository extends BaseRepository {
    constructor(model) {
        super(model);
    }
    find(data) {
        return super.find(data)
            .populate('farm.location.prov_id', 'namek')
            .populate('farm.location.dist_id', 'name')
            .populate('farm.location.sect_id', 'name')
            .populate('farm.location.cell_id', 'name')
            .populate('farm.location.village_id', 'name')
            .populate('gap')
            .populate('groupId')
            .populate('scheduleId');
    }
    findAll() {
        return super.findAll()
            .populate('farm.location.prov_id', 'namek')
            .populate('farm.location.dist_id', 'name')
            .populate('farm.location.sect_id', 'name')
            .populate('farm.location.cell_id', 'name')
            .populate('farm.location.village_id', 'name')
            .populate('gap')
            .populate('groupId')
            .populate('scheduleId');
    }
    findOne(id) {
        return super.findOne(id)
            .populate('farm.location.prov_id', 'namek')
            .populate('farm.location.dist_id', 'name')
            .populate('farm.location.sect_id', 'name')
            .populate('farm.location.cell_id', 'name')
            .populate('farm.location.village_id', 'name')
            .populate('gap')
            .populate('groupId')
            .populate('scheduleId');

    }
}

module.exports.farmVisitConductRepository = new FarmVisitConductRepository(
    FarmVisitConduct
);