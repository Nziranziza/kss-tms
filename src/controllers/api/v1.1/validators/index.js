const {validateApplication} = require("controllers/api/v1.1/application/application.validator");
const {
    validateGroup,
    validateUpdateMembers,
    validateUpdateProfile,
    validateGetMemberAttendance
} = require("controllers/api/v1.1/group/group.validator");
const {validateFarmVisitConduct} = require("controllers/api/v1.1/farm-visit-conduct/farm-visit-conduct.validator");
const {validateEvaluation} = require("controllers/api/v1.1/evaluations/evaluations.validator");
const {
    validateTraining,
    validateUpdateTraining,
} = require("controllers/api/v1.1/trainings/trainings.validator");
const {
    validateSchedule,
    validateUpdateSchedule,
    validateRecordAtt,
    validateEditAtt,
    validateStats,
    validateFilterSchedule
} = require("controllers/api/v1.1/schedule/schedule.validator");
const {
    validateFarmVisitSchedule,
    validateVisitStats
} = require("controllers/api/v1.1/farm-visit-schedule/farm-visit-schedule.validator");


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
    validateRecordAtt,
    validateEditAtt,
    validateStats,
    validateFilterSchedule,
    validateVisitStats,
    validateUpdateSchedule
};
