const BaseRepository = require("../../core/library/BaseRepository");
const { Training } = require("./training");
const ObjectId = require("mongodb").ObjectID;
class TrainingRepository extends BaseRepository {
  constructor(model) {
    super(model);
    this.findSingle = this.findSingle.bind(this)
  }

  findSingle(id){
    return super.findById(id);
  }

  findOne(id) {
    const unwind = {
      $unwind: {
        path: "$schedules",
        preserveNullAndEmptyArrays: true,
      },
    };

    const match = {
      $match: {
        //'schedules.isDeleted': false
      }
    };

    const locationPopulate = [
      {
        $lookup: {
          from: "provinces",
          localField: "schedules.location.prov_id",
          foreignField: "_id",
          as: "schedules.location.prov_id",
        },
      },
      {
        $addFields: {
          "schedules.location.prov_id": {
            $arrayElemAt: ["$schedules.location.prov_id", 0],
          },
        },
      },
      {
        $lookup: {
          from: "districts",
          localField: "schedules.location.dist_id",
          foreignField: "_id",
          as: "schedules.location.dist_id",
        },
      },
      {
        $addFields: {
          "schedules.location.dist_id": {
            $arrayElemAt: ["$schedules.location.dist_id", 0],
          },
        },
      },
      {
        $lookup: {
          from: "sectors",
          localField: "schedules.location.sect_id",
          foreignField: "_id",
          as: "schedules.location.sect_id",
        },
      },
      {
        $addFields: {
          "schedules.location.sect_id": {
            $arrayElemAt: ["$schedules.location.sect_id", 0],
          },
        },
      },
      {
        $lookup: {
          from: "cells",
          localField: "schedules.location.cell_id",
          foreignField: "_id",
          as: "schedules.location.cell_id",
        },
      },
      {
        $addFields: {
          "schedules.location.cell_id": {
            $arrayElemAt: ["$schedules.location.cell_id", 0],
          },
        },
      },
      {
        $lookup: {
          from: "villages",
          localField: "schedules.location.village_id",
          foreignField: "_id",
          as: "schedules.location.village_id",
        },
      },
      {
        $addFields: {
          "schedules.location.village_id": {
            $arrayElemAt: ["$schedules.location.village_id", 0],
          },
        },
      },
    ];

    const group = {
      $group: {
        _id: "$_id",
        trainingName: { $first: "$trainingName" },
        adoptionGaps: { $first: "$adoptionGaps" },
        description: { $first: "$description" },
        materials: { $first: "$materials" },
        status: { $first: "$status" },
        createdAt: { $first: "$createdAt" },
        updatedAt: { $first: "$updatedAt" },
        schedules: {
          $push: "$schedules",
        },
      },
    };

    return this.model.aggregate([
      {
        $match: {
          $and: [{ _id: ObjectId(id) }],
        },
      },
      {
        $lookup: {
          from: "evaluations",
          localField: "adoptionGaps",
          foreignField: "_id",
          as: "adoptionGaps",
        },
      },
      {
        $lookup: {
          from: "schedules",
          localField: "_id",
          foreignField: "trainingId",
          as: "schedules",
        },
      },
      {
        $project: {
          "adoptionGaps.questions": 0,
          "adoptionGaps.isDeleted": 0,
          "adoptionGaps.description": 0,
          "adoptionGaps.deletedAt": 0,
          "adoptionGaps.applicationId": 0,
        },
      },
      unwind,
      match,
      ...locationPopulate,
      group,
    ]);
  }
}
module.exports.trainingRepository = new TrainingRepository(Training);
