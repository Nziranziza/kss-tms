const BaseRepository = require('../../core/library/BaseRepository');
const { Group } = require('./group');
const {
    provinces,
    districts,
    sectors,
    cells,
    villages
} = require('../../database/location/location');
class GroupRepository extends BaseRepository {
    constructor(model) {
        super(model);
    }
    find(data) {
        return super.find(data)
            .populate('location.prov_id', 'namek')
            .populate('location.dist_id', 'name')
            .populate('location.sect_id', 'name')
            .populate('location.cell_id', 'name')
            .populate('location.village_id', 'name')
    }
    findAll() {
        return super.findAll()
            .populate('location.prov_id', 'namek')
            .populate('location.dist_id', 'name')
            .populate('location.sect_id', 'name')
            .populate('location.cell_id', 'name')
            .populate('location.village_id', 'name')
    }
}
module.exports.groupRepository = new GroupRepository(
    Group
);
