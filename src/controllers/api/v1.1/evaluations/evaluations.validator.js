const Joi = require("joi");

module.exports.validateEvaluation = Joi.object({
  gap_name: Joi.string().required(),
  gap_weight: Joi.number().required(),
  gap_score: Joi.number().required(),
  picture_text: Joi.string().required(),
  sections: Joi.array()
    .items(
      Joi.object({
        section_name: Joi.string().required(),
        questions: Joi.array()
          .items(
            Joi.object({
              question: Joi.string().required(),
              description: Joi.string(),
              question_type: Joi.string().required(),
              weight: Joi.number().required(),
              is_not_applicable: Joi.boolean().required(),
              answers: Joi.array().items(
                Joi.object({
                  answer: Joi.string().required(),
                  description: Joi.string(),
                  weight: Joi.number().required(),
                  is_not_applicable: Joi.boolean().required(),
                })
              ),
            })
          )
          .required(),
      })
    )
    .required(),
});
