const BaseRepository = require("../../core/library/BaseRepository");
const {
  farmVisitConductRepository,
} = require("../farm-visit-conduct/farm-visit-conduct.repository");
const { Evaluation } = require("./evaluation");
class EvaluationRepository extends BaseRepository {
  constructor(model) {
    super(model);
  }

  async evaluationStats(body) {
    const evaluations = await this.model.find({});
    return Promise.all(
      evaluations.map(async (element) => {
        const { _id, gap_name, isDeleted } = element;
        const adoption =
          await farmVisitConductRepository.calculateAdoptionScore({
            gapId: _id,
          });
          
        return {
          _id,
          gap_name,
          adoptionRate:
            adoption.length > 0
              ? (adoption[0].overall_score * 100) / adoption[0].overall_weight
              : 0,
          baselineRate: 10,
          isDeleted,
        };
      })
    );
  }

  calculateScore(data){
    return Promise.all(
      data.map(async (element) => {
        const { _id, gap_name, gap_weight, gap_score, sections, status, createdAt } = element;
        const adoption =
          await farmVisitConductRepository.calculateAdoptionScore({
            gapId: _id,
          });
          
        return {
          _id,
          gap_name,
          gap_weight,
          gap_score,
          sections,
          status,
          createdAt,
          adoptionRate:
            adoption.length > 0
              ? (adoption[0].overall_score * 100) / adoption[0].overall_weight
              : 0,
          baselineRate: 10
        };
      })
    );
  }
}
module.exports.evaluationRepository = new EvaluationRepository(Evaluation);
