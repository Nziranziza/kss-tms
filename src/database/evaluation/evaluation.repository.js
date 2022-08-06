const BaseRepository = require("../../core/library/BaseRepository");
const { Evaluation } = require("./evaluation");
class EvaluationRepository extends BaseRepository {
  constructor(model) {
    super(model);
  }

  async evaluationStats(body) {
    const evaluations = await this.model.find(body);
    return evaluations.map((element) => {
      const { _id, gap_name, isDeleted } = element;
      return {
        _id,
        gap_name,
        adoptionRate: 50,
        baselineRate: Math.floor(Math.random() * 10),
        isDeleted,
      };
    });
  }
}
module.exports.evaluationRepository = new EvaluationRepository(Evaluation);
