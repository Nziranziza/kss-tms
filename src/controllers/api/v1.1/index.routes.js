const { applications } = require("./application/application.routes");
const { groups } = require("./group/group.routes");
const { members } = require("./members/members.routes");
const { evaluations } = require("./evaluations/evaluations.routes");
const v1_1 = require("express").Router();

v1_1.use("/applications", applications);
v1_1.use("/groups", groups);
v1_1.use("/members", members);
v1_1.use("/evaluations", evaluations);

module.exports = v1_1;
