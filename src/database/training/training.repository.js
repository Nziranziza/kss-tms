const BaseRepository = require("../../core/library/BaseRepository");
const { Training } = require("./training");
class EvaluationRepository extends BaseRepository {
  constructor(model) {
    super(model);
  }

  customFindAll(data) {
    return this.model.find(data).populate("adoptionGaps", "name");
  }

  findOne(id) {
    return this.model.findOne({ _id: id }).populate("adoptionGaps", "name");
  }
}
module.exports.trainingRepository = new EvaluationRepository(Training);
