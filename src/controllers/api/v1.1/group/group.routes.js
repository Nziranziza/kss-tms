const Router = require("express").Router;
const { groupCtrl } = require("./group.controller");
const { validateMembers } = require("./group.middlewares");
const validator = require("middlewares/validator");

const routes = Router();

routes.post("/", validator("validateGroup"), validateMembers, groupCtrl.create);
routes.put("/:id", validateMembers, groupCtrl.update);
routes.get("/:id", groupCtrl.findById);
routes.delete("/:id", groupCtrl.softDelete);
routes.post("/reference", groupCtrl.find);
routes.post('/search', groupCtrl.searchGroup);
routes.post('/report', groupCtrl.report);
routes.post('/statistics', groupCtrl.statistics);
routes.get('/', groupCtrl.find);
routes.get('/member/:id', groupCtrl.findMemberGroup);
routes.put(
  "/members/:id",validator("validateUpdateMembers"), validateMembers,
  groupCtrl.updateMembers
);
routes.put(
  "/member/profile/:id",
  groupCtrl.updateSingleMember
);
routes.put(
  "/profile/:id",
  validator("validateUpdateProfile"),
  groupCtrl.updateProfile
);
routes.post(
  "/attendance/:id",
  validator("validateGetMemberAttendance"),
  groupCtrl.groupAttendance
);

module.exports.groups = routes;
