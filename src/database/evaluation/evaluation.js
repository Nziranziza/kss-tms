const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const timestamps = require("mongoose-timestamp");
const softDelete = require("../plugins/soft-delete");

const ANSWER = new mongoose.Schema({
  answer: { type: String, required: false },
  weight: { type: Number, required: false },
});

const QUESTIONS = new mongoose.Schema({
  question: { type: String, required: true },
  answerType: { type: String, required: true },
  answers: { type: [ANSWER], required: false },
  marks: { type: Number, required: false },
});

// Evaluation schema
const evaluationSchema = new Schema({
  name: { type: String },
  description: { type: String },
  questions: { type: [QUESTIONS], required: true },
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
