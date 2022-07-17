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
    this.attendanceSummary = this.attendanceSummary.bind(this);
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
        const message = `Uruganda ${
          schedule.trainer.organisationName
        } rubatumiye mu mahugurwa ya \"${
          schedule.trainingId.trainingName
        }\". Azaba ku itariki ${schedule.startTime.toLocaleDateString()}, guhera ${schedule.startTime.toLocaleTimeString()} - kuri:${
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

  // Get Attendance Summary
  attendanceSummary(req, res) {
    const {body} = req;
    return asyncWrapper(res, async () => {
      const summary = await this.repository.attendanceSummary(body);

      if (summary)
        return responseWrapper({
          res,
          status: statusCodes.OK,
          message: "success",
          data: summary,
        });
        
    });
  }
}

module.exports.scheduleCtrl = new ScheduleController(scheduleRepository);
