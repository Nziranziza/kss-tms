const Joi = require("@hapi/joi");

const validateEvaluation = (data) => {
  const schema = {
    name: Joi.string().required(),
    description: Joi.string().required().trim(),
    questions: Joi.array()
      .items(
        Joi.object({
          question: Joi.string(),
          answerType: Joi.string(),
          marks: Joi.number(),
          answers: Joi.array().items(
            Joi.object({ answer: Joi.string(), weight: Joi.number() })
          ),
        })
      )
      .required(),
    applicationId: Joi.number().required(),
  };
  return Joi.validate(data, schema);
};

module.exports.validateEvaluation = validateEvaluation;
