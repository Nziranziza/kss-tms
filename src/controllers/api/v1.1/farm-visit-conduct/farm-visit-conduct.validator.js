let Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const ownerSchema = Joi.object({
  userId: Joi.objectId().required().label("user id"),
  firstName: Joi.string().label("first name"),
  lastName: Joi.string().label("last name"),
  regNumber: Joi.string().label("reg number"),
  nid: Joi.string(),
  email: Joi.string(),
  sex: Joi.string(),
  groupName: Joi.string().label("group name"),
  groupContactPersonNames: Joi.string().label("group contact person names"),
  groupContactPersonPhoneNumber: Joi.string().label(
    "group contact person phone number"
  ),
  phoneNumber: Joi.string().label("phone number"),
  organisationName: Joi.string().label("organization name"),
});

module.exports.validateFarmVisitConduct = Joi.object({
  farm: Joi.object({
    farmId: Joi.objectId().required().label("farm id"),
    location: Joi.object({
      prov_id: Joi.objectId().required().label("province"),
      dist_id: Joi.objectId().required().label("district"),
      sect_id: Joi.objectId().required().label("sector"),
      cell_id: Joi.objectId().required().label("cell"),
      village_id: Joi.objectId().required().label("village"),
    }).required(),
    upiNumber: Joi.string(),
  }),
  visitor: ownerSchema,
  owner: ownerSchema,
  gap: Joi.objectId().required().label("gap"),
  reference: Joi.string().trim(),
  groupId: Joi.objectId().required().label("group"),
  scheduleId: Joi.objectId(),
  photos: Joi.array().items(Joi.string()),
  evaluation: Joi.array().items(
    Joi.object({
      sectionId: Joi.objectId(),
      questions: Joi.array().items({
        questionId: Joi.objectId(),
        score: Joi.number(),
        selected: Joi.boolean(),
        text: Joi.string(),
        answers: Joi.array().items(
          Joi.object({
            answerId: Joi.string(),
            selected: Joi.boolean(),
            text: Joi.string(),
            score: Joi.number(),
          })
        ),
      }),
    })
  ),
});
