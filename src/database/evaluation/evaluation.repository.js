const BaseRepository = require("core/library/BaseRepository");
const {
  farmVisitConductRepository,
} = require("database/farm-visit-conduct/farm-visit-conduct.repository");
const { Evaluation } = require("./evaluation");
class EvaluationRepository extends BaseRepository {
  constructor(model) {
    super(model);
  }

  async evaluationStats(body) {
    const evaluations = await this.find();
    return Promise.all(
      evaluations.map(async (element) => {
        const { _id, gap_name, baselineRate, isDeleted } = element;
        const adoption =
          await farmVisitConductRepository.calculateAdoptionScore({
            gapId: _id,
            ...body
          });
          
        return {
          _id,
          gap_name,
          adoptionRate:
            adoption.length > 0
              ? (adoption[0].overall_score * 100) / adoption[0].overall_weight
              : 0,
          baselineRate,
          isDeleted,
        };
      })
    );
  }

  calculateScore(data){
    return Promise.all(
      data.map(async (element) => {
        const { _id, gap_name, gap_weight, gap_score, sections, status, createdAt, baselineRate } = element;
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
          baselineRate
        };
      })
    );
  }

  async computeBaseline() {
    // Fetch all gaps
    const gaps = await this.find();
    Promise.all(
      gaps.map(async gap => {
        const score = await farmVisitConductRepository.calculateBaselineScore({gapId: gap._id});
        gap.baselineRate = score.length > 0 ? score[0].overall_score : 0;
        await gap.save();
      })
    );
    return gaps;
  }
}
module.exports.evaluationRepository = new EvaluationRepository(Evaluation);
