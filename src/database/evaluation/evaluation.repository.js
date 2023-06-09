const BaseRepository = require("core/library/BaseRepository");
const {
  farmVisitConductRepository,
} = require("database/farm-visit-conduct/farm-visit-conduct.repository");
const { Evaluation } = require("./evaluation");
class EvaluationRepository extends BaseRepository {
  constructor(model) {
    super(model);
  }

  find() {
    return super.find(null, { gap_name: 1 });
  }

  async evaluationStats(body) {
    const evaluations = await this.find();
    return Promise.all(
      evaluations.map(async (element) => {
        const { _id, gap_name, baselineRate, isDeleted } = element;
        const adoptions =
          await farmVisitConductRepository.calculateAdoptionScore({
            gapId: _id,
            ...body
          });
        const { score, weight } = adoptions.reduce((prev, curr) => {
          return {
            score: prev.score + curr.overall_score,
            weight: prev.weight + curr.overall_weight
          }
        }, { score: 0, weight: 0 });
        return {
          _id,
          gap_name,
          adoptionRate: (score * 100) / weight,
          baselineRate,
          isDeleted,
        };
      })
    );
  }

  calculateScore(data) {
    return Promise.all(
      data.map(async (element) => {
        const { _id, gap_name, gap_weight, gap_score, sections, status, createdAt, baselineRate } = element;
        const adoptions =
          await farmVisitConductRepository.calculateAdoptionScore({
            gapId: _id,
          });

        const { score, weight } = adoptions.reduce((prev, curr) => {
          return {
            score: prev.score + curr.overall_score,
            weight: prev.weight + curr.overall_weight
          }
        }, { score: 0, weight: 0 });

        return {
          _id,
          gap_name,
          gap_weight,
          gap_score,
          sections,
          status,
          createdAt,
          adoptionRate: (score * 100) / weight,
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
