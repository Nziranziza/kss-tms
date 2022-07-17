const {validateApplication} = require("../application/application.validator");
const {validateGroup, validateUpdateMembers, validateUpdateProfile, validateGetMemberAttendance} = require("../group/group.validator");
const {validateEvaluation} = require("../evaluations/evaluations.validator");
const {validateTraining, validateUpdateTraining} = require("../trainings/trainings.validator");
const {validateSchedule, validateRecordAtt} = require("../schedule/schedule.validator");
const {validateFarmVisitSchedule} = require("../farm-visit-schedule/farm-visit-schedule.validator");
const {validateFarmVisitConduct} = require("../farm-visit-conduct/farm-visit-conduct.validator");

// Validators will be accessed via a middleware

module.exports = {
    validateApplication,
    validateGroup,
    validateEvaluation,
    validateTraining,
    validateUpdateMembers,
    validateUpdateProfile,
    validateUpdateTraining,
    validateFarmVisitSchedule,
    validateFarmVisitConduct,
    validateSchedule, 
    validateGetMemberAttendance,
    validateRecordAtt
};
