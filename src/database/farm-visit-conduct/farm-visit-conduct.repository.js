const BaseRepository = require("core/library/BaseRepository");
const {
  FarmVisitConduct,
} = require("database/farm-visit-conduct/farm-visit-conduct");
const {
  FarmVisitSchedule,
} = require("database/farm-visit-schedule/farm-visit-schedule");
const { Evaluation } = require("database/evaluation/evaluation");
const moment = require("moment/moment");
const CustomError = require("core/helpers/customerError");
const { statusCodes } = require("utils/constants/common");
const populate = require('./farm-visit-conduct.populate');
const toObjectId = require('utils/toObjectId');
const removeNilProps = require('utils/removeNilProps');

function generateFilters(body) {
  return removeNilProps({
    "farm.location.prov_id": toObjectId(body?.location?.prov_id),
    "farm.location.dist_id": toObjectId(body?.location?.dist_id),
    "farm.location.sect_id": toObjectId(body?.location?.sect_id),
    "farm.location.cell_id": toObjectId(body?.location?.cell_id),
    "farm.location.village_id": toObjectId(body?.location?.village_id),
    reference: body?.reference || body?.referenceId,
    scheduleId: body?.scheduleId,
    groupId: toObjectId(body?.groupId),
    createdAt: body?.date ? {
        $gte: moment(body?.date?.from).startOf("day").toDate(),
        $lt: moment(body?.date?.to).endOf("day").toDate(),
    }: undefined,
    isDeleted: false,
  })
}

class FarmVisitConductRepository extends BaseRepository {
  constructor(model) {
    super(model);
  }

  create = async (entity) => {
    const gap = await Evaluation.findById(entity.gap);
    if(!gap) {
      throw new CustomError('Gap with such id is not found', statusCodes.NOT_FOUND);
    }
    let score = 0;
    entity.evaluation.forEach((evaluation) => {
      evaluation.questions.forEach((question) => {
        score = score + question.score;
      });
    });
    if(score > gap.gap_score) {
      throw new CustomError('Total question score should be less or equal to gap score', statusCodes.BAD_REQUEST)
    }
    entity.overall_score = (gap.gap_weight / gap.gap_score) * score;
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
            conduct_id: conduct._id,
            photos: conduct.photos
          },
        },
      }
    );
    return conduct;
  }

  find = (data = {}) => {
    return super
      .find(data)
      .populate(populate);
  }

  findOne = (data = {}) => {
    return super
      .findOne(data)
      .populate(populate);
  }

  findById = (id) => {
    return super
      .findById(id)
      .populate(populate);
  }
  

  statistics = async (body) => {
    const match = {
      $match: generateFilters(body),
    };
    const group = {
      $group: {
        _id: null,
        numberOfFarmVisits: { $sum: 1 },
      },
    };
    const groupByFarm = {
      $group: {
        _id: "$farm.farmId",
      },
    };
    const groupByOwnerGenderAndId = {
      $group: {
        _id: { sex: "$owner.sex", farmerId: "$owner.userId" },
      },
    };
    const groupByGender = {
      $group: {
        _id: "$sex",
        total: { $sum: 1 }
      }
    }
    const projectToSexAndFarmerId = {
      $project: { _id: 0, sex: "$_id.sex", farmerId: "$_id.farmerId" },
    };
    const project = {
      $project: {
        numberOfFarmVisits: 1,
      },
    };
    const [{ numberOfFarmVisits } = { numberOfFarmVisits: 0 }] = await this.model.aggregate([match, group, project]);
    const [{ numberOfFarmVisited } = { numberOfFarmVisited: 0 }] = await this.model.aggregate([match, groupByFarm, { $count: "numberOfFarmVisited" }]);
    const genderInfos = await this.model.aggregate([match, groupByOwnerGenderAndId, projectToSexAndFarmerId, groupByGender]);
    return [
      {
        numberOfFarmVisits,
        numberOfFarmVisited,
        ...genderInfos.reduce(
          (prev, curr) => {
            if (curr._id.toLowerCase() === "f") {
              return {
                ...prev,
                numberFemaleVisited: curr.total,
                numberOfFarmerVisited: curr.total + prev.numberOfFarmerVisited,
              };
            } else {
              return {
                ...prev,
                numberOfMaleVisited: curr.total,
                numberOfFarmerVisited: curr.total + prev.numberOfFarmerVisited,
              };
            }
          },
          {
            numberFemaleVisited: 0,
            numberOfMaleVisited: 0,
            numberOfFarmerVisited: 0,
          }
        ),
      },
    ];
  }

  report = (body) => {
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
    const filters = {
      $match: generateFilters(body),
    };
    return this.aggregate([filters].concat(lookup));
  }

  calculateAdoptionScore = (data) => {
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
      $match: removeNilProps({
        gap: gapId,
        reference: referenceId ,
        [locSearchBy]: toObjectId(location?.locationId),
        createdAt: date ? { $gte: startDate, $lt: endDate } : undefined,
        isDeleted: false
      }),
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

  calculateBaselineScore = (data) => {
    const { gapId } = data;

    const filters = {
      $match: removeNilProps({
        gap: toObjectId(gapId),
        isDeleted: false
      }),
    };

    const sort = {
      $sort:  { createdAt: 1 }
    };

    const limit = {
      $limit: 100
    };

    const group = {
      $group: {
        _id: "",
        overall_score: { $sum: "$overall_score" },
        overall_weight: { $sum: "$overall_weight" },
      },
    };
    return this.model.aggregate([filters, sort, limit, group]);
  }
}

module.exports.farmVisitConductRepository = new FarmVisitConductRepository(
  FarmVisitConduct
);
