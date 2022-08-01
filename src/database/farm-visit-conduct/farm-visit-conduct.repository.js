const BaseRepository = require("../../core/library/BaseRepository");
const {FarmVisitConduct} = require("../farm-visit-conduct/farm-visit-conduct");
const {
    FarmVisitSchedule,
} = require("../farm-visit-schedule/farm-visit-schedule");


class FarmVisitConductRepository extends BaseRepository {
    constructor(model) {
        super(model);
    }

    async create(entity) {
        const conduct = await this.model.create(entity);
        await FarmVisitSchedule.findOneAndUpdate({'farms.farmId': conduct.farm.farmId,
            '_id': conduct.scheduleId}, {'$push': {
                'farms.$.evaluatedGaps': conduct.gap
            }
        });
        return conduct;
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