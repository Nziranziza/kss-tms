const { ObjectId } = require("mongodb");
const BaseRepository = require("../../core/library/BaseRepository");
const {
  FarmVisitSchedule,
} = require("../farm-visit-schedule/farm-visit-schedule");
const moment = require("moment");

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
      .populate("gaps")
      .populate("groupId", "groupName");
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
      .populate("groupId", "groupName").lean();
  }

  async schedulesStats(body) {
    const { location, visitorId, date, referenceId } = body;

    let locSearchBy = "";
    if (location) locSearchBy = `farms.location.${location.searchBy}`;

    let startDate = "";
    let endDate = "";
    if (date) {
      startDate = moment(date.from).startOf("day").toDate();
      endDate = moment(date.to).endOf("day").toDate();
    }

    // Filter statistics by different values
    const filter = {
      $match: {
        ...(visitorId && { "visitor.userId": ObjectId(visitorId) }),
        ...(location && { [locSearchBy]: ObjectId(location.locationId) }),
        ...(referenceId && { reference: referenceId }),
        ...(date && { date: { $gte: startDate, $lt: endDate } }),
        isDeleted: false
      },
    };


    // Unwind all trainees so we can compute data
    const unwind = {
      $unwind: "$farms",
    };

    // Group farms by owner sex
    const group = {
      $group: {
        _id: { gender: "$farms.owner.sex" },
        visits: { $sum: 1 },
        Unique: {
          $addToSet: "$farms.owner.userId",
        },
      },
    };

    // count by unique gender and absence status
    const project = {
      $project: {
        _id: 0,
        gender: "$_id.gender",
        unique: { $size: "$Unique" },
        visits: "$visits",
      },
    };

    // Run query // Query will return 2 objects or less each containing stats for each gender
    const summary = await this.model.aggregate([
      unwind,
      filter,
      group,
      project,
    ]);

    let maleFarmVisits = 0;
    let femaleFarmVisits = 0;
    let visits = 0;

    // Compile results
    summary.forEach((data) => {
      visits = visits + data.visits;
      if (data.gender.toLowerCase() == "m")
        maleFarmVisits = maleFarmVisits + data.unique;
      else femaleFarmVisits = femaleFarmVisits + data.unique;
    });

    return {
      maleFarmVisits,
      femaleFarmVisits,
      totalFarmersVisited: maleFarmVisits + femaleFarmVisits,
      totalVisits: visits,
    };
  }

  farmerScheduledVisits(id) {
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
        $lookup: {
          from: "provinces",
          localField: "farms.location.prov_id",
          foreignField: "_id",
          as: "farms.location.prov_id",
        },
      },
      {
        $addFields: {
          "farms.location.prov_id": {
            $arrayElemAt: ["$farms.location.prov_id", 0],
          },
        },
      },
      {
        $lookup: {
          from: "districts",
          localField: "farms.location.dist_id",
          foreignField: "_id",
          as: "farms.location.dist_id",
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
          localField: "farms.location.sect_id",
          foreignField: "_id",
          as: "farms.location.sect_id",
        },
      },
      {
        $addFields: {
          "farms.location.sect_id": {
            $arrayElemAt: ["$farms.location.sect_id", 0],
          },
        },
      },
      {
        $lookup: {
          from: "cells",
          localField: "farms.location.cell_id",
          foreignField: "_id",
          as: "farms.location.cell_id",
        },
      },
      {
        $addFields: {
          "farms.location.cell_id": {
            $arrayElemAt: ["$farms.location.cell_id", 0],
          },
        },
      },
      {
        $lookup: {
          from: "villages",
          localField: "farms.location.village_id",
          foreignField: "_id",
          as: "farms.location.village_id",
        },
      },
      {
        $addFields: {
          "farms.location.village_id": {
            $arrayElemAt: ["$farms.location.village_id", 0],
          },
        },
      },
      {
        $match: {
          "farms.owner.userId": ObjectId(id),
        },
      },
    ]);
  }

  farmScheduledVisits(body) {
    return this.model.aggregate([
      {
        $match: {
          ...(body.farmId && {
            "farms.farmId": ObjectId(body.farmId),
          }),
          ...(body.scheduleId && {
            _id: ObjectId(body.scheduleId),
          }),
          ...(body.created_at && {
            created_at: {
              $gte: body.created_at.from,
              $lt: body.created_at.to,
            },
          }),
        },
      },
      {
        $unwind: "$farms",
      },
      {
        $match: {
          ...(body.farmId && {
            "farms.farmId": ObjectId(body.farmId),
          }),
        },
      },
      {
        $lookup: {
          from: "provinces",
          localField: "farms.location.prov_id",
          foreignField: "_id",
          as: "farms.location.prov_id",
        },
      },
      {
        $addFields: {
          "farms.location.prov_id": {
            $arrayElemAt: ["$farms.location.prov_id", 0],
          },
        },
      },
      {
        $lookup: {
          from: "districts",
          localField: "farms.location.dist_id",
          foreignField: "_id",
          as: "farms.location.dist_id",
        },
      },
      {
        $addFields: {
          "farms.location.dist_id": {
            $arrayElemAt: ["$farms.location.dist_id", 0],
          },
        },
      },
      {
        $lookup: {
          from: "sectors",
          localField: "farms.location.sect_id",
          foreignField: "_id",
          as: "farms.location.sect_id",
        },
      },
      {
        $addFields: {
          "farms.location.sect_id": {
            $arrayElemAt: ["$farms.location.sect_id", 0],
          },
        },
      },
      {
        $lookup: {
          from: "cells",
          localField: "farms.location.cell_id",
          foreignField: "_id",
          as: "farms.location.cell_id",
        },
      },
      {
        $addFields: {
          "farms.location.cell_id": {
            $arrayElemAt: ["$farms.location.cell_id", 0],
          },
        },
      },
      {
        $lookup: {
          from: "villages",
          localField: "farms.location.village_id",
          foreignField: "_id",
          as: "farms.location.village_id",
        },
      },
      {
        $addFields: {
          "farms.location.village_id": {
            $arrayElemAt: ["$farms.location.village_id", 0],
          },
        },
      },
      {
        $lookup: {
          from: "evaluations",
          localField: "gaps",
          foreignField: "_id",
          as: "gaps",
        },
      },
    ]);
  }

  farmsScheduledVisits(body) {
    const filter = {
      $match: {
        ...(body.reference && {
          reference: body.reference,
        }),
      },
    };
    return this.model.aggregate([
      filter,
      {
        $unwind: "$farms",
      },
    ]);
  }

  visitedFarmsOverview(body) {
    const { location, date, referenceId } = body;

    let locSearchBy = "";
    if (location) locSearchBy = `farms.location.${location.searchBy}`;

    let startDate = "";
    let endDate = "";
    if (date) {
      startDate = moment(date.from).startOf("day").toDate();
      endDate = moment(date.to).endOf("day").toDate();
    }

    // Filter statistics by different values
    const filter = {
      $match: {
        ...(location && { [locSearchBy]: ObjectId(location.locationId) }),
        ...(referenceId && { reference: referenceId }),
        ...(date && { date: { $gte: startDate, $lt: endDate } }),
      },
    };

    const unwind = {
      $unwind: {
        path: "$farms",
        preserveNullAndEmptyArrays: true
      }
    };

    const group = {
      $group: {
        _id: "null" ,
        visits: {$addToSet: "$_id"}
      }
    }
    return this.model.aggregate([
      {
        $unwind: "$farms",
      },
      filter,
      unwind,
      group
    ]);
  }
}

module.exports.farmVisitScheduleRepository = new FarmVisitScheduleRepository(
  FarmVisitSchedule
);
