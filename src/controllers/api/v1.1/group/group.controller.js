const {
  groupRepository
} = require('../../../../database/group/group.repository');
const BaseController = require('../../../../core/library/BaseController');

class GroupController extends BaseController {
  constructor(repository) {
    super(repository);
  }
}

module.exports.groupCtrl = new GroupController(groupRepository);
