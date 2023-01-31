const asyncWrapper = require("core/helpers/asyncWrapper");
const {ObjectId} = require("mongodb");
const {groupRepository} = require("database/group/group.repository");
const {statusCodes} = require("utils/constants/common");
const CustomError = require("core/helpers/customerError");

module.exports.validateMembers = function (req, res, next) {
    return asyncWrapper(res, async () => {
        const {body, params} = req;
        const {members} = body;
        /**
         * Check if the user does not
         * have a group already
         */
        if (members?.length) {
            for (const member of members) {
                const group = await groupRepository.findOne(
                    {
                        'members.userId': member.userId,
                        ...(params.id && {_id: {$ne: ObjectId(params.id)}})
                    });
                if (group) {
                    throw new CustomError(
                        `${member.firstName || member.groupName} ${member.lastName || ''} already belongs to a group`,
                        statusCodes.BAD_REQUEST
                    );
                }
            }
        }

        next()
    });
};