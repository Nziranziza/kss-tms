const {applications} = require("./application/application.routes");
const {groups} = require("./group/group.routes");
const {evaluations} = require("./evaluations/evaluations.routes");
const {trainings} = require("./trainings/trainings.routes");
const v1_1 = require("express").Router();

v1_1.use("/applications", applications);
v1_1.use("/groups", groups);
v1_1.use("/evaluations", evaluations);
v1_1.use("/trainings", trainings)

module.exports = v1_1;
