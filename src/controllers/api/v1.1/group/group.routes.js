const Router = require("express").Router;
const { groupCtrl } = require("./group.controller");
const validator = require("../../../../middlewares/validator");

const routes = Router();
routes.post("/", validator("validateGroup"), groupCtrl.create);
routes.put("/:id", groupCtrl.update);
routes.get("/:id", groupCtrl.findOne);
routes.delete("/:id", groupCtrl.softDelete);
routes.post("/reference", groupCtrl.find);
routes.post('/search', groupCtrl.searchGroup);
routes.get("/", groupCtrl.findAll);
routes.put(
  "/members/:id",
  validator("validateUpdateMembers"),
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
