const asyncWrapper = require("../../../../core/helpers/asyncWrapper");
const BaseController = require("../../../../core/library/BaseController");
const responseWrapper = require("../../../../core/helpers/responseWrapper");
const {
    scheduleRepository,
} = require("../../../../database/schedule/schedule.repository");
const {statusCodes} = require("../../../../utils/constants/common");
const {sendClientSMS} = require("../../../../services/comm.service");
const excelJS = require("exceljs");
const appRoot = require("app-root-path");
const fs = require("fs");
const CustomError = require("../../../../core/helpers/customerError");
const {
    scheduleStatus,
    receptionStatus,
} = require("../../../../tools/constants");
const moment = require("moment");
const ejs = require("ejs");
const _path = require("path");
const pdf = require("html-pdf");

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
        this.getFarmerAttendance = this.getFarmerAttendance.bind(this);
        this.editAtt = this.editAtt.bind(this);
    }


    findAllByRef(req, res) {
        const {from, to} = req.query;
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
                    startTime: {$gte: startDate, $lt: endDate},
                }),
        };
        return asyncWrapper(res, async () => {
            const data = await this.repository.customFindAll(body);
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
            const data = await this.repository.findOne(req.params.id);
            if (data.status === scheduleStatus.HAPPENED)
                return responseWrapper({
                    res,
                    status: statusCodes.FORBIDDEN,
                    message: "Cannot delete a conducted training.",
                });

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
            const schedule = await this.repository.findOne(params.id);
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
            const schedule = await this.repository.findOne(params.id);
            // Build recipients
            let recipients = [];
            for (const trainee of schedule.trainees) {
                // If no phonenumber don't add user to recipients
                if (trainee.phoneNumber && trainee.smsStatus !== receptionStatus.DELIVERED) {
                    recipients.push(trainee.phoneNumber);
                    trainee.smsStatus = receptionStatus.QUEUED;
                }
            }

            const data = {
                recipients: recipients,
                message,
                sender: body.sender,
                ext_sender_id: body.sender_id,
            };

            console.log(data);

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
                console.log(sms.response.data);
                return responseWrapper({
                    res,
                    status: sms.response.data.status,
                    message: sms.response.data.message,
                });
            } else {
                console.log(sms);
                return responseWrapper({
                    res,
                    status: statusCodes.SERVER_ERROR,
                    message: "Could not send messages",
                });
            }

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


    getFarmerAttendance(req, res) {
        return asyncWrapper(res, async () => {
            const {params} = req;
            const schedules = await this.repository.farmerAttendance(params);
            console.log(schedules);
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
                {header: "Firstname", key: "forename", width: 10},
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
                    created_at: schedule.createdAt,
                    forename: schedule.trainees.foreName,
                    surname: schedule.trainees.surName,
                    gender: schedule.trainees.gender,
                    trainingName: schedule.trainingId.trainingName,
                    startTime: schedule.startTime,
                    venue: schedule.venueName,
                    attendance: schedule.trainees.attended,
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
            } else if (type === 'pdf') {
                ejs.renderFile(
                    _path.join(__dirname, '/../../../../templates/', 'trainings_report.ejs'),
                    {schedules: schedules},
                    (err, data) => {
                        if (err) {
                            console.log(err);
                            return err;
                        } else {
                            let options = {
                                height: '11.25in',
                                width: '10in',
                                header: {
                                    height: '20mm'
                                },
                                footer: {
                                    height: '20mm'
                                }
                            };
                            const fileName = `${path}/${Date.now()}-schedules_report.pdf`;
                            pdf.create(data, options).toFile(fileName, function (err, data) {
                                if (err) {
                                    console.log(err)
                                    return err;
                                } else {
                                    const str = fs.readFileSync(fileName, {encoding: "base64"});
                                    console.log(str);
                                    return responseWrapper({
                                        res,
                                        status: statusCodes.OK,
                                        message: "Success",
                                        data: {
                                            file: str,
                                            type: "pdf",
                                        },
                                    });
                                }
                            });
                        }
                    }
                );

            } else {
                throw new CustomError("File type not found", statusCodes.NOT_FOUND);
            }
        });
    }
}

module.exports.scheduleCtrl = new ScheduleController(scheduleRepository);
