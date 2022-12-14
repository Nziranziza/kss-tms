const express = require("express");

const { applications } = require("./application/application.routes");
const { groups } = require("./group/group.routes");
const { evaluations } = require("./evaluations/evaluations.routes");
const { trainings } = require("./trainings/trainings.routes");
const { schedules } = require("./schedule/schedule.routes");
const {
  farmVisitSchedules,
} = require("./farm-visit-schedule/farm-visit-schedule.routes");
const {
  farmVisitConducts,
} = require("./farm-visit-conduct/farm-visit-conduct.routes");
const { communication } = require("./communication/communication.routes");
const { dashboard } = require("./dashboard/dashboard.routes");

const router = express.Router();

router.use("/applications", applications);
router.use("/groups", groups);
router.use("/evaluations", evaluations);
router.use("/trainings", trainings);
router.use("/schedules", schedules);
router.use("/farm-visit-schedules", farmVisitSchedules);
router.use("/farm-visit-conducts", farmVisitConducts);
router.use("/sms", communication);
router.use("/dashboard", dashboard);

module.exports = router;
