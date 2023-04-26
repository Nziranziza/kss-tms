const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const timestamps = require("mongoose-timestamp");
const locationSchema  = require('utils/schemas/location');
const softDelete = require("database/plugins/soft-delete");
const { receptionStatus } = require("tools/constants")

const ownerSchema = new Schema({
    userId: {type: Schema.Types.ObjectId},
    firstName: {type: String},
    lastName: {type: String},
    sex: {type: String},
    regNumber: {type: String},
    nid: {type: String},
    groupName: {type: String},
    groupContactPersonNames: {type: String},
    groupContactPersonPhoneNumber: {type: String},
    phoneNumber: {type: String},
    organisationName: {type: String}
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

const farmerSchema = new Schema({
    userId: {type: Schema.Types.ObjectId},
    firstName: {type: String},
    lastName: {type: String},
    sex: {type: String},
    regNumber: {type: String},
    nid: {type: String},
    groupName: {type: String},
    groupContactPersonNames: {type: String},
    groupContactPersonPhoneNumber: {type: String},
    phoneNumber: {type: String},
    organisationName: {type: String},
    smsStatus: {
        type: String,
        required: true,
        default: receptionStatus.NOT_SENT,
      },
});

const expectedDurationSchema = new Schema({
    from: { type: String },
    to: { type: String }
});

const evaluationGap = new  Schema({
    gap_id: {type: Schema.Types.ObjectId},
    conduct_id: {type: Schema.Types.ObjectId},
    photos: {type: [String]},
    overall_weight: {type: Number},
    overall_score: {type: Number}
});

const farmSchema = new Schema({
    farmId: {type: Schema.Types.ObjectId, },
    location: { type: locationSchema, required: true },
    upiNumber: {type: String},
    owner: {type: ownerSchema},
    evaluatedGaps: {type: [evaluationGap]}
});

// Farm visit schema
const farmVisitScheduleSchema = new Schema({
    gaps: [{type: Schema.Types.ObjectId,  ref: "evaluation"}],
    description: {type: String, required: true},
    date: {type: Date, required: true},
    visitor:  {type: ownerSchema},
    applicationId: {type: Number, required: true},
    reference: {type: String},
    farms: {type: [farmSchema]},
    farmers: { type: [farmerSchema]},
    groupId: {type: Schema.Types.ObjectId, ref: "group"},
    status: {type: Number},
    observation: {type: String},
    expectedDuration: {type: expectedDurationSchema},
    smsResponse: { type: [MESSAGE] },
});

farmVisitScheduleSchema.plugin(timestamps, {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
});

farmVisitScheduleSchema.plugin(softDelete);

const FarmVisitSchedule = mongoose.model('farm_visit_schedule', farmVisitScheduleSchema);
module.exports.FarmVisitSchedule = FarmVisitSchedule;
