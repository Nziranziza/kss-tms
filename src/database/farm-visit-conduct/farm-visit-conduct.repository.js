const BaseRepository = require("../../core/library/BaseRepository");
const {
  FarmVisitConduct,
} = require("../farm-visit-conduct/farm-visit-conduct");
const {
  FarmVisitSchedule,
} = require("../farm-visit-schedule/farm-visit-schedule");
const { ObjectId } = require("mongodb");
const { Evaluation } = require("../evaluation/evaluation");
const moment = require("moment/moment");

class FarmVisitConductRepository extends BaseRepository {
  constructor(model) {
    super(model);
  }

  async create(entity) {
    let score = 0;
    entity.evaluation.forEach((evaluation) => {
      evaluation.questions.forEach((question) => {
        score = score + question.score;
      });
    });
    const gap = await Evaluation.findById(entity.gap);
    entity.overall_score = (gap.gap_weight / 100) * score;
    entity.overall_weight = gap.gap_weight;
    const conduct = await this.model.create(entity);
    await FarmVisitSchedule.findOneAndUpdate(
      {
        "farms.farmId": conduct.farm.farmId,
        _id: conduct.scheduleId,
      },
      {
        $push: {
          "farms.$.evaluatedGaps": {
            gap_id: conduct.gap,
            overall_weight: conduct.overall_weight,
            overall_score: conduct.overall_score,
          },
        },
      }
    );
    return conduct;
  }
  find(data) {
    return super
      .find(data)
      .populate("farm.location.prov_id", "namek")
      .populate("farm.location.dist_id", "name")
      .populate("farm.location.sect_id", "name")
      .populate("farm.location.cell_id", "name")
      .populate("farm.location.village_id", "name")
      .populate("gap")
      .populate("groupId")
      .populate("scheduleId");
  }

  findAll() {
    return super
      .findAll()
      .populate("farm.location.prov_id", "namek")
      .populate("farm.location.dist_id", "name")
      .populate("farm.location.sect_id", "name")
      .populate("farm.location.cell_id", "name")
      .populate("farm.location.village_id", "name")
      .populate("gap")
      .populate("groupId")
      .populate("scheduleId");
  }

  findOne(id) {
    return super
      .findOne(id)
      .populate("farm.location.prov_id", "namek")
      .populate("farm.location.dist_id", "name")
      .populate("farm.location.sect_id", "name")
      .populate("farm.location.cell_id", "name")
      .populate("farm.location.village_id", "name")
      .populate("gap")
      .populate("groupId")
      .populate("scheduleId");
  }

  statistics(body) {
    const filter = {
      $match: {
        ...(body.location &&
          body.location.prov_id && {
            "farm.location.prov_id": ObjectId(body.location.prov_id),
          }),
        ...(body.location &&
          body.location.dist_id && {
            "farm.location.dist_id": ObjectId(body.location.dist_id),
          }),
        ...(body.location &&
          body.location.sect_id && {
            "farm.location.sect_id": ObjectId(body.location.sect_id),
          }),
        ...(body.location &&
          body.location.cell_id && {
            "farm.location.cell_id": ObjectId(body.location.cell_id),
          }),
        ...(body.location &&
          body.location.village_id && {
            "farm.location.village_id": ObjectId(body.location.village_id),
          }),
        ...(body.reference && { reference: body.reference }),
        ...(body.scheduleId && { scheduleId: body.scheduleId }),
        ...(body.groupId && { groupId: body.groupId }),
        ...(body.date && { createdAt: { $gte:moment(body.date.from)
                  .startOf('day')
                  .toDate() , $lt:  moment(body.date.to)
                  .endOf('day')
                  .toDate() }}),
        ...{ isDeleted: false },
      },
    };
    const group = {
      $group: {
        _id: null,
        numberOfFarmVisits: { $sum: 1 },
      },
    };
    const visits = {
      $project: {
        numberOfFarmVisits: 1,
        _id: 0,
      },
    };
    return this.model.aggregate([filter, group, visits]);
  }

  report(body) {
    const lookup = [
      {
        $lookup: {
          from: "groups",
          localField: "groupId",
          foreignField: "_id",
          as: "groupId",
        },
      },
      {
        $addFields: {
          groupId: {
            $arrayElemAt: ["$groupId", 0],
          },
        },
      },
      {
        $lookup: {
          from: "evaluations",
          localField: "gap",
          foreignField: "_id",
          as: "gap",
        },
      },
      {
        $addFields: {
          gap: {
            $arrayElemAt: ["$gap", 0],
          },
        },
      },
        {
            $lookup: {
                from: "provinces",
                localField: "farm.location.prov_id",
                foreignField: "_id",
                as: "farm.location.prov_id",
            },
        },
        {
            $addFields: {
                "farm.location.prov_id": {
                    $arrayElemAt: ["$farm.location.prov_id", 0],
                },
            },
        },
        {
            $lookup: {
                from: "districts",
                localField: "farm.location.dist_id",
                foreignField: "_id",
                as: "farm.location.dist_id",
            },
        },
        {
            $addFields: {
                "farm.location.dist_id": {
                    $arrayElemAt: ["$farm.location.dist_id", 0],
                },
            },
        },
        {
            $lookup: {
                from: "sectors",
                localField: "farm.location.sect_id",
                foreignField: "_id",
                as: "farm.location.sect_id",
            },
        },
        {
            $addFields: {
                "farm.location.sect_id": {
                    $arrayElemAt: ["$farm.location.sect_id", 0],
                },
            },
        },
        {
            $lookup: {
                from: "cells",
                localField: "farm.location.cell_id",
                foreignField: "_id",
                as: "farm.location.cell_id",
            },
        },
        {
            $addFields: {
                "farm.location.cell_id": {
                    $arrayElemAt: ["$farm.location.cell_id", 0],
                },
            },
        },
        {
            $lookup: {
                from: "villages",
                localField: "farm.location.village_id",
                foreignField: "_id",
                as: "farm.location.village_id",
            },
        },
        {
            $addFields: {
                "farm.location.village_id": {
                    $arrayElemAt: ["$farm.location.village_id", 0],
                },
            },
        }
    ];
    const filter = {
      $match: {
        ...(body.location &&
          body.location.prov_id && {
            "farm.location.prov_id": ObjectId(body.location.prov_id),
          }),
        ...(body.location &&
          body.location.dist_id && {
            "farm.location.dist_id": ObjectId(body.location.dist_id),
          }),
        ...(body.location &&
          body.location.sect_id && {
            "farm.location.sect_id": ObjectId(body.location.sect_id),
          }),
        ...(body.location &&
          body.location.cell_id && {
            "farm.location.cell_id": ObjectId(body.location.cell_id),
          }),
        ...(body.location &&
          body.location.village_id && {
            "farm.location.village_id": ObjectId(body.location.village_id),
          }),
          ...(body.reference && { reference: body.reference }),
          ...(body.scheduleId && { scheduleId: body.scheduleId }),
          ...(body.groupId && { groupId: body.groupId }),
          ...(body.date && { createdAt: { $gte:moment(body.date.from)
                      .startOf('day')
                      .toDate() , $lt:  moment(body.date.to)
                      .endOf('day')
                      .toDate() }}),
          ...{ isDeleted: false },
      },
    };
    return this.model.aggregate([filter].concat(lookup));
  }

  calculateAdoptionScore(data) {
    const { gapId, referenceId, location, date } = data;

    let locSearchBy = "";
    if (location) locSearchBy = `farm.location.${location.searchBy}`;

    let startDate = "";
    let endDate = "";
    if (date) {
      startDate = moment(date.from).startOf("day").toDate();
      endDate = moment(date.to).endOf("day").toDate();
    }

    const filters = {
      $match: {
        ...(gapId && { gap: gapId }),
        ...(referenceId && { referenceId: referenceId }),
        ...(location && { [locSearchBy]: ObjectId(location.locationId) }),
        ...(date && {
          createdAt: { $gte: startDate, $lt: endDate },
        }),
        isDeleted: false
      },
    };

    const group = {
      $group: {
        _id: "",
        overall_score: { $sum: "$overall_score" },
        overall_weight: { $sum: "$overall_weight" },
      },
    };
    return this.model.aggregate([filters, group]);
  }
}

module.exports.farmVisitConductRepository = new FarmVisitConductRepository(
  FarmVisitConduct
);
