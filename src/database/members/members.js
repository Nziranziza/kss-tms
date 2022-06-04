const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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

// Members schema
const membersSchema = new Schema({
    groupId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'group',
        index: true,
        unique: true
    },
    members: {type: [memberSchema], required: true},
    applicationId: { type: Number, required: true }
});


const Members = mongoose.model('members', membersSchema);
module.exports.Members = Members;
