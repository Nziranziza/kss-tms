const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const locationSchema  = require('../../utils/schemas/location')

const meetingScheduleSchema = new Schema({
    meetingDay: { type: Number, enum: [1, 2, 3, 4, 5, 6] },
    meetingTime: { type: Date }
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
});


const Group = mongoose.model('group', groupSchema);
module.exports.Group = Group;
