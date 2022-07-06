const asyncWrapper = require("../../../../core/helpers/asyncWrapper");
const BaseController = require("../../../../core/library/BaseController");
const responseWrapper = require("../../../../core/helpers/responseWrapper");
const {
  scheduleRepository,
} = require("../../../../database/schedule/schedule.repository");
const { statusCodes } = require("../../../../utils/constants/common");
const { sendAppSMS } = require("../../../../services/comm.service");
const { RedisService } = require("../../../../services/redis.service");

class ScheduleController extends BaseController {
  constructor(repository) {
    super(repository);
    this.findAllByOrg = this.findAllByOrg.bind(this);
    this.delete = this.delete.bind(this);
    this.recordAtt = this.recordAtt.bind(this);
    this.sendSMS = this.sendSMS.bind(this);
  }

  findAllByOrg(req, res) {
    const body = { referenceId: req.params.id };
    return asyncWrapper(res, async () => {
      console.log(body);
      const data = await this.repository.customFindAll(body);
      return responseWrapper({
        res,
        status: statusCodes.OK,
        message: "Success",
        data,
      });
    });
  }

  delete(req, res) {
    return asyncWrapper(res, async () => {
      const data = await this.repository.findOne(req.params.id);
      const isDeleted = await data.softDelete();
      return responseWrapper({
        res,
        status: statusCodes.OK,
        message: "Removed successfully",
        data,
      });
    });
  }

  recordAtt(req, res) {
    const { params, body } = req;
    return asyncWrapper(res, async () => {
      const schedule = await this.repository.findOne(params.id);
      if (schedule) {
        const attendance = await this.repository.recordAtt(schedule, body);
        if (attendance)
          return responseWrapper({
            res,
            status: statusCodes.OK,
            message: "Removed successfully",
            data: attendance,
          });
        else
          return responseWrapper({
            res,
            status: statusCodes.SERVER_ERROR,
            message: "Could not record attendance.",
            data: attendance,
          });
      }
      return responseWrapper({
        res,
        status: statusCodes.NOT_FOUND,
        message: "Schedule not found",
      });
    });
  }

  sendSMS(req, res) {
    const { params } = req;
    return asyncWrapper(res, async () => {
      const schedule = await this.repository.findOne(params.id);

      if (schedule) {
        const message = `Mwiriwe, Nkara Dukare ibatumiye mu mahugurwa ya \\" ${
          schedule.trainingId.trainingName
        } \\" Azaba ku itariki
        ${schedule.startTime.toLocaleDateString()} agatangira saa 16:00 Kugeza saa 18:00 - Akazabera ${
          schedule.venueName
        }`;

        console.log(message);

        let recipients = [];

        for (const trainee of schedule.trainees) {
          recipients.push(trainee.phoneNumber);
        }

        const data = {
          recipients: recipients,
          message: message,
          sender: "SKS",
        };

        const sms = await sendAppSMS(data);
        if (sms.data)
          return responseWrapper({
            res,
            status: statusCodes.CREATED,
            message: sms.data.message,
            data: sms.data.data,
          });
        else {
          return responseWrapper({
            res,
            status: statusCodes.NOT_FOUND,
            message: "Could not send SMS to Invitees.",
          });
        }
      }

      return responseWrapper({
        res,
        status: statusCodes.NOT_FOUND,
        message: "Schedule not found",
      });
    });
  }
}

module.exports.scheduleCtrl = new ScheduleController(scheduleRepository);
