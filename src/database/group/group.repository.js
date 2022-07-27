const BaseRepository = require("../../core/library/BaseRepository");
const { Group } = require("./group");
const { scheduleRepository } = require("../schedule/schedule.repository");
const { attendanceStatus } = require("../../tools/constants");
const ObjectId = require("mongodb").ObjectID;

class GroupRepository extends BaseRepository {
  constructor(model) {
    super(model);
    this.searchGroup = this.searchGroup.bind(this);
    this.statistics = this.statistics.bind(this);
    this.report = this.report.bind(this);
  }

  find(data) {
    return super.find(data);
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

  statistics(body) {
    const filter = {
      $match: {
        ...(body.location &&
          body.location.prov_id && {
            "location.prov_id": ObjectId(body.location.prov_id),
          }),
        ...(body.location &&
          body.location.dist_id && {
            "location.dist_id": ObjectId(body.location.dist_id),
          }),
        ...(body.location &&
          body.location.sect_id && {
            "location.sect_id": ObjectId(body.location.sect_id),
          }),
        ...(body.location &&
          body.location.cell_id && {
            "location.cell_id": ObjectId(body.location.cell_id),
          }),
        ...(body.location &&
          body.location.village_id && {
            "location.village_id": ObjectId(body.location.village_id),
          }),
        ...(body.reference && { reference: body.reference }),
      },
    };

    const group = {
      $group: {
        _id: null,
        numberOfGroups: { $sum: 1 },
        numberOfMembers: {
          $sum: {
            $cond: {
              if: { $isArray: "$members" },
              then: { $size: "$members" },
              else: 0,
            },
          },
        },
      },
    };
    const members = {
      $project: {
        numberOfMembers: 1,
        numberOfGroups: 1,
        groupName: 1,
        _id: 0,
      },
    };

    return this.model.aggregate([filter, group, members]);
  }

  report(body) {
    const filter = {
      ...(body.location &&
        body.location.prov_id && {
          "location.prov_id": ObjectId(body.location.prov_id),
        }),
      ...(body.location &&
        body.location.dist_id && {
          "location.dist_id": ObjectId(body.location.dist_id),
        }),
      ...(body.location &&
        body.location.sect_id && {
          "location.sect_id": ObjectId(body.location.sect_id),
        }),
      ...(body.location &&
        body.location.cell_id && {
          "location.cell_id": ObjectId(body.location.cell_id),
        }),
      ...(body.location &&
        body.location.village_id && {
          "location.village_id": ObjectId(body.location.village_id),
        }),
      ...(body.reference && { reference: body.reference }),
    };
    return this.model
      .find(filter)
      .populate("location.prov_id", "namek")
      .populate("location.dist_id", "name")
      .populate("location.sect_id", "name")
      .populate("location.cell_id", "name")
      .populate("location.village_id", "name");
  }
}

module.exports.groupRepository = new GroupRepository(Group);
