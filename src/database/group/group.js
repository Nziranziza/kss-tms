const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const locationSchema  = require('../../utils/schemas/location')

// Group schema
const groupSchema = new Schema({
    groupName: { type: String},
    leaderNames: { type: String},
    leaderPhoneNumber: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: locationSchema, required: true },
    meetingSchedule: { type: Date, required: true },
    applicationId: { type: Number, required: true },
    reference: { type: String },
});


const Group = mongoose.model('group', groupSchema);
module.exports.Group = Group;
