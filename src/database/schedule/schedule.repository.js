const { ObjectId } = require("mongodb");
const BaseRepository = require("../../core/library/BaseRepository");
const { scheduleStatus } = require("../../tools/constants");
const { Schedule } = require("./schedule");
class ScheduleRepository extends BaseRepository {
  constructor(model) {
    super(model);
  }

  findGroupSchedule(groupId, trainingId) {
    return super
      .cFindOne({ groupId, trainingId })
      .populate("trainingId", "trainingName")
      .populate("groupId", "groupName")
      .populate("location.prov_id", "namek")
      .populate("location.dist_id", "name")
      .populate("location.sect_id", "name")
      .populate("location.cell_id", "name")
      .populate("location.village_id", "name");
  }

  findMemberAttendance(userId, trainingId) {
    return super.customFindAll({ "trainee.userId": userId });
  }

  customFindAll(data) {
    return this.model
      .find(data)
      .populate("trainingId", "trainingName")
      .populate("groupId", "groupName")
      .populate("location.prov_id", "namek")
      .populate("location.dist_id", "name")
      .populate("location.sect_id", "name")
      .populate("location.cell_id", "name")
      .populate("location.village_id", "name");
  }

  findOne(id) {
    return this.model
      .findOne({ _id: id })
      .populate("trainingId", "trainingName")
      .populate("groupId", "groupName")
      .populate("location.prov_id", "namek")
      .populate("location.dist_id", "name")
      .populate("location.sect_id", "name")
      .populate("location.cell_id", "name")
      .populate("location.village_id", "name");
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

  // Get Attendance Summary
  async attendanceSummary(body) {
    const { trainingId, trainerId, scheduleId } = body;

    // Filter statistics by different values
    const filter = {
      $match: {
        ...(trainingId && { trainingId: ObjectId(trainingId) }),
        ...(trainerId && { "trainer.userId": ObjectId(trainerId) }),
        ...(scheduleId && { _id: ObjectId(scheduleId) }),
      },
    };

    // Unwind all trainees so we can compute data
    const unwind = {
      $unwind: "$trainees",
    };

    // Group by each gender and attendance
    const group = {
      $group: {
        _id: {
          absence: "$trainees.attended",
          gender: "$trainees.gender",
        },
        Unique: {
          $addToSet: "$trainees._id",
        },
      },
    };

    // count by unique gender and absence status
    const project = {
      $project: {
        _id: 0,
        absence: "$_id.absence",
        gender: "$_id.gender",
        unique: { $size: "$Unique" },
      },
    };

    // Run query // Query will return 4 objects or less each containing stats for each gender 
    const summary = await this.model.aggregate([
      filter,
      unwind,
      group,
      project,
    ]);

    let femaleAbsent = 0;
    let maleAbsent = 0;
    let femalePresent = 0;
    let malePresent = 0;

    // Compile results
    summary.forEach((data) => {
      if (data.gender == "M") {
        if (data.absence === true) malePresent = malePresent + data.unique;
        else maleAbsent = maleAbsent + data.unique;
      } else {
        if (data.absence === true) femalePresent = femalePresent + data.unique;
        else femaleAbsent = femaleAbsent + data.unique;
      }
    });

    return {
      femaleAbsent,
      femalePresent,
      malePresent,
      maleAbsent,
      totalAbsent: femaleAbsent + maleAbsent,
      totalPresent: malePresent + femalePresent,
      totalInvitees: femaleAbsent + femalePresent + maleAbsent + malePresent,
    };
  }
}
module.exports.scheduleRepository = new ScheduleRepository(Schedule);
