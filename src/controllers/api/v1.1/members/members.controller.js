const {
  membersRepository
} = require('../../../../database/members/members.repository');
const BaseController = require('../../../../core/library/BaseController');

class MembersController extends BaseController {
  constructor(repository) {
    super(repository);
  }
}

module.exports.membersCtrl = new MembersController(membersRepository);
