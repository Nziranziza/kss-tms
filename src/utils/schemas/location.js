const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const locationSchema = new Schema({
    prov_id: { type: Schema.Types.ObjectId, ref: 'provinces', index: true },
    dist_id: { type: Schema.Types.ObjectId, ref: 'districts', index: true },
    sect_id: { type: Schema.Types.ObjectId, ref: 'sectors', index: true },
    cell_id: { type: Schema.Types.ObjectId, ref: 'cells', index: true },
    village_id: { type: Schema.Types.ObjectId, ref: 'villages', index: true }
});

module.exports = locationSchema;