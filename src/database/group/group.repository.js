const BaseRepository = require("../../core/library/BaseRepository");
const {Group} = require("./group");
const {scheduleRepository} = require("../schedule/schedule.repository");
const {attendanceStatus, scheduleStatus} = require("../../tools/constants");
const ObjectId = require("mongodb").ObjectID;

class GroupRepository extends BaseRepository {
    constructor(model) {
        super(model);
        this.searchGroup = this.searchGroup.bind(this);
        this.statistics = this.statistics.bind(this);
        this.report = this.report.bind(this);
    }

    async find(data) {
        const groups = await super
            .find(data)
            .sort({createdAt: -1})
            .populate("location.prov_id", "namek")
            .populate("location.dist_id", "name")
            .populate("location.sect_id", "name")
            .populate("location.cell_id", "name")
            .populate("location.village_id", "name");

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

    findAll() {
        return super
            .findAll()
            .populate("location.prov_id", "namek")
            .populate("location.dist_id", "name")
            .populate("location.sect_id", "name")
            .populate("location.cell_id", "name")
            .populate("location.village_id", "name");
    }

    findOne(data) {
        return super
            .findOne(data)
            .populate("location.prov_id", "namek")
            .populate("location.dist_id", "name")
            .populate("location.sect_id", "name")
            .populate("location.cell_id", "name")
            .populate("location.village_id", "name");
    }

    searchGroup(name) {
        const regex = new RegExp(["^", name, "$"].join(""), "i");
        return this.model
            .findOne({
                groupName: regex,
                isDeleted: false,
            })
            .populate("location.prov_id", "namek")
            .populate("location.dist_id", "name")
            .populate("location.sect_id", "name")
            .populate("location.cell_id", "name")
            .populate("location.village_id", "name");
    }

    async membersAttendance(group, trainingId) {
        // Find if group has already been invited for a training

        const members = group.members;

        // If group has a schedule then check past schedules and check whether members have attended at least once
        return Promise.all(
            members.map(async (member) => {
                const {userId, firstName, lastName, phoneNumber} = member;

                const traineeSchedules = await scheduleRepository.findMemberAttendance(
                    userId,
                    trainingId
                );

                let attendance = attendanceStatus.NOT_INVITED;
                for (const schedule of traineeSchedules) {
                    schedule.trainees.forEach((trainee) => {
                        if (trainee.userId === userId.toString() && trainee.attended && schedule.status === scheduleStatus.HAPPENED ) {
                            attendance = attendanceStatus.ATTENDED;
                        }else if(trainee.userId === userId.toString() && !trainee.attended && schedule.status === scheduleStatus.HAPPENED ){
                            attendance = attendanceStatus.ABSENT
                        }else if(schedule.status === scheduleStatus.PENDING) attendance = attendanceStatus.PENDING
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
        )
    }


    getSingleMember(grpId, mbrId) {
        return this.model.findOne({_id: grpId, "members.userId": mbrId});
    }

    updateMemberPhone(id, body) {
        return this.model.update(
            {_id: id, "members.userId": body.userId},
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
                ...(body.reference && {reference: body.reference}),
                ...(body.id && {_id: ObjectId(body.id)}),
                ...{isDeleted: false},
            },
        };

        const group = {
            $group: {
                _id: null,
                numberOfGroups: {$sum: 1},
                numberOfMembers: {
                    $sum: {
                        $cond: {
                            if: {$isArray: "$members"},
                            then: {$size: "$members"},
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
            ...(body.reference && {reference: body.reference}),
            ...(body.id && {_id: ObjectId(body.id)}),
        };
        return this.model
            .find(filter)
            .lean()
            .populate("location.prov_id", "namek")
            .populate("location.dist_id", "name")
            .populate("location.sect_id", "name")
            .populate("location.cell_id", "name")
            .populate("location.village_id", "name");
    }
}

module.exports.groupRepository = new GroupRepository(Group);
