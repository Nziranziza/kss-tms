const BaseRepository = require('../../core/library/BaseRepository');
const { Group } = require('./group');
class GroupRepository extends BaseRepository {
    constructor(model) {
        super(model);
    }
}
module.exports.groupRepository = new GroupRepository(
    Group
);
