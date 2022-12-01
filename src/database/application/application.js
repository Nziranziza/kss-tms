const mongoose = require('mongoose');
const timestamps = require("mongoose-timestamp");
const uniqueValidator = require("mongoose-unique-validator");
const softDelete = require("../plugins/soft-delete");
const Schema = mongoose.Schema;

// Application schema
const applicationSchema = new Schema({
    applicationName: { type: String, required: true },
    applicationId: { type: Number, required: true, unique: true },
    description: { type: String, required: true }
});

applicationSchema.plugin(timestamps, {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
});

applicationSchema.plugin(uniqueValidator);
applicationSchema.plugin(softDelete);

const Application = mongoose.model('application', applicationSchema);
module.exports.Application = Application;
