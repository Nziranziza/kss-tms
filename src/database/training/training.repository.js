const BaseRepository = require("../../core/library/BaseRepository");
const { Training } = require("./training");
class EvaluationRepository extends BaseRepository {
  constructor(model) {
    super(model);
  }
}
module.exports.trainingRepository = new EvaluationRepository(Training);
