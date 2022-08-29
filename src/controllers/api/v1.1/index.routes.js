const {applications} = require("./application/application.routes");
const {groups} = require("./group/group.routes");
const {evaluations} = require("./evaluations/evaluations.routes");
const {trainings} = require("./trainings/trainings.routes");
const {schedules} = require("./schedule/schedule.routes");
const {farmVisitSchedules} = require("./farm-visit-schedule/farm-visit-schedule.routes");
const {farmVisitConducts} = require("./farm-visit-conduct/farm-visit-conduct.routes");
const { communication } = require('./communication/communication.routes');
const v1_1 = require("express").Router();

v1_1.use("/applications", applications);
v1_1.use("/groups", groups);
v1_1.use("/evaluations", evaluations);
v1_1.use("/trainings", trainings);
v1_1.use("/schedules", schedules);
v1_1.use("/farm-visit-schedules", farmVisitSchedules);
v1_1.use("/farm-visit-conducts", farmVisitConducts);
v1_1.use("/sms", communication);

module.exports = v1_1;
