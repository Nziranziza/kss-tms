const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Application schema
const applicationSchema = new Schema({
    applicationName: { type: String, required: true },
    applicationId: { type: Number, required: true, unique: true },
    description: { type: String, required: true }
});

const Application = mongoose.model('application', applicationSchema);
module.exports.Application = Application;
