const BaseRepository = require("../../core/library/BaseRepository");
const { scheduleStatus } = require("../../tools/constants");
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
      .populate("groupId", "groupName");
  }


  // Record Attendance scheduled training
  recordAtt(schedule, data) {
    // Loop through every trainne, determine status and update accordingly
    schedule.trainees.forEach(async (trainee) => {
      const traineeStatus = data.trainees.find(
        (b) => b._id === trainee._id.toString()
      );
      if (traineeStatus && traineeStatus.attended === true) {
        trainee.attended = true;
      } else trainee.attended = false;
    });
    schedule.notes = data.notes;
    // Since Attendance is recored change schedulled attendance to Happened
    schedule.status = scheduleStatus.HAPPENED;
    return schedule.save();
  }
}
module.exports.scheduleRepository = new ScheduleRepository(Schedule);
