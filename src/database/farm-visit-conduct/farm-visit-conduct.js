const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const timestamps = require("mongoose-timestamp");
const locationSchema  = require('../../utils/schemas/location');
const softDelete = require("../plugins/soft-delete");

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


const answerSchema = new Schema({
    answerId: {type: Schema.Types.ObjectId},
    selected: {type: Boolean},
    text: {type: String},
    score: {type: Number}
});

const evaluationSchema = new Schema({
    questionId: {type: Schema.Types.ObjectId},
    score: {type: Number},
    answers: {type: [answerSchema]}
});


const farmSchema = new Schema({
    farmId: {type: Schema.Types.ObjectId},
    location: locationSchema,
    upiNumber: {type: String},
    owner: {type: ownerSchema}
});

// Farm visit schema
const farmVisitConductSchema = new Schema({
    gap: {type: Schema.Types.ObjectId,  ref: "evaluation"},
    scheduleId: {type: Schema.Types.ObjectId,  ref: "farm_visit_schedule"},
    visitor: {type: ownerSchema},
    applicationId: {type: Number, required: true},
    reference: {type: String},
    farm: {type: farmSchema},
    owner: {type: ownerSchema},
    groupId: {type: Schema.Types.ObjectId, ref: "group"},
    evaluation: {type: [evaluationSchema]},
    status: {type: Number}
});

farmVisitConductSchema.plugin(timestamps, {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
});

farmVisitConductSchema.plugin(softDelete);

const FarmVisitConduct = mongoose.model('farm_visit_conduct', farmVisitConductSchema);
module.exports.FarmVisitConduct = FarmVisitConduct;
