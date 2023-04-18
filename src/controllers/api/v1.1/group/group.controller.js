const {
    groupRepository,
} = require("database/group/group.repository");
const BaseController = require("core/library/BaseController");
const asyncWrapper = require("core/helpers/asyncWrapper");
const responseWrapper = require("core/helpers/responseWrapper");
const {statusCodes} = require("utils/constants/common");


class GroupController extends BaseController {
    constructor(repository) {
        super(repository);
        this.updateMembers = this.updateMembers.bind(this);
        this.updateProfile = this.updateProfile.bind(this);
        this.groupAttendance = this.groupAttendance.bind(this);
        this.searchGroup = this.searchGroup.bind(this);
        this.report = this.report.bind(this);
        this.statistics = this.statistics.bind(this);
        this.updateSingleMember = this.updateSingleMember.bind(this);
        this.findMemberGroup = this.findMemberGroup.bind(this);
    }

    updateMembers(req, res) {
        return asyncWrapper(res, async () => {
            const {body, params} = req;
            let group = await this.repository.findById(params.id);
            if (!group) {
                return responseWrapper({
                    res,
                    status: statusCodes.NOT_FOUND,
                    message: 'Can not update members, group not found'
                })
            }
            group = await this.repository.update(params.id, body);
            group.save();
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

    searchGroup(req, res) {
        const {body} = req;
        return asyncWrapper(res, async () => {
            const data = await this.repository.searchGroup(body.name);
            if (data)
                return responseWrapper({
                    res,
                    status: statusCodes.OK,
                    message: "Success",
                    data,
                });
            else
                return responseWrapper({
                    res,
                    status: statusCodes.NOT_FOUND,
                    message: "Group not found",
                });
        });
    }

    updateSingleMember(req, res) {
        return asyncWrapper(res, async () => {
            const {body, params} = req;
            const member = await this.repository.getSingleMember(
                body.userId,
                params.id
            );
            if (member) {
                const update = await this.repository.updateMemberPhone(params.id, body);
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

    findMemberGroup(req, res) {
        return asyncWrapper(res, async () => {
            const {params} = req;
            const group = await this.repository.findOne({"members.userId": params.id});
            return responseWrapper({
                res,
                status: statusCodes.OK,
                message: "Success",
                data: group,
            });
        });
    }

    updateProfile(req, res) {
        return asyncWrapper(res, async () => {
            const {body, params} = req;
            let group = await this.repository.findById(params.id);
            if (group) {
                group = await this.repository.update(params.id, body);
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
            const group = await this.repository.findById(params.id);
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
}

module.exports.groupCtrl = new GroupController(groupRepository);
