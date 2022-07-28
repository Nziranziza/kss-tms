const {ObjectId} = require("mongodb");
const BaseRepository = require("../../core/library/BaseRepository");
const {
    FarmVisitSchedule,
} = require("../farm-visit-schedule/farm-visit-schedule");

class FarmVisitScheduleRepository extends BaseRepository {
    constructor(model) {
        super(model);
    }

    find(data) {
        return super
            .find(data)
            .populate("farms.location.prov_id", "namek")
            .populate("farms.location.dist_id", "name")
            .populate("farms.location.sect_id", "name")
            .populate("farms.location.cell_id", "name")
            .populate("farms.location.village_id", "name")
            .populate("gaps")
            .populate("groupId", "groupName");
    }

    findAll() {
        return super
            .findAll()
            .populate("farms.location.prov_id", "namek")
            .populate("farms.location.dist_id", "name")
            .populate("farms.location.sect_id", "name")
            .populate("farms.location.cell_id", "name")
            .populate("gaps");
    }

    findOne(id) {
        return super
            .findOne(id)
            .populate("farms.location.prov_id", "namek")
            .populate("farms.location.dist_id", "name")
            .populate("farms.location.sect_id", "name")
            .populate("farms.location.cell_id", "name")
            .populate("farms.location.village_id", "name")
            .populate("gaps")
            .populate("groupId", "groupName");
    }

    async visitStats(body) {
        // const { trainingId, trainerId, scheduleId } = body;

        // Filter statistics by different values
        // const filter = {
        //   $match: {
        //   },
        // };

        // Unwind all trainees so we can compute data
        const unwind = {
            $unwind: "$farms",
        };

        // Group farms by owner sex
        const group = {
            $group: {
                _id: {
                    gender: "$farms.owner.sex",
                },
                Unique: {
                    $addToSet: "$farms._id",
                },
            },
        };

        // count by unique gender and absence status
        const project = {
            $project: {
                _id: 0,
                gender: "$_id.gender",
                unique: {$size: "$Unique"},
            },
        };

        // Run query // Query will return 2 objects or less each containing stats for each gender
        const summary = await this.model.aggregate([unwind, group, project]);

        let maleFarmVisits = 0;
        let femaleFarmVisits = 0;

        // Compile results
        summary.forEach((data) => {
            if (data.gender.toLowerCase() == "m")
                maleFarmVisits = maleFarmVisits + data.unique;
            else femaleFarmVisits = femaleFarmVisits + data.unique;
        });

        return {
            maleFarmVisits,
            femaleFarmVisits,
            totolVisits: maleFarmVisits + femaleFarmVisits,
        };
    }

    farmerVisits(id) {
        return this.model.aggregate([
            {
                $match: {
                    "farms.owner.userId": ObjectId(id),
                },
            },
            {
                $unwind: "$farms",
            },
            {
                $match: {
                    "farms.owner.userId": ObjectId(id),
                },
            },
        ]);
    }

    farmVisits(id) {
        return this.model.aggregate([
            {
                $match: {
                    "farms.farmId": ObjectId(id),
                },
            },
            {
                $unwind: "$farms",
            },
            {
                $match: {
                    "farms.farmId": ObjectId(id),
                },
            },
        ]);
    }

    farmsVisits(body) {
        const filter = {
            $match: {
                ...(body.reference && {
                    "reference": body.reference,
                })
            }
        }
        return this.model.aggregate([
            filter,
            {
                $unwind: "$farms",
            }
        ]);
    }
}

module.exports.farmVisitScheduleRepository = new FarmVisitScheduleRepository(
    FarmVisitSchedule
);
