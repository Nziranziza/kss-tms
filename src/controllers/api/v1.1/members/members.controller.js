const {
  membersRepository
} = require('../../../../database/members/members.repository');
const BaseController = require('../../../../core/library/BaseController');
const asyncWrapper = require("../../../../core/library/helpers/asyncWrapper");
const responseWrapper = require("../../../../core/library/helpers/responseWrapper");
const { statusCodes } = require("../../../../utils/constants/common");

class MembersController extends BaseController {
  constructor(repository) {
    super(repository);
    this.findOneByGroup = this.findOneByGroup.bind(this);
  }
  findOneByGroup(req, res) {
    const  body  = { groupId: req.params.id };
    return asyncWrapper(res, async () => {
      console.log(body);
      const data = await this.repository.customFindOne(body);
      return responseWrapper({
        res,
        status: statusCodes.OK,
        message: 'Success',
        data
      });
    });
  }
}

module.exports.membersCtrl = new MembersController(membersRepository);
