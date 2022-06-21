const BaseRepository = require("../../core/library/BaseRepository");
const { Schedule } = require("./schedule");
class ScheduleRepository extends BaseRepository {
  constructor(model) {
    super(model)
  }
}
module.exports.scheduleRepository = new ScheduleRepository(Schedule);
