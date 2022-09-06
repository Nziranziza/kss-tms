const asyncWrapper = require("../../../../core/helpers/asyncWrapper");
const BaseController = require("../../../../core/library/BaseController");
const responseWrapper = require("../../../../core/helpers/responseWrapper");
const { statusCodes } = require("../../../../utils/constants/common");

const {
  scheduleRepository,
} = require("../../../../database/schedule/schedule.repository");
const {
  groupRepository,
} = require("../../../../database/group/group.repository");
const { ObjectId } = require("mongodb");

class DashboardController extends BaseController {
  constructor() {
    super();
  }

  getFilterOptions(req, res) {
    return asyncWrapper(res, async () => {
      const { body } = req;
      const trainings = await scheduleRepository.getTrainingFilters(body);

      const filters = await Promise.all(
        trainings.map(async (training) => {
          const ids = training.groups.map((id) => ObjectId(id));
          console.log(ids);
          const groups = await groupRepository.customFindAll({
            _id: { $in: ids },
          });

          return {
            trainingId: training._id,
            trainingName: training.trainingName,
            trainers: training.trainers,
            groups: groups.map(group => {
                return {_id: group._id, groupName: group.groupName}
            }),
          };
        })
      );

      return responseWrapper({
        res,
        status: statusCodes.OK,
        message: "success",
        data: filters,
      });
    });
  }
}

module.exports.dashCtrl = new DashboardController();
