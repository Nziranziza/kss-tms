const BaseRepository = require('../../core/library/BaseRepository');
const { Application } = require('./application');
class ApplicationRepository extends BaseRepository {
    constructor(model) {
        super(model);
    }
}
module.exports.applicationRepository = new ApplicationRepository(
    Application
);
