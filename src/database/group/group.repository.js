const BaseRepository = require("core/library/BaseRepository");
const { Group } = require("./group");
const { scheduleRepository } = require("database/schedule/schedule.repository");
const { attendanceStatus, scheduleStatus } = require("tools/constants");
const populate = require('./group.populate')
const { omitBy, isNil } = require('lodash');
const toObjectId = require("utils/toObjectId");
const removeNilProps = require("utils/removeNilProps");


class GroupRepository extends BaseRepository {
  constructor(model) {
    super(model);
    this.searchGroup = this.searchGroup.bind(this);
    this.statistics = this.statistics.bind(this);
    this.report = this.report.bind(this);
  }

  async find(data) {
    const {
      location: { dist_id, sect_id, cell_id, village_id, prov_id } = {},
      ...filters
    } = data;
    const query = removeNilProps({
        ...filters,
        "location.dist_id": dist_id,
        "location.sect_id": sect_id,
        "location.village_id": village_id,
        "location.cell_id": cell_id,
        "location.prov_id": prov_id,
      }
    );
    const groups = await super
      .find(query, { groupName: 1 })
      .populate(populate);

    // Add attendance rate on every group
    return Promise.all(
      groups.map(async (group) => {
        const {
          _id,
          status,
          groupName,
          leaderNames,
          leaderPhoneNumber,
          description,
          location,
          meetingSchedule,
          reference,
          members,
          isDeleted,
          deletedAt,
          updatedAt,
          createdAt,
        } = group;
        return {
          _id,
          status,
          groupName,
          leaderNames,
          leaderPhoneNumber,
          description,
          location,
          meetingSchedule,
          reference,
          members,
          isDeleted,
          deletedAt,
          updatedAt,
          createdAt,
          attendanceRate: await scheduleRepository.groupAttendance({
            ...data,
            groupId: _id.toString(),
          }),
        };
      })
    );
  }

  findOne(data) {
    return super.findOne(data).populate(populate);
  }

  findById(id) {
    return super.findById(id).populate(populate);
  }

  searchGroup(name) {
    const regex = new RegExp(["^", name, "$"].join(""), "i");
    return this.findOne({
      groupName: regex,
      isDeleted: false,
    });
  }

  async membersAttendance(group, trainingId) {
    // Find if group has already been invited for a training

    const members = group.members;

    // If group has a schedule then check past schedules and check whether members have attended at least once
    return Promise.all(
      members.map(async (member) => {
        const { userId, firstName, lastName, phoneNumber } = member;

        const traineeSchedules = await scheduleRepository.findMemberAttendance(
          userId,
          trainingId
        );

        let attendance = attendanceStatus.NOT_INVITED;
        for (const schedule of traineeSchedules) {
          schedule.trainees.forEach((trainee) => {
            if (
              trainee.userId === userId.toString() &&
              trainee.attended &&
              schedule.status === scheduleStatus.HAPPENED
            ) {
              attendance = attendanceStatus.ATTENDED;
            } else if (
              trainee.userId === userId.toString() &&
              !trainee.attended &&
              schedule.status === scheduleStatus.HAPPENED
            ) {
              attendance = attendanceStatus.ABSENT;
            } else if (schedule.status === scheduleStatus.PENDING)
              attendance = attendanceStatus.PENDING;
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

  getSingleMember(memberId, groupId) {
    let filters = {
      "members.userId": memberId,
    };
    if (groupId) {
      filters = {
        ...filters,
        _id: groupId,
      };
    }
    return this.model.findOne(filters);
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
    const filters = removeNilProps({
        "location.prov_id": toObjectId(body.location.prov_id),
        "location.dist_id": toObjectId(body.location.dist_id),
        "location.sect_id": toObjectId(body.location.sect_id),
        "location.cell_id": toObjectId(body.location.cell_id),
        "location.village_id": toObjectId(body.location.village_id),
        reference: body.reference,
        _id: toObjectId(body.id),
        isDeleted: false,
      }
    );

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
    return this.model.aggregate([filters, group, members]);
  }

  report(body) {
    const filter = removeNilProps({
      "location.prov_id": toObjectId(body.location.prov_id),
      "location.dist_id": toObjectId(body.location.dist_id),
      "location.sect_id": toObjectId(body.location.sect_id),
      "location.cell_id": toObjectId(body.location.cell_id),
      "location.village_id": toObjectId(body.location.village_id),
      reference: body.reference,
      _id: toObjectId(body.id),
    });
    return this.model.find(filter).lean().populate(populate);
  }
}

module.exports.groupRepository = new GroupRepository(Group);
