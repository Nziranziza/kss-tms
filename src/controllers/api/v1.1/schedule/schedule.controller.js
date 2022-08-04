const asyncWrapper = require("../../../../core/helpers/asyncWrapper");
const BaseController = require("../../../../core/library/BaseController");
const responseWrapper = require("../../../../core/helpers/responseWrapper");
const {
  scheduleRepository,
} = require("../../../../database/schedule/schedule.repository");
const { statusCodes } = require("../../../../utils/constants/common");
const { sendAppSMS } = require("../../../../services/comm.service");
const {
  commRepo,
} = require("../../../../database/communication/communication.repository");
const {
  scheduleStatus,
  smsPurpose,
  receptionStatus,
} = require("../../../../tools/constants");
const moment = require("moment");

class ScheduleController extends BaseController {
  constructor(repository) {
    super(repository);
    this.findAllByRef = this.findAllByRef.bind(this);
    this.delete = this.delete.bind(this);
    this.recordAtt = this.recordAtt.bind(this);
    this.sendSMS = this.sendSMS.bind(this);
    this.attendanceSummary = this.attendanceSummary.bind(this);
  }

  findAllByRef(req, res) {
    const { from, to } = req.query;
    let startDate = "";
    let endDate = "";
    if (from && to) {
      startDate = moment(from).startOf("day").toDate();
      endDate = moment(to).endOf("day").toDate();
    }

    const body = {
      referenceId: req.params.id,
      ...(from &&
        to && {
          startTime: { $gte: startDate, $lt: endDate },
        }),
    };
    return asyncWrapper(res, async () => {
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
    const { params, body } = req;
    return asyncWrapper(res, async () => {
      const schedule = await this.repository.findOne(params.id);

      if (schedule) {
        // Build SMS body
        const message = `Uruganda ${
          schedule.trainer.organisationName
        } rubatumiye mu mahugurwa ya \"${
          schedule.trainingId.trainingName
        }\". Azaba ku itariki ${schedule.startTime.toLocaleDateString()}, guhera ${schedule.startTime.toLocaleTimeString()} - kuri:${
          schedule.venueName
        }`;

        // Build recipients
        let recipients = [];
        for (const trainee of schedule.trainees) {
          // If no phonenumber don't add user to recipients
          if (trainee.phoneNumber) {
            recipients.push({
              userId: trainee.userId,
              phoneNumber: trainee.phoneNumber,
              status: receptionStatus.QUEUED,
            });
          }
        }
        // create batch in communication db
        const batch = await commRepo.create(
          message,
          recipients,
          body,
          "SMS",
          smsPurpose.TRAINING_INVITE
        );
        if (batch.status == 200) {
          responseWrapper({
            res,
            status: statusCodes.CREATED,
            message: batch.message,
            data: batch.data,
          });
        } else {
          return responseWrapper({
            res,
            status: statusCodes.SERVER_ERROR,
            message: "Could not send messages",
          });
        }
      } else
        return responseWrapper({
          res,
          status: statusCodes.NOT_FOUND,
          message: "Schedule not found or no trainees Added",
        });
    });
  }

  // Get Attendance Summary
  attendanceSummary(req, res) {
    const { body } = req;
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
