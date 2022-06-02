const { validateApplication } = require('../application/application.validator');
const { validateGroup } = require('../group/group.validator');
const { validateMembers } = require('../members/members.validator');

// Validators will be accessed via a middleware

module.exports = {
    validateApplication,
    validateGroup,
    validateMembers
};