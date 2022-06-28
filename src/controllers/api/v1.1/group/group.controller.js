const {
    groupRepository,
} = require("../../../../database/group/group.repository");
const BaseController = require("../../../../core/library/BaseController");
const asyncWrapper = require("../../../../core/helpers/asyncWrapper");
const responseWrapper = require("../../../../core/helpers/responseWrapper");
const {statusCodes} = require("../../../../utils/constants/common");

class GroupController extends BaseController {

    constructor(repository) {
        super(repository);
        this.updateMembers = this.updateMembers.bind(this);
        this.updateProfile = this.updateProfile.bind(this);
        this.groupAttendance = this.groupAttendance.bind(this);
        this.searchGroup = this.searchGroup.bind(this);
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
                message: 'Success',
                data: group
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
}

module.exports.groupCtrl = new GroupController(groupRepository);
