const BaseRepository = require("../../core/library/BaseRepository");
const {FarmVisitConduct} = require("../farm-visit-conduct/farm-visit-conduct");
const {
    FarmVisitSchedule,
} = require("../farm-visit-schedule/farm-visit-schedule");
const {ObjectId} = require("mongodb");


class FarmVisitConductRepository extends BaseRepository {
    constructor(model) {
        super(model);
    }

    async create(entity) {
        const conduct = await this.model.create(entity);
        await FarmVisitSchedule.findOneAndUpdate({'farms.farmId': conduct.farm.farmId,
            '_id': conduct.scheduleId}, {'$push': {
                'farms.$.evaluatedGaps': conduct.gap
            }
        });
        return conduct;
    }

    find(data) {
        return super.find(data)
            .populate('farm.location.prov_id', 'namek')
            .populate('farm.location.dist_id', 'name')
            .populate('farm.location.sect_id', 'name')
            .populate('farm.location.cell_id', 'name')
            .populate('farm.location.village_id', 'name')
            .populate('gap')
            .populate('groupId')
            .populate('scheduleId');
    }
    findAll() {
        return super.findAll()
            .populate('farm.location.prov_id', 'namek')
            .populate('farm.location.dist_id', 'name')
            .populate('farm.location.sect_id', 'name')
            .populate('farm.location.cell_id', 'name')
            .populate('farm.location.village_id', 'name')
            .populate('gap')
            .populate('groupId')
            .populate('scheduleId');
    }
    findOne(id) {
        return super.findOne(id)
            .populate('farm.location.prov_id', 'namek')
            .populate('farm.location.dist_id', 'name')
            .populate('farm.location.sect_id', 'name')
            .populate('farm.location.cell_id', 'name')
            .populate('farm.location.village_id', 'name')
            .populate('gap')
            .populate('groupId')
            .populate('scheduleId');

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
        const preFilter = [
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
        return this.model.aggregate(preFilter.concat([filter]));
    }
}

module.exports.farmVisitConductRepository = new FarmVisitConductRepository(
    FarmVisitConduct
);