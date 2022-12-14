const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const timestamps = require("mongoose-timestamp");
const softDelete = require("database/plugins/soft-delete");

const RECIPIENT = new mongoose.Schema({
  status: { type: String },
  phoneNumber: { type: String, required: true },
  userId: { type: ObjectId, required: true },
});

// Communication schem
const commSchema = new Schema({
  type: { type: String, required: true },
  sender: { type: String, required: true },
  recipients: { type: [RECIPIENT], required: true },
  content: { type: String, required: true },
  batch_id: { type: String },
  senderId: { type: String },
  purpose: { type: String, required: true },
});

// auto-assigned to the most recent create/update timestamp
commSchema.plugin(timestamps, {
  createdAt: "createdAt",
  updatedAt: "updatedAt",
});

commSchema.plugin(softDelete);

const Communication = mongoose.model("communication", commSchema);
module.exports.Communication = Communication;
