const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const timestamps = require("mongoose-timestamp");
const softDelete = require("../plugins/soft-delete");

const ANSWER = new mongoose.Schema({
  answer: { type: String, required: false },
  description: { type: String },
  weight: { type: Number },
  is_not_applicable: { type: Boolean, default: false },
});

const QUESTIONS = new mongoose.Schema({
  question: { type: String, required: true },
  description: { type: String },
  question_type: { type: String, required: true },
  weight: { type: Number },
  answers: { type: [ANSWER], required: false },
  is_not_applicable: { type: Boolean, default: false },
});

const SECTIONS = new mongoose.Schema({
  section_name: { type: String, required: true },
  questions: { type: [QUESTIONS], required: false },
});

// Evaluation schema
const evaluationSchema = new Schema({
  baselineRate: { type: Number },
  gap_name: { type: String, required: true },
  gap_weight: { type: Number, required: true },
  gap_score: { type: Number, required: true },
  picture_text: { type: String, required: true },
  sections: { type: [SECTIONS], required: true },
  status: {type: String, default: 'active'},
  applicationId: { type: Number, required: true },
});

// auto-assigned to the most recent create/update timestamp

evaluationSchema.plugin(timestamps, {
  createdAt: "createdAt",
  updatedAt: "updatedAt",
});

evaluationSchema.plugin(softDelete);

const Evaluation = mongoose.model("evaluation", evaluationSchema);
module.exports.Evaluation = Evaluation;
