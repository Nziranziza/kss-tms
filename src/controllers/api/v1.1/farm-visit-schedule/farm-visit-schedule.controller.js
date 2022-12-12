const asyncWrapper = require("../../../../core/helpers/asyncWrapper");
const responseWrapper = require("../../../../core/helpers/responseWrapper");
const BaseController = require("../../../../core/library/BaseController");
const {
  farmVisitScheduleRepository,
} = require("../../../../database/farm-visit-schedule/farm-visit-schedule.repository");
const { statusCodes } = require("../../../../utils/constants/common");
const { sendAppSMS } = require("../../../../services/comm.service");

class FarmVisitScheduleController extends BaseController {
  constructor(repository) {
    super(repository);
    this.schedulesStats = this.schedulesStats.bind(this);
    this.farmerScheduledVisits = this.farmerScheduledVisits.bind(this);
    this.farmsScheduledVisits = this.farmsScheduledVisits.bind(this);
    this.farmScheduledVisits = this.farmScheduledVisits.bind(this);
    this.sendSMS = this.sendSMS.bind(this);
    this.visitedFarmsOverview = this.visitedFarmsOverview.bind(this);
  }

  schedulesStats(req, res) {
    const { body } = req;
    return asyncWrapper(res, async () => {
      const summary = await this.repository.schedulesStats(body);
      if (summary)
        return responseWrapper({
          res,
          status: statusCodes.OK,
          message: "success",
          data: summary,
        });
    });
  }

  farmerScheduledVisits(req, res) {
    const { params } = req;
    return asyncWrapper(res, async () => {
      const visits = await this.repository.farmerScheduledVisits(params.id);
      if (visits)
        return responseWrapper({
          res,
          status: statusCodes.OK,
          message: "success",
          data: visits,
        });
    });
  }

  sendSMS(req, res) {
    const { params } = req;
    return asyncWrapper(res, async () => {
      const schedule = await this.repository.findById(params.id);
      if (schedule) {
        for (const farm of schedule.farms) {
          let recipients = [];

          const message = `Uruganda ${schedule.visitor.organisationName} ruzasura umurima wawe uherereye ${farm.location.village_id.name}.
          ku itariki ${schedule.date.toLocaleDateString()} saa ${
            schedule.expectedDuration.from } - ${schedule.expectedDuration.to}`;

          if (farm.owner.phoneNumber) {
            recipients.push(farm.owner.phoneNumber);
          }
          const data = {
            recipients: recipients,
            message: message,
            sender: "SKS",
          };
          await sendAppSMS(data);
        }
        return responseWrapper({
          res,
          status: statusCodes.OK,
          message: "Success",
        });
      } else {
        return responseWrapper({
          res,
          status: statusCodes.NOT_FOUND,
          message: "Schedule not found",
        });
      }
    });
  }

  farmScheduledVisits(req, res) {
    const { body } = req;
    return asyncWrapper(res, async () => {
      const schedules = await this.repository.farmScheduledVisits(body);
      if (schedules)
        return responseWrapper({
          res,
          status: statusCodes.OK,
          message: "success",
          data: schedules,
        });
    });
  }

  farmsScheduledVisits(req, res) {
    const { body } = req;
    return asyncWrapper(res, async () => {
      const schedules = await this.repository.farmsScheduledVisits(body);
      if (schedules)
        return responseWrapper({
          res,
          status: statusCodes.OK,
          message: "success",
          data: schedules,
        });
    });
  }

  visitedFarmsOverview(req, res) {
    const { body } = req;
    return asyncWrapper(res, async () => {
      const visits = await this.repository.visitedFarmsOverview(body);

      if (visits)
        return responseWrapper({
          res,
          status: statusCodes.OK,
          message: "success",
          data: visits.length > 0 ? visits[0] : {visits: 0},
        });
    });
  }
}

module.exports.farmVisitScheduleCtrl = new FarmVisitScheduleController(
  farmVisitScheduleRepository
);
