const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const timestamps = require("mongoose-timestamp");
const softDelete = require("database/plugins/soft-delete");
const locationSchema = require("utils/schemas/location");
const { scheduleStatus, receptionStatus } = require("tools/constants");

const TRAINEE = new mongoose.Schema({
  userId: { type: String, required: true },
  foreName: { type: String, required: true },
  surName: { type: String, required: true },
  phoneNumber: { type: String },
  gender: { type: String, required: true },
  groupId: { type: String, required: true },
  attended: { type: Boolean, required: true, default: false },
  regNumber: { type: String, required: true },
  smsStatus: {
    type: String,
    required: true,
    default: receptionStatus.NOT_SENT,
  },
});

const TRAINER = new mongoose.Schema({
  userId: { type: Schema.Types.ObjectId, required: true },
  fullName: { type: String, required: true },
  phoneNumber: { type: String },
  organisationName: { type: String, required: true }
});

const MESSAGE = new mongoose.Schema({
  message: { type: String, required: true },
  validPhones: { type: [String] },
  InvalidPhones: { type: [String] },
  batch_id: { type: String },
});

MESSAGE.plugin(timestamps, {
  createdAt: "createdAt",
  updatedAt: "updatedAt",
});

// schedule schema
const scheduleSchema = new Schema({
  trainingId: { type: Schema.Types.ObjectId, ref: "training", required: true },
  trainer: { type: TRAINER },
  groupId: { type: Schema.Types.ObjectId, ref: "group", required: true },
  referenceId: { type: Schema.Types.ObjectId },
  description: { type: String, required: true },
  location: { type: locationSchema, required: true },
  venueName: { type: String },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  trainees: { type: [TRAINEE], required: true },
  notes: { type: String },
  lastUpdatedBy: { type: TRAINER },
  smsResponse: { type: [MESSAGE] },
  status: { type: String, default: scheduleStatus.PENDING, required: true },
  applicationId: { type: Number, required: true },
});

// auto-assigned to the most recent create/update timestamp

scheduleSchema.plugin(timestamps, {
  createdAt: "createdAt",
  updatedAt: "updatedAt",
});

scheduleSchema.plugin(softDelete);

const Schedule = mongoose.model("schedule", scheduleSchema);
module.exports.Schedule = Schedule;
