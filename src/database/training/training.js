const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const timestamps = require("mongoose-timestamp");
const softDelete = require("../plugins/soft-delete");

const MATERIAL = new mongoose.Schema({
  fileName: { type: String, required: true },
  url: { type: String, required: true },
});

// Training schema
const trainingSchema = new Schema({
  trainingName: { type: String },
  adoptionGap: { type: String },
  description: { type: String, required: true },
  materials: { type: [MATERIAL], required: true },
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
