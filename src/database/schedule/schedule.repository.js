const {ObjectId} = require("mongodb");
const BaseRepository = require("../../core/library/BaseRepository");
const {scheduleStatus} = require("../../tools/constants");
const {Schedule} = require("./schedule");

class ScheduleRepository extends BaseRepository {

    constructor(model) {
        super(model);
    }

    findGroupSchedule(groupId, trainingId) {
        return super
            .cFindOne({groupId, trainingId})
            .populate("trainingId", "trainingName")
            .populate("groupId", "groupName")
            .populate("location.prov_id", "namek")
            .populate("location.dist_id", "name")
            .populate("location.sect_id", "name")
            .populate("location.cell_id", "name")
            .populate("location.village_id", "name");
    }

    findMemberAttendance(userId, trainingId) {
        return super.customFindAll({"trainee.userId": userId});
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
            .findOne({_id: id})
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

    // edit Attendance scheduled training
    editAtt(schedule, data) {
        schedule.trainees.forEach(async (trainee) => {
            const traineeStatus = data.trainees.find(
                (b) => b._id === trainee._id.toString()
            );
            if (traineeStatus && traineeStatus.attended === true) {
                trainee.attended = true;
            } else trainee.attended = false;
        });
        schedule.notes = data.notes;
        schedule.lastUpdatedBy = data.lastUpdatedBy;
        return schedule.save();
    }

    // Get Attendance Summary
    async attendanceSummary(body) {
        const {
            trainingId,
            trainerId,
            scheduleId,
            referenceId,
            location,
            date,
            groupId,
        } = body;

        let locSearchBy = "";
        if (location) locSearchBy = `location.${location.searchBy}`;

        let startDate = "";
        let endDate = "";
        if (date) {
            startDate = moment(date.from).startOf("day").toDate();
            endDate = moment(date.to).endOf("day").toDate();
        }


    }

    statistics(body) {
        const preFilter = [
            {
                $match: {
                    ...(body.groupId && {
                        "groupId": ObjectId(body.groupId),
                    })
                }
            },
            {
                $lookup: {
                    from: "groups",
                    localField: "groupId",
                    foreignField: "_id",
                    as: "groupId",
                }
            },
            {
                $addFields: {
                    'groupId': {
                        $arrayElemAt: ['$groupId', 0]
                    }
                }
            },
            {
                $unwind: "$trainees"
            }
        ];

        const filter = {
            $match: {
                ...(body.location && body.location.prov_id && {'groupId.location.prov_id': ObjectId(body.location.prov_id)}),
                ...(body.location && body.location.dist_id && {'groupId.location.dist_id': ObjectId(body.location.dist_id)}),
                ...(body.location && body.location.sect_id && {'groupId.location.sect_id': ObjectId(body.location.sect_id)}),
                ...(body.location && body.location.cell_id && {'groupId.location.cell_id': ObjectId(body.location.cell_id)}),
                ...(body.location && body.location.village_id && {'groupId.location.village_id': ObjectId(body.location.village_id)}),
                ...(body.reference && {'reference': body.reference}),
                ...(body.trainingId && {'trainingId': body.trainingId}),
                ...(body.trainerId && {'trainer.userId': body.trainerId}),
                ...({'isDeleted': false})
            }
        };

        const group = {
            $group: {
                _id: null,
                numberOfTrainees: {$sum: 1},
                numberOfAttendedTrainees: {
                    $sum: {
                        $cond: {
                            if: "$trainees.attended",
                            then: 1,
                            else: 0,
                        },
                    },
                },
            },
        };
        const trainees = {
            $project: {
                numberOfTrainees: 1,
                numberOfAttendedTrainees: 1,
                _id: 0,
            },
        };

        return this.model.aggregate(preFilter.concat([filter, group, trainees]));
    }

    report(body) {
        const preFilter =
            [
                {
                    $match: {
                        ...
                            (body.groupId && {
                                "groupId": ObjectId(body.groupId),
                            })
                    }
                },
                {
                    $lookup: {
                        from: "groups",
                        localField: "groupId",
                        foreignField: "_id",
                        as: "groupId",
                    }
                },
                {
                    $addFields: {
                        'groupId': {
                            $arrayElemAt: ['$groupId', 0]
                        }
                    }
                },
                {
                    $lookup: {
                        from: 'provinces',
                        localField: 'location.prov_id',
                        foreignField: '_id',
                        as: 'location.prov_id'
                    }
                },
                {
                    $addFields: {
                        'location.prov_id': {
                            $arrayElemAt: ['$location.prov_id', 0]
                        }
                    }
                },
                {
                    $lookup: {
                        from: 'districts',
                        localField: 'location.dist_id',
                        foreignField: '_id',
                        as: 'location.dist_id'
                    }
                },
                {
                    $addFields: {
                        'location.dist_id': {
                            $arrayElemAt: ['$location.dist_id', 0]
                        }
                    }
                },
                {
                    $lookup: {
                        from: 'sectors',
                        localField: 'location.sect_id',
                        foreignField: '_id',
                        as: 'location.sect_id'
                    }
                },
                {
                    $addFields: {
                        'location.sect_id': {
                            $arrayElemAt: ['$location.sect_id', 0]
                        }
                    }
                },
                {
                    $lookup: {
                        from: 'cells',
                        localField: 'location.cell_id',
                        foreignField: '_id',
                        as: 'location.cell_id'
                    }
                },
                {
                    $addFields: {
                        'location.cell_id': {
                            $arrayElemAt: ['$location.cell_id', 0]
                        }
                    }
                },
                {
                    $lookup: {
                        from: 'villages',
                        localField: 'location.village_id',
                        foreignField: '_id',
                        as: 'location.village_id'
                    }
                },
                {
                    $addFields: {
                        'location.village_id': {
                            $arrayElemAt: ['$location.village_id', 0]
                        }
                    }
                },
                {
                    $unwind: "$trainees"
                },
            ];
        const filter =
            {
                $match: {
                    ...(body.location && body.location.prov_id && {'groupId.location.prov_id': ObjectId(body.location.prov_id)}),
                    ...(body.location && body.location.dist_id && {'groupId.location.dist_id': ObjectId(body.location.dist_id)}),
                    ...(body.location && body.location.sect_id && {'groupId.location.sect_id': ObjectId(body.location.sect_id)}),
                    ...(body.location && body.location.cell_id && {'groupId.location.cell_id': ObjectId(body.location.cell_id)}),
                    ...(body.location && body.location.village_id && {'groupId.location.village_id': ObjectId(body.location.village_id)}),
                    ...(body.reference && {'reference': body.reference}),
                    ...(body.trainingId && {'trainingId': body.trainingId}),
                    ...(body.trainerId && {'trainer.userId': body.trainerId}),
                    ...({'isDeleted': false})
                }
            };
        return this.model.aggregate(preFilter.concat([filter]));
    }
}

module.exports.scheduleRepository = new ScheduleRepository(Schedule);
