const asyncWrapper = require("core/helpers/asyncWrapper");
const BaseController = require("core/library/BaseController");
const responseWrapper = require("core/helpers/responseWrapper");
const {
    scheduleRepository,
} = require("database/schedule/schedule.repository");
const { statusCodes, serverMessages } = require("utils/constants/common");
const {sendClientSMS} = require("services/comm.service");
const {
  scheduleStatus,
  receptionStatus,
  trainingStatus
} = require("tools/constants");
const moment = require("moment");
const { Training } = require('database/training/training');
const removeNilProps = require("utils/removeNilProps");

class ScheduleController extends BaseController {
  constructor(repository) {
    super(repository);
    this.findAllByRef = this.findAllByRef.bind(this);
    this.delete = this.delete.bind(this);
    this.recordAtt = this.recordAtt.bind(this);
    this.sendSMS = this.sendSMS.bind(this);
    this.report = this.report.bind(this);
    this.statistics = this.statistics.bind(this);
    this.attendanceSummary = this.attendanceSummary.bind(this);
    this.getFarmerAttendance = this.getFarmerAttendance.bind(this);
    this.editAtt = this.editAtt.bind(this);
  }

  create(req, res){
    return asyncWrapper(res, async () => {
      req.body.applicationId = req.headers['tms-app-id'];
      const data = await this.repository.create(req.body);
      const response = await this.repository.findById(data._id);

      const training = await Training.findOne(req.params.id);
      training.status = trainingStatus.SCHEDULED;
      await training.save();

      return responseWrapper({
        res,
        message: serverMessages.CREATE_SUCCESS,
        status: statusCodes.OK,
        data: response
      });
    });
  }

    findAllByRef(req, res) {

        // Build find by date queries
        const {from, to} = req.query;
        let startDate = "";
        let endDate = "";
        if (from && to) {
            startDate = moment(from).startOf("day").toDate();
            endDate = moment(to).endOf("day").toDate();
        }

        // Filters
        const body = removeNilProps({
            referenceId: req.params.id,
            startTime: to && from ? {$gte: startDate, $lt: endDate} : undefined,
        });
        return asyncWrapper(res, async () => {
            const data = await this.repository.find(body);
            // if Associated training is null remove object
            const filter = data.filter((schedule) => schedule.trainingId !== null);
            return responseWrapper({
                res,
                status: statusCodes.OK,
                message: "Success",
                data: filter,
            });
        });
    }


    delete(req, res) {
        return asyncWrapper(res, async () => {
            const data = await this.repository.findById(req.params.id);
            if (data.status === scheduleStatus.HAPPENED)
                return responseWrapper({
                    res,
                    status: statusCodes.FORBIDDEN,
                    message: "Cannot delete a conducted training.",
                });

            await data.softDelete();
            return responseWrapper({
                res,
                status: statusCodes.OK,
                message: serverMessages.DELETE_SUCCESS,
                data,
            });
        });
    }


    recordAtt(req, res) {
        const {params, body} = req;
        return asyncWrapper(res, async () => {
            const schedule = await this.repository.findById(params.id);
            if (schedule && schedule.status === scheduleStatus.PENDING) {
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
                message: "Schedule not found or schedule attendance already recorded.",
            });
        });
    }

    editAtt(req, res) {
        const {params, body} = req;
        return asyncWrapper(res, async () => {
            const schedule = await this.repository.findById(params.id);
            if (schedule) {
                const attendance = await this.repository.editAtt(schedule, body);
                if (attendance)
                    return responseWrapper({
                        res,
                        status: statusCodes.OK,
                        message: "Updated attendance successfully",
                        data: attendance,
                    });
                else
                    return responseWrapper({
                        res,
                        status: statusCodes.SERVER_ERROR,
                        message: "Could not update attendance.",
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
        const {params, body} = req;
        return asyncWrapper(res, async () => {
            const schedule = await this.repository.findById(params.id);

            if (schedule) {
                // Build SMS body
                const message = `Uruganda ${
                  schedule.trainer.organisationName
                } rubatumiye mu mahugurwa ya "${
                  schedule.trainingId.trainingName
                }". Azaba ku itariki ${schedule.startTime.toLocaleDateString()}, guhera ${schedule.startTime.toLocaleTimeString()} - kuri:${
                  schedule.venueName
                }`;
        
                // Build recipients
                let recipients = [];
                for (const trainee of schedule.trainees) {
                  // If no phonenumber don't add user to recipients
                  if (
                    trainee.phoneNumber &&
                    trainee.smsStatus !== receptionStatus.DELIVERED
                  ) {
                    recipients.push(trainee.phoneNumber);
                    trainee.smsStatus = receptionStatus.QUEUED;
                  }
                }
        
                const data = {
                  recipients: recipients,
                  message,
                  sender: body.sender,
                  ext_sender_id: body.sender_id,
                  callBack: body.callback,
                };
        
                const sms = await sendClientSMS(data);
        
                if (sms.data) {
                  const response = {
                    message: message,
                    validPhones: sms.data.data.validPhones,
                    InvalidPhones: sms.data.data.InvalidPhones,
                    batch_id: sms.data.data.batch_id,
                  };
        
                  schedule.smsResponse.push(response);
                  await schedule.save();
        
                  responseWrapper({
                    res,
                    status: sms.data.status,
                    message: sms.data.message,
                    data: sms.data.data,
                  });
                } else if (sms.response.data) {
                  return responseWrapper({
                    res,
                    status: sms.response.data.status,
                    message: sms.response.data.message,
                  });
                } else {
                  return responseWrapper({
                    res,
                    status: statusCodes.SERVER_ERROR,
                    message: "Could not send messages",
                  });
                }
              }
              else
              return responseWrapper({
                res,
                status: statusCodes.NOT_FOUND,
                message: "Schedule not found or no trainees Added",
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
                    message: serverMessages.SUCCESS,
                    data: summary,
                });
        });
    }

    statistics(req, res) {
        return asyncWrapper(res, async () => {
            const {body} = req;
            const schedules = await this.repository.statistics(body);
            return responseWrapper({
                res,
                status: statusCodes.OK,
                message: serverMessages.SUCCESS,
                data: schedules,
            });
        });
    }

    getFarmerAttendance(req, res) {
        return asyncWrapper(res, async () => {
            const {params} = req;
            const schedules = await this.repository.farmerAttendance(params);
            return responseWrapper({
                res,
                status: statusCodes.OK,
                message: serverMessages.SUCCESS,
                data: schedules,
            });
        });
    }

    report(req, res) {
        return asyncWrapper(res, async () => {
            const {body} = req;
            const schedules = await this.repository.report(body);
            return responseWrapper({
                res,
                status: statusCodes.OK,
                message: serverMessages.SUCCESS,
                data: schedules,
            });
        });
    }
}

module.exports.scheduleCtrl = new ScheduleController(scheduleRepository);
