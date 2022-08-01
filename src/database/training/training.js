const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const timestamps = require("mongoose-timestamp");
const { trainingStatus } = require('../../tools/constants');
const softDelete = require("../plugins/soft-delete");

const MATERIAL = new mongoose.Schema({
  fileName: { type: String, required: true },
  url: { type: String, required: true },
});

// Training schema
const trainingSchema = new Schema({
  trainingName: { type: String },
  adoptionGaps: [{ type: Schema.Types.ObjectId, ref: "evaluation" }],
  description: { type: String, required: true },
  materials: { type: [MATERIAL], required: true },
  status: {type: String, default: trainingStatus.NOT_SCHEDULED, required: true},
  applicationId: { type: Number, required: true },
});

// auto-assigned to the most recent create/update timestamp

trainingSchema.plugin(timestamps, {
  createdAt: "createdAt",
  updatedAt: "updatedAt",
});

trainingSchema.plugin(softDelete);

const Training = mongoose.model("training", trainingSchema);
module.exports.Training = Training;
