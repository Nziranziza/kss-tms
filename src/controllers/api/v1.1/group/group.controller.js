const {
    groupRepository,
} = require("../../../../database/group/group.repository");
const BaseController = require("../../../../core/library/BaseController");
const asyncWrapper = require("../../../../core/helpers/asyncWrapper");
const responseWrapper = require("../../../../core/helpers/responseWrapper");
const {statusCodes} = require("../../../../utils/constants/common");
const excelJS = require("exceljs");
const appRoot = require('app-root-path');
const fs = require('fs');


class GroupController extends BaseController {
    constructor(repository) {
        super(repository);
        this.updateMembers = this.updateMembers.bind(this);
        this.updateProfile = this.updateProfile.bind(this);
        this.groupAttendance = this.groupAttendance.bind(this);
        this.searchGroup = this.searchGroup.bind(this);
        this.report = this.report.bind(this);
        this.downloadReport = this.downloadReport.bind(this);
        this.statistics = this.statistics.bind(this);
        this.updateSingleMember = this.updateSingleMember.bind(this);
    }

    updateMembers(req, res) {
        return asyncWrapper(res, async () => {
            const {body, params} = req;
            let group = await this.repository.findOne(params.id);
            if (group) {
                body._id = params.id;
                group = await this.repository.update(body);
                group.save();
            }
            return responseWrapper({
                res,
                status: statusCodes.OK,
                message: "Success",
                data: group,
            });
        });
    }

    find(req, res) {
        const {body} = req;
        return asyncWrapper(res, async () => {
            const data = await this.repository.find(body);
            return responseWrapper({
                res,
                status: statusCodes.OK,
                message: "Success",
                data,
            });
        });
    }

    updateSingleMember(req, res) {
        return asyncWrapper(res, async () => {
            const {body, params} = req;
            const member = await this.repository.getSingleMember(
                params.id,
                body.userId
            );
            if (member) {
                const update = await this.repository.updateMemberPhone(params.id, body);
                console.log(update);
                if (update)
                    return responseWrapper({
                        res,
                        status: statusCodes.OK,
                        message: "Success",
                    });
            }
            return responseWrapper({
                res,
                status: statusCodes.NOT_FOUND,
                message: "Member not found",
            });
        });
    }

    searchGroup(req, res) {
        const {body} = req;
        return asyncWrapper(res, async () => {
            const data = await this.repository.searchGroup(body.name);
            return responseWrapper({
                res,
                status: statusCodes.OK,
                message: "Success",
                data,
            });
        });
    }

    updateProfile(req, res) {
        return asyncWrapper(res, async () => {
            const {body, params} = req;
            let group = await this.repository.findOne(params.id);
            if (group) {
                body._id = params.id;
                group = await this.repository.update(body);
            }
            return responseWrapper({
                res,
                status: statusCodes.OK,
                message: "Success",
                data: group,
            });
        });
    }

    groupAttendance(req, res) {
        return asyncWrapper(res, async () => {
            const {params, body} = req;
            const group = await this.repository.findOne(params.id);
            if (!group)
                return responseWrapper({
                    res,
                    status: statusCodes.NOT_FOUND,
                    message: "Group not found",
                });

            const attendance = await this.repository.membersAttendance(
                group,
                body.trainingId
            );
            return responseWrapper({
                res,
                status: statusCodes.OK,
                message: "Success",
                data: attendance,
            });
        });
    }

    statistics(req, res) {
        return asyncWrapper(res, async () => {
            const {body} = req;
            const groups = await this.repository.statistics(body);
            return responseWrapper({
                res,
                status: statusCodes.OK,
                message: "Success",
                data: groups,
            });

        });
    }

    report(req, res) {
        return asyncWrapper(res, async () => {
            const {body} = req;
            const groups = await this.repository.report(body);
            return responseWrapper({
                res,
                status: statusCodes.OK,
                message: "Success",
                data: groups,
            });

        });
    }

    downloadReport(req, res) {
        return asyncWrapper(res, async () => {
            const {body} = req;
            const groups = await this.repository.report(body);
            const workbook = new excelJS.Workbook();
            const worksheet = workbook.addWorksheet("Groups");
            const path = `${appRoot}/files/downloads`;
            worksheet.columns = [
                {header: "Group name", key: "groupName", width: 10},
                {header: "Leader names", key: "leaderNames", width: 10},
                {header: "Leader phone number", key: "leaderPhoneNumber", width: 10},
                {header: "Group size", key: "Group size", width: 10},
                {header: "Location", key: "location", width: 10}
            ];
            groups.forEach((group) => {
                worksheet.addRow({
                    groupName: group.groupName,
                    leaderNames: group.leaderNames,
                    leaderPhoneNumber: group.leaderPhoneNumber,
                    groupSize: group.members.length,
                    location: group.location.prov_id.namek +
                        ' > ' + group.location.dist_id.name +
                        ' > ' + group.location.sect_id.name +
                        ' > ' + group.location.cell_id.name
                });
            });
            worksheet.getRow(1).eachCell((cell) => {
                cell.font = {bold: true};
            });
            const fileName = `${path}/${Date.now()}-groups.xlsx`;
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

        });
    }
}

module.exports.groupCtrl = new GroupController(groupRepository);
