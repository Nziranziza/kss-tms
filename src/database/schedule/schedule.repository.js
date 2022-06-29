const BaseRepository = require("../../core/library/BaseRepository");
const { Schedule } = require("./schedule");
class ScheduleRepository extends BaseRepository {
  constructor(model) {
    super(model);
  }

  findGroupSchedule(groupId, trainingId) {
    return super.cFindOne({ groupId, trainingId });
  }

  findMemberAttendance(userId, trainingId) {
    return super.customFindAll({ "trainee.userId": userId });
  }

  customFindAll(data) {
    return this.model
      .find(data)
      .populate("trainingId", "trainingName")
      .populate("groupId", "groupName");
  }

  findOne(id) {
    return this.model
      .findOne({ _id: id })
      .populate("trainingId", "trainingName")
      .populate("groupId", "groupName")
      .populate('location.prov_id', 'namek')
      .populate('location.dist_id', 'name')
      .populate('location.sect_id', 'name')
      .populate('location.cell_id', 'name')
      .populate('location.village_id', 'name');
  }
}
module.exports.scheduleRepository = new ScheduleRepository(Schedule);
