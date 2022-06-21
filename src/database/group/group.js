const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const locationSchema  = require('../../utils/schemas/location')
const timestamps = require("mongoose-timestamp");

const meetingScheduleSchema = new Schema({
    meetingDay: { type: Number, enum: [1, 2, 3, 4, 5, 6] },
    meetingTime: { type: Date }
});

const memberSchema = new Schema({
    userId: {type: Schema.Types.ObjectId},
    firstName: {type: String},
    lastName: {type: String},
    sex:{type:String},
    regNumber: {type: String},
    nid: {type: String},
    groupName: {type: String},
    groupContactPersonNames: {type: String},
    groupContactPersonPhoneNumber: {type: String},
    phoneNumber: {type: String}
});

// Group schema
const groupSchema = new Schema({
    groupName: { type: String},
    leaderNames: { type: String},
    leaderPhoneNumber: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: locationSchema, required: true },
    meetingSchedule: { type: meetingScheduleSchema },
    applicationId: { type: Number, required: true },
    reference: { type: String },
    members: {type: [memberSchema], required: true},
});

groupSchema.plugin(timestamps, {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
});


const Group = mongoose.model('group', groupSchema);
module.exports.Group = Group;
