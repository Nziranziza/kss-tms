const BaseRepository = require("../../core/library/BaseRepository");
const { Group } = require("./group");
const { scheduleRepository } = require("../schedule/schedule.repository");
const { attendanceStatus } = require("../../tools/constants");
class GroupRepository extends BaseRepository {
  constructor(model) {
    super(model);
    this.searchGroup = this.searchGroup.bind(this);
  }
  find(data) {
    return super
      .find(data)
      .populate("location.prov_id", "namek")
      .populate("location.dist_id", "name")
      .populate("location.sect_id", "name")
      .populate("location.cell_id", "name")
      .populate("location.village_id", "name");
  }
  findAll() {
    return super
      .findAll()
      .populate("location.prov_id", "namek")
      .populate("location.dist_id", "name")
      .populate("location.sect_id", "name")
      .populate("location.cell_id", "name")
      .populate("location.village_id", "name");
  }
  searchGroup(name) {
    return this.model
      .findOne({
        groupName: { $regex: name, $options: "i" },
      })
      .populate("location.prov_id", "namek")
      .populate("location.dist_id", "name")
      .populate("location.sect_id", "name")
      .populate("location.cell_id", "name")
      .populate("location.village_id", "name");
  }

  async membersAttendance(group, trainingId) {
    // Find if group has already been invited for a training
    const groupSchedule = await scheduleRepository.findGroupSchedule(
      group._id,
      trainingId
    );

    const members = group.members;

    // If group has no associated scheduled Training then by default all members have not been invited yet
    if (!groupSchedule) {
      return members.map((member) => {
        const { userId, firstName, lastName, phoneNumber } = member;
        return {
          userId,
          firstName,
          lastName,
          phoneNumber,
          groupId: group._id,
          attendance: attendanceStatus.NOT_INVITED,
        };
      });
    }

    // If group has a schedule then check past schedules and check whether members have attended at least once
    return Promise.all(
      members.map(async (member) => {
        const { userId, firstName, lastName, phoneNumber } = member;

        const traineeSchedules = await scheduleRepository.findMemberAttendance(
          userId,
          trainingId
        );

        let attendance = attendanceStatus.ABSENT;
        for (const schedule of traineeSchedules) {
          schedule.trainees.forEach((trainee) => {
            if (trainee.userId === userId.toString() && trainee.attended) {
              attendance = attendanceStatus.ATTENDED;
            }
          });
        }

        return {
          userId,
          firstName,
          lastName,
          phoneNumber,
          groupId: group._id,
          attendance: attendance,
        };
      })
    );
  }

  getSingleMember(grpId, mbrId) {
    return this.model.findOne({ _id: grpId, "members.userId": mbrId });
  }

  updateMemberPhone(id, body) {
    return this.model.update(
      { _id: id, "members.userId": body.userId },
      {
        $set: {
          "members.$.phoneNumber": body.phoneNumber,
        },
      }
    );
  }
}
module.exports.groupRepository = new GroupRepository(Group);
