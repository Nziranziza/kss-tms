const BaseRepository = require("../../core/library/BaseRepository");
const { Evaluation } = require("./evaluation");
class EvaluationRepository extends BaseRepository {
  constructor(model) {
    super(model);
  }
}
module.exports.evaluationRepository = new EvaluationRepository(Evaluation);
