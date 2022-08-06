const asyncWrapper = require("../../../../core/helpers/asyncWrapper");
const BaseController = require("../../../../core/library/BaseController");
const responseWrapper = require("../../../../core/helpers/responseWrapper");
const {
    scheduleRepository,
} = require("../../../../database/schedule/schedule.repository");
const {statusCodes} = require("../../../../utils/constants/common");
const {sendAppSMS} = require("../../../../services/comm.service");
const excelJS = require("exceljs");
const appRoot = require("app-root-path");
const fs = require("fs");
const CustomError = require("../../../../core/helpers/customerError");
const {
    commRepo,
} = require("../../../../database/communication/communication.repository");
const {
    scheduleStatus,
    smsPurpose,
    receptionStatus,
} = require("../../../../tools/constants");


class ScheduleController extends BaseController {
    constructor(repository) {
        super(repository);
        this.findAllByRef = this.findAllByRef.bind(this);
        this.delete = this.delete.bind(this);
        this.recordAtt = this.recordAtt.bind(this);
        this.sendSMS = this.sendSMS.bind(this);
        this.report = this.report.bind(this);
        this.downloadReport = this.downloadReport.bind(this);
        this.statistics = this.statistics.bind(this);
        this.attendanceSummary = this.attendanceSummary.bind(this);
    }

    findAllByRef(req, res) {
        // const date = req.body;
        const body = {
            referenceId: req.params.id,
            // startTime: {
            //   $gte: new Date(`${date}T00:00:00.000Z`),
            //   $lt: new Date(`${date}T00:00:00.000Z`),
            // },
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
        const {params, body} = req;
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
        const {params, body} = req;
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

    statistics(req, res) {
        return asyncWrapper(res, async () => {
            const {body} = req;
            const schedules = await this.repository.statistics(body);
            return responseWrapper({
                res,
                status: statusCodes.OK,
                message: "Success",
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
                message: "Success",
                data: schedules,
            });
        });
    }

    downloadReport(req, res) {
        return asyncWrapper(res, async () => {
            const {body, params} = req;
            const type = params.type;
            const schedules = await this.repository.report(body);
            const workbook = new excelJS.Workbook();
            const worksheet = workbook.addWorksheet("Schedules");
            const path = `${appRoot}/files/downloads`;
            worksheet.columns = [
                {header: "Date added", key: "created_at", width: 10},
                {header: "Firstname", key: "foreName", width: 10},
                {header: "Lastname", key: "surname", width: 10},
                {header: "Gender", key: "gender", width: 10},
                {header: "Training title", key: "trainingName", width: 10},
                {header: "Date of the training", key: "startTime", width: 10},
                {header: "Venue", key: "venue", width: 10},
                {header: "Attended", key: "attendance", width: 10},
                {header: "Status", key: "status", width: 10}
            ];
            schedules.forEach((schedule) => {
                worksheet.addRow({
                    created_at: schedule.created_at,
                    foreName: schedule.trainees.foreName,
                    surname: schedule.trainees.surname,
                    gender: schedule.trainees.gender,
                    trainingName: schedule.trainingId.trainingName,
                    startTime: schedule.startTime,
                    venue: schedule.venue,
                    attended: schedule.trainees.attended,
                    status: schedule.status
                });
            });
            worksheet.getRow(1).eachCell((cell) => {
                cell.font = {bold: true};
            });

            if (type === 'xlsx') {
                const fileName = `${path}/${Date.now()}-trainings.xlsx`;
                await workbook.xlsx.writeFile(fileName)
                    .then(() => {
                        const str = fs.readFileSync(fileName, {encoding: 'base64'});
                        return responseWrapper({
                            res,
                            status: statusCodes.OK,
                            message: "Success",
                            data: {
                                file: str,
                                type: 'xlsx'
                            }
                        });
                    });
            } else if (type === 'csv') {
                const fileName = `${path}/${Date.now()}-trainings.csv`;
                await workbook.csv.writeFile(fileName)
                    .then(() => {
                        const str = fs.readFileSync(fileName, {encoding: 'base64'});
                        return responseWrapper({
                            res,
                            status: statusCodes.OK,
                            message: "Success",
                            data: {
                                file: str,
                                type: 'csv'
                            }
                        });
                    });
            } else {
                throw new CustomError("File type not found", statusCodes.NOT_FOUND);
            }
        });
    }
}

module.exports.scheduleCtrl = new ScheduleController(scheduleRepository);
