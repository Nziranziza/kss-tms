const BaseRepository = require("../../core/library/BaseRepository");
const { Training } = require("./training");
const ObjectId = require("mongodb").ObjectID;
class EvaluationRepository extends BaseRepository {
  constructor(model) {
    super(model);
  }

  customFindAll(data) {
    return this.model.find(data).populate("adoptionGaps", "name");
  }

  findOne(id) {
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
    ]);
    // return this.model.populate(schedules[0], {path: "adoptionGaps"});
  }
}
module.exports.trainingRepository = new EvaluationRepository(Training);
