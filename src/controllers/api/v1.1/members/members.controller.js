const {
  membersRepository
} = require('../../../../database/members/members.repository');
const BaseController = require('../../../../core/library/BaseController');
const asyncWrapper = require("../../../../core/helpers/asyncWrapper");
const responseWrapper = require("../../../../core/helpers/responseWrapper");
const { statusCodes } = require("../../../../utils/constants/common");

class MembersController extends BaseController {
  constructor(repository) {
    super(repository);
    this.findMembersByGroup = this.findMembersByGroup.bind(this);
    this.updateMembersByGroup = this.updateMembersByGroup.bind(this);
  }
  findMembersByGroup(req, res) {
    const  body  = { groupId: req.params.id };
    return asyncWrapper(res, async () => {
      const data = await this.repository.customFindOne(body);
      return responseWrapper({
        res,
        status: statusCodes.OK,
        message: 'Success',
        data
      });
    });
  }
  updateMembersByGroup(req, res) {
    const  query  = { groupId: req.params.id };
    return asyncWrapper(res, async () => {
      const group = await this.repository.customFindOne(query);
      group.members = req.body.members;
      await group.save();
      return responseWrapper({
        res,
        status: statusCodes.OK,
        message: 'Success',
        data: group
      });
    });
  }
}

module.exports.membersCtrl = new MembersController(membersRepository);
