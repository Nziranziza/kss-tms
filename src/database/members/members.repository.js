const BaseRepository = require('../../core/library/BaseRepository');
const {Members} = require('./members');

class MembersRepository extends BaseRepository {
    constructor(model) {
        super(model);
    }
    findOne(id) {
        return super.findOne(id).populate('groupId');
    }
}

module.exports.membersRepository = new MembersRepository(
    Members
);
