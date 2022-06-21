const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const timestamps = require("mongoose-timestamp");
const softDelete = require("../plugins/soft-delete");
const locationSchema = require("../../utils/schemas/location");

const TRAINEE = new mongoose.Schema({
  userId: { type: String, required: true },
  foreName: { type: String, required: true },
  surName: { type: String, required: true },
  phoneNumber: { type: String },
  gender: { type: String, required: true },
  regNumber: { type: String, required: true },
});

// schedule schema
const scheduleSchema = new Schema({
  trainingId: { type: Schema.Types.ObjectId, ref: "training" },
  trainerId: { type: Schema.Types.ObjectId },
  referenceId: { type: Schema.Types.ObjectId },
  description: { type: String, required: true },
  location: { type: locationSchema },
  venueName: { type: String },
  startTime: { type: Date },
  endTime: { type: Date },
  trainees: { type: [TRAINEE], required: true },
  applicationId: { type: Number },
});

// auto-assigned to the most recent create/update timestamp

scheduleSchema.plugin(timestamps, {
  createdAt: "createdAt",
  updatedAt: "updatedAt",
});

scheduleSchema.plugin(softDelete);

const Schedule = mongoose.model("schedule", scheduleSchema);
module.exports.Schedule = Schedule;
