let Joi = require("joi").extend(require("@joi/date"));
Joi.objectId = require("joi-objectid")(Joi);

const ownerSchema = Joi.object({
  userId: Joi.objectId().required().label("user id"),
  firstName: Joi.string().label("first name"),
  lastName: Joi.string().label("last name"),
  regNumber: Joi.string().label("reg number"),
  nid: Joi.string(),
  sex: Joi.string(),
  email: Joi.string(),
  groupName: Joi.string().label("group name"),
  groupContactPersonNames: Joi.string().label("group contact person names"),
  groupContactPersonPhoneNumber: Joi.string().label(
    "group contact person phone number"
  ),
  phoneNumber: Joi.string().label("phone number"),
  organisationName: Joi.string().label("organisation name"),
});

module.exports.validateFarmVisitSchedule = Joi.object({
  description: Joi.string().required().trim(),
  expectedDuration: Joi.object({
    from: Joi.string(),
    to: Joi.string(),
  }),
  observation: Joi.string(),
  date: Joi.date(),
  farms: Joi.array()
    .min(1)
    .max(35)
    .items(
      Joi.object({
        farmId: Joi.objectId().required().label("farm id"),
        location: Joi.object({
          prov_id: Joi.objectId().required().label("province"),
          dist_id: Joi.objectId().required().label("district"),
          sect_id: Joi.objectId().required().label("sector"),
          cell_id: Joi.objectId().required().label("cell"),
          village_id: Joi.objectId().required().label("village"),
        }).required(),
        upiNumber: Joi.string().allow(null, ""),
        owner: ownerSchema,
      })
    ),
  visitor: ownerSchema,
  gaps: Joi.array()
    .min(1)
    .max(35)
    .items(Joi.objectId().required().label("gap"))
    .unique(),
  reference: Joi.string().trim(),
  groupId: Joi.objectId().required().label("group"),
});

module.exports.validateVisitStats = Joi.object({
  referenceId: Joi.objectId(),
  visitorId: Joi.objectId(),
  location: Joi.object({
    searchBy: Joi.string()
      .valid("prov_id", "dist_id", "sect_id", "cell_id", "village_id")
      .required(),
    locationId: Joi.objectId().required(),
  }),
  date: Joi.object({
    from: Joi.date().format("YYYY-MM-DD").required(),
    to: Joi.date().format("YYYY-MM-DD").required(),
  }),
});

